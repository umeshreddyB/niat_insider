import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatus } from '../types/index.js';
import { verifyToken } from '../utils/jwt.util.js';

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
    req.user = verifyToken(token);
    next();
  } catch (err) {
    console.error(err);
    if (err instanceof jwt.TokenExpiredError) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token expired. Log in again.' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        message:
          'Invalid token (wrong secret or malformed). Log in again and ensure JWT_SECRET matches the server that issued the token.',
      });
      return;
    }
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid or expired token' });
  }
}
