import { API_BASE_URL } from '../constants/api.constants';
import { TOKEN_STORAGE_KEY } from '../constants/storage.constants';
import type { IUser } from '../types/auth.types';
import type { Article } from '../types/article.types';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function requestJson(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(
      `Cannot reach API at ${API_BASE_URL}. Is the server running, and does CORS allow this origin?`,
    );
  }
}

export interface LoginResponse {
  token: string;
  user: IUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await requestJson(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as LoginResponse & { message?: string };

  if (!res.ok) {
    throw new Error(data.message ?? 'Login failed');
  }

  return data;
}

export async function getMe(): Promise<IUser> {
  const res = await requestJson(apiUrl('/api/auth/me'), {
    headers: authHeaders(),
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Failed to load profile');
  }

  return (await res.json()) as IUser;
}

interface ArticleFromApi extends Article {
  authorId?: string;
  status?: string;
  createdAt?: string;
}

function normalizeArticle(raw: ArticleFromApi): Article {
  return {
    _id: raw._id,
    title: raw.title,
    body: raw.body,
    category: raw.category,
    campus: raw.campus,
    ...(raw.imageUrl !== undefined && raw.imageUrl.length > 0 ? { imageUrl: raw.imageUrl } : {}),
  };
}

export async function getArticles(): Promise<Article[]> {
  const res = await requestJson(apiUrl('/api/articles'), {
    headers: authHeaders(),
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Failed to load articles');
  }

  const list = (await res.json()) as ArticleFromApi[];
  return list.map(normalizeArticle);
}

export async function updateArticle(
  id: string,
  fields: { title: string; body: string; category: string; imageUrl: string },
): Promise<Article> {
  const res = await requestJson(apiUrl(`/api/articles/${id}`), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(fields),
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Update failed');
  }

  const raw = (await res.json()) as ArticleFromApi;
  return normalizeArticle(raw);
}

export async function deleteArticle(id: string): Promise<void> {
  const res = await requestJson(apiUrl(`/api/articles/${id}`), {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Delete failed');
  }
}
