import { Request, Response, NextFunction } from 'express';
import { oauth2Client } from './auth';
import { getDb } from './db';

const FRONTEND_SECRET = process.env.FRONTEND_SECRET;
if (!FRONTEND_SECRET) {
  throw new Error('FRONTEND_SECRET environment variable is required');
}

export function verifyFrontendSecret(req: Request, res: Response, next: NextFunction) {
  const frontendSecret = req.headers['x-frontend-secret'];
  
  if (!frontendSecret || frontendSecret !== FRONTEND_SECRET) {
    return res.status(403).json({ error: 'Unauthorized: Invalid frontend secret' });
  }
  
  next();
}

export async function adminOnly(req: Request, res: Response, next: NextFunction) {
  console.log('adminOnly middleware called');
  try {
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided or malformed header');
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token ? token.substring(0, 20) + '...' : 'none');
    console.log('Audience (GOOGLE_CLIENT_ID):', process.env.GOOGLE_CLIENT_ID);
    let ticket, payload;
    try {
      ticket = await oauth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
      console.log('Token payload:', payload);
    } catch (verifyErr) {
      console.error('Token verification error:', verifyErr);
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.log('Admin check email:', payload && payload.email);
    if (!payload || payload.email !== 'mitsan.flores@gmail.com') {
      console.log('Forbidden: Not admin email');
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    next();
  } catch (err) {
    console.error('Unexpected error in adminOnly:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function upsertUserInfo(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    const token = authHeader.split(' ')[1];
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub) return next();
    const userId = payload.sub;
    const email = payload.email || null;
    const name = payload.name || null;
    const createdAt = new Date().toISOString();
    const db = await getDb();
    await db.run(
      `INSERT OR IGNORE INTO users (id, email, name, createdAt) VALUES (?, ?, ?, ?)`,
      userId, email, name, createdAt
    );
    await db.run(
      `UPDATE users SET email = ?, name = ? WHERE id = ?`,
      email, name, userId
    );
    next();
  } catch (err) {
    next();
  }
} 