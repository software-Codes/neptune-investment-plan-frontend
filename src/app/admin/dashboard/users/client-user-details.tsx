// app/admin/dashboard/users/[userId]/client-user-details.tsx
"use client";

import { UserDetails } from "@/components/admin/user-details-component";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUser } from "@/hooks/admin/use-admin-users";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminUser } from "@/app/admin/api/users-admin-api-client";

interface ClientUserDetailsProps {
  userId: string;
}


  // Transform camelCase data to snake_case AdminUser format
 export  const transformToAdminUser = (userData: any): AdminUser => {
    return {
      user_id: userData.userId,
      full_name: userData.fullName,
      email: userData.email,
      created_at: userData.createdAt,
      account_status: userData.accountStatus,
      account_balance: userData.accountBalance,
      trading_balance: userData.tradingBalance,
      referral_balance: userData.referralBalance,
    };
  };
export function ClientUserDetails({ userId }: ClientUserDetailsProps) {
  const router = useRouter();
  const { data, isLoading, error } = useAdminUser(userId);

  useEffect(() => {
    if (error) {
      console.error("Error loading user:", error);
      toast.error("Failed to load user details");
    }
  }, [error]);

  // Additional client-side validation
  useEffect(() => {
    if (!userId || userId === "undefined") {
      toast.error("Invalid user ID");
      router.push("/admin/dashboard/users");
    }
  }, [userId, router]);



  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-4">
        <h3 className="text-lg font-semibold text-destructive">
          Failed to Load User
        </h3>
        <p className="text-muted-foreground">
          Unable to fetch user data. This might be due to:
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>Invalid user ID</li>
          <li>User not found</li>
          <li>Network connection issues</li>
          <li>Server error</li>
        </ul>
        <div className="space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/admin/dashboard/users")}
            className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-muted/90"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 space-y-4">
        <h3 className="text-lg font-semibold text-destructive">
          User Not Found
        </h3>
        <p className="text-muted-foreground">
          The user with ID "{userId}" was not found.
        </p>
        <button
          onClick={() => router.push("/admin/dashboard/users")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Back to Users
        </button>
      </div>
    );
  }

  // Transform the data before passing to UserDetails
  const adminUser = transformToAdminUser(data);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          ← Back to Users
        </button>
        <div className="text-sm text-muted-foreground">User ID: {userId}</div>
      </div>
      <UserDetails user={adminUser} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Account info skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Wallet balances skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}
