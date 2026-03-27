import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePayrollRuns,
  useCreatePayrollRun,
  useProcessPayrollRun,
  usePayslips,
} from "@/hooks/use-payroll";
import { formatCurrency, formatDate } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import type { PayrollRun, SalarySlip } from "@/types";
import {
  Play,
  Loader2,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const payrollRunSchema = z.object({
  name: z.string().min(1, "Name is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
});

type PayrollRunForm = z.infer<typeof payrollRunSchema>;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const years = [currentYear - 1, currentYear, currentYear + 1].map(String);

const previewColumns: ColumnDef<SalarySlip>[] = [
  {
    id: "employee_name",
    header: "Employee",
    cell: (row) => (
      <div>
        <p className="font-medium">{row.employee_name}</p>
        <p className="text-xs text-muted-foreground">{row.employee_code}</p>
      </div>
    ),
  },
  {
    id: "working_days",
    header: "Working Days",
    accessorKey: "working_days",
  },
  {
    id: "lop_days",
    header: "LOP Days",
    accessorKey: "lop_days",
  },
  {
    id: "gross_pay",
    header: "Gross Pay",
    cell: (row) => formatCurrency(row.gross_pay),
  },
  {
    id: "total_deductions",
    header: "Deductions",
    cell: (row) => (
      <span className="text-red-600">{formatCurrency(row.total_deductions)}</span>
    ),
  },
  {
    id: "net_pay",
    header: "Net Pay",
    cell: (row) => (
      <span className="font-semibold">{formatCurrency(row.net_pay)}</span>
    ),
  },
];

const runHistoryColumns: ColumnDef<PayrollRun>[] = [
  {
    id: "name",
    header: "Run Name",
    accessorKey: "name",
    sortable: true,
  },
  {
    id: "period",
    header: "Period",
    cell: (row) =>
      `${formatDate(row.period_start, "dd MMM")} - ${formatDate(row.period_end, "dd MMM yyyy")}`,
  },
  {
    id: "total_employees",
    header: "Employees",
    accessorKey: "total_employees",
  },
  {
    id: "total_gross",
    header: "Gross",
    cell: (row) => formatCurrency(row.total_gross),
  },
  {
    id: "total_deductions",
    header: "Deductions",
    cell: (row) => (
      <span className="text-red-600">{formatCurrency(row.total_deductions)}</span>
    ),
  },
  {
    id: "total_net",
    header: "Net Pay",
    cell: (row) => (
      <span className="font-semibold">{formatCurrency(row.total_net)}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

export default function PayrollRunPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<"configure" | "preview" | "processing" | "done">(
    "configure"
  );
  const [progress, setProgress] = React.useState(0);
  const [activeRunId, setActiveRunId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const { data: runsData, isLoading: runsLoading } = usePayrollRuns({
    page,
    page_size: 10,
  });
  const createRun = useCreatePayrollRun();
  const processRun = useProcessPayrollRun();

  const { data: previewData } = usePayslips(
    activeRunId ? { payroll_run_id: activeRunId } : undefined
  );

  const form = useForm<PayrollRunForm>({
    resolver: zodResolver(payrollRunSchema),
    defaultValues: {
      name: "",
      month: String(new Date().getMonth()),
      year: String(currentYear),
    },
  });

  const onSubmitConfig = async (data: PayrollRunForm) => {
    const monthIdx = parseInt(data.month);
    const year = parseInt(data.year);
    const periodStart = new Date(year, monthIdx, 1).toISOString().split("T")[0];
    const periodEnd = new Date(year, monthIdx + 1, 0).toISOString().split("T")[0];

    try {
      const run = await createRun.mutateAsync({
        name: data.name || `Payroll - ${months[monthIdx]} ${year}`,
        period_start: periodStart,
        period_end: periodEnd,
      });
      setActiveRunId(run.id);
      setStep("preview");
    } catch {
      // Error handled by hook
    }
  };

  const handleProcess = async () => {
    if (!activeRunId) return;
    setStep("processing");
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      await processRun.mutateAsync(activeRunId);
      clearInterval(interval);
      setProgress(100);
      setStep("done");
      toast.success("Payroll processed successfully!");
    } catch {
      clearInterval(interval);
      setStep("preview");
      setProgress(0);
    }
  };

  const handleReset = () => {
    setStep("configure");
    setActiveRunId(null);
    setProgress(0);
    form.reset();
  };

  return (
    <div>
      <PageHeader
        title="Payroll Run"
        description="Create and process payroll for your employees"
      />

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {["Configure", "Preview", "Process"].map((label, idx) => {
          const stepIdx =
            step === "configure"
              ? 0
              : step === "preview"
                ? 1
                : 2;
          const isActive = idx === stepIdx;
          const isCompleted = idx < stepIdx;

          return (
            <React.Fragment key={label}>
              {idx > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-green-100 text-green-800"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted && <CheckCircle className="h-3 w-3" />}
                {label}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step: Configure */}
      {step === "configure" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>New Payroll Run</CardTitle>
              <CardDescription>
                Select the month and year to generate payslips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitConfig)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Run Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., March 2026 Payroll"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((m, idx) => (
                              <SelectItem key={m} value={String(idx)}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>
                                {y}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createRun.isPending}
                  >
                    {createRun.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Preview
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Run History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Payroll Run History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={runHistoryColumns}
                data={runsData?.items ?? []}
                total={runsData?.total ?? 0}
                page={page}
                pageSize={10}
                onPageChange={setPage}
                loading={runsLoading}
                emptyTitle="No payroll runs"
                emptyDescription="Create your first payroll run to get started"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payroll Preview</CardTitle>
              <CardDescription>
                Review calculated amounts before processing
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("configure")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleProcess}>
                <Play className="mr-2 h-4 w-4" />
                Process Payroll
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-xl font-bold">
                  {previewData?.items?.length ?? 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-center">
                <p className="text-sm text-muted-foreground">Total Gross</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(
                    previewData?.items?.reduce((s, p) => s + p.gross_pay, 0) ?? 0
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 text-center">
                <p className="text-sm text-muted-foreground">
                  Total Deductions
                </p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(
                    previewData?.items?.reduce(
                      (s, p) => s + p.total_deductions,
                      0
                    ) ?? 0
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-center">
                <p className="text-sm text-muted-foreground">Net Payroll</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(
                    previewData?.items?.reduce((s, p) => s + p.net_pay, 0) ?? 0
                  )}
                </p>
              </div>
            </div>

            <DataTable
              columns={previewColumns}
              data={previewData?.items ?? []}
              total={previewData?.total ?? 0}
              emptyTitle="No payslips generated"
              emptyDescription="The payroll run did not generate any payslips"
            />
          </CardContent>
        </Card>
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Processing Payroll</h3>
                <p className="text-sm text-muted-foreground">
                  Generating payslips for all employees...
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Done */}
      {step === "done" && (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  Payroll Processed Successfully
                </h3>
                <p className="text-sm text-muted-foreground">
                  All payslips have been generated and are ready for review
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(APP_ROUTES.PAYROLL.PAYSLIPS)}
                >
                  View Payslips
                </Button>
                <Button onClick={handleReset}>Run Another Payroll</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
