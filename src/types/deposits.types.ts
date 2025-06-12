export type DepositStatus = "pending" | "confirmed" | "failed";
export type DepositCurrency = "USDT";
export type DepositNetwork = "TRC20";

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  currency: DepositCurrency;
  txHash: string;
  status: DepositStatus;
  confirmations: number;
  blockHeight: number;
  createdAt: string;
  network: DepositNetwork;
  confirmationTimestamp?: string;
  creditedAmount?: number;
  estimatedCompletion?: string;
  failureReason?: string;
}