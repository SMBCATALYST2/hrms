export interface Designation {
  id: string;
  name: string;
  level?: number;
  pay_grade?: string;
  description?: string;
  department_id?: string;
  department_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDesignationRequest {
  name: string;
  level?: number;
  pay_grade?: string;
  description?: string;
  department_id?: string;
}

export interface UpdateDesignationRequest extends Partial<CreateDesignationRequest> {
  is_active?: boolean;
}
