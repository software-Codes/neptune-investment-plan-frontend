// lib/api/referralApi.ts

import { 
  ReferralCodePayload,
  ReferralStatPayload,
  ReferralEarningEntry,
  ReferralWithdrawRequest,
  ReferralReinvestRequest,
  ReferralActionResponse,
  ReferralActivity,
  ReferralAnalytics,
  Paginated,
} from "@/types/referrals/referral.types";
import { apiClient } from "./api-client";
import { enhancedMockData } from "@/mocks/referrals/referral-mockdata";



// Transport interface with enhanced methods
interface ReferralTransport {
  getCode(): Promise<ReferralCodePayload>;
  getStats(): Promise<ReferralStatPayload>;
  getEarnings(page?: number, limit?: number): Promise<Paginated<ReferralEarningEntry>>;
  getActivities(page?: number, limit?: number): Promise<Paginated<ReferralActivity>>;
  getAnalytics(): Promise<ReferralAnalytics>;
  withdraw(request: ReferralWithdrawRequest): Promise<ReferralActionResponse>;
  reinvest(request: ReferralReinvestRequest): Promise<ReferralActionResponse>;
  applyInviteCode(code: string): Promise<{ success: boolean; message: string }>;
  validateCode(code: string): Promise<{ valid: boolean; details?: ReferralCodePayload }>;
}

// Enhanced mock transport
const mockTransport: ReferralTransport = {
  async getCode() {
    await delay(300);
    return enhancedMockData.code;
  },

  async getStats() {
    await delay(400);
    return enhancedMockData.stats;
  },

  async getEarnings(page = 1, limit = 10) {
    await delay(500);
    const start = (page - 1) * limit;
    const items = enhancedMockData.earnings.slice(start, start + limit);
    return {
      items,
      currentPage: page,
      nextPage: start + limit < enhancedMockData.earnings.length ? page + 1 : undefined,
      totalPages: Math.ceil(enhancedMockData.earnings.length / limit),
      totalItems: enhancedMockData.earnings.length,
      hasMore: start + limit < enhancedMockData.earnings.length
    };
  },

  async getActivities(page = 1, limit = 10) {
    await delay(400);
    const start = (page - 1) * limit;
    const items = enhancedMockData.activities.slice(start, start + limit);
    return {
      items: items as ReferralActivity[],
      currentPage: page,
      nextPage: start + limit < enhancedMockData.activities.length ? page + 1 : undefined,
      totalPages: Math.ceil(enhancedMockData.activities.length / limit),
      totalItems: enhancedMockData.activities.length,
      hasMore: start + limit < enhancedMockData.activities.length
    };
  },

  async getAnalytics() {
    await delay(600);
    return enhancedMockData.analytics;
  },

  async withdraw(request) {
    await delay(800);
    const amount = parseFloat(request.amount);
    if (amount > enhancedMockData.balance) {
      throw new Error("Insufficient balance");
    }
    enhancedMockData.balance -= amount;
    enhancedMockData.stats.availableBalance = enhancedMockData.balance.toFixed(2);
    enhancedMockData.stats.totalWithdrawn = (parseFloat(enhancedMockData.stats.totalWithdrawn) + amount).toFixed(2);
    
    return {
      success: true,
      message: "Withdrawal request submitted successfully",
      newBalance: enhancedMockData.balance.toFixed(2),
      transaction_id: `txn_${Date.now()}`,
      estimated_processing_time: "20 minutes"
    };
  },

  async reinvest(request) {
    await delay(600);
    const amount = parseFloat(request.amount);
    if (amount > enhancedMockData.balance) {
      throw new Error("Insufficient balance");
    }
    enhancedMockData.balance -= amount;
    enhancedMockData.stats.availableBalance = enhancedMockData.balance.toFixed(2);
    enhancedMockData.stats.totalReinvested = (parseFloat(enhancedMockData.stats.totalReinvested) + amount).toFixed(2);
    
    return {
      success: true,
      message: "Amount reinvested successfully",
      newBalance: enhancedMockData.balance.toFixed(2),
      transaction_id: `reinvest_${Date.now()}`
    };
  },

  async applyInviteCode(code) {
    await delay(500);
    if (code.length < 3) {
      throw new Error("Invalid referral code");
    }
    return {
      success: true,
      message: `Successfully applied referral code: ${code}`
    };
  },

  async validateCode(code) {
    await delay(300);
    return {
      valid: code.length >= 3,
      details: code.length >= 3 ? {
        code,
        created_at: new Date(),
        is_active: true,
        usage_count: Math.floor(Math.random() * 20),
        max_usage: undefined
      } : undefined
    };
  }
};

// REST transport implementation
const restTransport: ReferralTransport = {
  async getCode() {
    const { data } = await apiClient.get("/api/v1/referral/code");
    return {
      code: data.data.code,
      created_at: new Date(data.data.created_at),
      is_active: data.data.is_active,
      usage_count: data.data.usage_count,
      max_usage: data.data.max_usage
    };
  },

  async getStats() {
    const { data } = await apiClient.get("/api/v1/referral/stats");
    return data.data;
  },

  async getEarnings(page = 1, limit = 10) {
    const { data } = await apiClient.get(`/api/v1/referral/earnings?page=${page}&limit=${limit}`);
    return {
      items: data.data.items.map((e: any) => ({
        id: e.id,
        referee_id: e.referee_id,
        referee_name: e.referee_name,
        amount: e.amount,
        date: new Date(e.date),
        status: e.status,
        deposit_amount: e.deposit_amount,
        bonus_percentage: e.bonus_percentage
      })),
      currentPage: data.data.currentPage,
      nextPage: data.data.nextPage,
      totalPages: data.data.totalPages,
      totalItems: data.data.totalItems,
      hasMore: data.data.hasMore
    };
  },

  async getActivities(page = 1, limit = 10) {
    const { data } = await apiClient.get(`/api/v1/referral/activities?page=${page}&limit=${limit}`);
    return {
      items: data.data.items.map((a: any) => ({
        id: a.id,
        type: a.type,
        description: a.description,
        amount: a.amount,
        date: new Date(a.date),
        status: a.status
      })),
      currentPage: data.data.currentPage,
      nextPage: data.data.nextPage,
      totalPages: data.data.totalPages,
      totalItems: data.data.totalItems,
      hasMore: data.data.hasMore
    };
  },

  async getAnalytics() {
    const { data } = await apiClient.get("/api/v1/referral/analytics");
    return data.data;
  },

  async withdraw(request) {
    const { data } = await apiClient.post("/api/v1/referral/withdraw", request);
    return data.data;
  },

  async reinvest(request) {
    const { data } = await apiClient.post("/api/v1/referral/reinvest", request);
    return data.data;
  },

  async applyInviteCode(code) {
    const { data } = await apiClient.post("/api/v1/referral/apply-code", { code });
    return data;
  },

  async validateCode(code) {
    const { data } = await apiClient.get(`/api/v1/referral/validate-code/${code}`);
    return data.data;
  }
};

function buildTransport(): ReferralTransport {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true" ? mockTransport : restTransport;
}

export const referralApi = buildTransport();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}