// hooks/admin/use-admin-users.ts
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
    placeholderData: (old) => old,
    staleTime: 5 * 60 * 1000,
    select: (server) => ({
      total: server.total,
      items: server.items.map((u) => ({
        userId: u.user_id,
        fullName: u.full_name,
        email: u.email,
        createdAt: u.created_at,
        accountStatus: u.account_status as
          | "active"
          | "suspended"
          | "deactivated",
        accountBalance: u.account_balance,
        tradingBalance: u.trading_balance,
        referralBalance: u.referral_balance,
      })),
    }),
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ["adminUser", userId],
    enabled: !!userId && userId !== "undefined",
    queryFn: () => usersAdminApiClient.get(userId),
    select: (u) => ({
      userId: u.user_id,
      fullName: u.full_name,
      email: u.email,
      createdAt: u.created_at,
      accountStatus: u.account_status,
      accountBalance: u.account_balance,
      tradingBalance: u.trading_balance,
      referralBalance: u.referral_balance,
    }),
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      reason = "Admin action",
    }: {
      userId: string;
      reason?: string;
    }) => usersAdminApiClient.block(userId, reason),
    onSuccess: (_, { userId }) => {
      // Invalidate both the user list and specific user queries
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      qc.invalidateQueries({ queryKey: ["adminUser", userId] });
    },
  });
}

export function useUnblockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersAdminApiClient.unblock(userId),
    onSuccess: (_, userId) => {
      // Invalidate both the user list and specific user queries
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      qc.invalidateQueries({ queryKey: ["adminUser", userId] });
    },
  });
}

export function useForceLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersAdminApiClient.forceLogout(userId),
    onSuccess: (_, userId) => {
      // Invalidate both the user list and specific user queries
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      qc.invalidateQueries({ queryKey: ["adminUser", userId] });
    },
  });
}

export function useRemoveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      soft = false,
    }: {
      userId: string;
      soft?: boolean;
    }) => usersAdminApiClient.remove(userId, soft),
    onSuccess: (_, { userId }) => {
      // Invalidate both the user list and specific user queries
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      qc.invalidateQueries({ queryKey: ["adminUser", userId] });
    },
  });
}
