

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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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

import { useIsMobile } from "@/hooks/use-mobile";
import { AdminUser } from "@/app/admin/api/users-admin-api-client";

/* ----------------------------------------------------------------------------
   Column definitions
   ---------------------------------------------------------------------------- */

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }) => (
      <span className="font-mono">{String(row.original.user_id).slice(0, 8)}…</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      const formatted = createdAt ? new Date(createdAt).toLocaleDateString() : "N/A";
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
    cell: ({ row }) => <span>{row.original.full_name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span>{row.original.email}</span>,
  },
  {
    accessorKey: "account_status",
    header: "Status",
    cell: ({ row }) => <span>{row.original.account_status}</span>,
  },
];


/* ----------------------------------------------------------------------------
   Draggable row wrapper
   ---------------------------------------------------------------------------- */

function DraggableRow({ row }: { row: Row<AdminUser> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.userId,
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
  /* ------------------- local state (sorting / filters / column hide) ------ */
  const [data, setData] = React.useState<AdminUser[]>(initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  /* ------------------- DnD sensors --------------------------------------- */
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  // row-id helper ---------------------------------------------------------
  function makeRowId(row: AdminUser, index: number): string {
    const base = row.userId ?? `row-${index}`;
    return `${base}`; // ensure string
  }

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map((row, i) => makeRowId(row, i)),
    [data]
  );

  /* ------------------- TanStack table ------------------------------------ */
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

  /* ------------------- handle drag reorder (pure client) ----------------- */
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

  /* ------------------- render ------------------------------------------- */
  return (
    <Tabs defaultValue="table" className="w-full flex-col gap-6">
      {/* header bar */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Columns
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

      {/* main table */}
      <TabsContent value="table" className="flex flex-col gap-4 px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <Table>
              {/* table head */}
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

              {/* table body */}
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

        {/* pagination footer */}
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
