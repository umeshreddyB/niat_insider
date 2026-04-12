import { useAuth } from '../context/AuthContext';

/** Profile for the logged-in user (from AuthContext). */
export function useCurrentUser() {
  const { user, loading, refreshUser } = useAuth();
  return { user, loading, refresh: refreshUser };
}
