export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  reporter_id: string;
  reporter_name?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  tags?: string[];
  board_id?: string;
  board_column?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignee_id?: string;
  priority: TaskPriority;
  due_date?: string;
  tags?: string[];
  board_id?: string;
  estimated_hours?: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
  actual_hours?: number;
}

export interface TaskBoard {
  id: string;
  name: string;
  columns: TaskBoardColumn[];
  created_at: string;
}

export interface TaskBoardColumn {
  id: string;
  name: string;
  order: number;
  task_count: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}
