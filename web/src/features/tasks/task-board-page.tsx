import React from "react";
import { useNavigate } from "react-router-dom";
import { useTasks, useCreateTask, useMoveTask } from "@/hooks/use-tasks";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, formatDate, cn } from "@/lib/utils";
import {
  Plus,
  Calendar,
  Loader2,
  List,
  MoreHorizontal,
  Filter,
  User,
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/types";

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "border-t-gray-500" },
  { id: "in_progress", title: "In Progress", color: "border-t-blue-500" },
  { id: "in_review", title: "In Review", color: "border-t-purple-500" },
  { id: "done", title: "Done", color: "border-t-green-500" },
];

const ALL_STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
];

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function TaskCard({
  task,
  onMove,
  onClick,
}: {
  task: Task;
  onMove: (status: TaskStatus) => void;
  onClick: () => void;
}) {
  return (
    <Card
      className="mb-2 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-medium flex-1 pr-2">{task.title}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ALL_STATUSES.filter((s) => s !== task.status).map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(status);
                  }}
                >
                  Move to{" "}
                  {status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn("text-xs border-0", priorityColors[task.priority])}
          >
            {task.priority}
          </Badge>
          {task.assignee_name && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {getInitials(task.assignee_name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-muted px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TaskBoardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState("all");
  const [assigneeFilter, setAssigneeFilter] = React.useState("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<TaskPriority>("medium");
  const [newDueDate, setNewDueDate] = React.useState("");

  const { data: tasksData, isLoading } = useTasks({ page_size: 200 });
  const createTask = useCreateTask();
  const moveTask = useMoveTask();

  const allTasks = tasksData?.items ?? [];

  // Apply filters
  const filteredTasks = React.useMemo(() => {
    let result = allTasks;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          t.assignee_name?.toLowerCase().includes(term) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (assigneeFilter === "my" && user) {
      result = result.filter((t) => t.assignee_id === user.id);
    }

    return result;
  }, [allTasks, search, priorityFilter, assigneeFilter, user]);

  const getColumnTasks = (status: TaskStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createTask.mutateAsync({
      title: newTitle,
      description: newDescription || undefined,
      priority: newPriority,
      due_date: newDueDate || undefined,
    });
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setNewDueDate("");
    setCreateOpen(false);
  };

  const handleMove = (taskId: string, newStatus: TaskStatus) => {
    moveTask.mutate({ id: taskId, status: newStatus });
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Task Board"
        description="Kanban board view of your tasks"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/tasks/list")}>
              <List className="mr-2 h-4 w-4" />
              List View
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[130px]">
              <User className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="my">My Tasks</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map((column) => {
          const columnTasks = getColumnTasks(column.id);
          return (
            <div
              key={column.id}
              className={cn(
                "flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg border-t-4",
                column.color
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-3 pb-2">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {columnTasks.length}
                </Badge>
              </div>

              {/* Cards */}
              <ScrollArea className="flex-1 px-3 pb-3">
                <div className="space-y-0">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full mb-2" />
                    ))
                  ) : columnTasks.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed p-6 text-center">
                      <p className="text-xs text-muted-foreground">
                        No tasks
                      </p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onMove={(status) => handleMove(task.id, status)}
                        onClick={() => {
                          /* Could navigate to task detail */
                        }}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Task description..."
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newPriority}
                  onValueChange={(v) => setNewPriority(v as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createTask.isPending || !newTitle.trim()}
            >
              {createTask.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
