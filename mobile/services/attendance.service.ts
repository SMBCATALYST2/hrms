import { api } from "./api";
import { API_ROUTES } from "../constants/api";

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "on_leave"
  | "holiday"
  | "weekly_off"
  | "work_from_home";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  working_hours?: number;
  late_entry?: boolean;
  early_exit?: boolean;
  overtime_hours?: number;
  notes?: string;
}

export interface CheckInRequest {
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface CheckInResponse {
  id: string;
  check_in_time: string;
  status: AttendanceStatus;
}

export interface CheckOutResponse {
  id: string;
  check_out_time: string;
  working_hours: number;
  status: AttendanceStatus;
}

export interface MonthlyAttendanceParams {
  month: number; // 1-12
  year: number;
}

export interface MonthlyAttendanceSummary {
  records: AttendanceRecord[];
  summary: {
    present: number;
    absent: number;
    half_day: number;
    on_leave: number;
    holiday: number;
    weekly_off: number;
    work_from_home: number;
    total_working_days: number;
    total_working_hours: number;
  };
}

export const attendanceService = {
  async checkIn(data?: CheckInRequest): Promise<CheckInResponse> {
    const response = await api.post<CheckInResponse>(
      API_ROUTES.ATTENDANCE.CHECK_IN,
      data || {}
    );
    return response.data;
  },

  async checkOut(data?: CheckInRequest): Promise<CheckOutResponse> {
    const response = await api.post<CheckOutResponse>(
      API_ROUTES.ATTENDANCE.CHECK_OUT,
      data || {}
    );
    return response.data;
  },

  async getMyAttendance(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: AttendanceRecord[]; total: number }> {
    const response = await api.get(API_ROUTES.ATTENDANCE.MY, { params });
    return response.data;
  },

  async getMonthlyAttendance(
    params: MonthlyAttendanceParams
  ): Promise<MonthlyAttendanceSummary> {
    const response = await api.get(API_ROUTES.ATTENDANCE.MONTHLY, { params });
    return response.data;
  },
};
