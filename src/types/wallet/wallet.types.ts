import { APIResponse, Wallet, WalletType } from "../withdrawals/withdrawal.types";

export interface WalletServiceInterface
{
      // Balance Operations
  getWalletBalances(): Promise<APIResponse<Wallet[]>>;
  getWalletBalance(type: WalletType): Promise<APIResponse<Wallet>>;
  refreshWalletBalance(type: WalletType): Promise<APIResponse<Wallet>>;
  
  // Transfer Operations
  transferBetweenWallets(data: WalletTransferForm): Promise<APIResponse<WalletTransfer>>;
  getTransferHistory(): Promise<APIResponse<WalletTransfer[]>>;
  validateTransfer(data: WalletTransferForm): Promise<APIResponse<TransferValidation>>;
  
  // Wallet Management
  getWalletDetails(walletId: string): Promise<APIResponse<WalletDetails>>;
  lockWalletBalance(walletType: WalletType, amount: number): Promise<APIResponse>;
  unlockWalletBalance(walletType: WalletType, amount: number): Promise<APIResponse>;
}

export interface WalletTransfer {
  transfer_id: string;
  user_id: string;
  from_wallet_type: WalletType;
  to_wallet_type: WalletType;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  failure_reason?: string;
}

export interface WalletTransferForm {
  from_wallet: WalletType;
  to_wallet: WalletType;
  amount: number;
  description?: string;
}

 export interface TransferValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  available_balance: number;
  transfer_fee: number;
  net_amount: number;
}

export   interface WalletDetails extends Wallet {
  transaction_count: number;
  last_transaction_date?: string;
  monthly_volume: number;
  locked_reasons: string[];
}

export interface WalletSummary {
  total_balance: number;
  available_balance: number;
  locked_balance: number;
  wallet_count: number;
  last_updated: string;
}