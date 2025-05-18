import { Request, Response, NextFunction } from 'express';

const FRONTEND_SECRET = 'pickle-wheel-frontend-secret-2024'; // This should match the frontend's secret

export function verifyFrontendSecret(req: Request, res: Response, next: NextFunction) {
  const frontendSecret = req.headers['x-frontend-secret'];
  
  if (!frontendSecret || frontendSecret !== FRONTEND_SECRET) {
    return res.status(403).json({ error: 'Unauthorized: Invalid frontend secret' });
  }
  
  next();
} 