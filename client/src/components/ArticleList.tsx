import type { Article } from '../types/article.types';
import { ArticleCard } from './ArticleCard';

type Props = {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (article: Article) => void;
};

export function ArticleList({ articles, onEdit, onDelete }: Props) {
  if (articles.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-violet-200 bg-gradient-to-br from-violet-50/80 to-amber-50/40 px-8 py-16 text-center">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-300/25 blur-3xl" />
        <p className="relative m-0 font-display text-xl font-semibold text-zinc-800">No articles yet</p>
        <p className="relative mt-2 mb-0 max-w-md mx-auto text-sm leading-relaxed text-zinc-600">
          When stories are published for your campus, they will appear here as beautiful cards with cover images.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid list-none gap-6 p-0 sm:grid-cols-1 lg:grid-cols-2">
      {articles.map((article) => (
        <li key={article._id} className="min-w-0">
          <ArticleCard article={article} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
