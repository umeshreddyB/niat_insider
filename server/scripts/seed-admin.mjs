/**
 * One-time: create an admin user. Usage (from server/):
 *   node scripts/seed-admin.mjs
 * Requires MONGODB_URI, and optionally ADMIN_EMAIL / ADMIN_PASSWORD in env or .env
 */
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
const email = (process.env.ADMIN_EMAIL ?? 'admin@niat-insider.local').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? 'ChangeMe123!';
const name = process.env.ADMIN_NAME ?? 'NIAT Admin';
const campus = 'NIAT HQ (Admin)';

if (!MONGODB_URI) {
  console.error('Set MONGODB_URI');
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MODERATOR'], required: true },
    campus: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const User = mongoose.models.User ?? mongoose.model('User', userSchema);

const hash = await bcrypt.hash(password, 10);
await mongoose.connect(MONGODB_URI);

const existing = await User.findOne({ email }).exec();
if (existing) {
  console.log('Admin already exists:', email);
  process.exit(0);
}

await User.create({
  email,
  name,
  password: hash,
  role: 'ADMIN',
  campus,
});

console.log('Created admin:', email, '| password:', password);
await mongoose.disconnect();
