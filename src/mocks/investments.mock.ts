import { Investment } from "@/types/investments/investments.types";


// Mock data
export const mockInvestments: Investment[] = [
    {
        id: 'inv_0001',
        userId: 'user_123',
        principal: 1000,
        startDate: '2025-05-20T09:00:00Z',
        status: 'active' as const,
        earningsToDate: 65.32,
        nextPayoutDate: '2025-06-13T00:00:00Z',
        releaseDate: '2025-06-19T09:00:00Z',
    },
    {
        id: 'inv_0002',
        userId: 'user_123',
        principal: 500,
        startDate: '2025-04-10T15:30:00Z',
        status: 'closed',
        earningsToDate: 118.75,
        nextPayoutDate: '2025-05-10T00:00:00Z',
        releaseDate: '2025-05-10T15:30:00Z',
    },
    {
        id: 'inv_0003',
        userId: 'user_123',
        principal: 2500,
        startDate: '2025-06-01T12:00:00Z',
        status: 'active',
        earningsToDate: 28.94,
        nextPayoutDate: '2025-06-13T00:00:00Z',
        releaseDate: '2025-07-01T12:00:00Z',
    }
];

export const mockBalances = {
    accountWallet: 1250.75,
    tradingWallet: 890.50,
    referralWallet: 45.25
};
