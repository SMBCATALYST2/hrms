import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attendanceService,
  type CheckInRequest,
  type MonthlyAttendanceParams,
} from "../services/attendance.service";

const ATTENDANCE_KEYS = {
  all: ["attendance"] as const,
  my: () => [...ATTENDANCE_KEYS.all, "my"] as const,
  monthly: (params: MonthlyAttendanceParams) =>
    [...ATTENDANCE_KEYS.all, "monthly", params] as const,
};

export function useMyAttendance(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEYS.my(), params],
    queryFn: () => attendanceService.getMyAttendance(params),
  });
}

export function useMonthlyAttendance(params: MonthlyAttendanceParams) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.monthly(params),
    queryFn: () => attendanceService.getMonthlyAttendance(params),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CheckInRequest) => attendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CheckInRequest) => attendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    },
  });
}
