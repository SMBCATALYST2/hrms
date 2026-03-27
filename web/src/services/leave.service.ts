import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  LeaveType,
  LeaveApplication,
  LeaveBalance,
  LeavePolicy,
  Holiday,
  CreateLeaveApplicationRequest,
  PaginatedResponse,
  PaginationParams,
  SuccessResponse,
} from "@/types";

export const leaveService = {
  async listTypes(): Promise<LeaveType[]> {
    const response = await api.get<LeaveType[]>(API_ROUTES.LEAVES.TYPES);
    return response.data;
  },

  async listApplications(
    params?: PaginationParams & { status?: string; employee_id?: string }
  ): Promise<PaginatedResponse<LeaveApplication>> {
    const response = await api.get<PaginatedResponse<LeaveApplication>>(
      API_ROUTES.LEAVES.APPLICATIONS,
      { params }
    );
    return response.data;
  },

  async getApplicationById(id: string): Promise<LeaveApplication> {
    const response = await api.get<LeaveApplication>(
      API_ROUTES.LEAVES.APPLICATION_DETAIL(id)
    );
    return response.data;
  },

  async applyLeave(data: CreateLeaveApplicationRequest): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      API_ROUTES.LEAVES.APPLICATIONS,
      data
    );
    return response.data;
  },

  async cancelLeave(id: string): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      `${API_ROUTES.LEAVES.APPLICATION_DETAIL(id)}/cancel`
    );
    return response.data;
  },

  async approveLeave(id: string): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      `${API_ROUTES.LEAVES.APPLICATION_DETAIL(id)}/approve`
    );
    return response.data;
  },

  async rejectLeave(id: string, reason: string): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      `${API_ROUTES.LEAVES.APPLICATION_DETAIL(id)}/reject`,
      { reason }
    );
    return response.data;
  },

  async getBalance(): Promise<LeaveBalance[]> {
    const response = await api.get<LeaveBalance[]>(API_ROUTES.LEAVES.BALANCE);
    return response.data;
  },

  async listPolicies(): Promise<LeavePolicy[]> {
    const response = await api.get<LeavePolicy[]>(API_ROUTES.LEAVES.POLICIES);
    return response.data;
  },

  async listHolidays(params?: { year?: number }): Promise<Holiday[]> {
    const response = await api.get<Holiday[]>(API_ROUTES.LEAVES.HOLIDAYS, {
      params,
    });
    return response.data;
  },

  async createHoliday(data: Omit<Holiday, "id">): Promise<Holiday> {
    const response = await api.post<Holiday>(API_ROUTES.LEAVES.HOLIDAYS, data);
    return response.data;
  },
};
