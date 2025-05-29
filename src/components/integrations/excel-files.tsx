"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ExternalLink, Plus, RefreshCcw } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";

interface ExcelFile {
  id: string;
  name: string;
  webUrl: string;
  lastModifiedDateTime: string;
  size: number;
  createdDateTime: string;
}

export function ExcelFiles() {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);

  const fetchExcelFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/integrations/excel/files");
      setFiles(response.data.files);
    } catch (err: any) {
      console.error("Error fetching Excel files:", err);
      setError(err.response?.data?.error || "Failed to fetch Excel files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExcelFiles();
  }, []);

  const createNewFile = async () => {
    if (!newFileName.trim()) return;

    setCreating(true);
    try {
      // This would call your API to create a new Excel file
      // const response = await axios.post('/api/integrations/excel/files', { name: newFileName });
      // Add the new file to the list
      // setFiles([response.data.file, ...files]);
      setNewFileName("");

      // For now, just show a message since we don't have the full backend implemented
      alert(`Creating new Excel file: ${newFileName}.xlsx`);
    } catch (err: any) {
      console.error("Error creating Excel file:", err);
      setError(err.response?.data?.error || "Failed to create Excel file");
    } finally {
      setCreating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const columns = useMemo<ColumnDef<ExcelFile, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className='font-medium'>{row.original.name}</div>
        ),
      },
      {
        accessorKey: "lastModifiedDateTime",
        header: "Last Modified",
        cell: ({ row }) => formatDate(row.original.lastModifiedDateTime),
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: ({ row }) => formatFileSize(row.original.size),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <a
            href={row.original.webUrl}
            target='_blank'
            rel='noopener noreferrer'>
            <Button variant='ghost' size='sm'>
              <ExternalLink className='h-4 w-4 mr-1' />
              Open
            </Button>
          </a>
        ),
      },
    ],
    []
  );

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center'>
            <FileSpreadsheet className='mr-2 h-6 w-6 text-green-600' />
            Excel Files
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={fetchExcelFiles}
            disabled={loading}>
            <RefreshCcw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Input
            placeholder='Enter file name'
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className='max-w-sm'
          />
          <Button
            onClick={createNewFile}
            disabled={creating || !newFileName.trim()}>
            <Plus className='h-4 w-4 mr-2' />
            Create New
          </Button>
        </div>

        {loading ? (
          <div className='text-center py-4'>Loading Excel files...</div>
        ) : error ? (
          <div className='text-center text-red-500 py-4'>{error}</div>
        ) : files.length === 0 ? (
          <div className='text-center py-4'>
            No Excel files found. Create one to get started.
          </div>
        ) : (
          <DataTable columns={columns} data={files} />
        )}
      </CardContent>
    </Card>
  );
}
