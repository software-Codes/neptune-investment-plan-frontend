// types/referrals/referral.types.ts

/**
 * Enhanced referral system types with better error handling and validation
 */

export interface ReferralCodePayload {
  code: string;
  created_at: Date;
  is_active: boolean;
  usage_count: number;
  max_usage?: number;
}

export interface ReferralStatPayload {
  totalReferred: number;
  totalEarned: string;
  activeReferees: number;
  availableBalance: string;
  totalWithdrawn: string;
  totalReinvested: string;
  conversionRate: number; // percentage of referred users who made deposits
}

export interface ReferralEarningEntry {
  id: string;
  referee_id: string;
  referee_name?: string;
  amount: string;
  date: Date;
  status: "pending" | "paid" | "cancelled";
  deposit_amount?: string;
  bonus_percentage: number;
}

export interface ReferralWithdrawRequest {
  amount: string;
  wallet_address?: string;
  payment_method?: "binance" | "bank" | "internal_transfer";
}

export interface ReferralReinvestRequest {
  amount: string;
  investment_plan?: string;
}

export interface ReferralActionResponse {
  success: boolean;
  message: string;
  newBalance: string;
  transaction_id?: string;
  estimated_processing_time?: string;
}

export interface ReferralInviteData {
  code: string;
  applied_by?: string;
  applied_at?: Date;
}

// Pagination helper with metadata
export interface Paginated<T> {
  items: T[];
  nextPage?: number;
  totalPages?: number;
  totalItems?: number;
  currentPage: number;
  hasMore: boolean;
}

// Error types for better error handling
export interface ReferralError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Activity feed types
export interface ReferralActivity {
  id: string;
  type: "referral_joined" | "bonus_earned" | "withdrawal" | "reinvestment";
  description: string;
  amount?: string;
  date: Date;
  status: "completed" | "pending" | "failed";
}

// Analytics types
export interface ReferralAnalytics {
  monthly_earnings: Array<{
    month: string;
    earnings: string;
    referrals: number;
  }>;
  top_referees: Array<{
    id: string;
    name: string;
    total_deposits: string;
    bonus_earned: string;
  }>;
  performance_metrics: {
    click_through_rate: number;
    conversion_rate: number;
    average_deposit: string;
    retention_rate: number;
  };
}