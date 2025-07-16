"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SectionCards } from "@/components/admin/dashboard/section-cards";
import { DataTable } from "@/components/admin/dashboard/data-table";
import { AppSidebar } from "@/components/admin/dashboard/app-sidebar";
import { useState } from "react";
import { useAdminUsers } from "@/hooks/admin/use-admin-users";

export default function Page() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const { data, isFetching, error } = useAdminUsers(page, pageSize);

  if (error) return <p>Failed to load users.</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * )",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="sidebar" />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6"></div>
              <DataTable
                data={data.items}
                total={data.total}
                page={page}
                onPageChange={setPage}
                isFetching={isFetching}
                pageSize={pageSize}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
