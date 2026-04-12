import { type FormEvent, useEffect, useState } from 'react';
import type { Article } from '../types/article.types';
import { ArticleCover } from './ArticleCover';

type Fields = { title: string; body: string; category: string; imageUrl: string };

type Props = {
  article: Article | null;
  onClose: () => void;
  onSave: (id: string, fields: Fields) => Promise<void>;
};

export function EditArticleModal({ article, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setBody(article.body);
      setCategory(article.category);
      setImageUrl(article.imageUrl ?? '');
      setSaveError(null);
    }
  }, [article]);

  if (article === null) {
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (article === null) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await onSave(article._id, {
        title: title.trim(),
        body: body.trim(),
        category: category.trim(),
        imageUrl: imageUrl.trim(),
      });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  const previewUrl = imageUrl.trim() || undefined;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-zinc-900/60 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-xl overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl shadow-violet-950/20"
        role="dialog"
        aria-labelledby="edit-article-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4">
          <h2 id="edit-article-title" className="m-0 font-display text-xl font-semibold text-white">
            Edit article
          </h2>
          <p className="mt-1 mb-0 text-sm text-violet-100">Update content and cover image URL</p>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[calc(92vh-5rem)] overflow-y-auto p-6">
          <div className="mb-5 overflow-hidden rounded-xl border border-zinc-200">
            <div className="aspect-[2/1] max-h-48 w-full">
              <ArticleCover src={previewUrl} alt="Cover preview" className="h-full w-full" />
            </div>
            <p className="m-0 bg-zinc-50 px-3 py-2 text-center text-[11px] text-zinc-500">
              Live preview — use any https image link (Unsplash, CDN, etc.)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="edit-imageUrl" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Cover image URL
              </label>
              <input
                id="edit-imageUrl"
                type="url"
                inputMode="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <p className="mt-1.5 text-xs text-zinc-500">Leave empty to use the gradient placeholder.</p>
            </div>

            <div>
              <label htmlFor="edit-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Title
              </label>
              <input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label htmlFor="edit-category" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Category
              </label>
              <input
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label htmlFor="edit-body" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Body
              </label>
              <textarea
                id="edit-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={7}
                className="w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm leading-relaxed focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          {saveError ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 ring-1 ring-red-100">{saveError}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/25 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
