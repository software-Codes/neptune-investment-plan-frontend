import { useQuery } from "@tanstack/react-query";
import { depositsClient } from "@/lib/api/deposits.client";
import { mockDeposits } from "@/mocks/deposits.mock";
import { Deposit } from "@/types/deposits.types";

export function useDeposits(userId: string) {
  return useQuery<Deposit[]>({
    queryKey: ["deposits", userId],
    queryFn: () => depositsClient.list(userId),
    placeholderData: mockDeposits, // offline-first
    retry: false, // avoid infinite loops w/ down backend
  });
}
