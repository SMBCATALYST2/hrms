export interface LeaveType {
  id: string;
  name: string;
  code: string;
  is_paid: boolean;
  max_days_per_year: number;
  carry_forward: boolean;
  max_carry_forward_days?: number;
  encashable: boolean;
  accrual_frequency: "monthly" | "quarterly" | "yearly";
  min_consecutive_days?: number;
  max_consecutive_days?: number;
  gender_applicable?: "male" | "female" | "all";
  requires_attachment: boolean;
  is_active: boolean;
  created_at: string;
}

export interface LeaveApplication {
  id: string;
  employee_id: string;
  employee_name?: string;
  leave_type_id: string;
  leave_type_name?: string;
  from_date: string;
  to_date: string;
  total_days: number;
  is_half_day: boolean;
  half_day_period?: "first_half" | "second_half";
  reason: string;
  status: LeaveStatus;
  attachment_url?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export type LeaveStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface CreateLeaveApplicationRequest {
  leave_type_id: string;
  from_date: string;
  to_date: string;
  is_half_day: boolean;
  half_day_period?: "first_half" | "second_half";
  reason: string;
}

export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  allocated: number;
  used: number;
  pending: number;
  available: number;
  carry_forward: number;
}

export interface LeavePolicy {
  id: string;
  name: string;
  description?: string;
  leave_allocations: LeavePolicyAllocation[];
  applicable_to: string;
  is_active: boolean;
  created_at: string;
}

export interface LeavePolicyAllocation {
  leave_type_id: string;
  leave_type_name: string;
  annual_allocation: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  is_optional: boolean;
  description?: string;
}
