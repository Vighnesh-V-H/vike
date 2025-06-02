"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { Dashboard } from "@/components/leads/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Filter, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

// Define types
interface Lead {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  status: string;
  priority?: string;
  value?: number;
  tags?: string[];
  createdAt: Date;
  position: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface GoogleSheet {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

// Mock data for initial development - will be replaced with API calls
const MOCK_LEADS = [
  {
    id: 1,
    fullName: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    companyName: "Acme Corp",
    jobTitle: "CEO",
    status: "new",
    priority: "high",
    value: 50000,
    tags: ["enterprise", "saas"],
    createdAt: new Date("2023-05-15"),
    position: 0,
  },
  {
    id: 2,
    fullName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-987-6543",
    companyName: "TechStart Inc",
    jobTitle: "CTO",
    status: "contacted",
    priority: "medium",
    value: 25000,
    tags: ["startup", "tech"],
    createdAt: new Date("2023-05-18"),
    position: 0,
  },
  {
    id: 3,
    fullName: "Michael Brown",
    email: "michael@example.com",
    phone: "555-456-7890",
    companyName: "Global Solutions",
    jobTitle: "Procurement Manager",
    status: "qualified",
    priority: "medium",
    value: 35000,
    tags: ["enterprise"],
    createdAt: new Date("2023-05-20"),
    position: 0,
  },
  {
    id: 4,
    fullName: "Emily Davis",
    email: "emily@example.com",
    phone: "555-789-0123",
    companyName: "Innovative Tech",
    jobTitle: "Director of Operations",
    status: "proposal",
    priority: "high",
    value: 75000,
    tags: ["tech", "enterprise"],
    createdAt: new Date("2023-05-22"),
    position: 0,
  },
  {
    id: 5,
    fullName: "David Wilson",
    email: "david@example.com",
    phone: "555-234-5678",
    companyName: "Smart Solutions",
    jobTitle: "CFO",
    status: "negotiation",
    priority: "high",
    value: 100000,
    tags: ["finance", "enterprise"],
    createdAt: new Date("2023-05-25"),
    position: 0,
  },
  {
    id: 6,
    fullName: "Jennifer Lee",
    email: "jennifer@example.com",
    phone: "555-345-6789",
    companyName: "Digital Marketing Pro",
    jobTitle: "Marketing Director",
    status: "won",
    priority: "medium",
    value: 45000,
    tags: ["marketing", "smb"],
    createdAt: new Date("2023-05-28"),
    position: 0,
  },
  {
    id: 7,
    fullName: "Robert Taylor",
    email: "robert@example.com",
    phone: "555-456-7890",
    companyName: "Taylor Industries",
    jobTitle: "Owner",
    status: "lost",
    priority: "low",
    value: 15000,
    tags: ["manufacturing", "smb"],
    createdAt: new Date("2023-05-30"),
    position: 0,
  },
];

const MOCK_USERS = [
  {
    id: "user1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson",
  },
  {
    id: "user2",
    name: "Morgan Smith",
    email: "morgan@example.com",
    avatar: "https://ui-avatars.com/api/?name=Morgan+Smith",
  },
  {
    id: "user3",
    name: "Taylor Brown",
    email: "taylor@example.com",
    avatar: "https://ui-avatars.com/api/?name=Taylor+Brown",
  },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("kanban");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const router = useRouter();

  // In a real app, this would fetch data from your API
  useEffect(() => {
    // Simulating API call
    const fetchLeads = async () => {
      // In production, replace with actual API call
      // const response = await fetch('/api/leads');
      // const data = await response.json();
      // setLeads(data);

      // For now, just use mock data
      setLeads(MOCK_LEADS);
    };

    fetchLeads();
  }, []);

  // Fetch Google Sheets
  useEffect(() => {
    const fetchGoogleSheets = async () => {
      setSheetsLoading(true);
      setSheetsError(null);
      try {
        const response = await axios.get("/api/integrations/google/sheets");
        setSheets(response.data.sheets || []);
      } catch (err: any) {
        console.error("Error fetching Google Sheets:", err);
        setSheetsError(
          err.response?.data?.error || "Failed to fetch Google Sheets"
        );
      } finally {
        setSheetsLoading(false);
      }
    };

    fetchGoogleSheets();
  }, []);

  const handleLeadUpdate = (updatedLead: Lead) => {
    // In a real app, this would call your API to update the lead
    setLeads(
      leads.map((lead) =>
        lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
      )
    );

    // In production, you would make an API call here
    // await fetch(`/api/leads/${updatedLead.id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updatedLead)
    // });
  };

  const handleLeadClick = (lead: Lead) => {
    // In a real app, this would open a lead details modal or navigate to a details page
    toast.info(`Viewing lead: ${lead.fullName}`);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    // In a real app, this would trigger a data refresh with the new date range
  };

  const handleSheetSelect = (sheetId: string) => {
    router.push(`/sheets-to-leads/${sheetId}`);
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Lead Management</h1>
        <div className='flex gap-2'>
          <Button>
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'>
        {/* <TabsList>
          <TabsTrigger value='kanban'>Kanban Board</TabsTrigger>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='list'>List View</TabsTrigger>
        </TabsList> */}

        <TabsContent value='kanban' className='space-y-4'>
          <KanbanBoard
            initialLeads={leads}
            users={MOCK_USERS}
            onLeadUpdate={handleLeadUpdate}
            onLeadClick={handleLeadClick}
          />
        </TabsContent>

        <TabsContent value='dashboard'>
          <Dashboard
            leads={leads}
            users={MOCK_USERS}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>

        <TabsContent value='list'>
          <div className='rounded-md border shadow-sm p-8 flex items-center justify-center'>
            <p className='text-muted-foreground'>
              List view will be implemented here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
