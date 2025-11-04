"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconWallet,
  IconShield,
  IconTrash,
  IconUserX,
  IconLogout,
} from "@tabler/icons-react";
import { AdminUser } from "@/app/admin/api/users-admin-api-client";
import {
  useBlockUser,
  useUnblockUser,
  useForceLogout,
  useRemoveUser,
} from "@/hooks/admin/use-admin-users";
import { toast } from "sonner";

interface UserDetailsProps {
  user: AdminUser;
  onClose?: () => void;
}

export function UserDetails({ user, onClose }: UserDetailsProps) {
  const [deleteType, setDeleteType] = useState<"soft" | "hard" | null>(null);

  const blockUser = useBlockUser();
  const unblockUser = useUnblockUser();
  const forceLogout = useForceLogout();
  const removeUser = useRemoveUser();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "deactivated":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBlockUser = () => {
    blockUser.mutate(
      { userId: user.user_id, reason: "Admin action" },
      {
        onSuccess: () => {
          toast.success("User blocked successfully");
          onClose?.();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Failed to block user");
        },
      }
    );
  };

  const handleUnblockUser = () => {
    unblockUser.mutate(user.user_id, {
      onSuccess: () => {
        toast.success("User unblocked successfully");
        onClose?.();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to unblock user");
      },
    });
  };

  const handleForceLogout = () => {
    forceLogout.mutate(user.user_id, {
      onSuccess: () => {
        toast.success("User logged out from all devices");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to force logout");
      },
    });
  };

  const handleDeleteUser = (soft: boolean) => {
    removeUser.mutate(
      { userId: user.user_id, soft },
      {
        onSuccess: () => {
          toast.success(
            soft ? "User deactivated successfully" : "User deleted permanently"
          );
          onClose?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to delete user"
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* User Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-muted rounded-full">
                <IconUser className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.full_name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            <Badge className={getStatusColor(user.account_status)}>
              {user.account_status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <IconUser className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">User ID:</span>
              <span className="font-mono text-sm">{user.user_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconMail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="text-sm">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconShield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge
                variant="outline"
                className={getStatusColor(user.account_status)}
              >
                {user.account_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWallet className="h-5 w-5" />
            Wallet Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                ${parseFloat(user.account_balance || "0").toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Account Balance
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                ${parseFloat(user.trading_balance || "0").toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Trading Balance
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                ${parseFloat(user.referral_balance || "0").toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Referral Balance
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>Manage user account and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {/* Block/Unblock User */}
            {user.account_status !== "suspended" ? (
              <Button
                variant="outline"
                onClick={handleBlockUser}
                disabled={blockUser.isPending}
              >
                <IconUserX className="h-4 w-4 mr-2" />
                {blockUser.isPending ? "Blocking..." : "Block User"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleUnblockUser}
                disabled={unblockUser.isPending}
              >
                <IconShield className="h-4 w-4 mr-2" />
                {unblockUser.isPending ? "Unblocking..." : "Unblock User"}
              </Button>
            )}

            {/* Force Logout */}
            <Button
              variant="outline"
              onClick={handleForceLogout}
              disabled={forceLogout.isPending}
            >
              <IconLogout className="h-4 w-4 mr-2" />
              {forceLogout.isPending ? "Logging out..." : "Force Logout"}
            </Button>

            <Separator orientation="vertical" className="h-6" />

            {/* Soft Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <IconUserX className="h-4 w-4 mr-2" />
                  Deactivate Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deactivate User Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will deactivate the user account. The user data will be
                    preserved and can be reactivated later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteUser(true)}
                    disabled={removeUser.isPending}
                  >
                    {removeUser.isPending ? "Deactivating..." : "Deactivate"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Hard Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <IconTrash className="h-4 w-4 mr-2" />
                  Delete Permanently
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
                  <AlertDialogDescription>
                    ⚠️ This action cannot be undone. This will permanently
                    delete the user and all associated data including wallets,
                    transactions, and trading history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteUser(false)}
                    disabled={removeUser.isPending}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {removeUser.isPending
                      ? "Deleting..."
                      : "Delete Permanently"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
