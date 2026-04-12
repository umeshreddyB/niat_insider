/** Deployed API (always works without a local server). */
const DEPLOYED_API = 'https://niat-insider.onrender.com';

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
 * - Defaults to deployed Render API.
 * - If `.env` sets `VITE_API_BASE_URL` to localhost, we still use the deployed API unless
 *   `VITE_USE_LOCAL_API=true` (so leftover local env files don't break the app).
 * - Any non-local `VITE_API_BASE_URL` is respected.
 */
function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  const forceLocal = import.meta.env.VITE_USE_LOCAL_API === 'true';

  if (raw && raw.length > 0) {
    const base = raw.replace(/\/$/, '');
    if (isLocalUrl(base)) {
      return forceLocal ? base : DEPLOYED_API;
    }
    return base;
  }

  return DEPLOYED_API;
}

export const API_BASE_URL = resolveApiBase();
