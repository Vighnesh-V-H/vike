"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { Lead, UserType } from "@/lib/leads/types";
import { LeadsDataTable } from "@/components/leads/leads-data-table";
import { LeadsHeader } from "@/components/leads/leads-header";

// Define types
interface GoogleSheet {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

// Mock data for initial development - will be replaced with API calls
const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    fullName: "John Smith",
    email: "john.smith@example.com",
    phone: "555-123-4567",
    companyName: "Acme Corp",
    jobTitle: "CEO",
    status: "new",
    priority: "high",
    value: "50000",
    tags: "enterprise,saas",
    createdAt: new Date("2023-05-15"),
    position: 0,
  },
  {
    id: "2",
    fullName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-987-6543",
    companyName: "TechStart Inc",
    jobTitle: "CTO",
    status: "contacted",
    priority: "medium",
    value: "25000",
    tags: "startup,tech",
    createdAt: new Date("2023-05-18"),
    position: 0,
  },
  {
    id: "3",
    fullName: "Michael Brown",
    email: "michael@example.com",
    phone: "555-456-7890",
    companyName: "Global Solutions",
    jobTitle: "Procurement Manager",
    status: "qualified",
    priority: "medium",
    value: "35000",
    tags: "enterprise",
    createdAt: new Date("2023-05-20"),
    position: 0,
  },
  {
    id: "4",
    fullName: "Emily Davis",
    email: "emily@example.com",
    phone: "555-789-0123",
    companyName: "Innovative Tech",
    jobTitle: "Director of Operations",
    status: "proposal",
    priority: "high",
    value: "75000",
    tags: "tech,enterprise",
    createdAt: new Date("2023-05-22"),
    position: 0,
  },
  {
    id: "5",
    fullName: "David Wilson",
    email: "david@example.com",
    phone: "555-234-5678",
    companyName: "Smart Solutions",
    jobTitle: "CFO",
    status: "negotiation",
    priority: "high",
    value: "100000",
    tags: "finance,enterprise",
    createdAt: new Date("2023-05-25"),
    position: 0,
  },
  {
    id: "6",
    fullName: "Jennifer Lee",
    email: "jennifer@example.com",
    phone: "555-345-6789",
    companyName: "Digital Marketing Pro",
    jobTitle: "Marketing Director",
    status: "won",
    priority: "medium",
    value: "45000",
    tags: "marketing,smb",
    createdAt: new Date("2023-05-28"),
    position: 0,
  },
  {
    id: "7",
    fullName: "Robert Taylor",
    email: "robert@example.com",
    phone: "555-456-7890",
    companyName: "Taylor Industries",
    jobTitle: "Owner",
    status: "lost",
    priority: "low",
    value: "15000",
    tags: "manufacturing,smb",
    createdAt: new Date("2023-05-30"),
    position: 0,
  },
];

const MOCK_USERS: UserType[] = [
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("kanban");
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, this would fetch data from your API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/leads");
      setLeads(response.data);
      toast.success("Leads loaded successfully");
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
      // Fallback to mock data in case of error
      setLeads(MOCK_LEADS);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLeadUpdate = async (updatedLead: Lead) => {
    try {
      // Update lead in database through API
      await axios.post("/api/leads/update", {
        id: updatedLead.id,
        status: updatedLead.status,
        position: updatedLead.position,
      });

      // Update local state
      setLeads(
        leads.map((lead) =>
          lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
        )
      );

      toast.success("Lead updated successfully");
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead");
    }
  };

  const handleLeadClick = (lead: Lead) => {
    // In a real app, this would open a lead details modal or navigate to a details page
    toast.info(`Viewing lead: ${lead.fullName}`);
  };

  const handleDeleteLead = async (id: string) => {
    try {
      // Delete lead from database through API
      await axios.delete(`/api/leads/${id}`);

      // Update local state
      setLeads(leads.filter((lead) => lead.id !== id));
      toast.success("Lead deleted successfully");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const handleEditLead = (lead: Lead) => {
    // In a real app, this would navigate to an edit page or open a modal
    toast.info(`Editing lead: ${lead.fullName}`);
  };

  const handleAddLead = () => {
    // In a real app, this would open a modal or navigate to a create page
    toast.info("Add lead functionality will be implemented here");
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <LeadsHeader
        sheets={sheets}
        sheetsLoading={sheetsLoading}
        sheetsError={sheetsError}
        onAddLead={handleAddLead}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'>
        <TabsList>
          <TabsTrigger value='kanban'>Kanban</TabsTrigger>
          <TabsTrigger value='all-leads'>All Leads</TabsTrigger>
        </TabsList>

        <TabsContent value='kanban' className='space-y-4'>
          <KanbanBoard
            initialLeads={leads}
            users={MOCK_USERS}
            onLeadUpdate={handleLeadUpdate}
            onLeadClick={handleLeadClick}
          />
        </TabsContent>

        <TabsContent value='all-leads'>
          <LeadsDataTable
            leads={leads}
            isLoading={isLoading}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
