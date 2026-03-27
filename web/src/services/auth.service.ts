import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  LoginRequest,
  LoginResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SuccessResponse,
} from "@/types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>(API_ROUTES.AUTH.ME);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token");
    await api.post(API_ROUTES.AUTH.LOGOUT, { refresh_token: refreshToken });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<SuccessResponse> {
    const response = await api.post<SuccessResponse>(
      API_ROUTES.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<SuccessResponse> {
    const response = await api.post<SuccessResponse>(
      API_ROUTES.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  },
};
