import React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayrollRuns } from "@/hooks/use-payroll";
import { formatCurrency, formatDate } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import type { PayrollRun } from "@/types";
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthlyTrendData = [
  { month: "Oct", amount: 2450000 },
  { month: "Nov", amount: 2480000 },
  { month: "Dec", amount: 2520000 },
  { month: "Jan", amount: 2510000 },
  { month: "Feb", amount: 2560000 },
  { month: "Mar", amount: 2590000 },
];

const payrollRunColumns: ColumnDef<PayrollRun>[] = [
  {
    id: "name",
    header: "Run Name",
    accessorKey: "name",
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
    id: "total_net",
    header: "Net Payroll",
    cell: (row) => formatCurrency(row.total_net),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: "created_at",
    header: "Created",
    cell: (row) => formatDate(row.created_at),
  },
];

export default function PayrollDashboardPage() {
  const navigate = useNavigate();
  const { data: runsData, isLoading } = usePayrollRuns({ page: 1, page_size: 5 });

  const runs = runsData?.items ?? [];
  const latestRun = runs[0];

  const totalPayrollCost = latestRun?.total_net ?? 0;
  const totalEmployees = latestRun?.total_employees ?? 0;
  const pendingPayslips = runs.filter(
    (r) => r.status === "draft" || r.status === "processing"
  ).length;

  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Manage payroll runs, salary structures, and tax declarations"
        actions={
          <Button onClick={() => navigate(APP_ROUTES.PAYROLL.RUN)}>
            <Plus className="mr-2 h-4 w-4" />
            New Payroll Run
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Payroll Cost"
              value={formatCurrency(totalPayrollCost)}
              icon={DollarSign}
              trend={{ value: 2.4, isPositive: true }}
              description="vs last month"
            />
            <StatCard
              title="Employees on Payroll"
              value={totalEmployees}
              icon={Users}
              description="Active employees"
            />
            <StatCard
              title="Pending Payslips"
              value={pendingPayslips}
              icon={FileText}
              description="Awaiting processing"
            />
            <StatCard
              title="Avg. Salary"
              value={
                totalEmployees > 0
                  ? formatCurrency(Math.round(totalPayrollCost / totalEmployees))
                  : formatCurrency(0)
              }
              icon={TrendingUp}
              description="Per employee"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Payroll Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payroll Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val) =>
                      `${(val / 100000).toFixed(1)}L`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Payroll"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payroll Runs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Payroll Runs</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(APP_ROUTES.PAYROLL.RUN)}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={payrollRunColumns}
              data={runs}
              loading={isLoading}
              emptyTitle="No payroll runs yet"
              emptyDescription="Create your first payroll run to get started"
              emptyAction={{
                label: "Create Payroll Run",
                onClick: () => navigate(APP_ROUTES.PAYROLL.RUN),
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
