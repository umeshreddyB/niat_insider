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
  } catch (err) {
    const hint =
      import.meta.env.DEV
        ? 'Is the API running (e.g. npm run dev in server/) and is VITE_API_BASE_URL correct?'
        : 'Check that the API is up (Render), VITE_API_BASE_URL matches your API URL, and CORS_ORIGIN on the server includes this site’s origin.';
    const cause = err instanceof Error ? err.message : String(err);
    throw new Error(`Cannot reach API at ${API_BASE_URL}. ${hint} (${cause})`);
  }
}

/** Single read of the body; tolerates HTML/plain error pages from proxies */
async function readJsonBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const hint = text.replace(/\s+/g, ' ').trim().slice(0, 160);
    throw new Error(
      res.ok ? 'Invalid JSON from server' : hint || `Request failed (${res.status})`,
    );
  }
}

function messageFromBody(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string' && m.length > 0) {
      return m;
    }
  }
  return fallback;
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

  const data = await readJsonBody<LoginResponse & { message?: string }>(res);

  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Login failed'));
  }

  return data;
}

export async function getCampuses(): Promise<string[]> {
  const res = await requestJson(apiUrl('/api/meta/campuses'));
  const data = await readJsonBody<{ campuses?: string[]; message?: string }>(res);
  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Could not load campuses'));
  }
  return data.campuses ?? [];
}

export async function listModerators(): Promise<IUser[]> {
  const res = await requestJson(apiUrl('/api/admin/moderators'), {
    headers: authHeaders(),
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 403) {
    throw new Error('Admin access required');
  }

  const data = await readJsonBody<IUser[] | { message?: string }>(res);
  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Failed to load moderators'));
  }
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response when loading moderators');
  }
  return data;
}

export async function createModerator(payload: {
  email: string;
  password: string;
  name: string;
  campus: string;
}): Promise<IUser> {
  const res = await requestJson(apiUrl('/api/admin/moderators'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    clearStoredToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 403) {
    throw new Error('Admin access required');
  }

  const data = await readJsonBody<IUser & { message?: string }>(res);
  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Could not create moderator'));
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

  if (res.status === 404) {
    clearStoredToken();
    throw new Error('Account not found. Please sign in again.');
  }

  const raw = await readJsonBody<IUser & { message?: string }>(res);

  if (!res.ok) {
    if (res.status >= 500) {
      throw new Error(messageFromBody(raw, 'Server error — try again in a moment.'));
    }
    clearStoredToken();
    throw new Error(messageFromBody(raw, 'Failed to load profile'));
  }

  return {
    ...raw,
    name: raw.name ?? raw.email,
  };
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

  const data = await readJsonBody<ArticleFromApi[] | { message?: string }>(res);
  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Failed to load articles'));
  }
  if (!Array.isArray(data)) {
    throw new Error('Unexpected response when loading articles');
  }
  return data.map(normalizeArticle);
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

  const data = await readJsonBody<ArticleFromApi & { message?: string }>(res);
  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Update failed'));
  }

  return normalizeArticle(data);
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

  const data = await readJsonBody<{ message?: string }>(res);
  if (!res.ok) {
    throw new Error(messageFromBody(data, 'Delete failed'));
  }
}
