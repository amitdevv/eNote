import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import * as api from './api';
import type { ProfilePatch } from './api';

const keys = {
  profile: (userId: string) => ['profile', userId] as const,
};

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.profile(user.id) : ['profile', 'none'],
    queryFn: () => api.getProfile(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: ProfilePatch) => api.updateProfile(user!.id, patch),
    onSuccess: (profile) => {
      if (user) qc.setQueryData(keys.profile(user.id), profile);
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => api.deleteAccount(),
  });
}
