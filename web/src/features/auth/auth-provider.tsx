import React from "react";
import { AuthContext, type AuthContextValue } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import type { User, UserRole } from "@/types";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const isAuthenticated = !!user;

  // Auto-refresh user on mount
  React.useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      authService
        .getMe()
        .then((meData: any) => {
          setUser({
            id: meData.id,
            email: meData.email,
            full_name: meData.full_name || meData.email.split("@")[0],
            avatar_url: meData.avatar_url,
            role: meData.role || (meData.roles && meData.roles[0]) || "employee",
            employee_id: meData.employee_id,
            is_active: meData.is_active,
            permissions: meData.permissions || [],
            created_at: meData.created_at,
          });
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem("access_token", response.access_token);
    localStorage.setItem("refresh_token", response.refresh_token);
    // Fetch user profile after storing tokens
    const meData: any = await authService.getMe();
    // Map API response to frontend User shape
    setUser({
      id: meData.id,
      email: meData.email,
      full_name: meData.full_name || meData.email.split("@")[0],
      avatar_url: meData.avatar_url,
      role: meData.role || (meData.roles && meData.roles[0]) || "employee",
      employee_id: meData.employee_id,
      is_active: meData.is_active,
      permissions: meData.permissions || [],
      created_at: meData.created_at,
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors during logout
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
