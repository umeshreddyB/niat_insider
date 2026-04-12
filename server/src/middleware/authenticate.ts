import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import { HttpStatus } from '../types/auth.types.js';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Missing Authorization header' });
    return;
  }

  const bearer = /^Bearer\s+/i;
  if (!bearer.test(header)) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      message: 'Use header: Authorization: Bearer <your_token>',
    });
    return;
  }

  const token = header.replace(bearer, '').trim();
  if (!token) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Missing token after Bearer' });
    return;
  }

  try {
    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    console.error(err);
    if (err instanceof jwt.TokenExpiredError) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token expired. Log in again.' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid token. Log in again with a fresh token.',
      });
      return;
    }
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
  }
}
