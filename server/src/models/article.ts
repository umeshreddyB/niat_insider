import mongoose from 'mongoose';
import { ArticleStatus, type IArticle } from '../types/article.types.js';

export interface IArticleDoc extends mongoose.Document {
  title: string;
  body: string;
  category: string;
  imageUrl?: string;
  campus: string;
  authorId: mongoose.Types.ObjectId;
  status: ArticleStatus;
  createdAt: Date;
}

const articleSchema = new mongoose.Schema<IArticleDoc>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: false, trim: true },
    campus: { type: String, required: true, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(ArticleStatus), required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Article = mongoose.model<IArticleDoc>('Article', articleSchema);

export function mapArticleToIArticle(doc: IArticleDoc): IArticle {
  const rawUrl = doc.imageUrl?.trim();
  return {
    _id: doc._id.toString(),
    title: doc.title,
    body: doc.body,
    category: doc.category,
    ...(rawUrl !== undefined && rawUrl.length > 0 ? { imageUrl: rawUrl } : {}),
    campus: doc.campus,
    authorId: doc.authorId.toString(),
    status: doc.status,
    createdAt: doc.createdAt,
  };
}
