// store/useAuthStore.ts
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
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // Unique key for the localStorage item
      // Optional: You can choose sessionStorage instead by adding:
      // storage: createJSONStorage(() => sessionStorage)
    }
  )
);

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   token: null,
//   setAuth: (user, token) => set({ user, token }),
//   logout: () => set({ user: null, token: null }),
// }));
