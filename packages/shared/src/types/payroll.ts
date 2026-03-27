import {
  PayrollFrequency,
  SalaryComponentType,
  SalarySlipStatus,
  PayrollEntryStatus,
} from "../enums";

// ─── Salary Component ───────────────────────────────────────────
export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  type: SalaryComponentType;
  description: string | null;
  is_taxable: boolean;
  is_flexible: boolean;
  depends_on: string | null; // Reference to another component
  formula: string | null;    // e.g., "base * 0.5"
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Salary Structure ───────────────────────────────────────────
export interface SalaryStructure {
  id: string;
  name: string;
  company_id: string;
  payroll_frequency: PayrollFrequency;
  is_active: boolean;
  components: SalaryStructureComponent[];
  created_at: string;
  updated_at: string;
}

export interface SalaryStructureComponent {
  id: string;
  salary_component_id: string;
  component_name: string;
  component_type: SalaryComponentType;
  formula: string | null;
  amount: number | null;
  is_formula_based: boolean;
}

// ─── Salary Slip ────────────────────────────────────────────────
export interface SalarySlip {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  department_name: string;
  designation_name: string;
  payroll_entry_id: string | null;
  month: number;
  year: number;
  status: SalarySlipStatus;

  // Breakdown
  earnings: SalarySlipComponent[];
  deductions: SalarySlipComponent[];

  // Totals
  gross_pay: number;
  total_deductions: number;
  net_pay: number;

  // Tax
  income_tax: number;
  professional_tax: number;
  provident_fund_employee: number;
  provident_fund_employer: number;
  esi_employee: number;
  esi_employer: number;

  // Metadata
  payment_days: number;
  total_working_days: number;
  leave_without_pay_days: number;

  created_at: string;
  updated_at: string;
}

export interface SalarySlipComponent {
  component_name: string;
  component_type: SalaryComponentType;
  amount: number;
  is_taxable: boolean;
}

// ─── Payroll Entry (Batch Run) ──────────────────────────────────
export interface PayrollEntry {
  id: string;
  company_id: string;
  company_name: string;
  month: number;
  year: number;
  payroll_frequency: PayrollFrequency;
  status: PayrollEntryStatus;
  total_employees: number;
  total_gross_pay: number;
  total_deductions: number;
  total_net_pay: number;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Tax Declaration ────────────────────────────────────────────
export interface TaxDeclaration {
  id: string;
  employee_id: string;
  employee_name: string;
  fiscal_year: string;
  regime: "old" | "new";
  status: "draft" | "submitted" | "verified";

  // Section 80C
  section_80c: TaxDeclarationItem[];
  // Section 80D
  section_80d: TaxDeclarationItem[];
  // HRA
  hra_declaration: HRADeclaration | null;
  // Other sections
  other_declarations: TaxDeclarationItem[];

  total_declared: number;
  total_verified: number;

  created_at: string;
  updated_at: string;
}

export interface TaxDeclarationItem {
  section: string;
  description: string;
  declared_amount: number;
  verified_amount: number | null;
  proof_document_id: string | null;
}

export interface HRADeclaration {
  monthly_rent: number;
  landlord_name: string;
  landlord_pan: string | null;
  city: string;
  is_metro: boolean;
}
