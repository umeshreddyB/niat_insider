import mongoose from 'mongoose';
import { UserRole, type IUser } from '../types/index.js';

export interface IUserDoc extends mongoose.Document {
  email: string;
  password: string;
  role: UserRole;
  campus: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUserDoc>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    campus: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const User = mongoose.model<IUserDoc>('User', userSchema);

export function mapUserToIUser(doc: IUserDoc): IUser {
  return {
    _id: doc._id.toString(),
    email: doc.email,
    role: doc.role,
    campus: doc.campus,
    createdAt: doc.createdAt,
  };
}
