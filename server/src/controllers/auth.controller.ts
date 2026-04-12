import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { HttpStatus } from '../types/auth.types.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      return;
    }

    const result = await authService.loginByEmailPassword(email, password);
    if (result === null) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      return;
    }

    res.status(HttpStatus.OK).json(result);
  } catch (err) {
    console.error(err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payload = req.user;
    if (payload === undefined) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const user = await authService.getUserById(payload.userId);
    if (user === null) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'User not found' });
      return;
    }

    res.status(HttpStatus.OK).json(user);
  } catch (err) {
    console.error(err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
  }
}
