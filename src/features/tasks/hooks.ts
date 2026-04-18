import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import * as api from './api';
import type { Task, TaskInput, TaskUpdate } from './types';

const keys = {
  all: ['tasks'] as const,
  list: (userId: string) => [...keys.all, 'list', userId] as const,
};

export function useTasks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.list(user.id) : ['tasks', 'list', 'none'],
    queryFn: () => api.listTasks(user!.id),
    enabled: !!user,
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => api.createTask(user!.id, input),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}

export function useUpdateTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: TaskUpdate }) =>
      api.updateTask(id, patch),
    // Optimistic update — the toggle should feel instant.
    onMutate: async ({ id, patch }) => {
      if (!user) return;
      const key = keys.list(user.id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<Task[]>(key);
      qc.setQueryData<Task[]>(key, (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (user && ctx?.previous) qc.setQueryData(keys.list(user.id), ctx.previous);
    },
    onSettled: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}

export function useDeleteTask() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}

export function useClearCompleted() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.clearCompleted(user!.id),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}
