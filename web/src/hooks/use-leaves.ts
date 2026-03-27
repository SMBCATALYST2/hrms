import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leave.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateLeaveApplicationRequest, PaginationParams } from "@/types";
import { toast } from "sonner";

export function useLeaveBalance() {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVES.BALANCE(),
    queryFn: () => leaveService.getBalance(),
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVES.TYPES(),
    queryFn: () => leaveService.listTypes(),
  });
}

export function useLeaveApplications(
  params?: PaginationParams & { status?: string; employee_id?: string }
) {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVES.APPLICATIONS(params),
    queryFn: () => leaveService.listApplications(params),
  });
}

export function useApplyLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveApplicationRequest) => leaveService.applyLeave(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVES.ALL });
      toast.success("Leave application submitted");
    },
    onError: () => {
      toast.error("Failed to submit leave application");
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveService.approveLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVES.ALL });
      toast.success("Leave approved");
    },
    onError: () => {
      toast.error("Failed to approve leave");
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leaveService.rejectLeave(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVES.ALL });
      toast.success("Leave rejected");
    },
    onError: () => {
      toast.error("Failed to reject leave");
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leaveService.cancelLeave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LEAVES.ALL });
      toast.success("Leave cancelled");
    },
    onError: () => {
      toast.error("Failed to cancel leave");
    },
  });
}

export function useLeavePolicies() {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVES.POLICIES(),
    queryFn: () => leaveService.listPolicies(),
  });
}

export function useHolidays(params?: { year?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.LEAVES.HOLIDAYS(),
    queryFn: () => leaveService.listHolidays(params),
  });
}
