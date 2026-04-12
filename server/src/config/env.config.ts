import 'dotenv/config';
import mongoose from 'mongoose';

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
    port,
    mongodbUri: requireEnv('MONGODB_URI'),
    jwtSecret: requireEnv('JWT_SECRET'),
    jwtExpiresIn: requireEnv('JWT_EXPIRES_IN'),
    corsOrigin: requireEnv('CORS_ORIGIN'),
  };
}

export const env = loadEnv();

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
