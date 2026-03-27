import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  leaveService,
  type LeaveApplicationStatus,
  type ApplyLeaveRequest,
  type ApproveRejectRequest,
} from "../services/leave.service";

const LEAVE_KEYS = {
  all: ["leaves"] as const,
  balance: () => [...LEAVE_KEYS.all, "balance"] as const,
  applications: (status?: LeaveApplicationStatus) =>
    [...LEAVE_KEYS.all, "applications", status] as const,
  application: (id: string) =>
    [...LEAVE_KEYS.all, "application", id] as const,
};

export function useLeaveBalance() {
  return useQuery({
    queryKey: LEAVE_KEYS.balance(),
    queryFn: () => leaveService.getBalance(),
  });
}

export function useLeaveApplications(params?: {
  status?: LeaveApplicationStatus;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...LEAVE_KEYS.applications(params?.status), params],
    queryFn: () => leaveService.getApplications(params),
  });
}

export function useLeaveApplication(id: string) {
  return useQuery({
    queryKey: LEAVE_KEYS.application(id),
    queryFn: () => leaveService.getApplication(id),
    enabled: !!id,
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplyLeaveRequest) => leaveService.applyLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.all });
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: ApproveRejectRequest;
    }) => leaveService.approveLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.all });
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: ApproveRejectRequest;
    }) => leaveService.rejectLeave(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.all });
    },
  });
}
