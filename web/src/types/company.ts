export interface Company {
  id: string;
  name: string;
  legal_name?: string;
  registration_number?: string;
  tax_id?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  industry?: string;
  website?: string;
  date_of_incorporation?: string;
  status: "active" | "inactive";
  employee_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  legal_name?: string;
  registration_number?: string;
  tax_id?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  industry?: string;
  website?: string;
  date_of_incorporation?: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {
  status?: "active" | "inactive";
}
