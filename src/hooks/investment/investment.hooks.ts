// src/hooks/investments/hooks.ts
// -----------------------------------------------------------------------------
// 🪝  Central hook layer for the Investments feature
// -----------------------------------------------------------------------------
// Why keep them in ONE barrel file?
//   • Easier to import ("import { useInvestments } from '@/hooks/investments'")
//   • Keeps responsibility clear: this folder ONLY exposes data‑layer hooks for
//     investments + wallets. No UI, no utils.
//
// Each hook is fully documented right here so new devs can read _what_ it does
// without digging through implementation.
// -----------------------------------------------------------------------------


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investmentsClient } from '@/lib/api/investments.client';
import { Investment } from '@/types/investments/investments.types';
import {walletsClient} from "@/lib/api/wallets.client";
import {mockInvestments} from "@/mocks/investments.mock";
/* -------------------------------------------------------------------------- */
/*  Hook: useInvestments                                                      */
/* -------------------------------------------------------------------------- */
/**
 * Returns **all investments** for a user.
 *
 * 🔄 Fetch strategy
 *   • Uses TanStack React‑Query to cache the list by `userId`.
 *   • While the real backend is under construction, we inject `mockInvestments`
 *     as `placeholderData` so UI renders instantly.
 *
 * @param userId – UUID of the current user
 */
export const useInvestments = (userId: string) =>
    useQuery<Investment[]>({
        queryKey: ['investments', userId],
        queryFn: () => investmentsClient.list(userId),
        placeholderData: mockInvestments,
        retry: false, // frontend is usable offline → avoid infinite retry noise
    });
/* -------------------------------------------------------------------------- */
/*  Hook: useInvestment                                                        */
/* -------------------------------------------------------------------------- */
/**
 * Fetch a **single investment row**.
 *
 * Separate from `useInvestments` so the detail page can refetch individually
 * without waiting for the whole list.
 */

export const useInvestment = (userId: string, investmentId: string) =>
    useQuery<Investment>({
        queryKey: ['investment', userId, investmentId],
        queryFn: () => investmentsClient.get(userId, investmentId),
        placeholderData: () =>
            mockInvestments.find((i) => i.id === investmentId) as Investment,
        retry: false,
    });
/* -------------------------------------------------------------------------- */
/*  Hook: useCreateInvestment                                                  */
/* -------------------------------------------------------------------------- */
/**
 * Mutation wrapper for **starting a new investment**.
 *
 * UI passes only the `amount`; the hook handles POSTing to the API and
 * invalidating the cached list so `useInvestments` auto‑refreshes.
 */
export const useCreateInvestment = (userId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (amount: number) => investmentsClient.create(userId, {amount}),

        onSuccess: () => qc.invalidateQueries(({queryKey: ['investments', userId]})),
    })
}

    /* -------------------------------------------------------------------------- */
    /*  Wallet‑related hooks                                                      */
    /* -------------------------------------------------------------------------- */
    /** Shape returned from walletsClient.getBalances */
    export interface WalletBalance {
        accountWallet: number;
        tradingWallet: number;
        referralWallet: number;
    }
/**
 * Read‑only balances for the three wallets.
 */
export const useWalletBalances = (userId: string) =>
    useQuery<WalletBalance>({
        queryKey: ['walletBalances', userId],
        queryFn: () => walletsClient.getBalances(userId),
        placeholderData: {
            accountWallet: 0,
            tradingWallet: 0,
            referralWallet: 0,
        },
        retry: false,
    });
/**
 * Mutation to **move funds from Account → Trading wallet**.
 *
 * After sucess we invalidate the wallet query so every component that shows
 * balances re‑renders with fresh data.
 */
export const useTransferToTrading = (userId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { from: 'account'; to: 'trading'; amount: number }) =>
            walletsClient.transfer(userId, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['walletBalances', userId] }),
    });
};
/* -------------------------------------------------------------------------- */
/*  Hook: useCancelInvestment (optional)                                       */
/* -------------------------------------------------------------------------- */
/**
 * If business rules allow users to cancel before release date, wrap the DELETE
 * endpoint here. Same invalidation pattern as above.
 */
export const useCancelInvestment = (userId: string) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (investmentId: string) =>
            investmentsClient.cancel?.(userId, investmentId), // optional backend route
        onSuccess: () => qc.invalidateQueries({ queryKey: ['investments', userId] }),
    });
};

