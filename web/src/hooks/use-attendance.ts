import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CheckInRequest, CheckOutRequest, PaginationParams, CreateShiftRequest } from "@/types";
import { toast } from "sonner";

export function useMyAttendance(params?: { month?: number; year?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.ATTENDANCE.MY(params),
    queryFn: () => attendanceService.getMyAttendance(params),
  });
}

export function useAttendanceSummary(params?: {
  employee_id?: string;
  month?: number;
  year?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.ATTENDANCE.SUMMARY(params),
    queryFn: () => attendanceService.getSummary(params),
  });
}

export function useAttendanceList(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.ATTENDANCE.LIST(params),
    queryFn: () => attendanceService.list(params),
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInRequest) => attendanceService.checkIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ALL });
      toast.success("Checked in successfully");
    },
    onError: () => {
      toast.error("Failed to check in");
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutRequest) => attendanceService.checkOut(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ATTENDANCE.ALL });
      toast.success("Checked out successfully");
    },
    onError: () => {
      toast.error("Failed to check out");
    },
  });
}

export function useShifts() {
  return useQuery({
    queryKey: QUERY_KEYS.SHIFTS.LIST(),
    queryFn: () => attendanceService.listShifts(),
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateShiftRequest) => attendanceService.createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHIFTS.ALL });
      toast.success("Shift created successfully");
    },
    onError: () => {
      toast.error("Failed to create shift");
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateShiftRequest> }) =>
      attendanceService.updateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHIFTS.ALL });
      toast.success("Shift updated successfully");
    },
    onError: () => {
      toast.error("Failed to update shift");
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceService.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SHIFTS.ALL });
      toast.success("Shift deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete shift");
    },
  });
}
