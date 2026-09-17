import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (session: { token: string; user: AuthUser }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      clearSession: () => set({ token: null, user: null })
    }),
    { name: 'dashboard-auth' }
  )
);

/** True once the persisted session has been read from localStorage. */
export function useAuthHasHydrated() {
  // `persist` is only attached client-side — the middleware bails out
  // entirely during SSR since it needs `window.localStorage`.
  const [hydrated, setHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated() ?? false
  );

  useEffect(() => {
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
