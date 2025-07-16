import { NotificationService } from "@/app/(user)/[userId]/withdrawals/services/notifications.service";
import { WalletType } from "@/types/withdrawals/withdrawal.types";
import { useEffect, useState } from "react";

class WalletBalanceMonitor {
  private static instance: WalletBalanceMonitor;
  private observers = new Map<WalletType, Set<(balance: number) => void>>();
  private thresholds = new Map<WalletType, number>();
  
  static getInstance(): WalletBalanceMonitor {
    if (!WalletBalanceMonitor.instance) {
      WalletBalanceMonitor.instance = new WalletBalanceMonitor();
    }
    return WalletBalanceMonitor.instance;
  }
  
  // Subscribe to balance changes
  subscribe(walletType: WalletType, callback: (balance: number) => void): () => void {
    if (!this.observers.has(walletType)) {
      this.observers.set(walletType, new Set());
    }
    
    this.observers.get(walletType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.observers.get(walletType)?.delete(callback);
    };
  }
  
  // Notify observers of balance changes
  notifyBalanceChange(walletType: WalletType, newBalance: number): void {
    const observers = this.observers.get(walletType);
    if (observers) {
      observers.forEach(callback => callback(newBalance));
    }
    
    // Check threshold alerts
    this.checkThresholdAlert(walletType, newBalance);
  }
  
  // Set low balance threshold
  setLowBalanceThreshold(walletType: WalletType, threshold: number): void {
    this.thresholds.set(walletType, threshold);
  }
  
  private checkThresholdAlert(walletType: WalletType, balance: number): void {
    const threshold = this.thresholds.get(walletType);
    if (threshold && balance < threshold) {
      NotificationService.getInstance().warning(
        `Low balance alert: ${walletType} wallet balance ($${balance}) is below threshold ($${threshold})`
      );
    }
  }
}

// Hook for balance monitoring
const useWalletBalanceMonitor = (walletType: WalletType, threshold?: number) => {
  const [isLowBalance, setIsLowBalance] = useState(false);
  
  useEffect(() => {
    const monitor = WalletBalanceMonitor.getInstance();
    
    if (threshold) {
      monitor.setLowBalanceThreshold(walletType, threshold);
    }
    
    const unsubscribe = monitor.subscribe(walletType, (balance) => {
      setIsLowBalance(threshold ? balance < threshold : false);
    });
    
    return unsubscribe;
  }, [walletType, threshold]);
  
  return { isLowBalance };
};