import { WalletService } from "@/app/(user)/[userId]/wallet/services/wallet.service";
import { notificationService } from "@/app/(user)/[userId]/withdrawals/services/notifications.service";
import { WalletSummary } from "@/types/wallet/wallet.types";
import { Wallet, WalletTransferForm, WalletType } from "@/types/withdrawals/withdrawal.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";


// Query Keys for Wallets
const walletKeys = {
    all: ['wallets'] as const,
    balances: () => [...walletKeys.all, 'balances'] as const,
    balance: (type: WalletType) => [...walletKeys.all, 'balance', type] as const,
    transfers: () => [...walletKeys.all, 'transfers'] as const,
    details: (id: string) => [...walletKeys.all, 'details', id] as const,
    summary: () => [...walletKeys.all, 'summary'] as const,
};

//wallet balance hooks
export const useWalletBalances = () => {
    return useQuery({
        queryKey: walletKeys.balances(),
        queryFn: () => WalletService.getInstance().getWalletBalances(),
        staleTime: 30000, //30 seconds
        refetchInterval: 60000,// 1 minute
        refetchOnWindowFocus: true,
        select: (data) => data.data || [],
    });
}
export const useWalletBalance = (type: WalletType) => {
    return useQuery({
        queryKey: walletKeys.balance(type),
        queryFn: () => WalletService.getInstance().getWalletBalance(type),
        staleTime: 30000,
        refetchInterval: 60000,
        enabled: !!type,
        select: (data) => data.data,
    });
};
// Wallet Summary Hook (Computed)
export const useWalletSummary = () => {
    const { data: wallets, ...queryInfo } = useWalletBalances();

    const summary = useMemo((): WalletSummary => {
        if (!wallets) {
            return {
                total_balance: 0,
                available_balance: 0,
                locked_balance: 0,
                wallet_count: 0,
                last_updated: new Date().toISOString(),
            };
        }

        return wallets.reduce((acc, wallet) => {
            acc.total_balance += wallet.balance;
            acc.available_balance += (wallet.balance - wallet.locked_balance);
            acc.locked_balance += wallet.locked_balance;
            acc.wallet_count++;

            // Get the most recent update
            if (wallet.updated_at > acc.last_updated) {
                acc.last_updated = wallet.updated_at;
            }

            return acc;
        }, {
            total_balance: 0,
            available_balance: 0,
            locked_balance: 0,
            wallet_count: 0,
            last_updated: new Date(0).toISOString(),
        });
    }, [wallets]);

    return {
        data: summary,
        ...queryInfo,
    };
};

// Transfer Hooks
export const useTransferHistory = () => {
    return useQuery({
        queryKey: walletKeys.transfers(),
        queryFn: () => WalletService.getInstance().getTransferHistory(),
        staleTime: 60000, // 1 minute
        select: (data) => data.data || [],
    });
};
export const useWalletTransfer = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: WalletTransferForm) =>
            WalletService.getInstance().transferBetweenWallets(data),
        onMutate: async (variables) => {
            // Optimistic update - temporarily update balances
            await queryClient.cancelQueries({ queryKey: walletKeys.all });

            const previousBalances = queryClient.getQueryData(walletKeys.balances());

            // Optimistically update the cache
            queryClient.setQueryData(walletKeys.balances(), (old: any) => {
                if (!old?.data) return old;

                return {
                    ...old,
                    data: old.data.map((wallet: Wallet) => {
                        if (wallet.wallet_type === variables.from_wallet) {
                            return {
                                ...wallet,
                                balance: wallet.balance - variables.amount,
                                locked_balance: wallet.locked_balance + variables.amount,
                            };
                        }
                        return wallet;
                    }),
                };
            });

            return { previousBalances };
        },
        onError: (error, variables, context) => {
            // Revert optimistic update on error
            if (context?.previousBalances) {
                queryClient.setQueryData(walletKeys.balances(), context.previousBalances);
            }
            notificationService.getInstance().error(`Transfer failed: ${error.message}`);
        },
        onSuccess: (data, variables) => {
            // Invalidate and refetch related queries
            queryClient.invalidateQueries({ queryKey: walletKeys.all });
            notificationService.getInstance().success(
                `Successfully transferred $${variables.amount} from ${variables.from_wallet} to ${variables.to_wallet} wallet`
            );
        },
    });
};

// Transfer Validation Hook
export const useTransferValidation = () => {
  return useMutation({
    mutationFn: (data: WalletTransferForm) => 
      WalletService.getInstance().validateTransfer(data),
    onError: (error) => {
      notificationService.getInstance().warning(`Validation failed: ${error.message}`);
    },
  });
};
