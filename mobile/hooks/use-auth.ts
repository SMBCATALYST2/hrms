import { useAuthStore } from "../store/auth-store";
import type { UserRole } from "../services/auth.service";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    refreshUser,
  } = useAuthStore();

  const isManager =
    user?.role === "manager" ||
    user?.role === "department_head" ||
    user?.role === "hr_manager" ||
    user?.role === "hr_admin" ||
    user?.role === "super_admin";

  const isHR =
    user?.role === "hr_admin" ||
    user?.role === "hr_manager" ||
    user?.role === "super_admin";

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    isManager,
    isHR,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
  };
}
