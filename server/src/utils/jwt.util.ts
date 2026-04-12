import jwt from 'jsonwebtoken';
import { UserRole, type ITokenPayload } from '../types/index.js';

function getSecret(): string {
  // Trim: a trailing newline/space in .env breaks verify() vs tokens signed before fix
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function signToken(payload: ITokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): ITokenPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded !== 'object' || decoded === null) {
    throw new Error('Invalid token');
  }

  const d = decoded as ITokenPayload;

  if (!d.userId || !d.role || !d.campus) {
    throw new Error('Invalid token');
  }
  if (d.role !== UserRole.ADMIN && d.role !== UserRole.MODERATOR) {
    throw new Error('Invalid token');
  }

  return d;
}
