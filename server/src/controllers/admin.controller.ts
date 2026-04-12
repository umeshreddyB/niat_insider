import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { HttpStatus } from '../types/auth.types.js';

export async function listModerators(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await authService.listModeratorsForAdmin();
    res.status(HttpStatus.OK).json(users);
  } catch (err) {
    next(err);
  }
}

export async function createModerator(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as {
      email?: string;
      password?: string;
      name?: string;
      campus?: string;
    };
    const { email, password, name, campus } = body;

    if (!email || !password || !name || !campus) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: 'email, password, name, and campus are required' });
      return;
    }

    const result = await authService.createModeratorByAdmin(email, password, name, campus);

    if (result.ok === false) {
      if (result.reason === 'duplicate') {
        res.status(HttpStatus.CONFLICT).json({ message: 'Email already registered' });
        return;
      }
      res.status(HttpStatus.BAD_REQUEST).json({
        message:
          'Invalid input — school name must be 2–120 characters (new schools are saved automatically), password length ≥ 8',
      });
      return;
    }

    res.status(HttpStatus.CREATED).json(result.user);
  } catch (err) {
    next(err);
  }
}
