/** Mirrors server `UserRole` — `enum` avoided here for `erasableSyntaxOnly` + Vite. */
export const UserRole = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  campus: string;
  createdAt: string;
}
