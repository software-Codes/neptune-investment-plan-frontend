import { useMutation, useQueryClient } from "@tanstack/react-query";
import { referralApi } from "@/lib/api/referralApi";

export const useReferralActions = () => {
    const qc = useQueryClient();
    const withdraw = useMutation({
        mutationFn: (amount: string) => referralApi.withdraw(amount),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['referral', 'stats'] });
            qc.invalidateQueries({ queryKey: ['referral', 'earnings'] })
        },
    });

    const reinvest = useMutation({
        mutationFn: (amount: string) => referralApi.reinvest(amount),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["referral", "stats"] });
            qc.invalidateQueries({ queryKey: ["referral", "earnings"] });

        }
    });
    return {withdraw, reinvest}
}