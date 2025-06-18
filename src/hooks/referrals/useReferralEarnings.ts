
// ----------------------------------------------------------------------------------------

// ┌───────────────────────────────────────────────────────────────────────────────┐
// │ 5. hooks/users/useReferralEarnings.ts                                        │
// └───────────────────────────────────────────────────────────────────────────────┘
import { referralApi } from "@/lib/api/referralApi";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useReferralEarnings = () => {
  /*
    useInfiniteQuery handles cursor pagination.
    ▸ Each fetch is O(1) server‑side.
    ▸ We supply `initialPageParam` so the TS signature matches the newest TanStack typings.
    ▸ Let React‑Query infer generics – avoids version‑specific overload headaches.
  */
  const query = useInfiniteQuery({
    queryKey: ["referral", "earnings"],
    initialPageParam: 1, // ✅ satisfies the “required” generic overload
    queryFn: ({ pageParam }) => referralApi.getEarnings(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return query;
};