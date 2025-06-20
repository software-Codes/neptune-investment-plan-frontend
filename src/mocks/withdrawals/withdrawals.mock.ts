import { APIResponse, Wallet, WithdrawalForm, WithdrawalRequest } from "@/types/withdrawals/withdrawal.types";

// Mock Data Factory
 export class MockDataFactory {
  static createWallet(overrides?: Partial<Wallet>): Wallet {
    return {
      wallet_id: crypto.randomUUID(),
      wallet_type: 'account',
      balance: 150.00,
      locked_balance: 0.00,
      updated_at: new Date().toISOString(),
      ...overrides
    };
  }
  
  static createWithdrawal(overrides?: Partial<WithdrawalRequest>): WithdrawalRequest {
    return {
      withdrawal_id: crypto.randomUUID(),
      user_id: crypto.randomUUID(),
      wallet_type: 'account',
      amount: 50.00,
      receiving_address: 'TQn9Y2khEsLMWD2WcPT6QyWVJnVLKXj8sE',
      status: 'pending',
      requested_at: new Date().toISOString(),
      ...overrides
    };
  }
  
  static createWithdrawalHistory(): WithdrawalRequest[] {
    return [
      this.createWithdrawal({ status: 'completed', amount: 100 }),
      this.createWithdrawal({ status: 'pending', amount: 50 }),
      this.createWithdrawal({ status: 'rejected', amount: 25 }),
    ];
  }
}

// Mock API Service
export class MockWithdrawalService {
  private static withdrawals = MockDataFactory.createWithdrawalHistory();
  
  static async createWithdrawal(data: WithdrawalForm): Promise<APIResponse<WithdrawalRequest>> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    const withdrawal = MockDataFactory.createWithdrawal({
      wallet_type: data.wallet_type,
      amount: data.amount,
      receiving_address: data.receiving_address,
    });
    
    this.withdrawals.unshift(withdrawal);
    
    return {
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: withdrawal
    };
  }
  
  static async getWithdrawalHistory(): Promise<APIResponse<WithdrawalRequest[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Withdrawal history retrieved',
      data: this.withdrawals
    };
  }
}

/*
Mock Data Benefits:

Development Speed: No backend dependency during frontend development
Testing: Predictable data for testing scenarios
Realistic Data: Mimics actual API responses
Easy Switching: Simple toggle between mock and real API
*/