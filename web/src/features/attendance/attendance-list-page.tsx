import React from "react";
import { useAttendanceList } from "@/hooks/use-attendance";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AttendanceRecord } from "@/types";

export default function AttendanceListPage() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");

  const { data, isLoading } = useAttendanceList({
    page,
    page_size: pageSize,
    search: search || undefined,
  });

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      id: "employee_name",
      header: "Employee",
      accessorKey: "employee_name",
      sortable: true,
    },
    {
      id: "date",
      header: "Date",
      sortable: true,
      cell: (row) => formatDate(row.date),
    },
    {
      id: "check_in",
      header: "Check In",
      cell: (row) => row.check_in || "-",
    },
    {
      id: "check_out",
      header: "Check Out",
      cell: (row) => row.check_out || "-",
    },
    {
      id: "total_hours",
      header: "Hours",
      cell: (row) => (row.total_hours ? `${row.total_hours.toFixed(1)}h` : "-"),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "source",
      header: "Source",
      cell: (row) => <span className="capitalize text-sm">{row.source}</span>,
    },
    {
      id: "is_late",
      header: "Late",
      cell: (row) =>
        row.is_late ? (
          <span className="text-red-600 text-sm">{row.late_minutes}m late</span>
        ) : (
          <span className="text-green-600 text-sm">On time</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Records"
        description="View all employee attendance records"
      />

      <div className="flex items-center gap-4 mb-4">
        <div>
          <Label className="text-xs">Date Filter</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

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
        searchPlaceholder="Search by employee name..."
        loading={isLoading}
        emptyTitle="No attendance records"
        emptyDescription="Attendance records will appear here once employees check in."
      />
    </div>
  );
}
