import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  OKRCycle,
  Objective,
  KeyResult,
  CreateObjectiveRequest,
  ReviewCycle,
  PerformanceReview,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

export const performanceService = {
  // OKR
  async listOKRCycles(): Promise<OKRCycle[]> {
    const response = await api.get<OKRCycle[]>(API_ROUTES.PERFORMANCE.OKR_CYCLES);
    return response.data;
  },

  async listObjectives(
    params?: PaginationParams & { cycle_id?: string; owner_id?: string }
  ): Promise<PaginatedResponse<Objective>> {
    const response = await api.get<PaginatedResponse<Objective>>(
      API_ROUTES.PERFORMANCE.OBJECTIVES,
      { params }
    );
    return response.data;
  },

  async getObjective(id: string): Promise<Objective> {
    const response = await api.get<Objective>(
      API_ROUTES.PERFORMANCE.OBJECTIVE_DETAIL(id)
    );
    return response.data;
  },

  async createObjective(data: CreateObjectiveRequest): Promise<Objective> {
    const response = await api.post<Objective>(
      API_ROUTES.PERFORMANCE.OBJECTIVES,
      data
    );
    return response.data;
  },

  async updateObjective(
    id: string,
    data: Partial<CreateObjectiveRequest>
  ): Promise<Objective> {
    const response = await api.patch<Objective>(
      API_ROUTES.PERFORMANCE.OBJECTIVE_DETAIL(id),
      data
    );
    return response.data;
  },

  async updateKeyResult(
    id: string,
    data: { current_value: number; notes?: string }
  ): Promise<KeyResult> {
    const response = await api.patch<KeyResult>(
      API_ROUTES.PERFORMANCE.KEY_RESULT_DETAIL(id),
      data
    );
    return response.data;
  },

  // Performance Reviews
  async listReviewCycles(): Promise<ReviewCycle[]> {
    const response = await api.get<ReviewCycle[]>(
      API_ROUTES.PERFORMANCE.REVIEW_CYCLES
    );
    return response.data;
  },

  async listReviews(
    params?: PaginationParams & { review_cycle_id?: string; status?: string }
  ): Promise<PaginatedResponse<PerformanceReview>> {
    const response = await api.get<PaginatedResponse<PerformanceReview>>(
      API_ROUTES.PERFORMANCE.REVIEWS,
      { params }
    );
    return response.data;
  },

  async getReview(id: string): Promise<PerformanceReview> {
    const response = await api.get<PerformanceReview>(
      API_ROUTES.PERFORMANCE.REVIEW_DETAIL(id)
    );
    return response.data;
  },

  async submitSelfReview(
    id: string,
    data: { self_rating: number; self_comments: string }
  ): Promise<PerformanceReview> {
    const response = await api.post<PerformanceReview>(
      `${API_ROUTES.PERFORMANCE.REVIEW_DETAIL(id)}/self-review`,
      data
    );
    return response.data;
  },

  async submitManagerReview(
    id: string,
    data: {
      manager_rating: number;
      manager_comments: string;
      strengths?: string;
      areas_of_improvement?: string;
      goals_for_next_period?: string;
    }
  ): Promise<PerformanceReview> {
    const response = await api.post<PerformanceReview>(
      `${API_ROUTES.PERFORMANCE.REVIEW_DETAIL(id)}/manager-review`,
      data
    );
    return response.data;
  },
};
