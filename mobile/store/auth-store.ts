import { create } from "zustand";
import { storage } from "../utils/storage";
import {
  authService,
  type User,
  type LoginRequest,
  type LoginResponse,
} from "../services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      const token = await storage.getAccessToken();
      if (!token) {
        set({ isInitialized: true, isLoading: false });
        return;
      }

      // Try to get stored user first for fast load
      const storedUser = await storage.getUser();
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          set({ user, isAuthenticated: true });
        } catch {
          // Invalid stored user data
        }
      }

      // Validate token by fetching current user
      try {
        const user = await authService.getMe();
        set({ user, isAuthenticated: true });
      } catch {
        // Token is invalid, clear everything
        await storage.clearTokens();
        set({ user: null, isAuthenticated: false });
      }
    } finally {
      set({ isInitialized: true, isLoading: false });
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return response;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  refreshUser: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
    } catch {
      // Silently fail — user data stays stale
    }
  },
}));
