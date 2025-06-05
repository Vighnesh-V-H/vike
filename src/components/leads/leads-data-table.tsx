"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Lead, UserType } from "@/lib/leads/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface LeadsDataTableProps {
  leads: Lead[];
  isLoading: boolean;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

export function LeadsDataTable({
  leads,
  isLoading,
  onEditLead,
  onDeleteLead,
}: LeadsDataTableProps) {
  // Define columns for the leads data table
  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "fullName",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "companyName",
      header: "Company",
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusColors: Record<string, string> = {
          new: "bg-blue-100 text-blue-800",
          contacted: "bg-purple-100 text-purple-800",
          qualified: "bg-green-100 text-green-800",
          proposal: "bg-yellow-100 text-yellow-800",
          negotiation: "bg-orange-100 text-orange-800",
          won: "bg-emerald-100 text-emerald-800",
          lost: "bg-red-100 text-red-800",
        };

        return (
          <Badge
            className={`${
              statusColors[status] || "bg-gray-100 text-gray-800"
            }`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const priorityColors: Record<string, string> = {
          high: "bg-red-100 text-red-800",
          medium: "bg-yellow-100 text-yellow-800",
          low: "bg-green-100 text-green-800",
        };

        return (
          <Badge
            className={`${
              priorityColors[priority] || "bg-gray-100 text-gray-800"
            }`}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value") as string;
        return value
          ? new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(Number(value))
          : "-";
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return date
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(date))
          : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;

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
              <DropdownMenuItem onClick={() => onEditLead(lead)}>
                <Pencil className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteLead(lead.id)}
                className='text-red-600'>
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className='rounded-md border shadow-sm p-4'>
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <p className='text-muted-foreground'>Loading leads...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={leads}
          searchKey='fullName'
          enableGlobalFilter={true}
        />
      )}
    </div>
  );
}
