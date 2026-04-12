import type { Request, Response, NextFunction } from 'express';
import * as articleService from '../services/article.service.js';
import type { CreateArticleBody, UpdateArticleBody } from '../types/article.types.js';
import { HttpStatus } from '../types/auth.types.js';

export async function listArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const articles = await articleService.listArticlesForUser(user);
    res.status(HttpStatus.OK).json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function createArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (user === undefined) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const body = req.body as CreateArticleBody;
    const result = await articleService.createArticle(user, body);

    if (result.ok === false) {
      res.status(400).json({ message: 'title, body, and category are required (campus required for admin)' });
      return;
    }

    res.status(HttpStatus.CREATED).json(result.article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export function getArticleById(req: Request, res: Response): void {
  const article = req.article;
  if (article === undefined) {
    res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
    return;
  }
  res.status(HttpStatus.OK).json(article);
}

export async function updateArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const existing = req.article;
    if (user === undefined || existing === undefined) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    const patch = req.body as UpdateArticleBody;
    const result = await articleService.updateArticle(user, existing, patch);

    if (result.ok === false) {
      if (result.reason === 'forbidden') {
        res.status(HttpStatus.FORBIDDEN).json({ message: 'Cannot assign article to another campus' });
        return;
      }
      if (result.reason === 'not_found') {
        res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
        return;
      }
      res.status(400).json({ message: 'Invalid input' });
      return;
    }

    res.status(HttpStatus.OK).json(result.article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = req.article;
    if (existing === undefined) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    const deleted = await articleService.deleteArticleById(existing._id);
    if (!deleted) {
      res.status(HttpStatus.NOT_FOUND).json({ message: 'Article not found' });
      return;
    }

    res.status(HttpStatus.OK).json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
