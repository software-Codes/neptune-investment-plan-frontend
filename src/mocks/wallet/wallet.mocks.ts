import { TransferValidation, WalletDetails, WalletServiceInterface, WalletTransfer } from "@/types/wallet/wallet.types";
import { APIResponse,  Wallet,  WalletTransferForm, WalletType } from "@/types/withdrawals/withdrawal.types";

class MockWalletDataFactory {
  static createWalletSet(userId: string): Wallet[] {
    return [
      {
        wallet_id: crypto.randomUUID(),
        wallet_type: 'account',
        user_id: userId,
        balance: 245.50,
        locked_balance: 0.00,
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date().toISOString(),
      },
      {
        wallet_id: crypto.randomUUID(),
        user_id: userId,
        wallet_type: 'trading',
        balance: 1250.75,
        locked_balance: 50.00,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        wallet_id: crypto.randomUUID(),
        user_id: userId,
        wallet_type: 'referral',
        balance: 85.25,
        locked_balance: 0.00,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
  
  static createWalletTransfer(overrides?: Partial<WalletTransfer>): WalletTransfer {
    return {
      transfer_id: crypto.randomUUID(),
      user_id: crypto.randomUUID(),
      from_wallet_type: 'trading',
      to_wallet_type: 'account',
      amount: 100.00,
      status: 'completed',
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      completed_at: new Date(Date.now() - 3540000).toISOString(), // 59 minutes ago
      ...overrides
    };
  }
  
  static createTransferHistory(): WalletTransfer[] {
    return [
      this.createWalletTransfer({ 
        amount: 200, 
        created_at: new Date(Date.now() - 86400000).toISOString() 
      }),
      this.createWalletTransfer({ 
        amount: 50, 
        from_wallet_type: 'account', 
        to_wallet_type: 'trading',
        created_at: new Date(Date.now() - 7200000).toISOString() 
      }),
      this.createWalletTransfer({ 
        amount: 25, 
        from_wallet_type: 'referral', 
        to_wallet_type: 'account',
        created_at: new Date(Date.now() - 3600000).toISOString() 
      }),
    ];
  }
}

// Mock WalletService Implementation
class MockWalletService implements WalletServiceInterface {
  private static wallets = MockWalletDataFactory.createWalletSet(crypto.randomUUID());
  private static transfers = MockWalletDataFactory.createTransferHistory();
  
  async getWalletBalances(): Promise<APIResponse<Wallet[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      message: 'Wallet balances retrieved successfully',
      data: MockWalletService.wallets
    };
  }
  
  async getWalletBalance(type: WalletType): Promise<APIResponse<Wallet>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const wallet = MockWalletService.wallets.find(w => w.wallet_type === type);
    
    if (!wallet) {
      return {
        success: false,
        message: `${type} wallet not found`,
      };
    }
    
    return {
      success: true,
      message: `${type} wallet balance retrieved`,
      data: wallet
    };
  }
  
  async refreshWalletBalance(type: WalletType): Promise<APIResponse<Wallet>> {
    // Simulate balance refresh with slight changes
    const wallet = MockWalletService.wallets.find(w => w.wallet_type === type);
    if (wallet) {
      wallet.balance += (Math.random() - 0.5) * 10; // Random change ±5
      wallet.updated_at = new Date().toISOString();
    }
    
    return this.getWalletBalance(type);
  }
  
  async transferBetweenWallets(data: WalletTransferForm): Promise<APIResponse<WalletTransfer>> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate transfer logic
    const fromWallet = MockWalletService.wallets.find(w => w.wallet_type === data.from_wallet);
    const toWallet = MockWalletService.wallets.find(w => w.wallet_type === data.to_wallet);
    
    if (!fromWallet || !toWallet) {
      return {
        success: false,
        message: 'One or both wallets not found',
      };
    }
    
    if (fromWallet.balance < data.amount) {
      return {
        success: false,
        message: 'Insufficient balance in source wallet',
      };
    }
    
    // Update balances
    fromWallet.balance -= data.amount;
    toWallet.balance += data.amount;
    
    const transfer = MockWalletDataFactory.createWalletTransfer({
      from_wallet_type: data.from_wallet,
      to_wallet_type: data.to_wallet,
      amount: data.amount,
    });
    
    MockWalletService.transfers.unshift(transfer);
    
    return {
      success: true,
      message: 'Transfer completed successfully',
      data: transfer
    };
  }
  
  async getTransferHistory(): Promise<APIResponse<WalletTransfer[]>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return {
      success: true,
      message: 'Transfer history retrieved',
      data: MockWalletService.transfers
    };
  }
  
  async validateTransfer(data: WalletTransferForm): Promise<APIResponse<TransferValidation>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const fromWallet = MockWalletService.wallets.find(w => w.wallet_type === data.from_wallet);
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!fromWallet) {
      errors.push('Source wallet not found');
    } else if (fromWallet.balance < data.amount) {
      errors.push('Insufficient balance');
    } else if (data.amount < 1) {
      errors.push('Minimum transfer amount is $1');
    }
    
    if (data.amount > 1000) {
      warnings.push('Large transfer amount - please verify');
    }
    
    return {
      success: true,
      message: 'Transfer validation completed',
      data: {
        valid: errors.length === 0,
        errors,
        warnings,
        available_balance: fromWallet?.balance || 0,
        transfer_fee: 0, // No fees for internal transfers
        net_amount: data.amount,
      }
    };
  }
  
  async getWalletDetails(walletId: string): Promise<APIResponse<WalletDetails>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const wallet = MockWalletService.wallets.find(w => w.wallet_id === walletId);
    
    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
      };
    }
    
    const details: WalletDetails = {
      ...wallet,
      transaction_count: Math.floor(Math.random() * 50) + 10,
      last_transaction_date: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      monthly_volume: Math.floor(Math.random() * 5000) + 1000,
      locked_reasons: wallet.locked_balance > 0 ? ['Pending withdrawal'] : [],
    };
    
    return {
      success: true,
      message: 'Wallet details retrieved',
      data: details
    };
  }
  
  async lockWalletBalance(walletType: WalletType, amount: number): Promise<APIResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const wallet = MockWalletService.wallets.find(w => w.wallet_type === walletType);
    
    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
      };
    }
    
    if (wallet.balance < amount) {
      return {
        success: false,
        message: 'Insufficient balance to lock',
      };
    }
    
    wallet.locked_balance += amount;
    wallet.updated_at = new Date().toISOString();
    
    return {
      success: true,
      message: `Successfully locked $${amount} in ${walletType} wallet`,
    };
  }
  
  async unlockWalletBalance(walletType: WalletType, amount: number): Promise<APIResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const wallet = MockWalletService.wallets.find(w => w.wallet_type === walletType);
    
    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
      };
    }
    
    if (wallet.locked_balance < amount) {
      return {
        success: false,
        message: 'Insufficient locked balance to unlock',
      };
    }
    
    wallet.locked_balance -= amount;
    wallet.updated_at = new Date().toISOString();
    
    return {
      success: true,
      message: `Successfully unlocked $${amount} in ${walletType} wallet`,
    };
  }
}