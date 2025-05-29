"use client";

import { ExcelFiles } from "@/components/integrations/excel-files";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExcelDashboardPage() {
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
          Microsoft Excel Integration
        </h1>
        <p className='text-gray-500 dark:text-gray-400 mb-6'>
          Access and manage your Excel spreadsheets. Create, view, and edit your
          Excel files directly from Vike.
        </p>
      </div>

      <ExcelFiles />
    </div>
  );
}
