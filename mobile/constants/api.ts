// API URL — uses environment variable or fallback to localhost
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  ATTENDANCE: {
    CHECK_IN: "/attendance/check-in",
    CHECK_OUT: "/attendance/check-out",
    MY: "/attendance/my",
    MONTHLY: "/attendance/monthly",
  },
  LEAVE: {
    BALANCE: "/leave/balance",
    APPLICATIONS: "/leave/applications",
    APPLY: "/leave/apply",
    APPROVE: (id: string) => `/leave/applications/${id}/approve`,
    REJECT: (id: string) => `/leave/applications/${id}/reject`,
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    REGISTER_PUSH: "/notifications/push-token",
  },
} as const;
