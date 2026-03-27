import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { EmployeeListParams, CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types";
import { toast } from "sonner";

export function useEmployees(params?: EmployeeListParams) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.LIST(params),
    queryFn: () => employeeService.list(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(id),
    queryFn: () => employeeService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => employeeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.ALL });
      toast.success("Employee created successfully");
    },
    onError: () => {
      toast.error("Failed to create employee");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      employeeService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.DETAIL(id) });
      toast.success("Employee updated successfully");
    },
    onError: () => {
      toast.error("Failed to update employee");
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMPLOYEES.ALL });
      toast.success("Employee deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete employee");
    },
  });
}

export function useSearchEmployees(query: string) {
  return useQuery({
    queryKey: QUERY_KEYS.EMPLOYEES.SEARCH(query),
    queryFn: () => employeeService.search(query),
    enabled: query.length >= 2,
  });
}
