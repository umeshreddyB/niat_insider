export enum UserRole {
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
}

export enum ArticleStatus {
  PUBLISHED = 'PUBLISHED',
  DRAFT = 'DRAFT',
}

export interface InterfaceUser {
  _id: string;
  email: string;
  role: UserRole;
  campus: string;
  createdAt: Date;
}

export interface InterfaceArticle {
  _id: string;
  title: string;
  body: string;
  category: string;
  campus: string;
  authorId: string;
  status: ArticleStatus;
  createdAt: Date;
}

export interface InterfaceTokenPayload {
  userId: string;
  role: UserRole;
  campus: string;
}

/** Aliases for code that uses the shorter names */
export type IUser = InterfaceUser;
export type IArticle = InterfaceArticle;
export type ITokenPayload = InterfaceTokenPayload;
