import type { Article } from '../types/article.types';
import { ArticleCover } from './ArticleCover';

type Props = {
  article: Article;
  previewLength?: number;
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
};

function previewText(body: string, maxLen: number): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLen) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLen)}…`;
}

export function ArticleCard({
  article,
  previewLength = 140,
  onEdit,
  onDelete,
}: Props) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl shadow-black/20 ring-1 ring-white/5 transition duration-300 hover:-translate-y-0.5 hover:border-teal-500/20 hover:shadow-teal-950/20">
      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden">
        <ArticleCover
          src={article.imageUrl}
          alt={article.title}
          className="h-full w-full"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-300 ring-1 ring-teal-500/25">
            {article.category}
          </span>
          <span className="text-[11px] font-medium text-zinc-500">{article.campus}</span>
        </div>

        <h2 className="font-display text-lg leading-snug font-semibold tracking-tight text-white md:text-xl">
          {article.title}
        </h2>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
          {previewText(article.body, previewLength)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onEdit(article)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-500 px-3 py-2.5 text-sm font-semibold text-zinc-950 shadow-md shadow-teal-900/30 transition hover:bg-teal-400 sm:flex-none"
          >
            <svg className="h-4 w-4 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(article)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-950/80 sm:flex-none"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
