// services/notifications.service.ts
import React from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info, DollarSign, Clock, Ban } from "lucide-react";

export interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  icon?: React.ReactNode;
}

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  private show(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    options: NotificationOptions = {}
  ): void {
    const {
      duration = type === 'error' ? 8000 : 5000,
      action,
      description,
      icon
    } = options;
    const defaultIcons = {
      success: React.createElement(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
      error: React.createElement(XCircle, { className: "h-4 w-4 text-red-500" }),
      warning: React.createElement(AlertTriangle, { className: "h-4 w-4 text-yellow-500" }),
      info: React.createElement(Info, { className: "h-4 w-4 text-blue-500" })
    };

    const toastOptions = {
      duration: duration,
      icon: icon || defaultIcons[type],
      description,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
    }
  }
  
  success(message: string, options?: NotificationOptions): void {
    this.show('success', message, options);
  }
  
  error(message: string, options?: NotificationOptions): void {
    this.show('error', message, options);
  }
  
  warning(message: string, options?: NotificationOptions): void {
    this.show('warning', message, options);
  }
  
  info(message: string, options?: NotificationOptions): void {
    this.show('info', message, options);
  }
  
  // Withdrawal-specific notifications with enhanced UX
  withdrawalRequested(amount: number, estimatedTime: string = "10-20 minutes"): void {
    this.success(
      `Withdrawal for $${amount.toFixed(2)} submitted`,
      {
        description: `Your request is being processed. Estimated time: ${estimatedTime}.`,
        icon: React.createElement(DollarSign, { className: "h-4 w-4 text-green-500" }),
        duration: 6000,
        action: {
          label: "View Status",
          onClick: () => window.location.href = "/withdrawals"
        }
      }
    );
  }
  
  withdrawalCompleted(amount: number, address: string): void {
    const maskedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
    this.success(
      `Withdrawal of $${amount.toFixed(2)} completed`,
      {
        description: `Funds have been sent to ${maskedAddress}.`,
        icon: React.createElement(CheckCircle2, { className: "h-4 w-4 text-green-500" }),
        duration: 8000,
        action: {
          label: "View History",
          onClick: () => window.location.href = "/withdrawals"
        }
      }
    );
  }
  
  withdrawalRejected(amount: number, reason?: string): void {
    this.error(
      `Withdrawal of $${amount.toFixed(2)} rejected`,
      {
        description: reason ? `Reason: ${reason}` : "Your request was rejected. Please contact support.",
        icon: React.createElement(Ban, { className: "h-4 w-4 text-red-500" }),
        duration: 10000,
        action: {
          label: "Contact Support",
          onClick: () => window.location.href = "/support"
        }
      }
    );
  }
  
  withdrawalProcessing(amount: number): void {
    this.info(
      `Processing withdrawal of $${amount.toFixed(2)}`,
      {
        description: "We will notify you once the transaction is complete.",
        icon: React.createElement(Clock, { className: "h-4 w-4 text-blue-500" }),
        duration: 6000
      }
    );
  }
  
  insufficientBalance(required: number, available: number): void {
    this.warning(
      `Insufficient Balance`,
      {
        description: `You need $${required.toFixed(2)} but only have $${available.toFixed(2)} available`,
        duration: 7000,
        action: {
          label: "Transfer Funds",
          onClick: () => window.location.href = "/wallet/transfer"
        }
      }
    );
  }
  
  validationError(errors: string[]): void {
    this.error(
      `Please Fix the Following Issues:`,
      {
        description: errors.join('. '),
        duration: 8000
      }
    );
  }
  
  networkError(): void {
    this.error(
      `Network Connection Error`,
      {
        description: "Please check your internet connection and try again",
        duration: 6000,
        action: {
          label: "Retry",
          onClick: () => window.location.reload()
        }
      }
    );
  }
}