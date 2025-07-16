"use client";

import { useState } from "react";
import { DataTable } from "@/components/admin/dashboard/data-table";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isFetching, error } = useAdminUsers(page, pageSize);

  if (error) return <p>Failed to load users.</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <DataTable
      data={data.items}
      total={data.total}
      page={page}
      onPageChange={setPage}
      isFetching={isFetching}
      pageSize={pageSize}
    />
  );
}
