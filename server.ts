import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'secret-jwt-key-2026';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-url') {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing.");
}

app.use(cors());
app.use(express.json());

// ✅ نقطة فحص الصحة (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

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
  if (!supabase) {
    return res.status(500).json({ error: 'Database is not configured.' });
  }
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
  if (!supabase) {
    return res.status(500).json({ error: 'Database is not configured.' });
  }

  const { masterPassword } = req.body;
  if (masterPassword === 'Eissa2026') {
    let { data: users, error: findError } = await supabase.from('users').select('*').limit(1);
    
    if (findError) {
      return res.status(500).json({ error: 'Database error.', details: findError });
    }

    let user = users && users.length > 0 ? users[0] : null;

    if (!user) {
      const hashed = await bcrypt.hash(masterPassword, 10);
      const { data: newUser, error: createError } = await supabase.from('users').insert({
        master_password: hashed
      } as any).select().single();
      
      if (createError) {
        return res.status(500).json({ error: 'Failed to create user', details: createError });
      }
      user = newUser;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid master password' });
  }
});

app.get('/api/vault/emails', authenticateToken, async (req: any, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured.' });
  }
  
  const { data: emails, error: emailError } = await supabase
    .from('emails')
    .select('*, services(*)')
    .eq('user_id', req.user.id);
    
  if (emailError) {
    return res.status(500).json({ error: 'Failed to fetch data', details: emailError });
  }

  const decryptedEmails = (emails || []).map((email: any) => ({
    id: email.id,
    address: email.address,
    services: (email.services || []).map((service: any) => ({
      id: service.id,
      name: service.name,
      category: service.category,
      status: service.status,
      link: service.link,
      deploymentType: service.deployment_type,
      credentials: service.credentials ? JSON.parse(decrypt(service.credentials) || '{}') : null,
      configFiles: service.config_files ? JSON.parse(service.config_files) : null
    }))
  }));

  res.json(decryptedEmails);
});

app.post('/api/vault/emails', authenticateToken, async (req: any, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured.' });
  }
  
  const { address } = req.body;
  try {
    const { data: email, error } = await supabase
      .from('emails')
      .insert({ address, user_id: req.user.id })
      .select()
      .single();
      
    if (error) throw error;
    res.json({ id: email?.id, address: email?.address });
  } catch (e: any) {
    res.status(400).json({ error: 'Email already exists or invalid data', details: e });
  }
});

app.post('/api/vault/services', authenticateToken, async (req: any, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured.' });
  }
  
  const { emailId, name, category, status, link, credentials, deploymentType, configFiles } = req.body;
  try {
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        email_id: emailId,
        name,
        category,
        status,
        link,
        credentials: encrypt(JSON.stringify(credentials || {})),
        deployment_type: deploymentType,
        config_files: JSON.stringify(configFiles || {})
      })
      .select()
      .single();
      
    if (error) throw error;
    
    res.json({
      id: service?.id,
      name: service?.name,
      category: service?.category,
      status: service?.status,
      link: service?.link,
      deploymentType: service?.deployment_type,
      emailId: service?.email_id
    });
  } catch (e: any) {
    res.status(400).json({ error: 'Invalid data', details: e });
  }
});

app.delete('/api/vault/services/:id', authenticateToken, async (req: any, res) => {
  if (!supabase) {
    return res.status(500).json({ error: 'Database not configured.' });
  }
  
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', req.params.id);
      
    if (error) throw error;
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: 'Failed to delete', details: e });
  }
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

async function startServer() {
  try {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log('✅ Vite middleware loaded for development');
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        if (req.path === '/health' || req.path === '/ping') return;
        res.sendFile(path.join(distPath, 'index.html'));
      });
      console.log('✅ Production mode: serving static files from', distPath);
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ Ping: http://localhost:${PORT}/ping`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
