"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronsUpDown,
  Rows3,
  Rows4,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  X,
  MoreHorizontal,
  Trash2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TableLayout = "compact" | "default" | "spacious";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  enableGlobalFilter?: boolean;
  enableMultiSort?: boolean;
  enableBulkActions?: boolean;
  onBulkDelete?: (selectedRows: TData[]) => void;
  onBulkExport?: (selectedRows: TData[]) => void;
}

// Custom filter function for global search
const globalFilterFn = (row: any, columnId: string, value: string) => {
  const search = value.toLowerCase();

  // Search in all visible columns
  return Object.values(row.original).some((cellValue: any) => {
    if (cellValue == null) return false;
    return String(cellValue).toLowerCase().includes(search);
  });
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  enableGlobalFilter = true,
  enableMultiSort = true,
  enableBulkActions = true,
  onBulkDelete,
  onBulkExport,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [layout, setLayout] = React.useState<TableLayout>("default");
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [showColumnFilters, setShowColumnFilters] = React.useState(false);

  // Enhanced columns with selection checkbox
  const enhancedColumns = React.useMemo(() => {
    const selectColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...columns];
  }, [columns]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn,
    enableMultiSort: enableMultiSort,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const getTableClassName = () => {
    switch (layout) {
      case "compact":
        return "text-xs";
      case "spacious":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const getCellClassName = () => {
    switch (layout) {
      case "compact":
        return "py-1 px-2";
      case "spacious":
        return "py-4 px-4";
      default:
        return "py-2 px-3";
    }
  };

  const getHeaderClassName = () => {
    switch (layout) {
      case "compact":
        return "py-2 px-2";
      case "spacious":
        return "py-4 px-4";
      default:
        return "py-3 px-3";
    }
  };

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
    table.resetColumnFilters();
  };

  const getSortingIcon = (column: any) => {
    const sortDirection = column.getIsSorted();
    if (sortDirection === "asc") {
      return <ArrowUp className='h-4 w-4' />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className='h-4 w-4' />;
    }
    return <ArrowUpDown className='h-4 w-4 opacity-50' />;
  };

  return (
    <div className='w-full space-y-4'>
      {/* Search and Filter Controls */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 flex-1'>
            {enableGlobalFilter && (
              <div className='relative max-w-sm'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search all columns...'
                  value={globalFilter}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                  className='pl-8'
                />
              </div>
            )}

            {searchKey && (
              <div className='relative max-w-sm'>
                <Input
                  placeholder={`Filter ${searchKey}...`}
                  value={
                    (table.getColumn(searchKey)?.getFilterValue() as string) ??
                    ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(searchKey)
                      ?.setFilterValue(event.target.value)
                  }
                />
              </div>
            )}

            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowColumnFilters(!showColumnFilters)}
              className='flex items-center gap-1'>
              <Filter className='h-4 w-4' />
              Filters
              {columnFilters.length > 0 && (
                <Badge variant='secondary' className='ml-1'>
                  {columnFilters.length}
                </Badge>
              )}
            </Button>

            {(globalFilter || columnFilters.length > 0) && (
              <Button
                variant='ghost'
                size='sm'
                onClick={clearAllFilters}
                className='flex items-center gap-1'>
                <X className='h-4 w-4' />
                Clear
              </Button>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {/* Bulk Actions */}
            {enableBulkActions && hasSelection && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  {selectedRows.length} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm'>
                      Actions <MoreHorizontal className='ml-2 h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {onBulkExport && (
                      <DropdownMenuItem
                        onClick={() =>
                          onBulkExport(selectedRows.map((row) => row.original))
                        }>
                        <Download className='h-4 w-4 mr-2' />
                        Export Selected
                      </DropdownMenuItem>
                    )}
                    {onBulkDelete && (
                      <DropdownMenuItem
                        onClick={() =>
                          onBulkDelete(selectedRows.map((row) => row.original))
                        }
                        className='text-destructive'>
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete Selected
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Layout Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex items-center gap-1'>
                  {layout === "compact" ? (
                    <Rows3 className='h-4 w-4' />
                  ) : layout === "spacious" ? (
                    <Rows4 className='h-4 w-4' />
                  ) : (
                    <ChevronsUpDown className='h-4 w-4' />
                  )}
                  <span className='hidden sm:inline-block capitalize'>
                    {layout}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setLayout("compact")}>
                  <Rows3 className='h-4 w-4 mr-2' />
                  Compact
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("default")}>
                  <ChevronsUpDown className='h-4 w-4 mr-2' />
                  Default
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLayout("spacious")}>
                  <Rows4 className='h-4 w-4 mr-2' />
                  Spacious
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Column Visibility */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm'>
                  <EyeOff className='h-4 w-4 mr-2' />
                  Columns
                  <ChevronDown className='ml-2 h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className='capitalize'
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }>
                        <Eye className='h-4 w-4 mr-2' />
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Column Filters */}
        {showColumnFilters && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50'>
            {table
              .getAllColumns()
              .filter(
                (column) => column.getCanFilter() && column.id !== "select"
              )
              .map((column) => (
                <div key={column.id} className='space-y-2'>
                  <label className='text-sm font-medium capitalize'>
                    {column.id}
                  </label>
                  <Input
                    placeholder={`Filter ${column.id}...`}
                    value={(column.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                      column.setFilterValue(event.target.value)
                    }
                    className='h-8'
                  />
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <div className='overflow-x-auto'>
          <Table className={getTableClassName()}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={getHeaderClassName()}>
                        {header.isPlaceholder ? null : (
                          <div className='flex items-center space-x-2'>
                            <div
                              className={
                                header.column.getCanSort()
                                  ? "cursor-pointer select-none flex items-center gap-2 hover:text-foreground"
                                  : ""
                              }
                              onClick={header.column.getToggleSortingHandler()}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() &&
                                getSortingIcon(header.column)}
                            </div>
                            {header.column.getIsSorted() && enableMultiSort && (
                              <Badge variant='outline' className='text-xs'>
                                {header.column.getSortIndex() + 1}
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={row.getIsSelected() ? "bg-muted/50" : ""}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={getCellClassName()}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={enhancedColumns.length}
                    className='h-24 text-center'>
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination and Info */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          <div>
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </div>
          <div>
            Showing {table.getRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} filtered results
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              Rows per page:
            </span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger className='w-16 h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}>
              {"<<"}
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <div className='flex items-center gap-1 px-2'>
              <span className='text-sm text-muted-foreground'>
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              Next
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}>
              {">>"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
