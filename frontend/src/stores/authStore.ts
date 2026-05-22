import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize state based on localStorage so it persists across reloads
  isAuthenticated: !!localStorage.getItem('authToken'),
  
  login: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    set({ isAuthenticated: false });
  },
}));
