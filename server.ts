import express from 'express';
import path from 'path';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key-2026';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes

app.use(cors());
app.use(express.json());

// Encryption Utilities
function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return JSON.stringify({ iv: iv.toString('hex'), encrypted, authTag });
}

function decrypt(text: string) {
  try {
    const { iv, encrypted, authTag } = JSON.parse(text);
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token expired or invalid' });
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/login', async (req, res) => {
  const { masterPassword } = req.body;
  // Demo hardcoded password Eissa2026
  if (masterPassword === 'Eissa2026') {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          masterPassword: await bcrypt.hash(masterPassword, 10),
        }
      });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid master password' });
  }
});

app.get('/api/vault/emails', authenticateToken, async (req: any, res) => {
  const emails = await prisma.email.findMany({
    where: { userId: req.user.id },
    include: { services: true }
  });
  
  // Decrypt credentials
  const decryptedEmails = emails.map((email: any) => ({
    ...email,
    services: email.services.map((service: any) => ({
      ...service,
      credentials: service.credentials ? JSON.parse(decrypt(service.credentials) || '{}') : null,
      configFiles: service.configFiles ? JSON.parse(service.configFiles) : null
    }))
  }));

  res.json(decryptedEmails);
});

app.post('/api/vault/emails', authenticateToken, async (req: any, res) => {
  const { address } = req.body;
  try {
    const email = await prisma.email.create({
      data: {
        address,
        userId: req.user.id
      }
    });
    res.json(email);
  } catch (e) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

app.post('/api/vault/services', authenticateToken, async (req: any, res) => {
  const { emailId, name, category, status, link, credentials, deploymentType, configFiles } = req.body;
  try {
    const service = await prisma.service.create({
      data: {
        emailId,
        name,
        category,
        status,
        link,
        credentials: encrypt(JSON.stringify(credentials || {})),
        deploymentType,
        configFiles: JSON.stringify(configFiles || {})
      }
    });
    res.json(service);
  } catch (e) {
    res.status(400).json({ error: 'Invalid data', details: e });
  }
});

app.delete('/api/vault/services/:id', authenticateToken, async (req: any, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: 'Failed to delete' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
