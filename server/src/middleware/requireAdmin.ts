import type { Request, Response, NextFunction } from 'express';
import { HttpStatus, UserRole } from '../types/auth.types.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const user = req.user;
  if (user === undefined) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
    return;
  }
  if (user.role !== UserRole.ADMIN) {
    res.status(HttpStatus.FORBIDDEN).json({ message: 'Admin access required' });
    return;
  }
  next();
}
