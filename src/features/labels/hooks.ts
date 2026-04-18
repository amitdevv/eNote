import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import * as api from './api';
import type { LabelInsert, LabelUpdate } from './types';

const keys = {
  all: ['labels'] as const,
  list: (userId: string) => [...keys.all, 'list', userId] as const,
};

export function useLabels() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.list(user.id) : ['labels', 'list', 'none'],
    queryFn: () => api.listLabels(user!.id),
    enabled: !!user,
  });
}

/** Name → color-key map, for rendering pills on notes. */
export function useLabelColorMap(): Record<string, string> {
  const { data } = useLabels();
  const map: Record<string, string> = {};
  for (const l of data ?? []) map[l.name] = l.color;
  return map;
}

export function useCreateLabel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LabelInsert) => api.createLabel(user!.id, input),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}

export function useUpdateLabel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: LabelUpdate }) => api.updateLabel(id, patch),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}

export function useDeleteLabel() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteLabel(id),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: keys.list(user.id) });
    },
  });
}
