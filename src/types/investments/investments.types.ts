export type InvestmentStatus = 'active' | 'closed' | 'cancelled';

export interface Investment{
    id:string;
    userId:string;
    principal: number;
    startDate: string
    status : InvestmentStatus;
    earningsToDate: number;
    nextPayoutDate: string;       // daily compound runs midnight UTC on BE
    releaseDate: string;          // principal unlock (startDate + 30d)
}