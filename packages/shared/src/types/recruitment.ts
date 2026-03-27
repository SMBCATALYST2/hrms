import {
  JobOpeningStatus,
  ApplicationStage,
  InterviewStatus,
  InterviewResult,
  FeedbackRecommendation,
  OfferStatus,
  EmploymentSource,
  EmploymentType,
} from "../enums";

// ─── Job Opening ────────────────────────────────────────────────
export interface JobOpening {
  id: string;
  title: string;
  company_id: string;
  company_name: string;
  department_id: string;
  department_name: string;
  designation_id: string | null;
  designation_name: string | null;
  description: string;
  requirements: string;
  location: string;
  employment_type: EmploymentType;
  experience_min: number | null;
  experience_max: number | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  vacancies: number;
  filled_positions: number;
  status: JobOpeningStatus;
  hiring_manager_id: string;
  hiring_manager_name: string;
  published_at: string | null;
  closed_at: string | null;
  application_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Job Application ────────────────────────────────────────────
export interface JobApplication {
  id: string;
  job_opening_id: string;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  resume_url: string | null;
  cover_letter: string | null;
  source: EmploymentSource;
  referral_employee_id: string | null;
  referral_employee_name: string | null;
  stage: ApplicationStage;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Interview ──────────────────────────────────────────────────
export interface Interview {
  id: string;
  application_id: string;
  candidate_name: string;
  job_title: string;
  round: number;
  round_name: string;
  interview_type: "in_person" | "video" | "phone" | "panel";
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_link: string | null;
  status: InterviewStatus;
  interviewers: InterviewerAssignment[];
  feedback: InterviewFeedback[];
  result: InterviewResult | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewerAssignment {
  id: string;
  interviewer_id: string;
  interviewer_name: string;
  is_lead: boolean;
}

// ─── Interview Feedback ─────────────────────────────────────────
export interface InterviewFeedback {
  id: string;
  interview_id: string;
  interviewer_id: string;
  interviewer_name: string;
  overall_rating: number; // 1-5
  technical_rating: number | null;
  communication_rating: number | null;
  cultural_fit_rating: number | null;
  strengths: string;
  weaknesses: string;
  notes: string | null;
  recommendation: FeedbackRecommendation;
  result: InterviewResult;
  submitted_at: string;
}

// ─── Job Offer ──────────────────────────────────────────────────
export interface JobOffer {
  id: string;
  application_id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  department_name: string;
  designation_name: string;
  offered_salary: number;
  currency: string;
  joining_date: string;
  expiry_date: string;
  status: OfferStatus;
  template_id: string | null;
  offer_letter_url: string | null;
  special_conditions: string | null;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ─── JD Template ────────────────────────────────────────────────
export interface JDTemplate {
  id: string;
  title: string;
  department_id: string | null;
  department_name: string | null;
  designation_id: string | null;
  designation_name: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferred_qualifications: string[];
  benefits: string[];
  is_ai_generated: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
