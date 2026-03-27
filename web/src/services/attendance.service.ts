import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  AttendanceRecord,
  AttendanceSummary,
  CheckInRequest,
  CheckOutRequest,
  Shift,
  CreateShiftRequest,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

export const attendanceService = {
  async list(params?: PaginationParams): Promise<PaginatedResponse<AttendanceRecord>> {
    const response = await api.get<PaginatedResponse<AttendanceRecord>>(
      API_ROUTES.ATTENDANCE.BASE,
      { params }
    );
    return response.data;
  },

  async getMyAttendance(params?: {
    month?: number;
    year?: number;
  }): Promise<AttendanceRecord[]> {
    const response = await api.get<AttendanceRecord[]>(
      API_ROUTES.ATTENDANCE.MY,
      { params }
    );
    return response.data;
  },

  async getSummary(params?: {
    employee_id?: string;
    month?: number;
    year?: number;
  }): Promise<AttendanceSummary> {
    const response = await api.get<AttendanceSummary>(
      API_ROUTES.ATTENDANCE.SUMMARY,
      { params }
    );
    return response.data;
  },

  async checkIn(data: CheckInRequest): Promise<AttendanceRecord> {
    const response = await api.post<AttendanceRecord>(
      API_ROUTES.ATTENDANCE.CHECK_IN,
      data
    );
    return response.data;
  },

  async checkOut(data: CheckOutRequest): Promise<AttendanceRecord> {
    const response = await api.post<AttendanceRecord>(
      API_ROUTES.ATTENDANCE.CHECK_OUT,
      data
    );
    return response.data;
  },

  async listShifts(): Promise<Shift[]> {
    const response = await api.get<Shift[]>(API_ROUTES.SHIFTS.BASE);
    return response.data;
  },

  async createShift(data: CreateShiftRequest): Promise<Shift> {
    const response = await api.post<Shift>(API_ROUTES.SHIFTS.BASE, data);
    return response.data;
  },

  async updateShift(id: string, data: Partial<CreateShiftRequest>): Promise<Shift> {
    const response = await api.patch<Shift>(API_ROUTES.SHIFTS.DETAIL(id), data);
    return response.data;
  },

  async deleteShift(id: string): Promise<void> {
    await api.delete(API_ROUTES.SHIFTS.DETAIL(id));
  },
};
