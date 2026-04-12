import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User, mapUserToIUser } from '../models/user.model.js';
import { HttpStatus, UserRole } from '../types/index.js';
import { signToken } from '../utils/jwt.util.js';

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    if (!emailNorm) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      return;
    }

    const userDoc = await User.findOne({ email: emailNorm }).exec();
    if (userDoc === null) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      return;
    }

    const passwordOk = await bcrypt.compare(password, userDoc.password);
    if (!passwordOk) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
      return;
    }

    const token = signToken({
      userId: userDoc._id.toString(),
      role: userDoc.role,
      campus: userDoc.campus,
    });

    res.status(HttpStatus.OK).json({
      token,
      user: mapUserToIUser(userDoc),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, campus } = req.body as {
      email?: string;
      password?: string;
      campus?: string;
    };

    if (!email || !password || !campus) {
      res.status(400).json({ message: 'email, password, and campus are required' });
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    const campusTrim = campus.trim();
    if (!emailNorm || !campusTrim) {
      res.status(400).json({ message: 'email and campus cannot be empty' });
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const userDoc = await User.create({
      email: emailNorm,
      password: passwordHash,
      role: UserRole.MODERATOR,
      campus: campusTrim,
    });

    const token = signToken({
      userId: userDoc._id.toString(),
      role: userDoc.role,
      campus: userDoc.campus,
    });

    res.status(HttpStatus.CREATED).json({
      token,
      user: mapUserToIUser(userDoc),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
