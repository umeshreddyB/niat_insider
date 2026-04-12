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

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as { email?: string; password?: string; campus?: string };
    const { email, password, campus } = body;

    if (!email || !password || !campus) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'email, password, and campus are required' });
      return;
    }

    const result = await authService.registerUser(email, password, campus);

    if (result === 'validation') {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid input (check email, campus, and password length)',
      });
      return;
    }
    if (result === 'duplicate') {
      res.status(HttpStatus.CONFLICT).json({ message: 'Email already registered' });
      return;
    }

    res.status(HttpStatus.CREATED).json(result);
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
