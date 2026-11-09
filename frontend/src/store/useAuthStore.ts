import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthResponse, AuthUser } from '../types';

export interface AuthStoreState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (auth: AuthResponse) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (auth) =>
        set(() => ({
          user: auth.user,
          accessToken: auth.accessToken,
        })),
      setUser: (user) =>
        set(() => ({
          user,
        })),
      logout: () =>
        set(() => ({
          user: null,
          accessToken: null,
        })),
    }),
    {
      name: 'brewlite-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
