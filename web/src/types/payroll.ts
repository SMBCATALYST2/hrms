export interface SalaryComponent {
  id: string;
  name: string;
  code: string;
  type: "earning" | "deduction";
  is_taxable: boolean;
  is_fixed: boolean;
  calculation_type: "fixed" | "percentage" | "formula";
  percentage_of?: string;
  formula?: string;
  is_active: boolean;
}

export interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  base_amount: number;
  components: SalaryStructureComponent[];
  created_at: string;
  updated_at: string;
}

export interface SalaryStructureComponent {
  id: string;
  salary_component_id: string;
  component_name: string;
  component_type: "earning" | "deduction";
  amount?: number;
  percentage?: number;
  formula?: string;
}

export interface CreateSalaryStructureRequest {
  name: string;
  description?: string;
  base_amount: number;
  components: {
    salary_component_id: string;
    amount?: number;
    percentage?: number;
    formula?: string;
  }[];
}

export interface PayrollRun {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: PayrollRunStatus;
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  processed_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
}

export type PayrollRunStatus =
  | "draft"
  | "processing"
  | "processed"
  | "approved"
  | "paid"
  | "cancelled";

export interface SalarySlip {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_code?: string;
  payroll_run_id: string;
  period_start: string;
  period_end: string;
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
  working_days: number;
  lop_days: number;
  earnings: PayslipComponent[];
  deductions: PayslipComponent[];
  status: "draft" | "generated" | "paid";
  created_at: string;
}

export interface PayslipComponent {
  component_name: string;
  component_code: string;
  amount: number;
}

export interface TaxDeclaration {
  id: string;
  employee_id: string;
  financial_year: string;
  regime: "old" | "new";
  declarations: TaxDeclarationItem[];
  total_declared: number;
  status: "draft" | "submitted" | "verified";
  created_at: string;
  updated_at: string;
}

export interface TaxDeclarationItem {
  section: string;
  description: string;
  declared_amount: number;
  approved_amount?: number;
  proof_url?: string;
}
