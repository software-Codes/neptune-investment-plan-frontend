import { WalletTransfer } from "@/types/wallet/wallet.types";
import { Wallet, WalletType } from "@/types/withdrawals/withdrawal.types";
import { useTransferHistory, useWalletBalances } from "./wallet.hooks";
import { useMemo } from "react";

class WalletAnalytics {
  private static instance: WalletAnalytics;
  
  static getInstance(): WalletAnalytics {
    if (!WalletAnalytics.instance) {
      WalletAnalytics.instance = new WalletAnalytics();
    }
    return WalletAnalytics.instance;
  }
  
  // Calculate wallet utilization
  calculateUtilization(wallets: Wallet[]): Map<WalletType, number> {
    const utilization = new Map<WalletType, number>();
    
    wallets.forEach(wallet => {
      const utilizationRate = wallet.balance > 0 
        ? (wallet.balance - wallet.locked_balance) / wallet.balance 
        : 0;
      utilization.set(wallet.wallet_type, utilizationRate);
    });
    
    return utilization;
  }
  
  // Calculate transfer patterns
  analyzeTransferPatterns(transfers: WalletTransfer[]): {
    mostUsedRoute: string;
    averageTransferAmount: number;
    transferFrequency: number;
  } {
    if (transfers.length === 0) {
      return { mostUsedRoute: 'N/A', averageTransferAmount: 0, transferFrequency: 0 };
    }
    
    // Find most used transfer route
    const routes = new Map<string, number>();
    let totalAmount = 0;
    
    transfers.forEach(transfer => {
      const route = `${transfer.from_wallet_type}->${transfer.to_wallet_type}`;
      routes.set(route, (routes.get(route) || 0) + 1);
      totalAmount += transfer.amount;
    });
    
    const mostUsedRoute = Array.from(routes.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    const averageTransferAmount = totalAmount / transfers.length;
    
    // Calculate frequency (transfers per day)
    const dateRange = this.getDateRange(transfers);
    const transferFrequency = dateRange > 0 ? transfers.length / dateRange : 0;
    
    return {
      mostUsedRoute,
      averageTransferAmount: Math.round(averageTransferAmount * 100) / 100,
      transferFrequency: Math.round(transferFrequency * 100) / 100,
    };
  }
  
  private getDateRange(transfers: WalletTransfer[]): number {
    if (transfers.length === 0) return 0;
    
    const dates = transfers.map(t => new Date(t.created_at).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    
    return Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
  }
}

// Hook for wallet analytics
const useWalletAnalytics = () => {
  const { data: wallets } = useWalletBalances();
  const { data: transfers } = useTransferHistory();
  
  const analytics = useMemo(() => {
    const analyticsService = WalletAnalytics.getInstance();
    
    if (!wallets || !transfers) {
      return null;
    }
    
    return {
      utilization: analyticsService.calculateUtilization(wallets),
      transferPatterns: analyticsService.analyzeTransferPatterns(transfers),
      totalBalance: wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
      totalLocked: wallets.reduce((sum, wallet) => sum + wallet.locked_balance, 0),
    };
  }, [wallets, transfers]);
  
  return analytics;
};