import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleList } from '../components/ArticleList';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { EditArticleModal } from '../components/EditArticleModal';
import { ROUTES } from '../constants/routes.constants';
import { useAuth } from '../context/AuthContext';
import { useArticles } from '../hooks/useArticles';
import { useCurrentUser } from '../hooks/useCurrentUser';
import type { Article } from '../types/article.types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, loading: userLoading } = useCurrentUser();
  const { articles, loading, error, fetchArticles, updateArticle, deleteArticle } = useArticles();
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function handleLogout() {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3400);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-20%,rgba(45,212,191,0.12),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-cyan-500/5 blur-3xl" />

      <header className="relative border-b border-white/10 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
          <div className="flex min-w-0 items-start gap-4">
            <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 text-lg font-black text-zinc-950 shadow-lg shadow-teal-900/40">
              N
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.28em] text-teal-400/90">Moderator</p>
              <h1 className="m-0 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Your campus feed
              </h1>
              {userLoading ? (
                <p className="mt-2 mb-0 text-sm text-zinc-500">Loading…</p>
              ) : user ? (
                <p className="mt-2 mb-0 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                  <span className="font-semibold text-zinc-100">{user.name}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="truncate">{user.email}</span>
                  <span className="inline-flex shrink-0 rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 ring-1 ring-teal-500/25">
                    {user.campus}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="m-0 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">Articles</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-500">
              Stories scoped to your school — edit, cover images, and categories. Only your campus appears here.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-bold text-teal-300">
              {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>

        {toast ? (
          <div
            className="fixed bottom-8 left-1/2 z-[2000] max-w-sm -translate-x-1/2 rounded-2xl border border-teal-500/30 bg-zinc-900/95 px-5 py-3 text-center text-sm font-medium text-teal-100 shadow-2xl"
            role="status"
          >
            {toast}
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-zinc-500">
            <span
              className="h-10 w-10 animate-spin rounded-full border-2 border-teal-500/20 border-t-teal-400"
              aria-hidden
            />
            <p className="m-0 text-sm font-medium">Loading articles…</p>
          </div>
        ) : null}

        {error ? (
          <div
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-red-100"
            role="alert"
          >
            <p className="m-0 font-display text-lg font-semibold">Could not load articles</p>
            <p className="mt-2 mb-4 text-sm leading-relaxed opacity-90">{error}</p>
            <button
              type="button"
              onClick={() => void fetchArticles()}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
            >
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !error ? <ArticleList articles={articles} onEdit={setEditing} onDelete={setDeleting} /> : null}

        <EditArticleModal
          article={editing}
          onClose={() => setEditing(null)}
          onSave={async (id, fields) => {
            await updateArticle(id, fields);
            showToast('Saved.');
          }}
        />

        <DeleteConfirmDialog
          article={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            if (deleting) {
              await deleteArticle(deleting._id);
              showToast('Article removed.');
            }
          }}
        />
      </main>
    </div>
  );
}
