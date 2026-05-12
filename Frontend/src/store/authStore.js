import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // null means not logged in
  isAuthenticated: false,
  isAdmin: false,
  login: (userData) => set({ user: userData, isAuthenticated: true, isAdmin: userData.role === 'admin' }),
  logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),
}));
