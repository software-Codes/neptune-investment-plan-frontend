import { apiClient } from '@/lib/api/api-client';
import { TransferValidation, WalletDetails, WalletServiceInterface, WalletTransfer } from '@/types/wallet/wallet.types'
import { APIResponse, Wallet, WalletTransferForm, WalletType } from '@/types/withdrawals/withdrawal.types';
export class WalletService implements WalletServiceInterface {
    private static instance: WalletService;
    private apiClient = apiClient;
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 30000; // 30 seconds
    public static getInstance(): WalletService {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }
    // Private cache management methods
    private getCacheKey(method: string, params?: any): string {
        return `${method}_${JSON.stringify(params || {})}`;
    }
    private getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data as T;
        }
        this.cache.delete(key);
        return null;
    }
    private setCache(key: string, data: any): void {
        this.cache.set(key, { data, timestamp: Date.now() });
    }
    private clearCacheByPattern(pattern: string): void {
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
            }
        }
    }
    // Balance Operations
    async getWalletBalances(): Promise<APIResponse<Wallet[]>> {
        const cacheKey = this.getCacheKey('walletBalances');
        const cached = this.getFromCache<APIResponse<Wallet[]>>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await this.apiClient.get<APIResponse<Wallet[]>>('/api/v1/wallet/balances');
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to fetch wallet balances: ${message}`);
        }
    }
    async getWalletBalance(type: WalletType): Promise<APIResponse<Wallet>> {
        const cacheKey = this.getCacheKey('walletBalance', { type });
        const cached = this.getFromCache<APIResponse<Wallet>>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await this.apiClient.get<APIResponse<Wallet>>(`/api/v1/wallet/balance/${type}`);
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to fetch ${type} wallet balance: ${message}`);
        }
    }
    async refreshWalletBalance(type: WalletType): Promise<APIResponse<Wallet>> {
        // Clear cache for this wallet type
        this.clearCacheByPattern(`walletBalance_${type}`);
        this.clearCacheByPattern('walletBalances');

        return this.getWalletBalance(type);
    }
    // Transfer Operations
    async transferBetweenWallets(data: WalletTransferForm): Promise<APIResponse<WalletTransfer>> {
        try {
            // Validate transfer before sending
            const validation = await this.validateTransfer(data);
            if (!validation.success) {
                throw new Error(validation.message);
            }

            const response = await this.apiClient.post<APIResponse<WalletTransfer>>(
                '/api/v1/wallet/transfer',
                data
            );

            // Clear relevant caches after successful transfer
            this.clearCacheByPattern('wallet');
            this.clearCacheByPattern('transfer');

            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Transfer failed: ${message}`);
        }
    }
    async getTransferHistory(): Promise<APIResponse<WalletTransfer[]>> {
        const cacheKey = this.getCacheKey('transferHistory');
        const cached = this.getFromCache<APIResponse<WalletTransfer[]>>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await this.apiClient.get<APIResponse<WalletTransfer[]>>('/api/v1/wallet/transfers');
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to fetch transfer history: ${message}`);
        }
    }
    async validateTransfer(data: WalletTransferForm): Promise<APIResponse<TransferValidation>> {
        try {
            const response = await this.apiClient.post<APIResponse<TransferValidation>>(
                '/api/v1/wallet/transfer/validate',
                data
            );
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Transfer validation failed: ${message}`);
        }
    }
    // Wallet Management
    async getWalletDetails(walletId: string): Promise<APIResponse<WalletDetails>> {
        const cacheKey = this.getCacheKey('walletDetails', { walletId });
        const cached = this.getFromCache<APIResponse<WalletDetails>>(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await this.apiClient.get<APIResponse<WalletDetails>>(`/api/v1/wallet/${walletId}`);
            this.setCache(cacheKey, response.data);
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to fetch wallet details: ${message}`);
        }
    }
    async lockWalletBalance(walletType: WalletType, amount: number): Promise<APIResponse> {
        try {
            const response = await this.apiClient.post<APIResponse>('/api/v1/wallet/lock', {
                wallet_type: walletType,
                amount
            });

            // Clear cache after balance lock
            this.clearCacheByPattern('wallet');

            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to lock wallet balance: ${message}`);
        }
    }
    async unlockWalletBalance(walletType: WalletType, amount: number): Promise<APIResponse> {
        try {
            const response = await this.apiClient.post<APIResponse>('/api/v1/wallet/unlock', {
                wallet_type: walletType,
                amount
            });

            // Clear cache after balance unlock
            this.clearCacheByPattern('wallet');

            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to unlock wallet balance: ${message}`);
        }
    }



}