"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SheetViewer } from "@/components/integrations/google/sheet-viewer";

export default function SheetViewPage() {
  const params = useParams();
  const router = useRouter();
  const [sheetInfo, setSheetInfo] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [sheetId, setSheetId] = useState<string>("");

  useEffect(() => {
    if (params && params.sheetId) {
      const id = Array.isArray(params.sheetId)
        ? params.sheetId[0]
        : params.sheetId;
      setSheetId(id || "");
    }
  }, [params]);

  useEffect(() => {
    const fetchSheetInfo = async () => {
      if (!sheetId) return;

      try {
        // Fetch sheet data from the API
        const response = await axios.get(
          `/api/integrations/google/sheets/${sheetId}`
        );

        // Get sheet name from the first cell or use a default name
        let sheetName = `Sheet - ${sheetId}`;

        // If we have data and it has at least one row with a first cell value
        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0 &&
          response.data.data[0].length > 0
        ) {
          // Use the first cell as the title if it's not empty
          if (response.data.data[0][0]) {
            sheetName = response.data.data[0][0];
          }
        }

        setSheetInfo({ name: sheetName });
      } catch (err: any) {
        console.error("Error fetching sheet info:", err);
        setError(
          err.response?.data?.error || "Failed to fetch sheet information"
        );
      } finally {
        setLoading(false);
      }
    };

    if (sheetId) {
      fetchSheetInfo();
    }
  }, [sheetId]);

  if (!sheetId) {
    return (
      <div className='flex items-center justify-center h-64'>
        Loading sheet information...
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        Loading sheet information...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-64'>
        <div className='text-red-500 mb-4'>{error}</div>
        <Link href='/google/sheets'>
          <Button variant='outline'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Sheets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link href='/google/sheets'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Sheets
            </Button>
          </Link>
        </div>
        <Button
          variant={isEditable ? "default" : "outline"}
          size='sm'
          onClick={() => setIsEditable(!isEditable)}>
          {isEditable ? "Editing Mode" : "View Mode"}
        </Button>
      </div>

      <div>
        <h1 className='text-2xl font-bold mb-4 flex items-center'>
          <FileSpreadsheet className='mr-2 h-6 w-6 text-green-600' />
          {sheetInfo?.name || "Google Sheet"}
        </h1>
        <p className='text-gray-500 dark:text-gray-400 mb-6'>
          View and manage the content of this Google Sheet.
        </p>
      </div>

      <SheetViewer
        sheetId={sheetId}
        sheetName={sheetInfo?.name}
        editable={isEditable}
      />
    </div>
  );
}
