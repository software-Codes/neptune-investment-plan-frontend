  // hooks/withdrawal.hooks.ts
  import { useState, useCallback, useMemo, useEffect } from "react";
  import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
  import { WalletService } from "@/app/(user)/[userId]/wallet/services/wallet.service";
  import { WithdrawalService } from "@/app/(user)/[userId]/withdrawals/services/withdrawals.services";
  import { NotificationService } from "@/app/(user)/[userId]/withdrawals/services/notifications.service";
  import {
    walletKeys,
    withdrawalKeys,
  } from "@/app/(user)/[userId]/withdrawals/services/query-keys";
  import {
    WithdrawalForm,
    WithdrawalRequest,
    WalletType,
    WithdrawalStatus,
    APIResponse,
    Wallet,
  } from "@/types/withdrawals/withdrawal.types";
  import { generateMockWithdrawals, mockWallets } from "@/mocks/withdrawals/withdrawals.mock";


  // Enhanced withdrawal creation with optimistic updates and better error handling
  export const useCreateWithdrawal = () => {
    const queryClient = useQueryClient();
    const notificationService = NotificationService.getInstance();
    const [isCreating, setIsCreating] = useState(false);

    return useMutation({
      mutationFn: async (data: WithdrawalForm): Promise<APIResponse<WithdrawalRequest>> => {
        setIsCreating(true);

        // Simulate API call with mock data for development
        return new Promise((resolve) => {
          setTimeout(() => {
            const newWithdrawal: WithdrawalRequest = {
              withdrawal_id: `w${Date.now()}`,
              user_id: "current-user",
              amount: data.amount,
              wallet_type: data.wallet_type,
              receiving_address: data.receiving_address,
              status: "pending" as WithdrawalStatus,
              requested_at: new Date().toISOString(),
            };

            resolve({
              success: true,
              data: newWithdrawal,
              message: "Withdrawal created successfully"
            });
          }, 1000);
        });
      },
      onMutate: async (newWithdrawal) => {
        setIsCreating(true);

        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: withdrawalKeys.history() });

        // Snapshot previous value
        const previousWithdrawals = queryClient.getQueryData(withdrawalKeys.history());

        // Create optimistic withdrawal
        const optimisticWithdrawal: WithdrawalRequest = {
          withdrawal_id: `temp-${Date.now()}`,
          user_id: "current-user",
          amount: newWithdrawal.amount,
          wallet_type: newWithdrawal.wallet_type,
          receiving_address: newWithdrawal.receiving_address,
          status: "pending" as WithdrawalStatus,
          requested_at: new Date().toISOString(),
        };

        // Optimistically update cache
        queryClient.setQueryData(withdrawalKeys.history(), (old: APIResponse<WithdrawalRequest[]> | undefined) => {
          if (!old) {
            return {
              success: true,
              data: [optimisticWithdrawal],
              message: "Success"
            };
          }

          return {
            ...old,
            data: [optimisticWithdrawal, ...(old.data || [])]
          };
        });

        return { previousWithdrawals };
      },
      onSuccess: (data) => {
        setIsCreating(false);
        if (data?.data) {
          notificationService.withdrawalRequested(data.data.amount);

          // Invalidate and refetch related queries
          queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
          queryClient.invalidateQueries({ queryKey: walletKeys.all });
        }
      },
      onError: (error: any, variables, context) => {
        setIsCreating(false);

        // Revert optimistic update
        if (context?.previousWithdrawals) {
          queryClient.setQueryData(withdrawalKeys.history(), context.previousWithdrawals);
        }

        const errorMessage = error?.message || "Failed to create withdrawal";
        notificationService.error(`Withdrawal failed: ${errorMessage}`);
      },
      onSettled: () => {
        setIsCreating(false);
      }
    });
  };

  // Enhanced withdrawal history with pagination and filtering
  export const useWithdrawalHistory = (options?: {
    limit?: number;
    status?: WithdrawalStatus | "all";
    enabled?: boolean;
  }) => {
    const { limit = 50, status, enabled = true } = options || {};

    return useQuery({
      queryKey: withdrawalKeys.history(),
      queryFn: async (): Promise<APIResponse<WithdrawalRequest[]>> => {
        // Use mock data for development
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              data: generateMockWithdrawals(),
              message: "Withdrawal history retrieved successfully"
            });
          }, 500);
        });
      },
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
      refetchOnWindowFocus: true,
      enabled,
      select: (data: APIResponse<WithdrawalRequest[]>) => {
        if (!data?.data) return data;

        let filteredData = data.data;

        // Filter by status if specified
        if (status && status !== 'all') {
          filteredData = data.data.filter(w => w.status === status);
        }

        // Apply limit
        const limitedData = filteredData.slice(0, limit);

        return {
          ...data,
          data: limitedData
        };
      }
    });
  };

  // Infinite query for large withdrawal histories
  export const useInfiniteWithdrawalHistory = () => {
    return useInfiniteQuery({
      queryKey: [...withdrawalKeys.history(), 'infinite'],
      queryFn: async ({ pageParam = 0 }) => {
        // Mock paginated data
        const pageSize = 20;
        const start = pageParam * pageSize;
        const end = start + pageSize;

        return new Promise<APIResponse<WithdrawalRequest[]>>((resolve) => {
          setTimeout(() => {
            const paginatedData = generateMockWithdrawals(2000).slice(start, end);
            resolve({
              success: true,
              data: paginatedData,
              message: "Page retrieved successfully"
            });
          }, 500);
        });
      },
      getNextPageParam: (lastPage, pages) => {
        if (!lastPage?.data || lastPage.data.length < 20) return undefined;
        return pages.length;
      },
      initialPageParam: 0,
      staleTime: 60000,
    });
  };

  // Get specific withdrawal details with auto-refresh for active statuses
  export const useWithdrawalDetails = (withdrawalId: string) => {
    return useQuery({
      queryKey: withdrawalKeys.status(withdrawalId),
      queryFn: async (): Promise<APIResponse<WithdrawalRequest>> => {
        // Find mock withdrawal by ID
        const withdrawal = generateMockWithdrawals(300).find(w => w.withdrawal_id === withdrawalId);

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (withdrawal) {
              resolve({
                success: true,
                data: withdrawal,
                message: "Withdrawal details retrieved successfully"
              });
            } else {
              reject(new Error("Withdrawal not found"));
            }
          }, 300);
        });
      },
      enabled: !!withdrawalId,
      staleTime: 10000, // 10 seconds for active status
    refetchInterval: (query) => {
      const data = query.state.data as APIResponse<WithdrawalRequest> | undefined;
      // Auto-refresh if withdrawal is pending or processing
      return (data?.data?.status === 'pending' || data?.data?.status === 'processing') ? 30000 : false;
    }
  });
  };

  // Enhanced wallet balances with real-time updates
  export const useWalletBalances = () => {
    return useQuery({
      queryKey: walletKeys.balances(),
      queryFn: async (): Promise<APIResponse<Wallet[]>> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              success: true,
              data: mockWallets,
              message: "Wallet balances retrieved successfully"
            });
          }, 300);
        });
      },
      staleTime: 30000,
      refetchOnWindowFocus: true,
      refetchInterval: 60000, // Refresh every minute
    });
  };

  // Get specific wallet balance
  export const useWalletBalance = (walletType: WalletType) => {
    return useQuery({
      queryKey: walletKeys.balance(walletType),
      queryFn: async (): Promise<APIResponse<Wallet>> => {
        const wallet = mockWallets.find(w => w.wallet_type === walletType);

        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (wallet) {
              resolve({
                success: true,
                data: wallet,
                message: "Wallet balance retrieved successfully"
              });
            } else {
              reject(new Error("Wallet not found"));
            }
          }, 300);
        });
      },
      staleTime: 30000,
      enabled: !!walletType,
    });
  };

  // Enhanced withdrawal summary with memoization
  export const useWithdrawalSummary = (withdrawals: WithdrawalRequest[]) => {
    return useMemo(() => {
      if (!withdrawals || withdrawals.length === 0) {
        return {
          total: 0,
          count: 0,
          thisMonth: 0,
          byStatus: {} as Record<WithdrawalStatus, number>,
          byWallet: {} as Record<WalletType, number>,
          averageAmount: 0,
          completionRate: 0
        };
      }

      const summary = withdrawals.reduce(
        (acc, withdrawal) => {
          acc.total += withdrawal.amount;
          acc.count++;
          acc.byStatus[withdrawal.status] = (acc.byStatus[withdrawal.status] || 0) + 1;
          acc.byWallet[withdrawal.wallet_type] = (acc.byWallet[withdrawal.wallet_type] || 0) + 1;

          // Calculate this month's withdrawals
          const withdrawalDate = new Date(withdrawal.requested_at);
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();

          if (withdrawalDate.getMonth() === currentMonth &&
            withdrawalDate.getFullYear() === currentYear) {
            acc.thisMonth += withdrawal.amount;
          }

          return acc;
        },
        {
          total: 0,
          count: 0,
          thisMonth: 0,
          byStatus: {} as Record<WithdrawalStatus, number>,
          byWallet: {} as Record<WalletType, number>
        }
      );

      return {
        ...summary,
        averageAmount: summary.count > 0 ? summary.total / summary.count : 0,
        completionRate: summary.count > 0
          ? ((summary.byStatus.completed || 0) / summary.count) * 100
          : 0
      };
    }, [withdrawals]);
  };

  // Optimized query invalidation helpers
  export const useOptimizedQueries = () => {
    const queryClient = useQueryClient();

    const invalidateWithdrawals = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
    }, [queryClient]);

    const invalidateWallets = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    }, [queryClient]);

    const prefetchWithdrawal = useCallback((withdrawalId: string) => {
      const MOCK_WITHDRAWALS = generateMockWithdrawals(500); // or any count you prefer

      queryClient.prefetchQuery({
        queryKey: withdrawalKeys.status(withdrawalId),
        queryFn: async () => {
          const withdrawal = MOCK_WITHDRAWALS.find(w => w.withdrawal_id === withdrawalId);
          if (!withdrawal) throw new Error("Withdrawal not found");

          return {
            success: true,
            data: withdrawal,
            message: "Success"
          };
        },
        staleTime: 10000,
      });
    }, [queryClient]);

    const refreshAllData = useCallback(() => {
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    }, [queryClient]);

    return {
      invalidateWithdrawals,
      invalidateWallets,
      prefetchWithdrawal,
      refreshAllData
    };
  };

  // Real-time withdrawal status updates with better state management
  export const useWithdrawalStatusSubscription = (withdrawalId: string) => {
    const MOCK_WITHDRAWALS = generateMockWithdrawals(300); // or any count you prefer

    const queryClient = useQueryClient();

    const queryResult = useQuery({
      queryKey: [...withdrawalKeys.status(withdrawalId), 'subscription'],
      queryFn: async (): Promise<APIResponse<WithdrawalRequest>> => {
        const withdrawal = MOCK_WITHDRAWALS.find(w => w.withdrawal_id === withdrawalId);

        if (!withdrawal) {
          throw new Error("Withdrawal not found");
        }

        return {
          success: true,
          data: withdrawal,
          message: "Status retrieved successfully"
        };
      },
      enabled: !!withdrawalId,
      refetchInterval: (query) => {
        const data = (query.state.data as APIResponse<WithdrawalRequest> | undefined)?.data;
        const status = data?.status;
        // More frequent updates for active statuses
        if (status === 'pending') return 15000; // 15 seconds
        if (status === 'processing') return 30000; // 30 seconds
        return false; // No polling for completed/rejected
      }
    });

    // Side effect for updating the main history cache when status changes
    useEffect(() => {
      if (queryResult.data?.data) {
        queryClient.setQueryData(withdrawalKeys.history(), (old: APIResponse<WithdrawalRequest[]> | undefined) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: old.data.map((w: WithdrawalRequest) =>
              w.withdrawal_id === withdrawalId ? { ...w, ...queryResult.data!.data } : w
            )
          };
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryResult.data?.data, withdrawalId, queryClient]);

    return queryResult;
  };

  // Batch operations for multiple withdrawals
  export const useBatchWithdrawalOperations = () => {
    const queryClient = useQueryClient();
    const notificationService = NotificationService.getInstance();

    const cancelMultipleWithdrawals = useMutation({
      mutationFn: async (withdrawalIds: string[]) => {
        // Mock batch cancellation
        const results = await Promise.allSettled(
          withdrawalIds.map(async (id) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return { id, success: true };
          })
        );
        return results;
      },
      onSuccess: (results) => {
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        notificationService.success(`Successfully cancelled ${successCount} withdrawals`);
        queryClient.invalidateQueries({ queryKey: withdrawalKeys.all });
      },
      onError: (error: any) => {
        notificationService.error(`Failed to cancel withdrawals: ${error.message}`);
      }
    });

    return { cancelMultipleWithdrawals };
  };

  // Hook for withdrawal statistics
  export const useWithdrawalStats = () => {
    const { data: withdrawals } = useWithdrawalHistory();

    return useMemo(() => {
      if (!withdrawals?.data) {
        return {
          totalWithdrawals: 0,
          totalAmount: 0,
          pendingCount: 0,
          completedCount: 0,
          rejectedCount: 0,
          averageAmount: 0,
          thisMonthTotal: 0
        };
      }

      const stats = withdrawals.data.reduce((acc, withdrawal) => {
        acc.totalWithdrawals++;
        acc.totalAmount += withdrawal.amount;

        switch (withdrawal.status) {
          case 'pending':
            acc.pendingCount++;
            break;
          case 'completed':
            acc.completedCount++;
            break;
          case 'rejected':
            acc.rejectedCount++;
            break;
        }

        // This month calculation
        const withdrawalDate = new Date(withdrawal.requested_at);
        const now = new Date();
        if (withdrawalDate.getMonth() === now.getMonth() &&
          withdrawalDate.getFullYear() === now.getFullYear()) {
          acc.thisMonthTotal += withdrawal.amount;
        }

        return acc;
      }, {
        totalWithdrawals: 0,
        totalAmount: 0,
        pendingCount: 0,
        completedCount: 0,
        rejectedCount: 0,
        thisMonthTotal: 0
      });

      return {
        ...stats,
        averageAmount: stats.totalWithdrawals > 0 ? stats.totalAmount / stats.totalWithdrawals : 0
      };
    }, [withdrawals?.data]);
  };