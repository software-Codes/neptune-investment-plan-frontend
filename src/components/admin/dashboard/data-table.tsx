"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsCircleHorizontal,
  IconDotsVertical,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import { AdminUser } from "@/app/admin/api/users-admin-api-client";
import {
  useBlockUser,
  useUnblockUser,
  useForceLogout,
  useRemoveUser,
} from "@/hooks/admin/use-admin-users";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RowActions from "./row-actions";

/* ----------------------------------------------------------------------------
   Column definitions
   ---------------------------------------------------------------------------- */

export function useUserColumns(): ColumnDef<AdminUser>[] {
  return React.useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(v) => table.toggleAllRowsSelected(!!v)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        ),
      },
      {
        accessorKey: "userId",
        header: "User ID",
        cell: ({ row }) => (
          <span className="font-mono">
            {row.original.user_id ? row.original.user_id.slice(0, 8) : "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Time Created",
        cell: ({ row }) =>
          row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "N/A",
      },
      {
        accessorKey: "fullName",
        header: "Full name",
        cell: ({ row }) => row.original.full_name || "N/A",
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.original.email || "N/A",
      },
      {
        accessorKey: "accountStatus",
        header: "Status",
        cell: ({ row }) => {
          const s = row.original.account_status;
          const badge =
            s === "active"
              ? "bg-green-50 text-green-600"
              : s === "suspended"
              ? "bg-red-50 text-red-600"
              : "bg-gray-50 text-gray-600";
          return (
            <span className={`px-2 py-1 rounded-full text-xs ${badge}`}>
              {s || "N/A"}
            </span>
          );
        },
      },
      {
        accessorKey: "accountBalance",
        header: "Account $",
        cell: ({ row }) =>
          `$${Number(row.original.account_balance || 0).toFixed(2)}`,
      },
      {
        accessorKey: "tradingBalance",
        header: "Trading $",
        cell: ({ row }) =>
          `$${Number(row.original.trading_balance || 0).toFixed(2)}`,
      },
      {
        accessorKey: "referral_balance",
        header: "Referral $",
        cell: ({ row }) =>
          `$${Number(row.original.referral_balance || 0).toFixed(2)}`,
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          // Transform AdminUser to TransformedUser
          const transformedUser = {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            createdAt: user.created_at,
            accountStatus: user.account_status,
            accountBalance: user.account_balance,
            tradingBalance: user.trading_balance,
            referralBalance: user.referral_balance,
          };
          return <RowActions user={transformedUser} />;
        },
      },
    ],
    []
  );
}
/* ----------------------------------------------------------------------------
   Draggable row wrapper
   ---------------------------------------------------------------------------- */

function DraggableRow({ row }: { row: Row<AdminUser> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.user_id || row.id,
  });

  return (
    <TableRow
      ref={setNodeRef}
      data-dragging={isDragging}
      data-state={row.getIsSelected() && "selected"}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

/* ----------------------------------------------------------------------------
   Props
   ---------------------------------------------------------------------------- */

interface DataTableProps {
  data: AdminUser[];
  page: number;
  total: number;
  onPageChange: (p: number) => void;
  isFetching?: boolean;
  pageSize?: number;
}

/* ----------------------------------------------------------------------------
   Component
   ---------------------------------------------------------------------------- */

export function DataTable({
  data: initialData,
  page,
  total,
  onPageChange,
  isFetching = false,
  pageSize = 25,
}: DataTableProps) {
  const [data, setData] = React.useState<AdminUser[]>(initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  function makeRowId(row: AdminUser, index: number): string {
    return row.user_id || `row-${index}`;
  }

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map((row, i) => makeRowId(row, i)),
    [data]
  );

  const columns = useUserColumns();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex: page - 1, pageSize },
    },
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    getRowId: (row, i) => makeRowId(row, i),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prev) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs defaultValue="table" className="w-full flex-col gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Users
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {table
              .getAllColumns()
              .filter((c) => c.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TabsContent value="table" className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      {isFetching ? "Loading…" : "No results."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">
              {Object.keys(rowSelection).length} users selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const selectedUserIds = Object.keys(rowSelection);
                if (
                  window.confirm(
                    `Delete ${selectedUserIds.length} selected users?`
                  )
                ) {
                  console.log("Bulk delete:", selectedUserIds);
                  // Implement bulk delete logic here
                }
              }}
            >
              Delete Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
            >
              Clear Selection
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-muted-foreground hidden lg:block">
            {table.getFilteredSelectedRowModel().rows.length} of
            {table.getFilteredRowModel().rows.length} row(s) selected
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page">Rows per page</Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger id="rows-per-page" size="sm" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 25, 50].map((ps) => (
                    <SelectItem key={ps} value={`${ps}`}>
                      {ps}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm">
              Page {page} of {Math.ceil(total / pageSize)}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 lg:inline-flex"
                onClick={() => onPageChange(1)}
                disabled={page === 1 || isFetching}
              >
                <IconChevronsLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1 || isFetching}
              >
                <IconChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange(page + 1)}
                disabled={page * pageSize >= total || isFetching}
              >
                <IconChevronRight size={16} />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 lg:inline-flex"
                onClick={() => onPageChange(Math.ceil(total / pageSize))}
                disabled={page * pageSize >= total || isFetching}
              >
                <IconChevronsRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
