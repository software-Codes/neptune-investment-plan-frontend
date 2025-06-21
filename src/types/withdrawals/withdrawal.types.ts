//base api response type for withdrawals
    export interface APIResponse<T = any> extends Response {
    success: boolean;
    data?: T;
    error?: string;
    message: string;
}

//wallets types
export type WalletType = 'account' | 'trading' | 'referral'
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';
//core entity for withdrawals
export interface Wallet {
    wallet_id: string;
    wallet_type: WalletType;
    user_id: string
    balance: number;
    locked_balance: number;
    updated_at: string;
    created_at: string
}
export interface WithdrawalRequest {
    withdrawal_id: string;
    user_id: string;
    wallet_type: WalletType;
    amount: number;
    receiving_address: string;
    status: WithdrawalStatus;
    admin_notes?: string;
    requested_at: string;
    completed_at?: string;

}
// Form Types
export interface WithdrawalForm {
    wallet_type: WalletType;
    amount: number;
    receiving_address: string;
}
 export interface WalletTransferForm {
    from_wallet: 'trading';
    to_wallet: 'account';
    amount: number;
}