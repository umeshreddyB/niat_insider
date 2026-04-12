import type { Request, Response, NextFunction } from 'express';
import { Article, mapArticleToIArticle } from '../models/article.model.js';
import { HttpStatus, UserRole } from '../types/auth.types.js';

export async function authoriseArticleCampus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const articleId = req.params.articleId;
    if (!articleId) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    const doc = await Article.findById(articleId).exec();
    if (!doc) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    if (user.role === UserRole.MODERATOR && doc.campus !== user.campus) {
      res.status(HttpStatus.FORBIDDEN).json({ message: 'Cannot access resources outside your campus' });
      return;
    }

    req.article = mapArticleToIArticle(doc);
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
