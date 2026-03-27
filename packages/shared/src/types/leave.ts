import { LeaveApplicationStatus } from "../enums";

// ─── Leave Type ─────────────────────────────────────────────────
export interface LeaveType {
  id: string;
  name: string;
  code: string;
  is_paid: boolean;
  is_carry_forward: boolean;
  max_carry_forward_days: number | null;
  is_encashable: boolean;
  max_encashable_days: number | null;
  is_compensatory: boolean;
  max_consecutive_days: number | null;
  applicable_gender: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Leave Policy ───────────────────────────────────────────────
export interface LeavePolicy {
  id: string;
  name: string;
  company_id: string;
  is_active: boolean;
  allocations: LeavePolicyAllocation[];
  created_at: string;
  updated_at: string;
}

export interface LeavePolicyAllocation {
  leave_type_id: string;
  leave_type_name: string;
  annual_allocation: number;
  accrual_frequency: "monthly" | "quarterly" | "yearly";
}

// ─── Leave Allocation ───────────────────────────────────────────
export interface LeaveAllocation {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type_id: string;
  leave_type_name: string;
  fiscal_year: string;
  total_allocated: number;
  total_used: number;
  total_pending: number;
  carried_forward: number;
  balance: number;
  created_at: string;
  updated_at: string;
}

// ─── Leave Application ─────────────────────────────────────────
export interface LeaveApplication {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_photo_url: string | null;
  leave_type_id: string;
  leave_type_name: string;
  from_date: string;
  to_date: string;
  half_day: boolean;
  half_day_date: string | null;
  total_days: number;
  reason: string;
  status: LeaveApplicationStatus;
  approval_comments: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeaveApplication {
  leave_type_id: string;
  from_date: string;
  to_date: string;
  half_day?: boolean;
  half_day_date?: string;
  reason: string;
}

// ─── Leave Balance ──────────────────────────────────────────────
export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  leave_type_code: string;
  total_allocated: number;
  total_used: number;
  total_pending: number;
  balance: number;
  is_carry_forward: boolean;
  carried_forward: number;
}
