import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  JobOpening,
  CreateJobOpeningRequest,
  JobApplication,
  Candidate,
  Interview,
  OfferLetter,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

export const recruitmentService = {
  async listJobOpenings(
    params?: PaginationParams & { status?: string }
  ): Promise<PaginatedResponse<JobOpening>> {
    const response = await api.get<PaginatedResponse<JobOpening>>(
      API_ROUTES.RECRUITMENT.JOB_OPENINGS,
      { params }
    );
    return response.data;
  },

  async getJobOpening(id: string): Promise<JobOpening> {
    const response = await api.get<JobOpening>(
      API_ROUTES.RECRUITMENT.JOB_OPENING_DETAIL(id)
    );
    return response.data;
  },

  async createJobOpening(data: CreateJobOpeningRequest): Promise<JobOpening> {
    const response = await api.post<JobOpening>(
      API_ROUTES.RECRUITMENT.JOB_OPENINGS,
      data
    );
    return response.data;
  },

  async updateJobOpening(
    id: string,
    data: Partial<CreateJobOpeningRequest>
  ): Promise<JobOpening> {
    const response = await api.patch<JobOpening>(
      API_ROUTES.RECRUITMENT.JOB_OPENING_DETAIL(id),
      data
    );
    return response.data;
  },

  async listApplications(
    params?: PaginationParams & { job_opening_id?: string; stage?: string }
  ): Promise<PaginatedResponse<JobApplication>> {
    const response = await api.get<PaginatedResponse<JobApplication>>(
      API_ROUTES.RECRUITMENT.APPLICATIONS,
      { params }
    );
    return response.data;
  },

  async getApplication(id: string): Promise<JobApplication> {
    const response = await api.get<JobApplication>(
      API_ROUTES.RECRUITMENT.APPLICATION_DETAIL(id)
    );
    return response.data;
  },

  async updateApplicationStage(
    id: string,
    stage: string,
    notes?: string
  ): Promise<JobApplication> {
    const response = await api.patch<JobApplication>(
      API_ROUTES.RECRUITMENT.APPLICATION_DETAIL(id),
      { stage, notes }
    );
    return response.data;
  },

  async listCandidates(
    params?: PaginationParams
  ): Promise<PaginatedResponse<Candidate>> {
    const response = await api.get<PaginatedResponse<Candidate>>(
      API_ROUTES.RECRUITMENT.CANDIDATES,
      { params }
    );
    return response.data;
  },

  async getCandidate(id: string): Promise<Candidate> {
    const response = await api.get<Candidate>(
      API_ROUTES.RECRUITMENT.CANDIDATE_DETAIL(id)
    );
    return response.data;
  },

  async listInterviews(
    params?: PaginationParams & { status?: string }
  ): Promise<PaginatedResponse<Interview>> {
    const response = await api.get<PaginatedResponse<Interview>>(
      API_ROUTES.RECRUITMENT.INTERVIEWS,
      { params }
    );
    return response.data;
  },

  async scheduleInterview(data: {
    application_id: string;
    interviewer_ids: string[];
    scheduled_at: string;
    duration_minutes: number;
    type: string;
    location?: string;
    meeting_link?: string;
  }): Promise<Interview> {
    const response = await api.post<Interview>(
      API_ROUTES.RECRUITMENT.INTERVIEWS,
      data
    );
    return response.data;
  },

  async listOffers(
    params?: PaginationParams
  ): Promise<PaginatedResponse<OfferLetter>> {
    const response = await api.get<PaginatedResponse<OfferLetter>>(
      API_ROUTES.RECRUITMENT.OFFERS,
      { params }
    );
    return response.data;
  },

  async createOffer(data: {
    application_id: string;
    offered_salary: number;
    joining_date: string;
    expiry_date: string;
    template_id?: string;
  }): Promise<OfferLetter> {
    const response = await api.post<OfferLetter>(
      API_ROUTES.RECRUITMENT.OFFERS,
      data
    );
    return response.data;
  },

  async generateJD(data: {
    title: string;
    department?: string;
    experience_level?: string;
    skills?: string[];
  }): Promise<{ description: string; requirements: string }> {
    const response = await api.post<{
      description: string;
      requirements: string;
    }>(API_ROUTES.RECRUITMENT.JD_GENERATE, data);
    return response.data;
  },
};
