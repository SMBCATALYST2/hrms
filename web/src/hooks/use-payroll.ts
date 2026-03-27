import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { payrollService } from "@/services/payroll.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateSalaryStructureRequest, PaginationParams, TaxDeclaration } from "@/types";
import { toast } from "sonner";

export function useSalaryStructures() {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.STRUCTURES(),
    queryFn: () => payrollService.listStructures(),
  });
}

export function useSalaryStructure(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.STRUCTURE_DETAIL(id),
    queryFn: () => payrollService.getStructureById(id),
    enabled: !!id,
  });
}

export function useCreateSalaryStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryStructureRequest) => payrollService.createStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYROLL.ALL });
      toast.success("Salary structure created");
    },
    onError: () => {
      toast.error("Failed to create salary structure");
    },
  });
}

export function usePayrollRuns(params?: PaginationParams) {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.RUNS(params),
    queryFn: () => payrollService.listPayrollRuns(params),
  });
}

export function usePayrollRun(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.RUN_DETAIL(id),
    queryFn: () => payrollService.getPayrollRun(id),
    enabled: !!id,
  });
}

export function useCreatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; period_start: string; period_end: string }) =>
      payrollService.createPayrollRun(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYROLL.ALL });
      toast.success("Payroll run created");
    },
    onError: () => {
      toast.error("Failed to create payroll run");
    },
  });
}

export function useProcessPayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => payrollService.processPayrollRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYROLL.ALL });
      toast.success("Payroll processed successfully");
    },
    onError: () => {
      toast.error("Failed to process payroll");
    },
  });
}

export function usePayslips(params?: PaginationParams & { payroll_run_id?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.PAYSLIPS(params),
    queryFn: () => payrollService.listPayslips(params),
  });
}

export function useMyPayslips() {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.MY_PAYSLIPS(),
    queryFn: () => payrollService.getMyPayslips(),
  });
}

export function useMyTaxDeclarations() {
  return useQuery({
    queryKey: QUERY_KEYS.PAYROLL.TAX_DECLARATIONS(),
    queryFn: () => payrollService.getMyTaxDeclarations(),
  });
}

export function useSaveTaxDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TaxDeclaration>) => payrollService.saveTaxDeclaration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYROLL.TAX_DECLARATIONS() });
      toast.success("Tax declaration saved");
    },
    onError: () => {
      toast.error("Failed to save tax declaration");
    },
  });
}
