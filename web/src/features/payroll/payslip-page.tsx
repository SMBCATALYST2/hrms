import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyPayslips } from "@/hooks/use-payroll";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SalarySlip } from "@/types";
import { Download, FileText, Eye } from "lucide-react";
import { toast } from "sonner";

const payslipListColumns: ColumnDef<SalarySlip>[] = [
  {
    id: "period",
    header: "Pay Period",
    cell: (row) =>
      `${formatDate(row.period_start, "dd MMM")} - ${formatDate(row.period_end, "dd MMM yyyy")}`,
    sortable: true,
  },
  {
    id: "working_days",
    header: "Working Days",
    accessorKey: "working_days",
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
      <span className="text-red-600">
        {formatCurrency(row.total_deductions)}
      </span>
    ),
  },
  {
    id: "net_pay",
    header: "Net Pay",
    cell: (row) => (
      <span className="font-semibold">{formatCurrency(row.net_pay)}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Eye className="h-4 w-4" />
      </Button>
    ),
    className: "w-10",
  },
];

function PayslipDetailDialog({
  payslip,
  open,
  onOpenChange,
}: {
  payslip: SalarySlip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleDownload = () => {
    toast.success("Downloading payslip PDF...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground">Employee</p>
              <p className="text-sm font-medium">
                {payslip.employee_name ?? "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {payslip.employee_code}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pay Period</p>
              <p className="text-sm font-medium">
                {formatDate(payslip.period_start, "dd MMM yyyy")} -{" "}
                {formatDate(payslip.period_end, "dd MMM yyyy")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Working Days</p>
              <p className="text-sm font-medium">{payslip.working_days}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">LOP Days</p>
              <p className="text-sm font-medium">{payslip.lop_days}</p>
            </div>
          </div>

          {/* Earnings Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-700 dark:text-green-400">
                Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslip.earnings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        No earnings
                      </TableCell>
                    </TableRow>
                  ) : (
                    payslip.earnings.map((e, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <span className="text-sm">{e.component_name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({e.component_code})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(e.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Deductions Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-700 dark:text-red-400">
                Deductions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslip.deductions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center text-muted-foreground"
                      >
                        No deductions
                      </TableCell>
                    </TableRow>
                  ) : (
                    payslip.deductions.map((d, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <span className="text-sm">{d.component_name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({d.component_code})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          {formatCurrency(d.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gross Pay</span>
              <span className="text-sm font-medium">
                {formatCurrency(payslip.gross_pay)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Deductions
              </span>
              <span className="text-sm font-medium text-red-600">
                - {formatCurrency(payslip.total_deductions)}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">Net Pay</span>
              <span className="text-lg font-bold text-green-700 dark:text-green-400">
                {formatCurrency(payslip.net_pay)}
              </span>
            </div>
          </div>

          {/* Download */}
          <Button onClick={handleDownload} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PayslipPage() {
  const { data: payslips, isLoading } = useMyPayslips();
  const [selectedPayslip, setSelectedPayslip] =
    React.useState<SalarySlip | null>(null);
  const [search, setSearch] = React.useState("");

  const filteredPayslips = React.useMemo(() => {
    if (!payslips) return [];
    if (!search) return payslips;
    return payslips.filter(
      (p) =>
        p.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.employee_code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [payslips, search]);

  return (
    <div>
      <PageHeader
        title="My Payslips"
        description="View and download your salary slips"
      />

      <DataTable
        columns={payslipListColumns}
        data={filteredPayslips}
        total={filteredPayslips.length}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payslips..."
        emptyTitle="No payslips found"
        emptyDescription="Your payslips will appear here after payroll is processed"
        onRowClick={(row) => setSelectedPayslip(row)}
      />

      {selectedPayslip && (
        <PayslipDetailDialog
          payslip={selectedPayslip}
          open={!!selectedPayslip}
          onOpenChange={(open) => !open && setSelectedPayslip(null)}
        />
      )}
    </div>
  );
}
