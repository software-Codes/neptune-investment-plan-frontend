import { WalletService } from "@/app/(user)/[userId]/wallet/services/wallet.service";
import { notificationService } from "@/app/(user)/[userId]/withdrawals/services/notifications.service";
import {
  walletKeys,
  withdrawalKeys,
} from "@/app/(user)/[userId]/withdrawals/services/query-keys";
import { WithdrawalService } from "@/app/(user)/[userId]/withdrawals/services/withdrawals.services";
import {
  WithdrawalForm,
  WithdrawalRequest,
} from "@/types/withdrawals/withdrawal.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawalForm) =>
      WithdrawalService.getInstance().createWithdrawal(data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => {
      // Centralized error handling
      notificationService.getInstance().error(error.message);
    },
  });
};

// Wallet Hooks
const useWalletBalances = () => {
  return useQuery({
    queryKey: walletKeys.balances(),
    queryFn: () => WalletService.getInstance().getWalletBalances(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Expensive calculations memoization
const useWithdrawalSummary = (withdrawals: WithdrawalRequest[]) => {
  return useMemo(() => {
    return withdrawals.reduce(
      (acc, withdrawal) => {
        acc.total += withdrawal.amount;
        acc.count++;
        if (withdrawal.status === "pending") acc.pending++;
        if (withdrawal.status === "completed") acc.completed++;
        return acc;
      },
      { total: 0, count: 0, pending: 0, completed: 0 }
    );
  }, [withdrawals]);
};
// Selective query invalidation
const useOptimizedQueries = () => {
  const queryClient = useQueryClient();

  const invalidateWithdrawals = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
  }, [queryClient]);

  const invalidateWallets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
  }, [queryClient]);

  return { invalidateWithdrawals, invalidateWallets };
};
