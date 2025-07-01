// src/lib/api/wallets.client.ts
// -----------------------------------------------------------------------------
// Single‑responsibility API wrapper for wallet‑related endpoints.
// -----------------------------------------------------------------------------

import { apiClient } from '@/lib/api/api-client';
/**
 * Shape of a wallet balance snapshot returned from the backend.
 */
export interface  WalletBalance{
    accountWallet: number;
    tradingWallet: number;
    referralWallet: number;
}

export interface  TransferRequest{
    from: 'account' | 'trading' | 'referral';
    to: 'account' | 'trading' | 'referral';
    amount: number;
}

export const  walletsClient =
    {
        /**
         * Fetch the latest balances for all three wallets.
         * GET /api/v1/users/:id/wallet/balances
         */
        async getBalances(userId: string): Promise<WalletBalance> {
            const { data } = await apiClient.get<WalletBalance>(
                `/api/v1/users/${userId}/wallet/balances`,
            );
            return data;
        },


        /**
         * Move funds between two internal wallets.
         * POST /api/v1/users/:id/wallet/transfer
         */
        async transfer(userId: string, payload: TransferRequest): Promise<WalletBalance> {
            const { data } = await apiClient.post<WalletBalance>(
                `/api/v1/users/${userId}/wallet/transfer`,
                payload,
            );
            return data;
        },
    }