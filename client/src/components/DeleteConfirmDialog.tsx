import { useState } from 'react';
import type { Article } from '../types/article.types';
import { ArticleCover } from './ArticleCover';

type Props = {
  article: Article | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteConfirmDialog({ article, onCancel, onConfirm }: Props) {
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (article === null) {
    return null;
  }

  async function handleConfirm() {
    setWorking(true);
    setErr(null);
    try {
      await onConfirm();
      onCancel();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl"
        role="alertdialog"
        aria-labelledby="delete-title"
      >
        <div className="aspect-[2/1] max-h-36 w-full">
          <ArticleCover src={article.imageUrl} alt={article.title} className="h-full w-full" />
        </div>
        <div className="p-6">
          <h2 id="delete-title" className="m-0 font-display text-xl font-semibold text-zinc-900">
            Delete this article?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            <span className="font-semibold text-zinc-800">{article.title}</span> will be permanently removed.
            This cannot be undone.
          </p>
          {err ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p> : null}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={working}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {working ? 'Deleting…' : 'Delete permanently'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={working}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
