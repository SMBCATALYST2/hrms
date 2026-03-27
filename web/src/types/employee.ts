export interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  blood_group?: string;
  nationality?: string;
  photo_url?: string;
  company_id: string;
  company_name?: string;
  department_id?: string;
  department_name?: string;
  designation_id?: string;
  designation_name?: string;
  reporting_manager_id?: string;
  reporting_manager_name?: string;
  employment_type: EmploymentType;
  date_of_joining: string;
  date_of_confirmation?: string;
  date_of_exit?: string;
  status: EmployeeStatus;
  notice_period_days?: number;
  probation_end_date?: string;
  created_at: string;
  updated_at: string;
}

export type EmployeeStatus =
  | "draft"
  | "active"
  | "suspended"
  | "resigned"
  | "relieved"
  | "terminated";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "intern"
  | "consultant";

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: "male" | "female" | "other";
  blood_group?: string;
  nationality?: string;
  company_id: string;
  department_id?: string;
  designation_id?: string;
  reporting_manager_id?: string;
  employment_type: EmploymentType;
  date_of_joining: string;
  notice_period_days?: number;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  status?: EmployeeStatus;
}

export interface EmployeePersonalInfo {
  permanent_address?: string;
  current_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  pan_number?: string;
  aadhaar_number?: string;
  passport_number?: string;
  passport_expiry?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  uan_number?: string;
}

export interface EmployeeProfessionalInfo {
  previous_company?: string;
  previous_designation?: string;
  previous_salary?: number;
  total_experience_years?: number;
  highest_qualification?: string;
  university?: string;
  specialization?: string;
  year_of_passing?: number;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  is_verified: boolean;
  expiry_date?: string;
  uploaded_at: string;
}

export interface EmployeeListParams {
  page?: number;
  page_size?: number;
  search?: string;
  department_id?: string;
  designation_id?: string;
  status?: EmployeeStatus;
  employment_type?: EmploymentType;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}
