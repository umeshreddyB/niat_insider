import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes.constants';
import * as api from '../services/api.service';
import type { IUser } from '../types/auth.types';

export function useCurrentUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const u = await api.getMe();
      setUser(u);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setUser(null);
      if (message.includes('Session expired') || api.getStoredToken() === null) {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, loading, refresh };
}
