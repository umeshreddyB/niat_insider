import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';
import * as api from '../services/api.service';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await api.login(email, password);
      api.setStoredToken(token);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex min-h-[40vh] flex-1 items-end overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-700 to-amber-500 lg:min-h-screen lg:items-center lg:justify-center">
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22g%22%20width%3D%2240%22%20height%3D%2240%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M0%2040h40V0H0v40z%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M0%200h40v40%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.06)%22%20fill%3D%22none%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23g)%22%2F%3E%3C%2Fsvg%3E')] opacity-90" />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 left-10 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative z-[1] max-w-lg px-8 pb-12 pt-8 text-white lg:px-12 lg:pb-0 lg:pt-0">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.25em] text-violet-200">Moderator platform</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            Stories that belong to your campus.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-violet-100/95 lg:text-lg">
            Manage articles with cover images, categories, and instant edits — scoped so you only ever see your
            campus.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#faf8f5] px-4 py-12 lg:py-0">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-2xl shadow-zinc-900/10 ring-1 ring-black/[0.04]">
            <h2 className="m-0 font-display text-2xl font-semibold text-zinc-900">Welcome back</h2>
            <p className="mt-1 text-sm text-zinc-600">Sign in with your moderator credentials.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-3 text-sm text-zinc-900 transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-3 text-sm text-zinc-900 transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              {error ? (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800 ring-1 ring-red-100">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-zinc-900 py-3.5 text-sm font-bold text-white shadow-lg shadow-zinc-900/25 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Signing in…' : 'Continue to dashboard'}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">NIAT Insider · Internal use</p>
        </div>
      </div>
    </div>
  );
}
