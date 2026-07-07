import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface User {
  name: string;
  email: string;
  picture?: string;
  role?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => Promise<void>;
}

const getUserFromToken = (token: string | null): User | null => {
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return {
      name: decoded.name || 'User',
      email: decoded.email || '',
      picture: decoded.picture || '',
      role: decoded.role || 'user',
    };
  } catch (error) {
    return null;
  }
};

const initialToken = localStorage.getItem('authToken');
export const useAuthStore = create<AuthState>((set) => ({
  // Initialize state based on localStorage so it persists across reloads
  isAuthenticated: !!initialToken,
  user: getUserFromToken(initialToken),
  
  login: (token: string) => {
    localStorage.setItem('authToken', token);
    set({ isAuthenticated: true, user: getUserFromToken(token) });
  },
  
  logout: async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Failed to notify backend on logout:', error);
      }
    }
    localStorage.removeItem('authToken');
    set({ isAuthenticated: false, user: null });
  },
}));
