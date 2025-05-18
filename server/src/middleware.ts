import { Request, Response, NextFunction } from 'express';

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