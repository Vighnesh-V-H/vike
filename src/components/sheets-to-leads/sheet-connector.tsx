"use client";

import { useState } from "react";
import { SheetViewer } from "@/components/integrations/google/sheet-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface SheetConnectorProps {
  onAddLead: (lead: any) => Promise<void>;
}

export function SheetConnector({ onAddLead }: SheetConnectorProps) {
  const [sheetId, setSheetId] = useState<string>("");
  const [sheetName, setSheetName] = useState<string>("Contacts");
  const [range, setRange] = useState<string>("Sheet1!A1:Z1000");
  const [isValidSheet, setIsValidSheet] = useState<boolean>(false);

  // Function to validate the sheet ID
  const validateSheet = () => {
    if (!sheetId) {
      toast.error("Please enter a Google Sheet ID");
      return;
    }

    // For demo purposes, we'll just set it as valid
    // In production, you would verify the sheet exists and is accessible
    setIsValidSheet(true);
    toast.success("Sheet connected successfully");
  };

  return (
    <Tabs defaultValue='connect' className='space-y-4'>
      <TabsList>
        <TabsTrigger value='connect'>Connect Sheet</TabsTrigger>
        <TabsTrigger value='view' disabled={!isValidSheet}>
          View & Import
        </TabsTrigger>
      </TabsList>

      <TabsContent value='connect' className='space-y-4'>
        <Card>
          <CardHeader>
            <CardTitle>Connect Google Sheet</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='sheetId'>Google Sheet ID</Label>
              <Input
                id='sheetId'
                placeholder='Enter Google Sheet ID'
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
              />
              <p className='text-sm text-muted-foreground'>
                Find the Sheet ID in the URL:
                https://docs.google.com/spreadsheets/d/
                <span className='font-bold'>SHEET_ID</span>/edit
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='sheetName'>Sheet Name</Label>
              <Input
                id='sheetName'
                placeholder='Sheet Name'
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='range'>Range (Optional)</Label>
              <Input
                id='range'
                placeholder='e.g. Sheet1!A1:Z1000'
                value={range}
                onChange={(e) => setRange(e.target.value)}
              />
            </div>

            <Button onClick={validateSheet} className='w-full'>
              <FileSpreadsheet className='mr-2 h-4 w-4' />
              Connect Sheet
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='view'>
        <Card>
          <CardHeader>
            <CardTitle>Sheet Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground mb-4'>
              View your sheet data below. Use the "Add to Leads" action in the
              dropdown menu to add a row as a lead. The first column will be
              used as the lead name, second as company, third as email, and
              fourth as phone.
            </p>

            {isValidSheet && (
              <SheetViewer
                sheetId={sheetId}
                sheetName={sheetName}
                range={range}
                onAddLead={onAddLead}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
