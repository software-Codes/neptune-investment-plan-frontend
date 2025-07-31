"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/admin/dashboard/data-table";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isFetching, error } = useAdminUsers(page, pageSize);

  useEffect(() => {
    if (data) {
      console.log('Fetched Users Data:', data);
      console.log('First User:', data.items[0]);
    }
  }, [data]);

  if (error) return <p>Failed to load users.</p>;
  if (!data) return (
    <p className="text-muted-foreground flex items-center justify-center text-center">Loading...</p>
  );

  const mappedData = data.items.map((user) => ({
    user_id: user.userId,
    full_name: user.fullName,
    email: user.email,
    created_at: user.createdAt,
    account_status: user.accountStatus,
    account_balance: user.accountBalance,
    trading_balance: user.tradingBalance,
    referral_balance: user.referralBalance,
  }));

  return (
    <DataTable
      data={mappedData}
      total={data.total}
      page={page}
      onPageChange={setPage}
      isFetching={isFetching}
      pageSize={pageSize}
    />
  );
}