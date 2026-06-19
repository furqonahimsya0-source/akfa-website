import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Custom storage that gracefully handles environments where localStorage is unavailable
const safeStorage = createJSONStorage(() => {
  try {
    // Test if localStorage is actually writable
    const testKey = '__akfa_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    // Return a no-op in-memory storage as fallback
    const memoryStore: Record<string, string | null> = {};
    return {
      getItem: (name: string) => memoryStore[name] ?? null,
      setItem: (name: string, value: string) => { memoryStore[name] = value; },
      removeItem: (name: string) => { memoryStore[name] = null; },
    };
  }
});

interface AdminState {
  isAuthenticated: boolean;
  adminToken: string;
  login: (token: string) => void;
  logout: () => void;
  getToken: () => string;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      adminToken: '',

      login: (token: string) => {
        set({ isAuthenticated: true, adminToken: token });
      },

      logout: () => {
        set({ isAuthenticated: false, adminToken: '' });
      },

      getToken: () => get().adminToken,
    }),
    {
      name: 'akfa-admin-session',
      storage: safeStorage,
      // Don't reset state on rehydration errors
      onRehydrateStorage: () => (state) => {
        // State is preserved even if rehydration fails
      },
    }
  )
);
