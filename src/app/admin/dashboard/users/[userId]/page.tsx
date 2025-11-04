// app/admin/dashboard/users/[userId]/page.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientUserDetails } from "../client-user-details";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserDetailsPage({ params }: PageProps) {
  // Await the params before using them
  const resolvedParams = await params;
  
  // Debug logging
  console.log('UserDetailsPage received params:', resolvedParams);
  
  // More robust userId validation
  const userId = resolvedParams?.userId;
  
  if (!userId || userId === 'undefined' || userId === 'null' || userId.trim() === '') {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-destructive">Invalid User ID</h2>
          <p className="text-muted-foreground">
            The user ID is missing or invalid. Please check the URL and try again.
          </p>
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Debug info: {JSON.stringify(resolvedParams)}
          </div>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <Suspense fallback={<UserDetailsSkeleton />}>
        <ClientUserDetails userId={userId} />
      </Suspense>
    </div>
  );
}

function UserDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}