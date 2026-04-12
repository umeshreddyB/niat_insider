import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordField } from '../components/PasswordField';
import { ROUTES } from '../constants/routes.constants';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api.service';
import { UserRole } from '../types/auth.types';

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.login(email, password);
      api.setStoredToken(res.token);
      setUser(res.user);
      navigate(
        res.user.role === UserRole.ADMIN ? ROUTES.ADMIN : ROUTES.DASHBOARD,
        { replace: true },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(20,184,166,0.08)_0deg,transparent_120deg,rgba(139,92,246,0.06)_240deg,transparent_360deg)]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-16 lg:flex-row lg:items-center lg:gap-20 lg:px-8">
        <div className="mb-12 max-w-lg lg:mb-0">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.35em] text-teal-400/90">NIAT Insider</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white lg:text-5xl">
            Campus stories,
            <span className="text-teal-400"> one dashboard.</span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-zinc-400">
            Sign in with credentials from your admin. There is no public registration — moderators are added in the admin
            console.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="m-0 font-display text-2xl font-semibold text-white">Sign in</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              <span className="font-semibold text-zinc-400">Moderators:</span> your admin creates your account.{' '}
              <span className="font-semibold text-zinc-400">First admin:</span> created on the server — see README
              (“How to add an admin”).
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-teal-500/40 focus:outline-none focus:ring-2 focus:ring-teal-500/15"
                />
              </div>
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                required
                variant="teal"
              />
              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>
              ) : null}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 py-3.5 text-sm font-bold text-zinc-950 shadow-lg shadow-teal-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Signing in…' : 'Continue'}
              </button>
            </form>
          </div>
          <p className="mt-8 text-center text-xs text-zinc-600">Internal NIAT platform · competition build</p>
        </div>
      </div>
    </div>
  );
}
