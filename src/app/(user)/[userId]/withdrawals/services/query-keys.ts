import { WalletType } from "@/types/withdrawals/withdrawal.types";

export const withdrawalKeys = {
    all: ['withdrawals'] as const,
    history: () => [...withdrawalKeys.all, 'history'] as const,
    status: (id: string) => [...withdrawalKeys.all, 'status', id] as const,
    pending: () => [...withdrawalKeys.all, 'pending'] as const,
}
export const walletKeys = {
    all: ['wallets'] as const,
    balances: () => [...walletKeys.all, 'balances'] as const,
    balance: (type: WalletType) => [...walletKeys.all, 'balance', type] as const,
};

/*
Why Query Key Factory:

Consistency: Standardized key structure across the app
Invalidation: Easy to invalidate related queries
Type Safety: TypeScript ensures correct key usage
Maintainability: Centralized key management
*/