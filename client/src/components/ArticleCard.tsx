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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/5 ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-950/10">
      <div className="aspect-[16/10] w-full shrink-0 overflow-hidden">
        <ArticleCover
          src={article.imageUrl}
          alt={article.title}
          className="h-full w-full"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-800">
            {article.category}
          </span>
          <span className="text-[11px] font-medium text-zinc-400">{article.campus}</span>
        </div>

        <h2 className="font-display text-lg leading-snug font-semibold tracking-tight text-zinc-900 md:text-xl">
          {article.title}
        </h2>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600">
          {previewText(article.body, previewLength)}
        </p>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-4">
          <button
            type="button"
            onClick={() => onEdit(article)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white shadow-md shadow-zinc-900/20 transition hover:bg-zinc-800 sm:flex-none"
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
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/80 px-3 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100 sm:flex-none"
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
