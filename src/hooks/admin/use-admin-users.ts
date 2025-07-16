import { usersAdminApiClient } from "@/app/admin/api/users-admin-api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useAdminUsers(
  page: number,
  size: number,
  status?: string,
  search?: string
) {
  return useQuery({
    queryKey: ["adminUsers", page, size, status, search],
    queryFn: () => usersAdminApiClient.list(page, size, status, search),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      usersAdminApiClient.block(userId, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}


export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersAdminApiClient.unblock(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useForceLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersAdminApiClient.forceLogout(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useRemoveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, soft }: { userId: string; soft?: boolean }) =>
      usersAdminApiClient.remove(userId, soft),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}