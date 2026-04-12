import type { IArticle } from './article.types.js';
import type { ITokenPayload } from './auth.types.js';

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
      article?: IArticle;
    }
  }
}

export {};
