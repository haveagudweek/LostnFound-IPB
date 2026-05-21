import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (userData) => set({
        user: userData,
        isAuthenticated: true,
        isAdmin: userData.role === 'admin',
      }),
      logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),
    }),
    {
      name: 'seekem-auth',
      partialize: (state) => ({ user: state.user }),
      merge: (persistedState, currentState) => {
        const user = persistedState?.user || null;
        return {
          ...currentState,
          user,
          isAuthenticated: Boolean(user),
          isAdmin: user?.role === 'admin',
        };
      },
    }
  )
);
