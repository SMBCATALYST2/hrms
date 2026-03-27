export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
  errors?: Record<string, string[]>;
}

export interface SuccessResponse {
  message: string;
  status: "success";
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface SelectOption {
  label: string;
  value: string;
}

export type Status = "active" | "inactive" | "draft" | "archived";
