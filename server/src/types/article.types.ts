export enum ArticleStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export interface IArticle {
  _id: string;
  title: string;
  body: string;
  category: string;
  /** HTTPS/HTTP URL for cover image (optional) */
  imageUrl?: string;
  campus: string;
  authorId: string;
  status: ArticleStatus;
  createdAt: Date;
}

/** POST body — campus comes only from JWT, not from the client */
export interface CreateArticleBody {
  title?: string;
  body?: string;
  category?: string;
  imageUrl?: string;
}

/** PUT body — only these fields may change (no campus/status/author) */
export interface UpdateArticleBody {
  title?: string;
  body?: string;
  category?: string;
  /** Set empty string to remove cover image */
  imageUrl?: string;
}
