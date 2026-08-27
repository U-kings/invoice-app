import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggingOut: boolean; // 🚀 Added tracking flag state
  setAuth: (user: User, token: string) => void;
  setLoggingOut: (status: boolean) => void; // 🚀 Added state setter action
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggingOut: false, // Initialized safely to false
      setAuth: (user, token) => set({ user, token, isLoggingOut: false }),
      setLoggingOut: (status) => set({ isLoggingOut: status }),
      logout: () => set({ user: null, token: null, isLoggingOut: false }),
    }),
    {
      name: 'auth-storage', // Unique key for the localStorage item
      
      // 🚀 THE SECURITY FIX: Only persist user and token. 
      // This completely prevents 'isLoggingOut: true' from getting stuck in localStorage!
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
