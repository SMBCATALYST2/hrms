import React from "react";
import { useLeaveApplications, useApproveLeave, useRejectLeave } from "@/hooks/use-leaves";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Check, X, MoreHorizontal } from "lucide-react";
import type { LeaveApplication } from "@/types";

export default function LeaveListPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const { data, isLoading } = useLeaveApplications({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const columns: ColumnDef<LeaveApplication>[] = [
    {
      id: "employee_name",
      header: "Employee",
      accessorKey: "employee_name",
      sortable: true,
    },
    {
      id: "leave_type_name",
      header: "Leave Type",
      accessorKey: "leave_type_name",
    },
    {
      id: "from_date",
      header: "From",
      cell: (row) => formatDate(row.from_date),
      sortable: true,
    },
    {
      id: "to_date",
      header: "To",
      cell: (row) => formatDate(row.to_date),
    },
    {
      id: "total_days",
      header: "Days",
      cell: (row) => (
        <span>
          {row.total_days}
          {row.is_half_day && " (half)"}
        </span>
      ),
    },
    {
      id: "reason",
      header: "Reason",
      cell: (row) => (
        <span className="truncate max-w-[200px] block text-sm">{row.reason}</span>
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
      cell: (row) =>
        row.status === "pending" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  approveLeave.mutate(row.id);
                }}
              >
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  rejectLeave.mutate({ id: row.id, reason: "Rejected by manager" });
                }}
              >
                <X className="mr-2 h-4 w-4 text-red-600" />
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Applications"
        description="Review and manage leave applications"
      />

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee..."
        loading={isLoading}
        emptyTitle="No leave applications"
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
