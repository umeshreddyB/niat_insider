import mongoose from 'mongoose';
import { Article, mapArticleToIArticle, type IArticleDoc } from '../models/Article.model.js';
import {
  ArticleStatus,
  type CreateArticleBody,
  type IArticle,
  type UpdateArticleBody,
} from '../types/article.types.js';
import { UserRole, type ITokenPayload } from '../types/auth.types.js';

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

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

  let imageUrl: string | undefined;
  if (body.imageUrl !== undefined) {
    const t = body.imageUrl.trim();
    if (t !== '') {
      if (!isValidHttpUrl(t)) {
        return { ok: false, reason: 'bad_input' };
      }
      imageUrl = t;
    }
  }

  const doc = await Article.create({
    title: titleRaw.trim(),
    body: bodyRaw.trim(),
    category: categoryRaw.trim(),
    ...(imageUrl !== undefined ? { imageUrl } : {}),
    campus: user.campus,
    authorId: new mongoose.Types.ObjectId(user.userId),
    status: ArticleStatus.DRAFT,
  });

  return { ok: true, article: mapArticleToIArticle(doc) };
}


export async function updateArticle(
  existing: IArticle,
  patch: UpdateArticleBody,
): Promise<{ ok: true; article: IArticle } | { ok: false; reason: 'bad_input' | 'not_found' }> {
  const $set: Record<string, string> = {};
  let unsetImage = false;

  if (patch.title !== undefined) {
    $set.title = patch.title.trim();
  }
  if (patch.body !== undefined) {
    $set.body = patch.body.trim();
  }
  if (patch.category !== undefined) {
    $set.category = patch.category.trim();
  }
  if (patch.imageUrl !== undefined) {
    const t = patch.imageUrl.trim();
    if (t === '') {
      unsetImage = true;
    } else if (!isValidHttpUrl(t)) {
      return { ok: false, reason: 'bad_input' };
    } else {
      $set.imageUrl = t;
    }
  }

  const hasMutation = Object.keys($set).length > 0 || unsetImage;
  if (!hasMutation) {
    return { ok: true, article: existing };
  }

  const hasEmpty =
    ($set.title !== undefined && $set.title === '') ||
    ($set.body !== undefined && $set.body === '') ||
    ($set.category !== undefined && $set.category === '');
  if (hasEmpty) {
    return { ok: false, reason: 'bad_input' };
  }

  const updateQuery: mongoose.UpdateQuery<IArticleDoc> = {};
  if (Object.keys($set).length > 0) {
    updateQuery.$set = $set;
  }
  if (unsetImage) {
    updateQuery.$unset = { imageUrl: 1 };
  }

  const updated = await Article.findByIdAndUpdate(existing._id, updateQuery, { new: true }).exec();
  if (updated === null) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true, article: mapArticleToIArticle(updated) };
}

export async function deleteArticleById(articleId: string): Promise<boolean> {
  const result = await Article.findByIdAndDelete(articleId).exec();
  return result !== null;
}
