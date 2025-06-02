"use client";

import { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { Sparkles, User, DollarSign, Building2 } from "lucide-react";
import { toast } from "sonner";
import { KanbanBoardProps, Column } from "@/lib/leads/types";
import { getStatusColumns } from "@/lib/leads/utils";
import { KanbanColumn } from "./kanban-column";

/**
 * Main KanbanBoard component
 */
export function KanbanBoard({
  initialLeads = [],
  users = [],
  onLeadUpdate,
  onLeadClick,
}: KanbanBoardProps) {
  // Get status columns configuration
  const statusColumns = getStatusColumns({
    sparkles: <Sparkles className='h-4 w-4' />,
    user: <User className='h-4 w-4' />,
    dollarSign: <DollarSign className='h-4 w-4' />,
    building: <Building2 className='h-4 w-4' />,
  });

  // State to hold our columns with leads
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize columns with leads
  useEffect(() => {
    const initialColumns = statusColumns.map((col) => ({
      ...col,
      leads: initialLeads
        .filter((lead) => lead.status === col.id)
        .sort((a, b) => a.position - b.position),
    }));

    setColumns(initialColumns);
    setIsLoading(false);
  }, [initialLeads, statusColumns]);

  // Handle drag end event
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back in the same place
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    // Find the lead that was dragged
    const leadId = Number.parseInt(draggableId.replace("lead-", ""));
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const lead = sourceColumn?.leads.find((l) => l.id === leadId);

    if (!lead) return;

    // Create new columns array
    const newColumns = columns.map((column) => {
      // Remove from source column
      if (column.id === source.droppableId) {
        const newLeads = [...column.leads];
        newLeads.splice(source.index, 1);
        return { ...column, leads: newLeads };
      }

      // Add to destination column
      if (column.id === destination.droppableId) {
        const newLeads = [...column.leads];
        const updatedLead = {
          ...lead,
          status: destination.droppableId,
          position: destination.index,
        };

        newLeads.splice(destination.index, 0, updatedLead);

        // Call the update handler if provided
        if (onLeadUpdate) {
          onLeadUpdate(updatedLead);
        }

        return { ...column, leads: newLeads };
      }

      return column;
    });

    setColumns(newColumns);
    toast.success(`Lead moved to ${destination.droppableId}`);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-4 lg:p-6 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#191919] dark:via-[#141212e9] dark:to-[#171717] min-h-screen'>
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
