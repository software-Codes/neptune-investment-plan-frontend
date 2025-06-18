// ----------------------------------------------------------------------------------------

// ┌───────────────────────────────────────────────────────────────────────────────┐
// │ 3. hooks/users/useReferralCode.ts                                            │
// └───────────────────────────────────────────────────────────────────────────────┘

import { useQuery } from "@tanstack/react-query";
import { referralApi } from "@/lib/api/referralApi";
import { ReferralCodePayload } from "@/types/referrals/referral.types";


export const useReferralCode = () =>{
     /*
    Fetch once and cache for the session.
    Key: stable across user session so components share the same data.
  */

    return useQuery<ReferralCodePayload, Error>({
        queryKey: ["refferal", "code"],
        queryFn: referralApi.getCode,
        staleTime: Infinity
    })
}