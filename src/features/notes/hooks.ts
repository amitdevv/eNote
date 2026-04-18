import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import * as api from './api';
import type { NoteInsert, NoteUpdate } from './types';

const keys = {
  all: ['notes'] as const,
  list: (userId: string, filters: api.NotesListFilters) =>
    [...keys.all, 'list', userId, filters] as const,
  detail: (id: string) => [...keys.all, 'detail', id] as const,
  search: (userId: string, q: string) => [...keys.all, 'search', userId, q] as const,
};

export function useNotes(filters: api.NotesListFilters = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.list(user.id, filters) : ['notes', 'list', 'none'],
    queryFn: () => api.listNotes(user!.id, filters),
    enabled: !!user,
  });
}

export function useNote(id: string | undefined) {
  return useQuery({
    queryKey: id ? keys.detail(id) : ['notes', 'detail', 'none'],
    queryFn: () => api.getNote(id!),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<NoteInsert> | void) =>
      api.createNote(user!.id, partial ?? undefined),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: [...keys.all, 'list', user.id] });
    },
  });
}

export function useUpdateNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: NoteUpdate }) => api.updateNote(id, patch),
    onSuccess: (note) => {
      qc.setQueryData(keys.detail(note.id), note);
      if (user) qc.invalidateQueries({ queryKey: [...keys.all, 'list', user.id] });
    },
  });
}

export function useDeleteNote() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteNote(id),
    onSuccess: () => {
      if (user) qc.invalidateQueries({ queryKey: [...keys.all, 'list', user.id] });
    },
  });
}

export function useSearchNotes(query: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.search(user.id, query) : ['notes', 'search', 'none', query],
    queryFn: () => api.searchNotes(user!.id, query),
    enabled: !!user && query.trim().length > 0,
  });
}

