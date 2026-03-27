import React from "react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "@/hooks/use-employees";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Employee } from "@/types";

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState("full_name");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  const { data, isLoading } = useEmployees({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: (statusFilter as any) || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const columns: ColumnDef<Employee>[] = [
    {
      id: "full_name",
      header: "Employee",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.photo_url} />
            <AvatarFallback className="text-xs">{getInitials(row.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.full_name}</p>
            <p className="text-xs text-muted-foreground">{row.employee_id}</p>
          </div>
        </div>
      ),
    },
    {
      id: "department_name",
      header: "Department",
      accessorKey: "department_name",
      sortable: true,
    },
    {
      id: "designation_name",
      header: "Designation",
      accessorKey: "designation_name",
      sortable: true,
    },
    {
      id: "employment_type",
      header: "Type",
      cell: (row) => (
        <span className="capitalize text-sm">{row.employment_type.replace(/_/g, " ")}</span>
      ),
    },
    {
      id: "date_of_joining",
      header: "Joined",
      sortable: true,
      cell: (row) => <span className="text-sm">{formatDate(row.date_of_joining)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description="Manage your organization's employees"
        actions={
          <Button onClick={() => navigate("/employees/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        }
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
        searchPlaceholder="Search employees..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(col, order) => {
          setSortBy(col);
          setSortOrder(order);
        }}
        loading={isLoading}
        emptyTitle="No employees found"
        emptyDescription="Get started by adding your first employee"
        emptyAction={{ label: "Add Employee", onClick: () => navigate("/employees/new") }}
        onRowClick={(row) => navigate(`/employees/${row.id}`)}
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="resigned">Resigned</SelectItem>
              <SelectItem value="relieved">Relieved</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
