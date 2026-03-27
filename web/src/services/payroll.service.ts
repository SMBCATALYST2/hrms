import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  SalaryComponent,
  SalaryStructure,
  CreateSalaryStructureRequest,
  PayrollRun,
  SalarySlip,
  TaxDeclaration,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

export const payrollService = {
  async listComponents(): Promise<SalaryComponent[]> {
    const response = await api.get<SalaryComponent[]>(
      API_ROUTES.PAYROLL.SALARY_COMPONENTS
    );
    return response.data;
  },

  async listStructures(): Promise<SalaryStructure[]> {
    const response = await api.get<SalaryStructure[]>(
      API_ROUTES.PAYROLL.SALARY_STRUCTURES
    );
    return response.data;
  },

  async getStructureById(id: string): Promise<SalaryStructure> {
    const response = await api.get<SalaryStructure>(
      API_ROUTES.PAYROLL.SALARY_STRUCTURE_DETAIL(id)
    );
    return response.data;
  },

  async createStructure(data: CreateSalaryStructureRequest): Promise<SalaryStructure> {
    const response = await api.post<SalaryStructure>(
      API_ROUTES.PAYROLL.SALARY_STRUCTURES,
      data
    );
    return response.data;
  },

  async updateStructure(
    id: string,
    data: Partial<CreateSalaryStructureRequest>
  ): Promise<SalaryStructure> {
    const response = await api.patch<SalaryStructure>(
      API_ROUTES.PAYROLL.SALARY_STRUCTURE_DETAIL(id),
      data
    );
    return response.data;
  },

  async listPayrollRuns(
    params?: PaginationParams
  ): Promise<PaginatedResponse<PayrollRun>> {
    const response = await api.get<PaginatedResponse<PayrollRun>>(
      API_ROUTES.PAYROLL.PAYROLL_RUNS,
      { params }
    );
    return response.data;
  },

  async getPayrollRun(id: string): Promise<PayrollRun> {
    const response = await api.get<PayrollRun>(
      API_ROUTES.PAYROLL.PAYROLL_RUN_DETAIL(id)
    );
    return response.data;
  },

  async createPayrollRun(data: {
    name: string;
    period_start: string;
    period_end: string;
  }): Promise<PayrollRun> {
    const response = await api.post<PayrollRun>(
      API_ROUTES.PAYROLL.PAYROLL_RUNS,
      data
    );
    return response.data;
  },

  async processPayrollRun(id: string): Promise<PayrollRun> {
    const response = await api.post<PayrollRun>(
      `${API_ROUTES.PAYROLL.PAYROLL_RUN_DETAIL(id)}/process`
    );
    return response.data;
  },

  async approvePayrollRun(id: string): Promise<PayrollRun> {
    const response = await api.post<PayrollRun>(
      `${API_ROUTES.PAYROLL.PAYROLL_RUN_DETAIL(id)}/approve`
    );
    return response.data;
  },

  async listPayslips(
    params?: PaginationParams & { payroll_run_id?: string }
  ): Promise<PaginatedResponse<SalarySlip>> {
    const response = await api.get<PaginatedResponse<SalarySlip>>(
      API_ROUTES.PAYROLL.PAYSLIPS,
      { params }
    );
    return response.data;
  },

  async getMyPayslips(): Promise<SalarySlip[]> {
    const response = await api.get<SalarySlip[]>(API_ROUTES.PAYROLL.MY_PAYSLIPS);
    return response.data;
  },

  async getMyTaxDeclarations(): Promise<TaxDeclaration[]> {
    const response = await api.get<TaxDeclaration[]>(
      API_ROUTES.PAYROLL.TAX_DECLARATIONS
    );
    return response.data;
  },

  async saveTaxDeclaration(data: Partial<TaxDeclaration>): Promise<TaxDeclaration> {
    const response = await api.post<TaxDeclaration>(
      API_ROUTES.PAYROLL.TAX_DECLARATIONS,
      data
    );
    return response.data;
  },
};
