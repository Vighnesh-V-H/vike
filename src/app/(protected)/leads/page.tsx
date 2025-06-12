"use client";

import { useState, useEffect } from "react";
import { KanbanBoard } from "@/components/leads/kanban-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { Lead } from "@/lib/leads/types";
import { LeadsDataTable } from "@/components/leads/leads-data-table";
import { LeadsHeader } from "@/components/leads/leads-header";
import { LeadCreator } from "@/components/sheets-to-leads/lead-creator";

interface GoogleSheet {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sheets, setSheets] = useState<GoogleSheet[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("kanban");
  const [isLoading, setIsLoading] = useState(false);
  const [showLeadCreator, setShowLeadCreator] = useState(false);

  const emptyLeadData = {
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    jobTitle: "",
  };

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
    } finally {
      setIsLoading(false);
    }
  };

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
      await axios.post("/api/leads/update", {
        id: updatedLead.id,
        status: updatedLead.status,
        position: updatedLead.position,
      });

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
    toast.info(`Viewing lead: ${lead.fullName}`);
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await axios.delete(`/api/leads/${id}`);

      setLeads(leads.filter((lead) => lead.id !== id));
      toast.success("Lead deleted successfully");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Failed to delete lead");
    }
  };

  const handleEditLead = (lead: Lead) => {
    toast.info(`Editing lead: ${lead.fullName}`);
  };

  const handleAddLead = () => {
    setShowLeadCreator(true);
  };

  const handleCreateLead = async (lead: any) => {
    try {
      const response = await axios.post("/api/leads", lead);
      setLeads([...leads, response.data]);
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating lead:", error);
      return Promise.reject(error);
    }
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <LeadsHeader
        sheets={sheets}
        sheetsLoading={sheetsLoading}
        sheetsError={sheetsError}
        onAddLead={handleAddLead}
      />

      <LeadCreator
        isOpen={showLeadCreator}
        onOpenChange={setShowLeadCreator}
        onCreateLead={handleCreateLead}
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
            users={[]}
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
