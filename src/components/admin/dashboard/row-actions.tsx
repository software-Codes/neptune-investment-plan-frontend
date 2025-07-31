"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { IconDotsCircleHorizontal } from "@tabler/icons-react";
import { toast } from "sonner";

import {
  useBlockUser,
  useUnblockUser,
  useForceLogout,
  useRemoveUser,
} from "@/hooks/admin/use-admin-users";

// Define the user type based on what useAdminUsers returns (camelCase)
interface TransformedUser {
  userId: string;
  fullName: string;
  email: string;
  createdAt: string;
  accountStatus: "active" | "suspended" | "deactivated";
  accountBalance: string;
  tradingBalance: string;
  referralBalance: string;
}

export default function RowActions({ user }: { user: TransformedUser }) {
  const router = useRouter();
  const block = useBlockUser();
  const unblock = useUnblockUser();
  const logout = useForceLogout();
  const remove = useRemoveUser();

  const confirm = (msg: string, fn: () => void) => {
    if (window.confirm(msg)) fn();
  };

  const handleBlockUser = () => {
    confirm("Block this user?", () => {
      block.mutate(
        { userId: user.userId, reason: "Admin action" },
        {
          onSuccess: () => {
            toast.success(`User ${user.userId} has been blocked.`);
          },
          onError: (error: any) => {
            console.error("Block user error:", error);
            toast.error(`Failed to block user ${user.userId}.`);
          },
        }
      );
    });
  };

  const handleUnblockUser = () => {
    confirm("Un-block this user?", () => {
      unblock.mutate(user.userId, {
        onSuccess: () => {
          toast.success(`User ${user.userId} has been unblocked.`);
        },
        onError: (error: any) => {
          console.error("Unblock user error:", error);
          toast.error(`Failed to unblock user ${user.userId}.`);
        },
      });
    });
  };

  const handleForceLogout = () => {
    confirm("Force logout from all devices?", () => {
      logout.mutate(user.userId, {
        onSuccess: () => {
          toast.success(`User ${user.userId} has been logged out.`);
        },
        onError: (error: any) => {
          console.error("Force logout error:", error);
          toast.error(`Failed to log out user ${user.userId}.`);
        },
      });
    });
  };

  const handleRemoveUser = (soft: boolean) => {
    const action = soft ? "Deactivate" : "Permanently delete";
    const message = soft
      ? "Deactivate this account?"
      : "⚠️ Permanently delete this user?\nThis cannot be undone.";

    confirm(message, () => {
      remove.mutate(
        { userId: user.userId, soft },
        {
          onSuccess: () => {
            toast.success(`${action} user ${user.userId} successful.`);
          },
          onError: (error: any) => {
            console.error("Remove user error:", error);
            toast.error(
              `Failed to ${action.toLowerCase()} user ${user.userId}.`
            );
          },
        }
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsCircleHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/dashboard/users/${user.userId}`)}
        >
          View details
        </DropdownMenuItem>

        {user.accountStatus !== "suspended" ? (
          <DropdownMenuItem
            disabled={block.isPending}
            onClick={handleBlockUser}
          >
            {block.isPending ? "Blocking…" : "Block"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            disabled={unblock.isPending}
            onClick={handleUnblockUser}
          >
            {unblock.isPending ? "Un-blocking…" : "Unblock"}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          disabled={logout.isPending}
          onClick={handleForceLogout}
        >
          {logout.isPending ? "Logging out…" : "Force logout"}
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={remove.isPending}
          onClick={() => handleRemoveUser(true)}
        >
          Deactivate
        </DropdownMenuItem>

        <DropdownMenuItem
          disabled={remove.isPending}
          className="text-red-600"
          onClick={() => handleRemoveUser(false)}
        >
          Delete permanently
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
