import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..', '..');

const nodeEnv = process.env.NODE_ENV ?? 'development';
const envBasename =
  nodeEnv === 'test' ? '.env.test' : nodeEnv === 'production' ? '.env.production' : '.env';

dotenv.config({ path: path.join(serverRoot, envBasename) });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadEnv() {
  const portRaw = requireEnv('PORT');
  const port = Number(portRaw);
  if (Number.isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  return {
    nodeEnv,
    port,
    mongodbUri: requireEnv('MONGODB_URI'),
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtExpiresIn: requireEnv('JWT_EXPIRES_IN'),
    corsOrigin: requireEnv('CORS_ORIGIN'),
  };
}

export const env = loadEnv();

/** Express `cors` origin: single origin, list, or `*` for allow-all. */
export function parseCorsOrigin(
  raw: string,
): boolean | string | RegExp | Array<string | RegExp> {
  const t = raw.trim();
  if (t === '*') {
    return true;
  }
  const parts = t
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (parts.length === 0) {
    return true;
  }
  if (parts.length === 1) {
    return parts[0] ?? true;
  }
  return parts;
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.mongodbUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

export default connectDB;
