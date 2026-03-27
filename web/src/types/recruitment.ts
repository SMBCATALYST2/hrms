export interface JobOpening {
  id: string;
  title: string;
  department_id?: string;
  department_name?: string;
  designation_id?: string;
  designation_name?: string;
  description: string;
  requirements?: string;
  location?: string;
  employment_type: string;
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  openings: number;
  status: JobOpeningStatus;
  posted_date?: string;
  closing_date?: string;
  hiring_manager_id?: string;
  hiring_manager_name?: string;
  application_count?: number;
  created_at: string;
  updated_at: string;
}

export type JobOpeningStatus =
  | "draft"
  | "open"
  | "on_hold"
  | "closed"
  | "cancelled";

export interface CreateJobOpeningRequest {
  title: string;
  department_id?: string;
  designation_id?: string;
  description: string;
  requirements?: string;
  location?: string;
  employment_type: string;
  experience_min?: number;
  experience_max?: number;
  salary_min?: number;
  salary_max?: number;
  openings: number;
  closing_date?: string;
  hiring_manager_id?: string;
}

export interface JobApplication {
  id: string;
  job_opening_id: string;
  job_title?: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  stage: ApplicationStage;
  rating?: number;
  source?: string;
  resume_url?: string;
  cover_letter?: string;
  notes?: string;
  applied_date: string;
  created_at: string;
  updated_at: string;
}

export type ApplicationStage =
  | "applied"
  | "screening"
  | "interview"
  | "assessment"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  current_company?: string;
  current_designation?: string;
  experience_years?: number;
  skills?: string[];
  resume_url?: string;
  source?: string;
  created_at: string;
}

export interface Interview {
  id: string;
  application_id: string;
  candidate_name?: string;
  job_title?: string;
  interviewer_ids: string[];
  interviewer_names?: string[];
  scheduled_at: string;
  duration_minutes: number;
  type: "phone" | "video" | "in_person" | "panel";
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  location?: string;
  meeting_link?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
}

export interface OfferLetter {
  id: string;
  application_id: string;
  candidate_name?: string;
  job_title?: string;
  offered_salary: number;
  joining_date: string;
  expiry_date: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "revoked";
  template_id?: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}
