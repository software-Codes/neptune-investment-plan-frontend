import { mockData } from "@/mocks/referrals/referral-mockdata";
import { apiClient } from "./api-client";
import {
    ReferralCodePayload,
    ReferralEarningEntry,
    ReferralStatPayload,
    Paginated

} from '@/types/referrals/referral.types'
// ---------------------------------------------
// Transport interface (Dependency‑Inversion)
// ---------------------------------------------

interface ReferralTransport {
    getCode(): Promise<ReferralCodePayload>;
    getStats(): Promise<ReferralStatPayload>;
    getEarnings(page?: number): Promise<Paginated<ReferralEarningEntry>>;
    withdraw(amount: string): Promise<{ success: boolean; newBalance: string }>;
    reinvest(amount: string): Promise<{ success: boolean; newBalance: string }>;
}

// ---------------------------------------------
// Mock transport – in‑memory, no backend needed
// ---------------------------------------------

const mockTransport: ReferralTransport = {
    async getCode() {
        await delay(400);
        return mockData.code;
    },
    async getStats() {
        await delay(400);
        return mockData.stats;
    },
    async getEarnings(page = 1) {
        await delay(400);
        const pageSize = 5;
        const start = (page - 1) * pageSize;
        const slice = mockData.earnings.slice(start, start + pageSize);
        return {
            items: slice,
            nextPage: start + pageSize < mockData.earnings.length ? page + 1 : undefined,
        };
    },
    async withdraw(amount) {
        await delay(500);
        mockData.balance -= parseFloat(amount);
        return { success: true, newBalance: mockData.balance.toFixed(2) };
    },
    async reinvest(amount) {
        await delay(500);
        mockData.balance -= parseFloat(amount);
        return { success: true, newBalance: mockData.balance.toFixed(2) };
    },
};

// ---------------------------------------------
// REST transport – real API calls via Axios
// ---------------------------------------------
const restTransport: ReferralTransport = {
    async getCode() {
        const { data } = await apiClient.get("/api/v1/referral/code");
        return {
            code: data.data.code,
            created_at: new Date(data.data.createdAt),
        };
    },
    async getStats() {
        const { data } = await apiClient.get("/api/v1/referral/earnings");
        return {
            totalReferred: data.data.totalReferred,
            totalEarned: data.data.totalEarned,
            activeReferees: data.data.activeReferees,
        };
    },
    async getEarnings(page = 1) {
        const { data } = await apiClient.get(`/api/v1/referral/earnings?page=${page}`);
        return {
            items: data.data.items.map((e: any) => ({
                id: e.id,
                referee_id: e.refereeId,
                amount: e.amount,
                date: new Date(e.date),
                status: e.status,
            })),
            nextPage: data.data.nextPage,
        };
    },
    async withdraw(amount) {
        const { data } = await apiClient.post("/api/v1/referral/withdraw", { amount });
        return { success: data.success, newBalance: data.data.newBalance };
    },
    async reinvest(amount) {
        const { data } = await apiClient.post("/api/v1/referral/reinvest", { amount });
        return { success: data.success, newBalance: data.data.newBalance };
    },
}
// ---------------------------------------------
// Factory – chooses transport based on env var
// ---------------------------------------------
function buildTransport(): ReferralTransport {
    return process.env.NEXT_PUBLIC_USE_MOCKS === "true" ? mockTransport : restTransport;
}

export const referralApi = buildTransport();

// Small util – move to utils if reused
function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}