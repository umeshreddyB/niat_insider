/** Base URL for the NIAT Insider API (no trailing slash). Override with `VITE_API_BASE_URL` in `.env.local`. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://niat-insider.onrender.com';
