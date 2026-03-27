import {
  EmployeeStatus,
  Gender,
  MaritalStatus,
  EmploymentType,
  BloodGroup,
} from "../enums";

// ─── Employee ───────────────────────────────────────────────────
export interface Employee {
  id: string;
  employee_id: string; // Auto-generated (EMP-0001)
  user_id: string | null;
  company_id: string;
  department_id: string;
  designation_id: string;
  reporting_manager_id: string | null;

  // Personal
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  personal_email: string | null;
  phone: string;
  date_of_birth: string;
  gender: Gender;
  marital_status: MaritalStatus | null;
  blood_group: BloodGroup | null;
  nationality: string;
  photo_url: string | null;

  // Employment
  employment_type: EmploymentType;
  date_of_joining: string;
  date_of_confirmation: string | null;
  date_of_resignation: string | null;
  date_of_relieving: string | null;
  notice_period_days: number;
  probation_end_date: string | null;
  status: EmployeeStatus;

  // Address
  current_address: Address | null;
  permanent_address: Address | null;

  // Emergency Contact
  emergency_contacts: EmergencyContact[];

  // Bank
  bank_details: BankDetails | null;

  // Documents (encrypted PII)
  pan_number: string | null;
  aadhaar_number: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
  uan_number: string | null;

  // Company references
  company_name: string;
  department_name: string;
  designation_name: string;
  reporting_manager_name: string | null;

  created_at: string;
  updated_at: string;
}

export interface Address {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
}

export interface BankDetails {
  bank_name: string;
  branch_name: string;
  account_number: string;
  ifsc_code: string;
  account_type: "savings" | "current";
}

// ─── List Item (lighter for tables) ────────────────────────────
export interface EmployeeListItem {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  photo_url: string | null;
  department_name: string;
  designation_name: string;
  reporting_manager_name: string | null;
  employment_type: EmploymentType;
  date_of_joining: string;
  status: EmployeeStatus;
}

// ─── Create / Update ────────────────────────────────────────────
export interface CreateEmployee {
  first_name: string;
  last_name: string;
  email: string;
  personal_email?: string;
  phone: string;
  date_of_birth: string;
  gender: Gender;
  marital_status?: MaritalStatus;
  blood_group?: BloodGroup;
  nationality?: string;

  company_id: string;
  department_id: string;
  designation_id: string;
  reporting_manager_id?: string;

  employment_type: EmploymentType;
  date_of_joining: string;
  notice_period_days?: number;
  probation_end_date?: string;

  current_address?: Address;
  permanent_address?: Address;
  emergency_contacts?: EmergencyContact[];
  bank_details?: BankDetails;

  pan_number?: string;
  aadhaar_number?: string;
  passport_number?: string;
  passport_expiry?: string;
  uan_number?: string;
}

export interface UpdateEmployee extends Partial<CreateEmployee> {
  status?: EmployeeStatus;
}

// ─── Related Entities ───────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  legal_name: string;
  registration_number: string | null;
  tax_id: string | null;
  logo_url: string | null;
  address: Address | null;
  industry: string | null;
  website: string | null;
  date_of_incorporation: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  company_id: string;
  parent_id: string | null;
  head_employee_id: string | null;
  cost_center: string | null;
  is_active: boolean;
  children?: Department[];
  created_at: string;
  updated_at: string;
}

export interface Designation {
  id: string;
  name: string;
  department_id: string | null;
  level: number | null;
  pay_grade: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalHistory {
  id: string;
  employee_id: string;
  company_name: string;
  designation: string;
  salary: number | null;
  from_date: string;
  to_date: string | null;
  description: string | null;
}

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  category: string;
  name: string;
  file_url: string;
  file_type: string;
  expiry_date: string | null;
  is_verified: boolean;
  verified_by: string | null;
  uploaded_at: string;
}
