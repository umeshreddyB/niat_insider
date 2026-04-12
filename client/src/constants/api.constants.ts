/** Default API for production builds when `VITE_API_BASE_URL` is not set (e.g. Vercel). */
const DEPLOYED_API = 'https://niat-insider.onrender.com';

/** Matches `PORT` in `server/env.development.example` — used when running `vite` with no client env. */
const LOCAL_DEV_DEFAULT = 'http://localhost:5000';

function isLocalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Resolves API base (no trailing slash).
 *
 * | Mode | `VITE_API_BASE_URL` unset |
 * |------|---------------------------|
 * | `vite` / dev | `http://localhost:5000` (local API) |
 * | `vite build` / production | `DEPLOYED_API` (Render) |
 *
 * If set: non-local URLs are always used. Localhost in **production** builds is ignored (replaced by `DEPLOYED_API`)
 * unless `VITE_USE_LOCAL_API=true`, so a copied `.env` does not point Vercel at your laptop.
 */
function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  const forceLocal = import.meta.env.VITE_USE_LOCAL_API === 'true';
  const isDev = import.meta.env.DEV;

  if (raw && raw.length > 0) {
    const base = raw.replace(/\/$/, '');
    if (isLocalUrl(base)) {
      if (isDev || forceLocal) {
        return base;
      }
      return DEPLOYED_API;
    }
    return base;
  }

  if (isDev) {
    return LOCAL_DEV_DEFAULT;
  }

  return DEPLOYED_API;
}

export const API_BASE_URL = resolveApiBase();
