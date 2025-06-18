
// ----------------------------------------------------------------------------------------

// ┌───────────────────────────────────────────────────────────────────────────────┐
// │ 4. hooks/users/useReferralStats.ts                                           │
// └───────────────────────────────────────────────────────────────────────────────┘
import { useQuery } from "@tanstack/react-query";
import { referralApi } from "@/lib/api/referralApi";
import { ReferralStatPayload } from "@/types/referrals/referral.types";

export const useReferralStats = () => {
  return useQuery<ReferralStatPayload, Error>({
    queryKey: ["referral", "stats"],
    queryFn: referralApi.getStats,
    refetchInterval: 60_000, // keep fresh every 60s – cheap O(1) server hit
  });
};