"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCcw,
  Save,
  Plus,
  MoreHorizontal,
  Copy,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Input } from "@/components/ui/input";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LeadCreator } from "@/components/sheets-to-leads/lead-creator";

interface SheetViewerProps {
  sheetId: string;
  sheetName?: string;
  range?: string;
  editable?: boolean;
  onAddLead?: (lead: any) => Promise<void>;
}

export function SheetViewer({
  sheetId,
  sheetName = "Untitled Sheet",
  range = "Sheet1!A1:Z1000",
  editable = false,
  onAddLead,
}: SheetViewerProps) {
  const [data, setData] = useState<any[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRange, setCurrentRange] = useState<string>(range);
  const [editedData, setEditedData] = useState<any[][]>([]);
  const [showLeadCreator, setShowLeadCreator] = useState<boolean>(false);
  const [selectedRowData, setSelectedRowData] = useState<Record<
    string,
    any
  > | null>(null);

  const fetchSheetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `/api/integrations/google/sheets/${sheetId}?range=${encodeURIComponent(
          currentRange
        )}`
      );

      const responseData = response.data.data || [];
      console.log("API response data:", responseData);

      // Log the data structure for debugging
      if (responseData.length > 0) {
        console.log("First row:", responseData[0]);
        console.log("Number of rows:", responseData.length);
        console.log(
          "Sample row data structure:",
          responseData.map((row: any[]) => row.length)
        );
      }

      // If we have empty data but are in edit mode, create a starter template
      if (responseData.length === 0 && editable) {
        const templateData = [
          ["Header 1", "Header 2", "Header 3"], // Add default headers
          ["", "", ""], // Add an empty row for data entry
        ];
        setData(templateData);
        setEditedData(JSON.parse(JSON.stringify(templateData)));
      } else {
        setData(responseData);
        setEditedData(JSON.parse(JSON.stringify(responseData)));
      }
    } catch (err: any) {
      console.error("Error fetching sheet data:", err);
      setError(err.response?.data?.error || "Failed to fetch sheet data");
    } finally {
      setLoading(false);
    }
  }, [sheetId, currentRange, editable]);

  useEffect(() => {
    fetchSheetData();
  }, [fetchSheetData]);

  const handleSave = async () => {
    try {
      await axios.patch(`/api/integrations/google/sheets/${sheetId}`, {
        range: currentRange,
        values: editedData,
      });
      alert("Changes saved successfully");
      fetchSheetData();
    } catch (err: any) {
      alert(
        "Error saving changes: " +
          (err.response?.data?.error || "Unknown error")
      );
    }
  };

  const headers = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Ensure we have headers for all columns in the data
    const firstRow = data[0] || [];

    // Find the maximum number of columns in any row
    const maxColumns = data.reduce(
      (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
      0
    );

    // Generate header names for each column
    return Array.from({ length: maxColumns }).map((_, index) => {
      // Use the content of the first row as headers, or generate Column N if empty
      const headerContent = firstRow[index];
      return headerContent !== undefined &&
        headerContent !== null &&
        headerContent !== ""
        ? String(headerContent)
        : `Column ${index + 1}`;
    });
  }, [data]);

  // Process data for the table
  const tableData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Skip the header row in edit mode, include all rows in view mode
    const startRow = editable ? 1 : 0;

    console.log("Processing table data, starting from row:", startRow);
    console.log("Total rows to process:", data.length - startRow);

    // Process each row from the data array
    const processedData = data.slice(startRow).map((row, rowIndex) => {
      // Ensure row is an array
      if (!Array.isArray(row)) {
        console.warn(`Row ${rowIndex} is not an array:`, row);
        return { id: rowIndex };
      }

      const rowData: Record<string, any> = { id: rowIndex };

      // Process each cell in the row and assign it to the corresponding header
      headers.forEach((header, colIndex) => {
        const cellValue = colIndex < row.length ? row[colIndex] : "";
        rowData[header] = cellValue;
      });

      return rowData;
    });

    console.log("Processed table data:", processedData.length, "rows");
    return processedData;
  }, [data, headers, editable]);

  // Generate columns for the data table
  const columns = useMemo<ColumnDef<any>[]>(() => {
    const baseColumns = headers.map((header, columnIndex) => {
      const accessorId = `col_${columnIndex}`;

      return {
        id: accessorId,
        accessorFn: (row: Record<string, any>) => row[header], // Use accessorFn instead of accessorKey
        header: header,
        cell: editable
          ? ({ row }: { row: { index: number } }) => {
              const rowIndex = row.index;
              // In edit mode, we need to add 1 to the index because we're skipping the header row
              const dataRowIndex = rowIndex + 1;

              return (
                <Input
                  value={editedData[dataRowIndex]?.[columnIndex] ?? ""}
                  onChange={(e) => {
                    const newData = [...editedData];
                    // Ensure the row exists
                    if (!newData[dataRowIndex]) {
                      newData[dataRowIndex] = Array(headers.length).fill("");
                    }
                    // Update the cell value
                    newData[dataRowIndex][columnIndex] = e.target.value;
                    setEditedData(newData);
                  }}
                  className='h-9 w-full'
                />
              );
            }
          : ({ getValue }: { getValue: () => any }) => {
              // For view mode, just display the value
              const value = getValue() as string;
              return value;
            },
      };
    });

    // Add actions column
    const actionsColumn: ColumnDef<any> = {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }: { row: any }) => {
        const rowIndex = row.index;
        const dataRowIndex = editable ? rowIndex + 1 : rowIndex;

        const handleCopyRow = () => {
          // Create a string representation of the row data
          const rowData = headers
            .map((header, idx) => {
              return `${header}: ${row.getValue(`col_${idx}`) || ""}`;
            })
            .join("\n");

          navigator.clipboard.writeText(rowData);
          toast.success("Copied to clipboard", {
            description: "Row data has been copied to clipboard",
          });
        };

        const handleDeleteRow = () => {
          if (!editable) return;

          const newData = [...editedData];
          // Remove the row at dataRowIndex
          newData.splice(dataRowIndex, 1);
          setEditedData(newData);

          toast.success("Row deleted", {
            description: "The row will be deleted when you save changes",
          });
        };

        // Update the handleAddToLeads function
        const handleAddToLeads = () => {
          // Create a properly mapped object from row data to lead fields
          // This maps the spreadsheet columns to the lead fields in a more intelligent way
          const mappedRowData = {
            // Map common spreadsheet column headers to lead fields
            fullName:
              row.original["Name"] ||
              row.original["Full Name"] ||
              row.original["Contact"] ||
              row.original[headers[0]] ||
              "",
            email:
              row.original["Email"] ||
              row.original["Email Address"] ||
              row.original[headers[2]] ||
              "",
            phone:
              row.original["Phone"] ||
              row.original["Phone Number"] ||
              row.original["Contact Number"] ||
              row.original[headers[3]] ||
              "",
            companyName:
              row.original["Company"] ||
              row.original["Company Name"] ||
              row.original["Organization"] ||
              row.original[headers[1]] ||
              "",
            jobTitle:
              row.original["Job Title"] ||
              row.original["Position"] ||
              row.original["Title"] ||
              row.original[headers[4]] ||
              "",
            // Include all original data for reference
            originalData: row.original,
          };

          // Set the selected row data and show the lead creator
          setSelectedRowData(mappedRowData);
          setShowLeadCreator(true);
        };

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
              <DropdownMenuItem onClick={handleCopyRow}>
                <Copy className='h-4 w-4 mr-2' />
                Copy row data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToLeads}>
                <Plus className='h-4 w-4 mr-2' />
                Add to Leads
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {editable ? (
                <>
                  <DropdownMenuItem onClick={handleDeleteRow}>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete row
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => {}}>
                  <Eye className='h-4 w-4 mr-2' />
                  View details
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    };

    return [...baseColumns, actionsColumn];
  }, [headers, editedData, editable]);

  const addNewRow = () => {
    const newData = [...editedData];

    const newRow = Array(headers.length).fill("");
    newData.push(newRow);
    setEditedData(newData);
  };

  return (
    <>
      <Card className='w-full'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center justify-between'>
            <div className='text-xl font-semibold'>{sheetName}</div>
            <div className='flex space-x-2'>
              {editable && (
                <>
                  <Button onClick={addNewRow} variant='outline' size='sm'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Row
                  </Button>
                  <Button onClick={handleSave} variant='outline' size='sm'>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </Button>
                </>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={fetchSheetData}
                disabled={loading}>
                <RefreshCcw className='h-4 w-4 mr-2' />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-4'>Loading sheet data...</div>
          ) : error ? (
            <div className='text-center text-red-500 py-4'>{error}</div>
          ) : data.length === 0 ? (
            <div className='text-center py-4'>
              <p>No data found in this sheet.</p>
              {editable && (
                <Button
                  onClick={fetchSheetData}
                  variant='outline'
                  size='sm'
                  className='mt-2'>
                  Create Template Sheet
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className='mb-4 flex justify-between items-center'>
                <p className='text-sm text-muted-foreground'>
                  {editable
                    ? `Showing ${tableData.length} rows. First row is used as column headers.`
                    : `Showing all ${tableData.length} rows from the sheet.`}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {headers.length} columns
                </p>
              </div>

              <DataTable columns={columns} data={tableData} />

              {tableData.length === 0 && (
                <div className='text-center py-4'>
                  <p>
                    No data rows found.{" "}
                    {editable ? "Click 'Add Row' to add data." : ""}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <LeadCreator
        isOpen={showLeadCreator}
        onOpenChange={setShowLeadCreator}
        rowData={selectedRowData || {}}
        onCreateLead={async (lead) => {
          try {
            const response = await axios.post("/api/leads", lead);
            if (onAddLead) {
              await onAddLead(response.data);
            }
            toast.success("Lead successfully added to database");
            setShowLeadCreator(false);
          } catch (error: any) {
            console.error("Error saving lead to database:", error);
            throw error;
          }
        }}
      />
    </>
  );
}
