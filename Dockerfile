# ============================================================
# 🐳 Dockerfile محسّن لتطبيق Node.js + Prisma
# ============================================================

# ✅ استخدام صورة خفيفة ومستقرة
FROM node:20-alpine AS builder

# ✅ تثبيت OpenSSL و الأدوات الأساسية
RUN apk add --no-cache openssl

WORKDIR /app

# ✅ نسخ package.json فقط أولاً (للاستفادة من caching)
COPY package*.json ./

# ✅ تثبيت الاعتماديات مع تنظيف ذاكرة التخزين المؤقت
RUN npm ci --only=production && \
    npm cache clean --force

# ✅ نسخ باقي الملفات
COPY . .

# ✅ إنشاء عميل Prisma
RUN npx prisma generate

# ✅ بناء التطبيق
RUN npm run build

# ============================================================
# 🚀 مرحلة التشغيل (Production Stage)
# ============================================================

FROM node:20-alpine AS runner

# ✅ تثبيت OpenSSL للتشغيل
RUN apk add --no-cache openssl

WORKDIR /app

# ✅ نسخ الملفات المطلوبة فقط
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# ✅ تشغيل Prisma generate مرة أخرى للتأكد
RUN npx prisma generate

# ✅ إنشاء مستخدم غير root للأمان
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# ✅ فتح المنفذ
EXPOSE 5000

# ✅ تشغيل التطبيق
CMD ["node", "dist/server.cjs"]
