import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config.js';
import { BCRYPT_SALT_ROUNDS, MIN_PASSWORD_LENGTH } from '../constants/app.constants.js';
import { User, mapUserToIUser } from '../models/user.js';
import * as campusService from './campus.service.js';
import { UserRole, type IUser, type ITokenPayload } from '../types/auth.types.js';

function isMongoDuplicateKey(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) {
    return false;
  }
  if (!('code' in err)) {
    return false;
  }
  const code = (err as { code: unknown }).code;
  return code === 11000;
}

function signToken(payload: ITokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);
}

export function verifyToken(token: string): ITokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
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

export async function loginByEmailPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: IUser } | null> {
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm) {
    return null;
  }

  const userDoc = await User.findOne({ email: emailNorm }).exec();
  if (userDoc === null) {
    return null;
  }

  const passwordOk = await bcrypt.compare(password, userDoc.password);
  if (!passwordOk) {
    return null;
  }

  const token = signToken({
    userId: userDoc._id.toString(),
    role: userDoc.role,
    campus: userDoc.campus,
  });

  return { token, user: mapUserToIUser(userDoc) };
}

/** Admin creates a moderator account for a chosen campus */
export async function createModeratorByAdmin(
  email: string,
  password: string,
  name: string,
  campus: string,
): Promise<{ ok: true; user: IUser } | { ok: false; reason: 'duplicate' | 'validation' }> {
  const emailNorm = email.trim().toLowerCase();
  const campusTrim = campus.trim();
  const nameTrim = name.trim();

  if (!emailNorm || !campusTrim || !nameTrim) {
    return { ok: false, reason: 'validation' };
  }
  const campusOk = await campusService.ensureCampusExistsForAdmin(campusTrim);
  if (!campusOk.ok) {
    return { ok: false, reason: 'validation' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, reason: 'validation' };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    const userDoc = await User.create({
      email: emailNorm,
      name: nameTrim,
      password: passwordHash,
      role: UserRole.MODERATOR,
      campus: campusTrim,
    });
    return { ok: true, user: mapUserToIUser(userDoc) };
  } catch (err: unknown) {
    if (isMongoDuplicateKey(err)) {
      return { ok: false, reason: 'duplicate' };
    }
    throw err;
  }
}

export async function listModeratorsForAdmin(): Promise<IUser[]> {
  const docs = await User.find({ role: UserRole.MODERATOR }).sort({ createdAt: -1 }).exec();
  return docs.map((d) => mapUserToIUser(d));
}

export async function getUserById(userId: string): Promise<IUser | null> {
  const userDoc = await User.findById(userId).exec();
  if (userDoc === null) {
    return null;
  }
  return mapUserToIUser(userDoc);
}
