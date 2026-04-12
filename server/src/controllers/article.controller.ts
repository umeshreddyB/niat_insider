import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Article, mapArticleToIArticle } from '../models/article.model.js';
import { ArticleStatus, type IArticle } from '../types/article.types.js';
import { HttpStatus, UserRole } from '../types/auth.types.js';

export async function listArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const filter = user.role === UserRole.MODERATOR ? { campus: user.campus } : {};

    const docs = await Article.find(filter).sort({ createdAt: -1 }).exec();
    const articles: IArticle[] = docs.map((d) => mapArticleToIArticle(d));
    res.status(HttpStatus.OK).json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function createArticle(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      console.error('Unauthorized');
      return;
    }

    const b = req.body as {
      title?: string;
      body?: string;
      category?: string;
      campus?: string;
      status?: string;
    };

    if (!b.title || !b.body || !b.category) {
      res.status(400).json({ message: 'title, body, and category are required' });
      return;
    }

    let status: ArticleStatus = ArticleStatus.DRAFT;
    if (b.status === ArticleStatus.PUBLISHED || b.status === ArticleStatus.DRAFT) {
      status = b.status;
    }

    let campus: string;
    if (user.role === UserRole.MODERATOR) {
      campus = user.campus;
    } else {
      if (!b.campus || !b.campus.trim()) {
        res.status(400).json({ message: 'campus is required for admin-created articles' });
        return;
      }
      campus = b.campus.trim();
    }

    const doc = await Article.create({
      title: b.title.trim(),
      body: b.body.trim(),
      category: b.category.trim(),
      campus,
      authorId: new mongoose.Types.ObjectId(user.userId),
      status,
    });

    res.status(HttpStatus.CREATED).json(mapArticleToIArticle(doc));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export function getArticleById(req: Request, res: Response): void {
  const article = req.article;
  if (!article) {
    res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
    return;
  }
  res.status(HttpStatus.OK).json(article);
}

export async function updateArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const existing = req.article;
    if (!user || !existing) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const b = req.body as {
      title?: string;
      body?: string;
      category?: string;
      campus?: string;
      status?: string;
    };

    if (b.campus !== undefined && b.campus !== '') {
      const newCampus = b.campus.trim();
      if (!newCampus) {
        res.status(400).json({ message: 'Invalid campus' });
        return;
      }
      if (user.role === UserRole.MODERATOR && newCampus !== user.campus) {
        res.status(HttpStatus.FORBIDDEN).json({ message: 'Cannot assign article to another campus' });
        return;
      }
    }

    const $set: {
      title?: string;
      body?: string;
      category?: string;
      campus?: string;
      status?: ArticleStatus;
    } = {};

    if (b.title !== undefined) {
      $set.title = b.title.trim();
    }
    if (b.body !== undefined) {
      $set.body = b.body.trim();
    }
    if (b.category !== undefined) {
      $set.category = b.category.trim();
    }
    if (b.status !== undefined) {
      if (b.status === ArticleStatus.PUBLISHED || b.status === ArticleStatus.DRAFT) {
        $set.status = b.status;
      }
    }
    if (b.campus !== undefined && b.campus.trim() !== '') {
      $set.campus = b.campus.trim();
    }

    if (Object.keys($set).length === 0) {
      res.status(HttpStatus.OK).json(existing);
      return;
    }

    const updated = await Article.findByIdAndUpdate(existing._id, { $set }, { new: true }).exec();
    if (!updated) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    res.status(HttpStatus.OK).json(mapArticleToIArticle(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = req.article;
    if (!existing) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    await Article.findByIdAndDelete(existing._id).exec();
    res.status(HttpStatus.OK).json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
