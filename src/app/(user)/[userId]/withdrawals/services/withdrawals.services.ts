import { apiClient } from "@/lib/api/api-client";
import { APIResponse } from "@/types/types";
import { Wallet, WalletTransferForm, WalletType, WithdrawalForm, WithdrawalRequest } from "@/types/withdrawals/withdrawal.types";

//withdrawal service
export class WithdrawalService {
    private static instance: WithdrawalService;
    private apiClient = apiClient;

    // Singleton Pattern for consistent API usage
    public static getInstance(): WithdrawalService {
        if (!WithdrawalService.instance) {
            WithdrawalService.instance = new WithdrawalService();
        }
        return WithdrawalService.instance;
    }

    async createWithdrawal(data: WithdrawalForm): Promise<APIResponse<WithdrawalRequest>> {
        return this.apiClient.post("/withdrawals", data);
    }

    async getWithdrawalHistory(): Promise<APIResponse<WithdrawalRequest[]>> {
        return this.apiClient.get("/withdrawals/history");
    }

    async getWithdrawalStatus(id: string): Promise<APIResponse<WithdrawalRequest>> {
        return this.apiClient.get(`/withdrawals/${id}/status`);
    }

    async transferBetweenWallets(data: WalletTransferForm): Promise<APIResponse<WithdrawalRequest>> {
        return this.apiClient.post("/wallets/transfer", data);
    }
}

// Wallet Service
export class WalletService {
    async getWalletBalances(): Promise<APIResponse<Wallet[]>> {
        return apiClient.get("/wallets");
    }

    async getWalletBalance(type: WalletType): Promise<APIResponse<Wallet>> {
        return apiClient.get(`/wallets/${type}`);
    }
}