import mongoose from 'mongoose';

export interface ICampusDoc extends mongoose.Document {
  name: string;
  sortOrder: number;
}

const campusSchema = new mongoose.Schema<ICampusDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    sortOrder: { type: Number, required: true },
  },
  { timestamps: false },
);

export const Campus = mongoose.model<ICampusDoc>('Campus', campusSchema);
