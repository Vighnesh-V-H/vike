"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { SheetConnector } from "@/components/sheets-to-leads/sheet-connector";

export default function SheetsToLeadsPage() {
  const router = useRouter();

  // Function to handle adding a lead
  const handleAddLead = async (lead: any) => {
    try {
      // In production, this would be an API call
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lead),
      });

      if (!response.ok) {
        throw new Error("Failed to add lead");
      }

      // Optionally navigate to the leads page after adding
      // router.push("/leads");
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Failed to add lead to database");
    }
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Sheets to Leads</h1>
        <Button onClick={() => router.push("/leads")}>
          View Leads
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>

      <SheetConnector onAddLead={handleAddLead} />
    </div>
  );
}
