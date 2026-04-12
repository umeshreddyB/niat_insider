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
