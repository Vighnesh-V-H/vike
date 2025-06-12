"use client";

import { useState, useEffect, useMemo } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import {
  Sparkles,
  User,
  DollarSign,
  Building2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { KanbanBoardProps, Column } from "@/lib/leads/types";
import { getStatusColumns } from "@/lib/leads/utils";
import { KanbanColumn } from "./kanban-column";
import axios from "axios";
import { Button } from "@/components/ui/button";

export function KanbanBoard({
  initialLeads = [],
  users = [],
  onLeadUpdate,
  onLeadClick,
}: KanbanBoardProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [isLoading, setIsLoading] = useState(false);

  const statusColumns = useMemo(
    () =>
      getStatusColumns({
        sparkles: <Sparkles className='h-4 w-4' />,
        user: <User className='h-4 w-4' />,
        dollarSign: <DollarSign className='h-4 w-4' />,
        building: <Building2 className='h-4 w-4' />,
      }),
    []
  );

  const [columns, setColumns] = useState<Column[]>(() =>
    statusColumns.map((col) => ({
      ...col,
      leads: leads
        .filter((lead) => lead.status === col.id)
        .sort((a, b) => a.position - b.position),
    }))
  );

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/leads");
      console.log("Fetched leads:", response.data);
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    const updatedColumns = statusColumns.map((col) => ({
      ...col,
      leads: leads
        .filter((lead) => lead.status === col.id)
        .sort((a, b) => a.position - b.position),
    }));

    console.log("Updated columns with leads:", updatedColumns);
    setColumns(updatedColumns);
  }, [leads, statusColumns]);

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const leadId = draggableId.replace("lead-", "");
    const sourceColumn = columns.find((col) => col.id === source.droppableId);

    const lead = sourceColumn?.leads.find(
      (l) => String(l.id) === String(leadId)
    );

    if (!lead) {
      console.error("Lead not found:", leadId);
      console.log("Available leads:", sourceColumn?.leads);
      return;
    }

    const newColumns = columns.map((column) => {
      if (column.id === source.droppableId) {
        const newLeads = [...column.leads];
        newLeads.splice(source.index, 1);
        return { ...column, leads: newLeads };
      }

      if (column.id === destination.droppableId) {
        const newLeads = [...column.leads];
        const updatedLead = {
          ...lead,
          status: destination.droppableId,
          position: destination.index,
        };

        newLeads.splice(destination.index, 0, updatedLead);

        return { ...column, leads: newLeads };
      }

      return column;
    });

    setColumns(newColumns);

    try {
      const updatedLead = {
        ...lead,
        status: destination.droppableId,
        position: destination.index,
      };

      if (onLeadUpdate) {
        await onLeadUpdate(updatedLead);
      }

      await axios.post("/api/leads/update", {
        id: lead.id,
        status: destination.droppableId,
        position: destination.index,
      });

      toast.success(`Lead moved to ${destination.droppableId}`);

      fetchLeads();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error("Failed to update lead status");

      fetchLeads();
    }
  };

  return (
    <div className='p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#191919] dark:via-[#141212e9] dark:to-[#171717] min-h-screen'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Lead Management</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={fetchLeads}
          disabled={isLoading}
          className='flex items-center gap-2'>
          <RefreshCcw className='h-4 w-4' />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      <style jsx global>{`
        [data-rbd-drag-handle-draggable-id] {
          z-index: 9999 !important;
        }
        [data-rbd-draggable-id] {
          z-index: 9999 !important;
        }
      `}</style>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 auto-rows-fr'>
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              users={users}
              onLeadClick={onLeadClick}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
