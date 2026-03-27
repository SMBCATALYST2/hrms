import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";
import { QUERY_KEYS } from "@/lib/constants";
import type { CreateTaskRequest, UpdateTaskRequest, PaginationParams } from "@/types";
import { toast } from "sonner";

export function useTasks(
  params?: PaginationParams & {
    assignee_id?: string;
    status?: string;
    priority?: string;
    board_id?: string;
  }
) {
  return useQuery({
    queryKey: QUERY_KEYS.TASKS.LIST(params),
    queryFn: () => taskService.list(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TASKS.DETAIL(id),
    queryFn: () => taskService.getById(id),
    enabled: !!id,
  });
}

export function useMyTasks(assigneeId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TASKS.LIST({ assignee_id: assigneeId }),
    queryFn: () => taskService.list({ assignee_id: assigneeId }),
    enabled: !!assigneeId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.ALL });
      toast.success("Task created");
    },
    onError: () => {
      toast.error("Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.DETAIL(id) });
      toast.success("Task updated");
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.ALL });
      toast.success("Task deleted");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, board_column }: { id: string; status: string; board_column?: string }) =>
      taskService.moveTask(id, { status, board_column }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TASKS.ALL });
    },
    onError: () => {
      toast.error("Failed to move task");
    },
  });
}

export function useTaskBoards() {
  return useQuery({
    queryKey: QUERY_KEYS.TASKS.BOARDS(),
    queryFn: () => taskService.listBoards(),
  });
}
