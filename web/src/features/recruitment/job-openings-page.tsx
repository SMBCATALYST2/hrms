import React from "react";
import { useNavigate } from "react-router-dom";
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
import { useJobOpenings } from "@/hooks/use-recruitment";
import { formatDate } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import type { JobOpening, JobOpeningStatus } from "@/types";
import { Plus, Briefcase } from "lucide-react";

const columns: ColumnDef<JobOpening>[] = [
  {
    id: "title",
    header: "Job Title",
    cell: (row) => (
      <div>
        <p className="font-medium">{row.title}</p>
        {row.location && (
          <p className="text-xs text-muted-foreground">{row.location}</p>
        )}
      </div>
    ),
    sortable: true,
  },
  {
    id: "department_name",
    header: "Department",
    accessorKey: "department_name",
    sortable: true,
  },
  {
    id: "openings",
    header: "Positions",
    accessorKey: "openings",
  },
  {
    id: "application_count",
    header: "Applications",
    cell: (row) => (
      <span className="font-medium">{row.application_count ?? 0}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: "posted_date",
    header: "Posted",
    cell: (row) => (row.posted_date ? formatDate(row.posted_date) : "-"),
    sortable: true,
  },
];

const statusOptions: { label: string; value: string }[] = [
  { label: "All Status", value: "all" },
  { label: "Open", value: "open" },
  { label: "On Hold", value: "on_hold" },
  { label: "Closed", value: "closed" },
  { label: "Draft", value: "draft" },
];

export default function JobOpeningsPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState<string | undefined>();
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading } = useJobOpenings({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const handleSortChange = (column: string, order: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(order);
  };

  return (
    <div>
      <PageHeader
        title="Job Openings"
        description="Manage open positions and job postings"
        actions={
          <Button onClick={() => navigate(APP_ROUTES.RECRUITMENT.JD_CREATOR)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
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
        searchPlaceholder="Search job openings..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        loading={isLoading}
        emptyTitle="No job openings"
        emptyDescription="Create your first job opening to start recruiting"
        emptyAction={{
          label: "Create Job Opening",
          onClick: () => navigate(APP_ROUTES.RECRUITMENT.JD_CREATOR),
        }}
        onRowClick={(row) =>
          navigate(APP_ROUTES.RECRUITMENT.JOB_OPENING_DETAIL(row.id))
        }
        actions={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Briefcase className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
