import React from "react";
import { useNavigate } from "react-router-dom";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { getInitials, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { LayoutGrid, Plus, ChevronDown } from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "@/types";

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const ALL_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

export default function TaskListPage() {
  const navigate = useNavigate();
  const updateTask = useUpdateTask();
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("");
  const [sortBy, setSortBy] = React.useState("created_at");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  const { data, isLoading } = useTasks({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const columns: ColumnDef<Task>[] = [
    {
      id: "title",
      header: "Task",
      sortable: true,
      cell: (row) => (
        <div>
          <p className="font-medium">{row.title}</p>
          {row.tags && row.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {row.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "assignee_name",
      header: "Assignee",
      cell: (row) =>
        row.assignee_name ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(row.assignee_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{row.assignee_name}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        ),
    },
    {
      id: "priority",
      header: "Priority",
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn("text-xs border-0 capitalize", priorityColors[row.priority])}
        >
          {row.priority}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2"
              onClick={(e) => e.stopPropagation()}
            >
              <StatusBadge status={row.status} />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ALL_STATUSES.map((s) => (
              <DropdownMenuItem
                key={s.value}
                disabled={s.value === row.status}
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask.mutate({ id: row.id, data: { status: s.value } });
                }}
              >
                <StatusBadge status={s.value} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      id: "due_date",
      header: "Due Date",
      sortable: true,
      cell: (row) =>
        row.due_date ? (
          <span className="text-sm">{formatDate(row.due_date)}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        ),
    },
    {
      id: "created_at",
      header: "Created",
      sortable: true,
      cell: (row) => <span className="text-sm">{formatDate(row.created_at)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Table view of all tasks"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/tasks")}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board View
            </Button>
            <Button onClick={() => navigate("/tasks")}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
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
        searchPlaceholder="Search tasks..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(col, order) => {
          setSortBy(col);
          setSortOrder(order);
        }}
        loading={isLoading}
        emptyTitle="No tasks found"
        emptyDescription="Create your first task to get started"
        actions={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
