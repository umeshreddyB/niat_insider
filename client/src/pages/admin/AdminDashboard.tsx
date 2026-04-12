import { type FormEvent, useCallback, useEffect, useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasswordField } from '../../components/PasswordField';
import { ROUTES } from '../../constants/routes.constants';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api.service';
import type { IUser } from '../../types/auth.types';

const REFRESH_MS = 45_000;

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [moderators, setModerators] = useState<IUser[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [campus, setCampus] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const campusDatalistId = useId();

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [mods, camps] = await Promise.all([api.listModerators(), api.getCampuses()]);
      setModerators(mods);
      setCampuses(camps);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Refetch moderators + campuses while this tab is open (live view). */
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    };
    const id = window.setInterval(tick, REFRESH_MS);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }

  async function handleCreateModerator(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setCreating(true);
    try {
      const created = await api.createModerator({
        email,
        password,
        name: name.trim(),
        campus: campus.trim(),
      });
      setModerators((prev) => [created, ...prev]);
      setEmail('');
      setPassword('');
      setName('');
      setCampus('');
      setLastUpdated(new Date());
      try {
        setCampuses(await api.getCampuses());
      } catch {
        /* list still ok */
      }
      showToast(`Moderator ${created.name} added for ${created.campus}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create');
    } finally {
      setCreating(false);
    }
  }

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  const byCampus = moderators.reduce<Record<string, number>>((acc, m) => {
    acc[m.campus] = (acc[m.campus] ?? 0) + 1;
    return acc;
  }, {});

  /** Directory schools plus any campus string used by moderators (so nothing is hidden). */
  const schoolNamesMerged = Array.from(
    new Set([...campuses, ...moderators.map((m) => m.campus)]),
  ).sort((a, b) => a.localeCompare(b));
  const schoolRows = schoolNamesMerged.map((name) => ({
    name,
    count: byCampus[name] ?? 0,
  }));

  const schoolsWithMods = schoolRows.filter((r) => r.count > 0).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,rgba(16,185,129,0.12),transparent)]" />

      <header className="relative border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">Admin console</p>
            <h1 className="m-0 mt-1 font-display text-2xl font-semibold text-white">NIAT Insider</h1>
            {user ? (
              <p className="mt-2 mb-0 text-sm text-zinc-400">
                <span className="text-zinc-200">{user.name}</span>
                <span className="mx-2 text-zinc-600">·</span>
                {user.email}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-10 sm:px-8">
        {toast ? (
          <div
            className="fixed bottom-8 left-1/2 z-[100] max-w-md -translate-x-1/2 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-5 py-3 text-center text-sm font-medium text-emerald-100 shadow-2xl"
            role="status"
          >
            {toast}
          </div>
        ) : null}

        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            {lastUpdated ? (
              <>
                Last updated{' '}
                <time dateTime={lastUpdated.toISOString()}>
                  {lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </time>{' '}
                · auto-refresh every {REFRESH_MS / 1000}s
              </>
            ) : null}
          </span>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/40 to-zinc-900/80 p-6">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-emerald-400/90">Total moderators</p>
            <p className="mt-2 m-0 font-display text-4xl font-semibold text-white">{moderators.length}</p>
            <p className="mt-2 m-0 text-[11px] text-zinc-500">All moderator accounts</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-zinc-500">Schools in directory</p>
            <p className="mt-2 m-0 font-display text-4xl font-semibold text-white">{campuses.length}</p>
            <p className="mt-2 m-0 text-[11px] text-zinc-500">Saved in MongoDB (includes any school you add when inviting)</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-zinc-500">Schools with moderators</p>
            <p className="mt-2 m-0 font-display text-4xl font-semibold text-white">{schoolsWithMods}</p>
            <p className="mt-2 m-0 text-[11px] text-zinc-500">Schools that have at least one moderator</p>
          </div>
        </div>

        <section className="mb-10 rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="m-0 font-display text-lg font-semibold text-white">Moderators by school</h2>
              <p className="mt-1 m-0 text-sm text-zinc-500">
                Every school in the directory plus any campus label used by a moderator. Counts are live from the moderator list.
              </p>
            </div>
          </div>
          {loading && !lastUpdated ? (
            <p className="mt-4 text-sm text-zinc-500">Loading schools…</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="py-3 pr-4 font-semibold">School</th>
                    <th className="py-3 font-semibold">Moderators</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolRows.map((row) => (
                    <tr key={row.name} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4 text-zinc-200">{row.name}</td>
                      <td className="py-3 tabular-nums text-zinc-100">
                        {row.count}
                        {row.count === 0 ? <span className="ml-2 text-xs font-normal text-zinc-600">— none yet</span> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {schoolRows.length === 0 && !loading ? (
                <p className="mt-2 text-sm text-zinc-500">No campus list returned from the server.</p>
              ) : null}
            </div>
          )}
        </section>

        <div className="grid gap-10 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur">
            <h2 className="m-0 font-display text-xl font-semibold text-white">Add moderator</h2>
            <p className="mt-1 text-sm text-zinc-500">
              This is how new moderator accounts are created — there is no public sign-up. They sign in on the main login
              page with the password you set.
            </p>
            <form onSubmit={handleCreateModerator} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-name">
                  Name
                </label>
                <input
                  id="adm-name"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-email">
                  Email
                </label>
                <input
                  id="adm-email"
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="adm-campus">
                  School / campus
                </label>
                <input
                  id="adm-campus"
                  name="campus"
                  list={campusDatalistId}
                  placeholder="Pick a suggestion or type a new school name"
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  required
                  minLength={2}
                  maxLength={120}
                />
                <datalist id={campusDatalistId}>
                  {campuses.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                <p className="mt-1.5 m-0 text-[11px] text-zinc-500">
                  <span className="text-zinc-400">Existing schools</span> appear as suggestions (from MongoDB).{' '}
                  <span className="text-zinc-400">Or type any new name</span> — it is saved to the directory when you add the
                  moderator (2–120 characters).
                </p>
              </div>
              <PasswordField
                id="adm-pass"
                label="Temporary password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                required
                minLength={8}
                variant="emerald"
                density="compact"
              />
              {formError ? <p className="text-sm text-red-400">{formError}</p> : null}
              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                {creating ? 'Creating…' : 'Add moderator'}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-zinc-900/40 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <h2 className="m-0 font-display text-xl font-semibold text-white">Moderators</h2>
              <button
                type="button"
                onClick={() => void load()}
                className="text-xs font-semibold uppercase tracking-wide text-emerald-400 hover:text-emerald-300"
              >
                Refresh
              </button>
            </div>
            {loading && lastUpdated === null ? <p className="mt-6 text-sm text-zinc-500">Loading…</p> : null}
            {error ? <p className="mt-6 text-sm text-red-400">{error}</p> : null}
            {!loading && !error && moderators.length === 0 ? (
              <p className="mt-6 text-sm text-zinc-500">No moderators yet — add one on the left.</p>
            ) : null}
            <ul className="mt-4 list-none space-y-2 p-0">
              {moderators.map((m) => (
                <li
                  key={m._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/5 bg-zinc-950/80 px-4 py-3"
                >
                  <div>
                    <p className="m-0 font-medium text-zinc-100">{m.name}</p>
                    <p className="m-0 text-xs text-zinc-500">{m.email}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/20">
                    {m.campus}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
