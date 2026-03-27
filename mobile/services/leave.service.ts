import { api } from "./api";
import { API_ROUTES } from "../constants/api";

export type LeaveApplicationStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface LeaveBalance {
  id: string;
  leave_type_id: string;
  leave_type_name: string;
  total_allocated: number;
  used: number;
  pending: number;
  available: number;
  carry_forward: number;
}

export interface LeaveApplication {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_avatar?: string;
  leave_type_id: string;
  leave_type_name: string;
  from_date: string;
  to_date: string;
  total_days: number;
  half_day: boolean;
  half_day_date?: string;
  reason: string;
  status: LeaveApplicationStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface ApplyLeaveRequest {
  leave_type_id: string;
  from_date: string;
  to_date: string;
  half_day: boolean;
  half_day_date?: string;
  reason: string;
}

export interface ApproveRejectRequest {
  comment?: string;
}

export const leaveService = {
  async getBalance(): Promise<LeaveBalance[]> {
    const response = await api.get<LeaveBalance[]>(API_ROUTES.LEAVE.BALANCE);
    return response.data;
  },

  async getApplications(params?: {
    status?: LeaveApplicationStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: LeaveApplication[]; total: number }> {
    const response = await api.get(API_ROUTES.LEAVE.APPLICATIONS, { params });
    return response.data;
  },

  async getApplication(id: string): Promise<LeaveApplication> {
    const response = await api.get<LeaveApplication>(
      `${API_ROUTES.LEAVE.APPLICATIONS}/${id}`
    );
    return response.data;
  },

  async applyLeave(data: ApplyLeaveRequest): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      API_ROUTES.LEAVE.APPLY,
      data
    );
    return response.data;
  },

  async approveLeave(
    id: string,
    data?: ApproveRejectRequest
  ): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      API_ROUTES.LEAVE.APPROVE(id),
      data || {}
    );
    return response.data;
  },

  async rejectLeave(
    id: string,
    data?: ApproveRejectRequest
  ): Promise<LeaveApplication> {
    const response = await api.post<LeaveApplication>(
      API_ROUTES.LEAVE.REJECT(id),
      data || {}
    );
    return response.data;
  },
};
