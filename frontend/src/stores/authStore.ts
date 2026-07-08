import { create } from 'zustand';

interface User {
  name: string;
  email: string;
  picture?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  checkingAuth: boolean;
  checkAuth: () => Promise<void>;
  login: (user: User) => void;
  logout: () => Promise<void>;
  handleSessionExpired: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  checkingAuth: true,
  
  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const user = await response.json();
        set({ isAuthenticated: true, user, checkingAuth: false });
      } else {
        set({ isAuthenticated: false, user: null, checkingAuth: false });
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      set({ isAuthenticated: false, user: null, checkingAuth: false });
    }
  },
  
  login: (user: User) => {
    set({ isAuthenticated: true, user });
  },
  
  logout: async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to notify backend on logout:', error);
    }
    set({ isAuthenticated: false, user: null });
  },

  handleSessionExpired: () => {
    // Check if user is currently authenticated to avoid double-alerting
    if (useAuthStore.getState().isAuthenticated) {
      alert("Your session has expired. You will be redirected to the login page.");
      set({ isAuthenticated: false, user: null });
    }
  },
}));
