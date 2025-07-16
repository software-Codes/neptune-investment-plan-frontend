//using Map  for 0(1) lookup by withdrawal id

import { WithdrawalRequest } from "@/types/withdrawals/withdrawal.types";
import { useMemo } from "react";

export const useWithdrawalMap = (withdrawals: WithdrawalRequest[]) => {
    return useMemo(() => {
        const map = new Map<string, WithdrawalRequest>();
        withdrawals.forEach(withdrawal => {
            map.set(withdrawal.withdrawal_id, withdrawal)
        });
        return map
    }, [withdrawals])
};

// Binary Search for sorted withdrawal history
export const useSortedWithdrawals = (withdrawals: WithdrawalRequest[]) => {
    return useMemo(() => {
        return [...withdrawals].sort((a, b) =>
            new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
        );
    }, [withdrawals]);
};

/*
Why These Data Structures:

Map: O(1) lookup for finding specific withdrawals
Sorted Array: Efficient for displaying chronological order
Memoization: Prevents unnecessary recalculations
*/