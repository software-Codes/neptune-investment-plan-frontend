// data/mockWithdrawals.ts
import { WithdrawalRequest, Wallet, WalletType, WithdrawalStatus, APIResponse } from "@/types/withdrawals/withdrawal.types";

// Generate realistic withdrawal data
const generateWithdrawalId = () => `WD${Date.now()}${Math.random().toString(36).substr(2, 5)}`;

const sampleAddresses = [
  "1BvBMsEYstWetqTFn5Au4m4GFg7xJaNVN2",
  "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
  "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "3FupnQyzu61aXz8LfVNCqX2CHUZYSt6S3z",
  "bc1q2vma00hq52ygxej90fn8dccta8p4p4gwjyy7ex",
];

const getRandomAddress = () => sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
const getRandomWalletType = (): WalletType => {
  const types: WalletType[] = ['account', 'trading', 'referral'];
  return types[Math.floor(Math.random() * types.length)];
};

const getRandomStatus = (): WithdrawalStatus => {
  const statuses: WithdrawalStatus[] = ['pending', 'processing', 'completed', 'rejected'];
  const weights = [0.2, 0.15, 0.6, 0.05]; // Most are completed, few rejected
  const random = Math.random();
  let sum = 0;

  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random <= sum) return statuses[i];
  }
  return 'completed';
};

const getRandomAmount = () => {
  const amounts = [25, 50, 100, 250, 500, 1000, 2500, 5000];
  return amounts[Math.floor(Math.random() * amounts.length)] + Math.random() * 99.99;
};

const getRandomDate = (daysBack: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

// Generate mock withdrawals
export const generateMockWithdrawals = (count: number = 50): WithdrawalRequest[] => {
  return Array.from({ length: count }, (_, index) => {
    const status = getRandomStatus();
    const requestedAt = getRandomDate(90); // Within last 90 days
    const completedAt = status === 'completed'
      ? new Date(new Date(requestedAt).getTime() + Math.random() * 86400000 * 3).toISOString() // 0-3 days later
      : undefined;

    return {
      withdrawal_id: generateWithdrawalId(),
      user_id: "user123",
      wallet_type: getRandomWalletType(),
      amount: parseFloat(getRandomAmount().toFixed(2)),
      receiving_address: getRandomAddress(),
      status,
      requested_at: requestedAt,
      completed_at: completedAt,
      admin_notes: status === 'rejected'
        ? "Insufficient verification documents"
        : status === 'processing'
          ? "Under review by compliance team"
          : undefined,
    };
  }).sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
};

// Mock wallet data
export const mockWallets: Wallet[] = [
  {
    wallet_id: "wallet_account_123",
    wallet_type: "account",
    user_id: "user123",
    balance: 15420.75,
    locked_balance: 250.00,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    wallet_id: "wallet_trading_123",
    wallet_type: "trading",
    user_id: "user123",
    balance: 8950.25,
    locked_balance: 1200.50,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: new Date().toISOString(),
  },
  {
    wallet_id: "wallet_referral_123",
    wallet_type: "referral",
    user_id: "user123",
    balance: 2150.30,
    locked_balance: 0.00,
    created_at: "2024-02-01T10:15:00Z",
    updated_at: new Date().toISOString(),
  },
];

// Mock API responses
export const mockWithdrawalHistory: APIResponse<WithdrawalRequest[]> = {
  success: true,
  message: "Withdrawal history retrieved successfully",
  data: generateMockWithdrawals(75),

};

export const mockWalletBalances: APIResponse<Wallet[]> = {
  success: true,
  message: "Wallet balances retrieved successfully",
  data: mockWallets,

};

// Mock service implementation for development
export class MockWithdrawalService {
  private withdrawals = generateMockWithdrawals(100);

  async createWithdrawal(data: any): Promise<APIResponse<WithdrawalRequest>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newWithdrawal: WithdrawalRequest = {
      withdrawal_id: generateWithdrawalId(),
      user_id: "user123",
      ...data,
      status: 'pending' as WithdrawalStatus,
      requested_at: new Date().toISOString(),
    };

    this.withdrawals.unshift(newWithdrawal);

    return {
      success: true,
      message: "Withdrawal request submitted successfully",
      data: newWithdrawal,

    };
  }

  async getWithdrawalHistory(): Promise<APIResponse<WithdrawalRequest[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      ...mockWithdrawalHistory,
      data: this.withdrawals
    };
  }

  async getWithdrawalStatus(id: string): Promise<APIResponse<WithdrawalRequest>> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const withdrawal = this.withdrawals.find(w => w.withdrawal_id === id);

    if (!withdrawal) {
      return {
        success: false,
        message: "Withdrawal not found",
        error: "NOT_FOUND",

      };
    }

    return {
      success: true,
      message: "Withdrawal status retrieved successfully",
      data: withdrawal,

    };
  }
}

// Environment-based service selection
export const getWithdrawalService = () => {
  if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_DATA === 'true') {
    return new MockWithdrawalService();
  }
  return null; // Use real service
};