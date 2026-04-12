export enum ArticleStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export interface IArticle {
  _id: string;
  title: string;
  body: string;
  category: string;
  campus: string;
  authorId: string;
  status: ArticleStatus;
  createdAt: Date;
}

/** JSON body for POST /api/articles */
export interface CreateArticleBody {
  title?: string;
  body?: string;
  category?: string;
  campus?: string;
  status?: string;
}

/** JSON body for PATCH /api/articles/:articleId */
export interface UpdateArticleBody {
  title?: string;
  body?: string;
  category?: string;
  campus?: string;
  status?: string;
}
