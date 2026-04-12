import type { Request, Response, NextFunction } from 'express';
import * as articleService from '../services/article.service.js';
import { HttpStatus } from '../types/auth.types.js';

function getRouteId(req: Request): string | undefined {
  const raw = req.params['id'];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

export async function authoriseArticleCampus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const articleId = getRouteId(req);
    if (articleId === undefined || articleId === '') {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    const article = await articleService.getArticleById(articleId);
    if (article === null) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    if (articleService.isModeratorBlockedFromCampus(user, article.campus)) {
      res.status(HttpStatus.FORBIDDEN).json({ message: 'Cannot access resources outside your campus' });
      return;
    }

    req.article = article;
    next();
  } catch (err) {
    console.error(err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
  }
}
