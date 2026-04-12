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

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  campus: string;
  createdAt: Date;
}

export interface ITokenPayload {
  userId: string;
  role: UserRole;
  campus: string;
}
