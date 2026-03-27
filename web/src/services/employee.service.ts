import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeListParams,
  PaginatedResponse,
} from "@/types";

export const employeeService = {
  async list(params?: EmployeeListParams): Promise<PaginatedResponse<Employee>> {
    const response = await api.get<PaginatedResponse<Employee>>(
      API_ROUTES.EMPLOYEES.BASE,
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<Employee> {
    const response = await api.get<Employee>(API_ROUTES.EMPLOYEES.DETAIL(id));
    return response.data;
  },

  async create(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await api.post<Employee>(API_ROUTES.EMPLOYEES.BASE, data);
    return response.data;
  },

  async update(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await api.patch<Employee>(
      API_ROUTES.EMPLOYEES.DETAIL(id),
      data
    );
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.EMPLOYEES.DETAIL(id));
  },

  async search(query: string): Promise<Employee[]> {
    const response = await api.get<Employee[]>(API_ROUTES.EMPLOYEES.SEARCH, {
      params: { q: query },
    });
    return response.data;
  },
};
