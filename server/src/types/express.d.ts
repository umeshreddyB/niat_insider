import type { InterfaceArticle, InterfaceTokenPayload } from './index.js';

declare global {
  namespace Express {
    interface Request {
      user?: InterfaceTokenPayload;
      article?: InterfaceArticle;
    }
  }
}

export {};
