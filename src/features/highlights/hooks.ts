import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import * as api from './api';
import type { HighlightInsert, HighlightUpdate } from './types';

const keys = {
  all: ['highlights'] as const,
  list: (userId: string) => [...keys.all, 'list', userId] as const,
};

export function useHighlights() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.list(user.id) : ['highlights', 'list', 'none'],
    queryFn: () => api.listHighlights(user!.id),
    enabled: !!user,
  });
}

export function useCreateHighlight() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: HighlightInsert) => api.createHighlight(user!.id, input),
    onSuccess: () => user && qc.invalidateQueries({ queryKey: keys.list(user.id) }),
  });
}

export function useUpdateHighlight() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: HighlightUpdate }) => api.updateHighlight(id, patch),
    onSuccess: () => user && qc.invalidateQueries({ queryKey: keys.list(user.id) }),
  });
}

export function useDeleteHighlight() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteHighlight(id),
    onSuccess: () => user && qc.invalidateQueries({ queryKey: keys.list(user.id) }),
  });
}
