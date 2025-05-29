"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  date: string;
  customer: string;
};

const data: Payment[] = [
  {
    id: "m5gr84i9",
    amount: 316,
    status: "success",
    email: "ken99@example.com",
    date: "2023-04-12",
    customer: "Ken Thompson",
  },
  {
    id: "3u1reuv4",
    amount: 242,
    status: "success",
    email: "Abe45@example.com",
    date: "2023-05-23",
    customer: "Abraham Lincoln",
  },
  {
    id: "derv1ws0",
    amount: 837,
    status: "processing",
    email: "Monserrat44@example.com",
    date: "2023-06-17",
    customer: "Monserrat Rodriguez",
  },
  {
    id: "5kma53ae",
    amount: 874,
    status: "success",
    email: "Silas22@example.com",
    date: "2023-07-05",
    customer: "Silas Johnson",
  },
  {
    id: "bhqecj4p",
    amount: 721,
    status: "failed",
    email: "carmella@example.com",
    date: "2023-08-12",
    customer: "Carmella DeWitt",
  },
  {
    id: "8a8md53k",
    amount: 432,
    status: "pending",
    email: "michael87@example.com",
    date: "2023-09-15",
    customer: "Michael Brown",
  },
  {
    id: "4k5sd78l",
    amount: 968,
    status: "success",
    email: "janesmith@example.com",
    date: "2023-10-22",
    customer: "Jane Smith",
  },
  {
    id: "9d7fe4g2",
    amount: 345,
    status: "processing",
    email: "robert11@example.com",
    date: "2023-11-08",
    customer: "Robert Wilson",
  },
  {
    id: "6hj78k9s",
    amount: 1290,
    status: "success",
    email: "sarah.davis@example.com",
    date: "2023-12-03",
    customer: "Sarah Davis",
  },
  {
    id: "2lm56n7p",
    amount: 580,
    status: "failed",
    email: "thomas@example.com",
    date: "2024-01-14",
    customer: "Thomas Anderson",
  },
  {
    id: "7q8r9s1t",
    amount: 763,
    status: "pending",
    email: "emma24@example.com",
    date: "2024-02-19",
    customer: "Emma Garcia",
  },
  {
    id: "3u4v5w6x",
    amount: 892,
    status: "success",
    email: "david.lee@example.com",
    date: "2024-03-05",
    customer: "David Lee",
  },
];

export function DataTableDemo() {
  const [tableData, setTableData] = useState<Payment[]>(data);

  const handleBulkDelete = (selectedRows: Payment[]) => {
    // In a real app, you'd call your API to delete these records
    const selectedIds = selectedRows.map((row) => row.id);
    setTableData(tableData.filter((item) => !selectedIds.includes(item.id)));
    toast.success(`Deleted ${selectedRows.length} items`);
  };

  const handleBulkExport = (selectedRows: Payment[]) => {
    // In a real app, you'd generate a CSV/Excel file
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Amount,Status,Email,Date,Customer\n" +
      selectedRows
        .map(
          (row) =>
            `${row.id},${row.amount},${row.status},${row.email},${row.date},${row.customer}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${selectedRows.length} items`);
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className='flex items-center'>
          <Badge
            className={`capitalize ${
              row.getValue("status") === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : row.getValue("status") === "processing"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : row.getValue("status") === "pending"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}>
            {row.getValue("status")}
          </Badge>
        </div>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant='ghost'
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className='p-0 hover:bg-transparent'>
            Email
            <ArrowUpDown className='ml-2 h-4 w-4' />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className='lowercase'>{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => <div>{row.getValue("customer")}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "amount",
      header: () => <div className='text-right'>Amount</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <span className='sr-only'>Open menu</span>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}>
                Copy payment ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View customer</DropdownMenuItem>
              <DropdownMenuItem>View payment details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className='text-destructive'>
                Delete payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className='space-y-4'>
      <DataTable
        columns={columns}
        data={tableData}
        searchKey='email'
        enableGlobalFilter={true}
        enableMultiSort={true}
        enableBulkActions={true}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
      />
    </div>
  );
}
