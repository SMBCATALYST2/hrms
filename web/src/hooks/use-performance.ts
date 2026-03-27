import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { performanceService } from "@/services/performance.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateObjectiveRequest, PaginationParams } from "@/types";
import { toast } from "sonner";

export function useOKRCycles() {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE.OKR_CYCLES(),
    queryFn: () => performanceService.listOKRCycles(),
  });
}

export function useObjectives(params?: PaginationParams & { cycle_id?: string; owner_id?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE.OBJECTIVES(params),
    queryFn: () => performanceService.listObjectives(params),
  });
}

export function useObjective(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE.OBJECTIVE_DETAIL(id),
    queryFn: () => performanceService.getObjective(id),
    enabled: !!id,
  });
}

export function useCreateObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateObjectiveRequest) => performanceService.createObjective(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.ALL });
      toast.success("Objective created");
    },
    onError: () => {
      toast.error("Failed to create objective");
    },
  });
}

export function useUpdateKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { current_value: number; notes?: string } }) =>
      performanceService.updateKeyResult(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.ALL });
      toast.success("Key result updated");
    },
    onError: () => {
      toast.error("Failed to update key result");
    },
  });
}

export function useReviewCycles() {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE.REVIEW_CYCLES(),
    queryFn: () => performanceService.listReviewCycles(),
  });
}

export function useReviews(params?: PaginationParams & { review_cycle_id?: string; status?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE.REVIEWS(params),
    queryFn: () => performanceService.listReviews(params),
  });
}

export function useMyReview(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE.REVIEW_DETAIL(id),
    queryFn: () => performanceService.getReview(id),
    enabled: !!id,
  });
}

export function useSubmitSelfReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { self_rating: number; self_comments: string } }) =>
      performanceService.submitSelfReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.ALL });
      toast.success("Self review submitted");
    },
    onError: () => {
      toast.error("Failed to submit self review");
    },
  });
}

export function useSubmitManagerReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        manager_rating: number;
        manager_comments: string;
        strengths?: string;
        areas_of_improvement?: string;
        goals_for_next_period?: string;
      };
    }) => performanceService.submitManagerReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFORMANCE.ALL });
      toast.success("Manager review submitted");
    },
    onError: () => {
      toast.error("Failed to submit manager review");
    },
  });
}
