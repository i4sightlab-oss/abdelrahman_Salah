import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_DATA_DIR = path.resolve('.data');
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), 'nilekids-auth');
const AUTH_FILENAME = 'teacher-auth.json';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
let memoryAuthRecord: StoredAuthRecord | null = null;

interface StoredAuthRecord {
  salt: string;
  hash: string;
  sessionSecret: string;
  updatedAt: string;
}

interface SessionPayload {
  sub: 'teacher-admin';
  nonce: string;
  iat: number;
  exp: number;
}

// Simple in-memory rate limiter for PIN attempts
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = failedAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    failedAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailures(ip: string): void {
  failedAttempts.delete(ip);
}

function hashPin(pin: string, saltHex?: string): { salt: string; hash: string } {
  const salt = saltHex || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(pin, salt, 64);
  return { salt, hash: derived.toString('hex') };
}

function verifyPinHash(pin: string, record: StoredAuthRecord): boolean {
  const candidate = crypto.scryptSync(pin, record.salt, 64);
  const stored = Buffer.from(record.hash, 'hex');
  if (candidate.length !== stored.length) return false;
  return crypto.timingSafeEqual(candidate, stored);
}

function readAuthFromDir(dir: string): StoredAuthRecord | null {
  const file = path.join(dir, AUTH_FILENAME);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoredAuthRecord>;
    if (parsed.salt && parsed.hash && parsed.sessionSecret) {
      return parsed as StoredAuthRecord;
    }
  } catch {
    // Ignore unreadable/corrupt file and try fallback
  }
  return null;
}

function writeAuthToDir(dir: string, record: StoredAuthRecord): boolean {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const file = path.join(dir, AUTH_FILENAME);
    const tmpFile = `${file}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(record, null, 2), { mode: 0o600 });
    fs.renameSync(tmpFile, file);
    return true;
  } catch {
    return false;
  }
}

function ensureAuthRecord(): StoredAuthRecord {
  const fromPrimary = readAuthFromDir(PRIMARY_DATA_DIR);
  if (fromPrimary) {
    memoryAuthRecord = fromPrimary;
    return fromPrimary;
  }

  const fromFallback = readAuthFromDir(FALLBACK_DATA_DIR);
  if (fromFallback) {
    memoryAuthRecord = fromFallback;
    return fromFallback;
  }

  if (memoryAuthRecord) {
    return memoryAuthRecord;
  }

  const initialPin = process.env.TEACHER_DASHBOARD_PIN || 'nour2018';
  const { salt, hash } = hashPin(initialPin);
  const record: StoredAuthRecord = {
    salt,
    hash,
    sessionSecret: crypto.randomBytes(32).toString('hex'),
    updatedAt: new Date().toISOString(),
  };
  memoryAuthRecord = record;

  if (!writeAuthToDir(PRIMARY_DATA_DIR, record)) {
    writeAuthToDir(FALLBACK_DATA_DIR, record);
  }
  return record;
}

function saveAuthRecord(record: StoredAuthRecord): void {
  memoryAuthRecord = record;
  if (!writeAuthToDir(PRIMARY_DATA_DIR, record)) {
    writeAuthToDir(FALLBACK_DATA_DIR, record);
  }
}

function createSessionToken(secret: string): string {
  const now = Date.now();
  const payload: SessionPayload = {
    sub: 'teacher-admin',
    nonce: crypto.randomBytes(16).toString('hex'),
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token: string, secret: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8')) as SessionPayload;
    if (payload.sub !== 'teacher-admin') return false;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

function normalizePinInput(input: string): string {
  // Strip invisible Unicode directional/zero-width marks and convert Arabic/Eastern-Arabic digits to ASCII 0-9
  return input
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim()
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

async function startServer() {
  // Ensure initial server-side auth record exists
  ensureAuthRecord();

  const app = express();
  app.use(express.json());

  // Prevent browser/CDN caching on API responses, SW scripts, and HTML entry point
  app.use((req, res, next) => {
    if (
      req.path.startsWith('/api/') ||
      req.path === '/' ||
      req.path === '/index.html' ||
      req.path === '/sw.js' ||
      req.path === '/dev-sw.js' ||
      req.path === '/registerSW.js'
    ) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    }
    next();
  });

  // Teacher & Parent Dashboard Authentication Endpoints
  app.post('/api/teacher/verify-pin', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({
        valid: false,
        error: 'Too many incorrect attempts. Please wait a minute and try again.',
      });
      return;
    }

    const pin = typeof req.body?.pin === 'string' ? normalizePinInput(req.body.pin) : '';
    if (!pin) {
      res.status(400).json({
        valid: false,
        error: 'Please enter your dashboard access PIN.',
      });
      return;
    }

    const record = ensureAuthRecord();
    if (!verifyPinHash(pin, record)) {
      recordFailure(ip);
      res.status(401).json({
        valid: false,
        error: 'That PIN is not quite right. Please check and try again.',
      });
      return;
    }

    clearFailures(ip);
    const token = createSessionToken(record.sessionSecret);
    res.json({ valid: true, token });
  });

  app.post('/api/teacher/change-pin', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      res.status(429).json({
        success: false,
        error: 'Too many attempts. Please wait a minute and try again.',
      });
      return;
    }

    const record = ensureAuthRecord();
    const token = extractToken(req);
    if (!token || !verifySessionToken(token, record.sessionSecret)) {
      res.status(401).json({
        success: false,
        error: 'Your dashboard session has expired. Please unlock the dashboard again.',
      });
      return;
    }

    const currentPin = typeof req.body?.currentPin === 'string' ? normalizePinInput(req.body.currentPin) : '';
    const newPin = typeof req.body?.newPin === 'string' ? normalizePinInput(req.body.newPin) : '';

    if (!currentPin || !newPin) {
      res.status(400).json({
        success: false,
        error: 'Please fill in both your current PIN and new PIN.',
      });
      return;
    }

    if (newPin.length < 4 || newPin.length > 32) {
      res.status(400).json({
        success: false,
        error: 'New PIN must be between 4 and 32 characters long.',
      });
      return;
    }

    if (!verifyPinHash(currentPin, record)) {
      recordFailure(ip);
      res.status(403).json({
        success: false,
        error: 'The current PIN you entered is incorrect.',
      });
      return;
    }

    clearFailures(ip);
    const { salt, hash } = hashPin(newPin);
    const updatedRecord: StoredAuthRecord = {
      salt,
      hash,
      sessionSecret: crypto.randomBytes(32).toString('hex'), // Rotate secret to invalidate old tokens
      updatedAt: new Date().toISOString(),
    };
    saveAuthRecord(updatedRecord);

    const newToken = createSessionToken(updatedRecord.sessionSecret);
    res.json({ success: true, token: newToken });
  });

  app.post('/api/teacher/logout', (_req: Request, res: Response) => {
    res.json({ success: true });
  });

  // Dev vs Production frontend serving
  const distDir = path.resolve('dist');
  const distIndex = path.join(distDir, 'index.html');
  const isDev =
    process.env.NODE_ENV === 'development' ||
    (process.env.NODE_ENV !== 'production' && !fs.existsSync(distIndex));

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (req: Request, res: Response, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NileKids server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
