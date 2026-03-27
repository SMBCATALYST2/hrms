export interface OKRCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: "planning" | "active" | "closed";
  created_at: string;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  owner_name?: string;
  cycle_id: string;
  cycle_name?: string;
  parent_id?: string;
  progress: number;
  status: "on_track" | "at_risk" | "behind" | "completed";
  priority: "low" | "medium" | "high" | "critical";
  due_date?: string;
  key_results: KeyResult[];
  children?: Objective[];
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  title: string;
  description?: string;
  metric_type: "number" | "percentage" | "currency" | "boolean";
  start_value: number;
  target_value: number;
  current_value: number;
  progress: number;
  unit?: string;
  owner_id?: string;
  owner_name?: string;
  due_date?: string;
  status: "on_track" | "at_risk" | "behind" | "completed";
  created_at: string;
  updated_at: string;
}

export interface CreateObjectiveRequest {
  title: string;
  description?: string;
  cycle_id: string;
  parent_id?: string;
  priority: "low" | "medium" | "high" | "critical";
  due_date?: string;
  key_results: CreateKeyResultRequest[];
}

export interface CreateKeyResultRequest {
  title: string;
  description?: string;
  metric_type: "number" | "percentage" | "currency" | "boolean";
  start_value: number;
  target_value: number;
  unit?: string;
  owner_id?: string;
  due_date?: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  self_review_deadline: string;
  manager_review_deadline: string;
  calibration_deadline?: string;
  status: "setup" | "self_review" | "manager_review" | "calibration" | "completed";
  created_at: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  employee_name?: string;
  review_cycle_id: string;
  cycle_name?: string;
  reviewer_id?: string;
  reviewer_name?: string;
  self_rating?: number;
  manager_rating?: number;
  final_rating?: number;
  self_comments?: string;
  manager_comments?: string;
  strengths?: string;
  areas_of_improvement?: string;
  goals_for_next_period?: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus =
  | "pending"
  | "self_review"
  | "manager_review"
  | "calibration"
  | "completed"
  | "acknowledged";
