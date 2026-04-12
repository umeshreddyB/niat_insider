import mongoose from 'mongoose';
import { ArticleStatus, type InterfaceArticle } from '../types/index.js';

export interface InterfaceArticleDoc extends mongoose.Document {
  title: string;
  body: string;
  category: string;
  campus: string;
  authorId: mongoose.Types.ObjectId;
  status: ArticleStatus;
  createdAt: Date;
}

const articleSchema = new mongoose.Schema<InterfaceArticleDoc>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    campus: { type: String, required: true, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(ArticleStatus), required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Article = mongoose.model<InterfaceArticleDoc>('Article', articleSchema);

export function mapArticleToInterfaceArticle(doc: InterfaceArticleDoc): InterfaceArticle {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    body: doc.body,
    category: doc.category,
    campus: doc.campus,
    authorId: doc.authorId.toString(),
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
