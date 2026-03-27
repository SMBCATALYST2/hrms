import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recruitmentService } from "@/services/recruitment.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateJobOpeningRequest, PaginationParams } from "@/types";
import { toast } from "sonner";

export function useJobOpenings(params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT.JOB_OPENINGS(params),
    queryFn: () => recruitmentService.listJobOpenings(params),
  });
}

export function useJobOpening(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT.JOB_OPENING_DETAIL(id),
    queryFn: () => recruitmentService.getJobOpening(id),
    enabled: !!id,
  });
}

export function useCreateJobOpening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobOpeningRequest) => recruitmentService.createJobOpening(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECRUITMENT.ALL });
      toast.success("Job opening created");
    },
    onError: () => {
      toast.error("Failed to create job opening");
    },
  });
}

export function useApplications(
  params?: PaginationParams & { job_opening_id?: string; stage?: string }
) {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT.APPLICATIONS(params),
    queryFn: () => recruitmentService.listApplications(params),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT.APPLICATION_DETAIL(id),
    queryFn: () => recruitmentService.getApplication(id),
    enabled: !!id,
  });
}

export function useUpdateApplicationStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: string; notes?: string }) =>
      recruitmentService.updateApplicationStage(id, stage, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECRUITMENT.ALL });
      toast.success("Application stage updated");
    },
    onError: () => {
      toast.error("Failed to update application stage");
    },
  });
}

export function useInterviews(params?: PaginationParams & { status?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT.INTERVIEWS(params),
    queryFn: () => recruitmentService.listInterviews(params),
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      application_id: string;
      interviewer_ids: string[];
      scheduled_at: string;
      duration_minutes: number;
      type: string;
      location?: string;
      meeting_link?: string;
    }) => recruitmentService.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECRUITMENT.ALL });
      toast.success("Interview scheduled");
    },
    onError: () => {
      toast.error("Failed to schedule interview");
    },
  });
}

export function useOffers(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.RECRUITMENT.OFFERS(params),
    queryFn: () => recruitmentService.listOffers(params),
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      application_id: string;
      offered_salary: number;
      joining_date: string;
      expiry_date: string;
      template_id?: string;
    }) => recruitmentService.createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECRUITMENT.ALL });
      toast.success("Offer letter created");
    },
    onError: () => {
      toast.error("Failed to create offer letter");
    },
  });
}

export function useGenerateJD() {
  return useMutation({
    mutationFn: (data: {
      title: string;
      department?: string;
      experience_level?: string;
      skills?: string[];
    }) => recruitmentService.generateJD(data),
    onError: () => {
      toast.error("Failed to generate job description");
    },
  });
}
