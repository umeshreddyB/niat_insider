import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArticleList } from '../components/ArticleList';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { EditArticleModal } from '../components/EditArticleModal';
import { ROUTES } from '../constants/routes.constants';
import { useArticles } from '../hooks/useArticles';
import { useCurrentUser } from '../hooks/useCurrentUser';
import * as api from '../services/api.service';
import type { Article } from '../types/article.types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useCurrentUser();
  const { articles, loading, error, fetchArticles, updateArticle, deleteArticle } = useArticles();
  const [editing, setEditing] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState<Article | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function handleLogout() {
    api.clearStoredToken();
    navigate(ROUTES.LOGIN, { replace: true });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3400);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf8f5]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
      <div className="pointer-events-none absolute right-0 top-24 h-96 w-96 rounded-full bg-fuchsia-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl" />

      <header className="relative border-b border-zinc-200/60 bg-white/80 shadow-sm shadow-zinc-900/[0.03] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg font-bold text-white shadow-lg shadow-violet-600/30">
              N
            </div>
            <div className="min-w-0">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600">NIAT Insider</p>
              <h1 className="m-0 font-display text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                Moderator hub
              </h1>
              {userLoading ? (
                <p className="mt-1 mb-0 text-sm text-zinc-500">Loading profile…</p>
              ) : user ? (
                <p className="mt-1.5 mb-0 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                  <span className="truncate font-medium text-zinc-800">{user.email}</span>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-900 ring-1 ring-violet-200/80">
                    {user.campus}
                  </span>
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="m-0 font-display text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Campus articles
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600">
              Curate stories for your campus. Add stunning cover images via URL — only your campus appears here.
            </p>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white">
              {articles.length} {articles.length === 1 ? 'story' : 'stories'}
            </span>
          </div>
        </div>

        {toast ? (
          <div
            className="fixed bottom-8 left-1/2 z-[2000] max-w-sm -translate-x-1/2 rounded-2xl border border-emerald-200/80 bg-white px-5 py-3 text-center text-sm font-medium text-emerald-900 shadow-2xl shadow-emerald-900/10 ring-1 ring-black/5"
            role="status"
          >
            {toast}
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-zinc-500">
            <span
              className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"
              aria-hidden
            />
            <p className="m-0 text-sm font-medium">Loading your articles…</p>
          </div>
        ) : null}

        {error ? (
          <div
            className="mb-6 rounded-2xl border border-red-200 bg-red-50/90 p-6 text-red-950 shadow-sm"
            role="alert"
          >
            <p className="m-0 font-display text-lg font-semibold">Could not load articles</p>
            <p className="mt-2 mb-4 text-sm leading-relaxed opacity-90">{error}</p>
            <button
              type="button"
              onClick={() => void fetchArticles()}
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
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
            showToast('Saved — your article looks great.');
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
