import mongoose from 'mongoose';
import { Article, mapArticleToIArticle, type IArticleDoc } from '../models/Article.model.js';
import {
  ArticleStatus,
  type CreateArticleBody,
  type IArticle,
  type UpdateArticleBody,
} from '../types/article.types.js';
import { UserRole, type ITokenPayload } from '../types/auth.types.js';

export async function listArticlesForUser(user: ITokenPayload): Promise<IArticle[]> {
  const filter = user.role === UserRole.MODERATOR ? { campus: user.campus } : {};
  const docs = await Article.find(filter).sort({ createdAt: -1 }).exec();
  return docs.map((doc: IArticleDoc) => mapArticleToIArticle(doc));
}

export async function getArticleById(articleId: string): Promise<IArticle | null> {
  const doc = await Article.findById(articleId).exec();
  if (doc === null) {
    return null;
  }
  return mapArticleToIArticle(doc);
}

/** Moderators may only access articles that belong to their campus. */
export function isModeratorBlockedFromCampus(user: ITokenPayload, articleCampus: string): boolean {
  return user.role === UserRole.MODERATOR && articleCampus !== user.campus;
}

export async function createArticle(
  user: ITokenPayload,
  body: CreateArticleBody,
): Promise<{ ok: true; article: IArticle } | { ok: false; reason: 'bad_input' }> {
  const titleRaw = body.title;
  const bodyRaw = body.body;
  const categoryRaw = body.category;

  if (
    titleRaw === undefined ||
    bodyRaw === undefined ||
    categoryRaw === undefined ||
    titleRaw.trim() === '' ||
    bodyRaw.trim() === '' ||
    categoryRaw.trim() === ''
  ) {
    return { ok: false, reason: 'bad_input' };
  }

  let status: ArticleStatus = ArticleStatus.DRAFT;
  if (body.status === ArticleStatus.PUBLISHED || body.status === ArticleStatus.DRAFT) {
    status = body.status;
  }

  let campus: string;
  if (user.role === UserRole.MODERATOR) {
    campus = user.campus;
  } else {
    const c = body.campus?.trim();
    if (c === undefined || c === '') {
      return { ok: false, reason: 'bad_input' };
    }
    campus = c;
  }

  const doc = await Article.create({
    title: titleRaw.trim(),
    body: bodyRaw.trim(),
    category: categoryRaw.trim(),
    campus,
    authorId: new mongoose.Types.ObjectId(user.userId),
    status,
  });

  return { ok: true, article: mapArticleToIArticle(doc) };
}

export async function updateArticle(
  user: ITokenPayload,
  existing: IArticle,
  patch: UpdateArticleBody,
): Promise<
  | { ok: true; article: IArticle }
  | { ok: false; reason: 'bad_input' | 'forbidden' | 'not_found' }
> {
  if (patch.campus !== undefined && patch.campus !== '') {
    const newCampus = patch.campus.trim();
    if (newCampus === '') {
      return { ok: false, reason: 'bad_input' };
    }
    if (user.role === UserRole.MODERATOR && newCampus !== user.campus) {
      return { ok: false, reason: 'forbidden' };
    }
  }

  const $set: {
    title?: string;
    body?: string;
    category?: string;
    campus?: string;
    status?: ArticleStatus;
  } = {};

  if (patch.title !== undefined) {
    $set.title = patch.title.trim();
  }
  if (patch.body !== undefined) {
    $set.body = patch.body.trim();
  }
  if (patch.category !== undefined) {
    $set.category = patch.category.trim();
  }
  if (patch.status !== undefined) {
    if (patch.status === ArticleStatus.PUBLISHED || patch.status === ArticleStatus.DRAFT) {
      $set.status = patch.status;
    }
  }
  if (patch.campus !== undefined && patch.campus.trim() !== '') {
    $set.campus = patch.campus.trim();
  }

  if (Object.keys($set).length === 0) {
    return { ok: true, article: existing };
  }

  const updated = await Article.findByIdAndUpdate(existing._id, { $set }, { new: true }).exec();
  if (updated === null) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true, article: mapArticleToIArticle(updated) };
}

export async function deleteArticleById(articleId: string): Promise<boolean> {
  const result = await Article.findByIdAndDelete(articleId).exec();
  return result !== null;
}
