"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, FileSpreadsheet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoogleSheet {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

interface LeadsHeaderProps {
  sheets: GoogleSheet[];
  sheetsLoading: boolean;
  sheetsError: string | null;
  onAddLead: () => void;
}

export function LeadsHeader({
  sheets,
  sheetsLoading,
  sheetsError,
  onAddLead,
}: LeadsHeaderProps) {
  const router = useRouter();

  const handleSheetSelect = (sheetId: string) => {
    router.push(`/sheets-to-leads/${sheetId}`);
  };

  return (
    <div className='flex justify-between items-center'>
      <h1 className='text-3xl font-bold'>Lead Management</h1>
      <div className='flex gap-2'>
        <Button onClick={onAddLead}>
          <Plus className='mr-2 h-4 w-4' />
          Add Lead
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline'>
              <FileSpreadsheet className='mr-2 h-4 w-4' />
              Import from Sheet
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <DropdownMenuLabel>Select Sheet</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sheetsLoading ? (
              <DropdownMenuItem disabled>Loading sheets...</DropdownMenuItem>
            ) : sheetsError ? (
              <DropdownMenuItem disabled className='text-red-500'>
                Error: {sheetsError}
              </DropdownMenuItem>
            ) : sheets.length === 0 ? (
              <DropdownMenuItem disabled>No sheets found</DropdownMenuItem>
            ) : (
              sheets.map((sheet) => (
                <DropdownMenuItem
                  key={sheet.id}
                  onClick={() => handleSheetSelect(sheet.id)}
                  className='cursor-pointer'>
                  {sheet.name}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/sheets-to-leads")}
              className='cursor-pointer'>
              <FileSpreadsheet className='mr-2 h-4 w-4' />
              View All Sheets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant='outline'>
          <Upload className='mr-2 h-4 w-4' />
          Import
        </Button>
        <Button variant='outline'>
          <Download className='mr-2 h-4 w-4' />
          Export
        </Button>
      </div>
    </div>
  );
}
