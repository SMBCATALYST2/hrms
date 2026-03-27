import { AttendanceStatus, CheckinType } from "../enums";

// ─── Attendance Record ──────────────────────────────────────────
export interface Attendance {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: number | null;
  overtime_hours: number | null;
  late_entry: boolean;
  early_exit: boolean;
  shift_id: string | null;
  shift_name: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Check-in / Check-out ───────────────────────────────────────
export interface CheckIn {
  type: CheckinType;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  device_id: string | null;
  selfie_url: string | null;
  is_within_geofence: boolean | null;
  ip_address: string | null;
}

export interface CheckInRequest {
  type: CheckinType;
  latitude?: number;
  longitude?: number;
  device_id?: string;
  selfie_url?: string;
}

export interface CheckInResponse {
  id: string;
  type: CheckinType;
  timestamp: string;
  is_within_geofence: boolean | null;
  attendance_id: string;
}

// ─── Checkin Log ────────────────────────────────────────────────
export interface CheckinLog {
  id: string;
  employee_id: string;
  type: CheckinType;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  device_id: string | null;
  is_within_geofence: boolean | null;
}

// ─── Shift ──────────────────────────────────────────────────────
export interface ShiftType {
  id: string;
  name: string;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  grace_period_minutes: number;
  half_day_threshold_hours: number;
  full_day_threshold_hours: number;
  is_night_shift: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftAssignment {
  id: string;
  employee_id: string;
  employee_name: string;
  shift_id: string;
  shift_name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

// ─── Attendance Request (Regularization) ────────────────────────
export interface AttendanceRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  requested_status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  reason: string;
  approval_status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Geofence ───────────────────────────────────────────────────
export interface GeofenceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}

// ─── Attendance Summary ─────────────────────────────────────────
export interface AttendanceSummary {
  employee_id: string;
  month: number;
  year: number;
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  leave_days: number;
  holidays: number;
  weekly_offs: number;
  late_entries: number;
  early_exits: number;
  total_working_hours: number;
  total_overtime_hours: number;
}
