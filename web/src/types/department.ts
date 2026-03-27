export interface Department {
  id: string;
  name: string;
  company_id: string;
  company_name?: string;
  parent_id?: string;
  parent_name?: string;
  head_id?: string;
  head_name?: string;
  cost_center?: string;
  description?: string;
  is_active: boolean;
  employee_count?: number;
  children?: Department[];
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentRequest {
  name: string;
  company_id: string;
  parent_id?: string;
  head_id?: string;
  cost_center?: string;
  description?: string;
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  is_active?: boolean;
}
