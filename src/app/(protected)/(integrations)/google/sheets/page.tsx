"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  ArrowLeft,
  Plus,
  RefreshCcw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

interface GoogleSheet {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
}

export default function GoogleSheetsPage() {
  const router = useRouter();
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSheetName, setNewSheetName] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchSheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/integrations/google/sheets");
      setSheets(response.data.sheets);
    } catch (err: any) {
      console.error("Error fetching sheets:", err);
      setError(err.response?.data?.error || "Failed to fetch Google Sheets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  const createNewSheet = async () => {
    if (!newSheetName.trim()) return;

    setCreating(true);
    try {
      const response = await axios.post("/api/integrations/google/sheets", {
        title: newSheetName.trim(),
      });

      setSheets([response.data.sheet, ...sheets]);
      setNewSheetName("");
    } catch (err: any) {
      console.error("Error creating sheet:", err);
      setError(err.response?.data?.error || "Failed to create sheet");
    } finally {
      setCreating(false);
    }
  };

  const columns: ColumnDef<GoogleSheet>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link
          href={`/google/sheets/${row.original.id}`}
          className='font-medium text-blue-600 hover:underline'>
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "modifiedTime",
      header: "Last Modified",
      cell: ({ row }) =>
        format(new Date(row.original.modifiedTime), "MMM d, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <Link href={`/google/sheets/${row.original.id}`}>
            <Button variant='ghost' size='sm'>
              View
            </Button>
          </Link>
          <a
            href={row.original.webViewLink}
            target='_blank'
            rel='noopener noreferrer'>
            <Button variant='ghost' size='sm'>
              <ExternalLink className='h-4 w-4 mr-1' />
              Open in Google
            </Button>
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link href='/integrations'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Integrations
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-4 flex items-center'>
          <FileSpreadsheet className='mr-2 h-6 w-6 text-green-600' />
          Google Sheets
        </h1>
        <p className='text-gray-500 dark:text-gray-400 mb-6'>
          View and manage your Google Sheets. Create, view, and edit your
          spreadsheets.
        </p>
      </div>

      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center'>
              <FileSpreadsheet className='mr-2 h-6 w-6 text-green-600' />
              Your Spreadsheets
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={fetchSheets}
              disabled={loading}>
              <RefreshCcw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-2 mb-4'>
            <Input
              placeholder='Enter spreadsheet name'
              value={newSheetName}
              onChange={(e) => setNewSheetName(e.target.value)}
              className='max-w-sm'
            />
            <Button
              onClick={createNewSheet}
              disabled={creating || !newSheetName.trim()}>
              <Plus className='h-4 w-4 mr-2' />
              Create New
            </Button>
          </div>

          {loading ? (
            <div className='text-center py-4'>Loading Google Sheets...</div>
          ) : error ? (
            <div className='text-center text-red-500 py-4'>{error}</div>
          ) : sheets.length === 0 ? (
            <div className='text-center py-4'>
              No Google Sheets found. Create one to get started.
            </div>
          ) : (
            <DataTable columns={columns} data={sheets} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
