import api from "@/lib/api";
import { API_ROUTES } from "@/lib/constants";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskBoard,
  PaginatedResponse,
  PaginationParams,
} from "@/types";

export const taskService = {
  async list(
    params?: PaginationParams & {
      assignee_id?: string;
      status?: string;
      priority?: string;
      board_id?: string;
    }
  ): Promise<PaginatedResponse<Task>> {
    const response = await api.get<PaginatedResponse<Task>>(
      API_ROUTES.TASKS.BASE,
      { params }
    );
    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await api.get<Task>(API_ROUTES.TASKS.DETAIL(id));
    return response.data;
  },

  async create(data: CreateTaskRequest): Promise<Task> {
    const response = await api.post<Task>(API_ROUTES.TASKS.BASE, data);
    return response.data;
  },

  async update(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await api.patch<Task>(API_ROUTES.TASKS.DETAIL(id), data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(API_ROUTES.TASKS.DETAIL(id));
  },

  async listBoards(): Promise<TaskBoard[]> {
    const response = await api.get<TaskBoard[]>(API_ROUTES.TASKS.BOARDS);
    return response.data;
  },

  async moveTask(
    id: string,
    data: { status: string; board_column?: string }
  ): Promise<Task> {
    const response = await api.patch<Task>(API_ROUTES.TASKS.DETAIL(id), data);
    return response.data;
  },
};
