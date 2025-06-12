import {Investment} from "@/types/investments/investments.types";


export const mockInvestments: Investment[] = [
    {
        id: 'inv_0001',
        userId: 'user_123',
        principal: 1000,
        startDate: '2025-05-20T09:00:00Z',
        status: 'active',
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
    }
]