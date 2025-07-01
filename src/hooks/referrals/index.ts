    // hooks/referrals/index.ts

    import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
    import { referralApi } from "@/lib/api/referralApi";
    import { 
    ReferralCodePayload, 
    ReferralStatPayload, 
    ReferralWithdrawRequest,
    ReferralReinvestRequest,
    ReferralAnalytics
    } from "@/types/referrals/referral.types";
    import { toast } from "sonner";

    // Hook for referral code with better error handling
    export const useReferralCode = () => {
    return useQuery<ReferralCodePayload, Error>({
        queryKey: ["referral", "code"],
        queryFn: referralApi.getCode,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
    };

    // Hook for referral stats with auto-refresh
    export const useReferralStats = () => {
    return useQuery<ReferralStatPayload, Error>({
        queryKey: ["referral", "stats"],
        queryFn: referralApi.getStats,
        refetchInterval: 2 * 60 * 1000, // 2 minutes
        staleTime: 60 * 1000, // 1 minute
        retry: 2,
    });
    };

    // Hook for paginated earnings with infinite scroll
    export const useReferralEarnings = (limit = 10) => {
    return useInfiniteQuery({
        queryKey: ["referral", "earnings", limit],
        initialPageParam: 1,
        queryFn: ({ pageParam }) => referralApi.getEarnings(pageParam, limit),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 2 * 60 * 1000,
    });
    };

    // Hook for activity feed
    export const useReferralActivities = (limit = 10) => {
    return useInfiniteQuery({
        queryKey: ["referral", "activities", limit],
        initialPageParam: 1,
        queryFn: ({ pageParam }) => referralApi.getActivities(pageParam, limit),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 60 * 1000,
    });
    };

    // Hook for analytics data
    export const useReferralAnalytics = () => {
    return useQuery<ReferralAnalytics, Error>({
        queryKey: ["referral", "analytics"],
        queryFn: referralApi.getAnalytics,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });
    };

    // Enhanced referral actions with better error handling and user feedback
    export const useReferralActions = () => {
    const queryClient = useQueryClient();

    const withdraw = useMutation({
        mutationFn: (request: ReferralWithdrawRequest) => referralApi.withdraw(request),
        onSuccess: (data) => {
        toast.success("Withdrawal Submitted", {
            description: `${data.message}. Processing time: ${data.estimated_processing_time || "20 minutes"}`
        });
        
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ queryKey: ["referral", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["referral", "activities"] });
        },
        onError: (error: Error) => {
        toast.error("Withdrawal Failed", {
            description: error.message || "Unable to process withdrawal request"
        });
        },
    });

    const reinvest = useMutation({
        mutationFn: (request: ReferralReinvestRequest) => referralApi.reinvest(request),
        onSuccess: (data) => {
        toast.success("Reinvestment Successful", {
            description: data.message
        });
        
        queryClient.invalidateQueries({ queryKey: ["referral", "stats"] });
        queryClient.invalidateQueries({ queryKey: ["referral", "activities"] });
        // Also invalidate investment-related queries if they exist
        queryClient.invalidateQueries({ queryKey: ["investments"] });
        },
        onError: (error: Error) => {
        toast.error("Reinvestment Failed", {
            description: error.message || "Unable to process reinvestment"
        });
        },
    });

    const applyInviteCode = useMutation({
        mutationFn: (code: string) => referralApi.applyInviteCode(code),
        onSuccess: (data) => {
        toast.success("Referral Code Applied", {
            description: data.message
        });
        
        // Refresh user data to show the applied referral
        queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error: Error) => {
        toast.error("Invalid Code", {
            description: error.message || "Please check the referral code and try again"
        });
        },
    });

    const validateCode = useMutation({
        mutationFn: (code: string) => referralApi.validateCode(code),
        onError: (error: Error) => {
        console.error("Code validation failed:", error);
        },
    });

    return {
        withdraw,
        reinvest,
        applyInviteCode,
        validateCode,
    };
    };

    // Utility hook for sharing referral code
    export const useReferralSharing = () => {
    const { data: codeData } = useReferralCode();

    const shareCode = async (method: "copy" | "whatsapp" | "telegram" | "email" = "copy") => {
        if (!codeData?.code) {
        toast.error("Referral code not available");
        return;
        }

        const shareText = `Join me on this amazing investment platform! Use my referral code: ${codeData.code}`;
        const shareUrl = `${window.location.origin}/register?ref=${codeData.code}`;

        switch (method) {
        case "copy":
            try {
            await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast.success("Referral details copied to clipboard!");
            } catch {
            toast.error("Failed to copy to clipboard");
            }
            break;

        case "whatsapp":
            window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`);
            break;

        case "telegram":
            window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
            break;

        case "email":
            window.open(`mailto:?subject=Join me on this investment platform&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`);
            break;
        }
    };

    const copyCode = async () => {
        if (!codeData?.code) return;
        
        try {
        await navigator.clipboard.writeText(codeData.code);
        toast.success("Referral code copied!");
        } catch {
        toast.error("Failed to copy code");
        }
    };

    return { shareCode, copyCode, referralCode: codeData?.code };
    };