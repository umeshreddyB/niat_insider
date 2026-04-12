import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';
import * as api from '../services/api.service';
import type { Article } from '../types/article.types';

export function useArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getArticles();
      setArticles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load articles';
      setError(message);
      if (message.includes('Session expired') || api.getStoredToken() === null) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void fetchArticles();
  }, [fetchArticles]);

  const updateArticle = async (
    id: string,
    fields: { title: string; body: string; category: string; imageUrl: string },
  ): Promise<void> => {
    setError(null);
    try {
      const updated = await api.updateArticle(id, fields);
      setArticles((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      if (message.includes('Session expired') || api.getStoredToken() === null) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
      throw err;
    }
  };

  const deleteArticle = async (id: string): Promise<void> => {
    setError(null);
    try {
      await api.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      if (message.includes('Session expired') || api.getStoredToken() === null) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
      throw err;
    }
  };

  return {
    articles,
    loading,
    error,
    fetchArticles,
    updateArticle,
    deleteArticle,
  };
}
