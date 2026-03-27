export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  check_in?: string;
  check_out?: string;
  total_hours?: number;
  status: AttendanceStatus;
  source: AttendanceSource;
  shift_id?: string;
  shift_name?: string;
  is_late: boolean;
  late_minutes?: number;
  is_half_day: boolean;
  overtime_hours?: number;
  remarks?: string;
  location_lat?: number;
  location_lng?: number;
  created_at: string;
}

export type AttendanceStatus =
  | "present"
  | "absent"
  | "half_day"
  | "on_leave"
  | "holiday"
  | "week_off"
  | "on_duty";

export type AttendanceSource =
  | "web"
  | "mobile"
  | "biometric"
  | "manual"
  | "auto";

export interface CheckInRequest {
  source: AttendanceSource;
  latitude?: number;
  longitude?: number;
  remarks?: string;
}

export interface CheckOutRequest {
  source: AttendanceSource;
  latitude?: number;
  longitude?: number;
  remarks?: string;
}

export interface AttendanceSummary {
  total_working_days: number;
  days_present: number;
  days_absent: number;
  days_late: number;
  half_days: number;
  total_overtime_hours: number;
  leave_days: number;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  half_day_hours: number;
  full_day_hours: number;
  is_night_shift: boolean;
  break_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftRequest {
  name: string;
  start_time: string;
  end_time: string;
  grace_period_minutes?: number;
  half_day_hours?: number;
  full_day_hours?: number;
  is_night_shift?: boolean;
  break_duration_minutes?: number;
}
