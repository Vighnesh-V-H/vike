"use client";

import {
  Droppable,
  Draggable,
  type DroppableProvided,
  type DraggableProvided,
} from "@hello-pangea/dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KanbanColumnProps } from "@/lib/leads/types";
import { getUserInfo } from "@/lib/leads/utils";
import { LeadCard } from "./lead-card";
import { EmptyColumn } from "./empty-column";


export function KanbanColumn({
  column,
  users,
  onLeadClick,
}: KanbanColumnProps) {
  return (
    <div className='flex flex-col h-full min-h-[600px]'>
      <Card className='flex-1 shadow-lg border-0 bg-white dark:bg-[#171717] dark:border dark:border-gray-700'>
        <CardHeader
          className={`bg-gradient-to-r ${column.color} text-white rounded-t-xl p-4`}>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              {column.icon}
              <CardTitle className='text-sm font-semibold'>
                {column.title}
              </CardTitle>
            </div>
            <Badge
              variant='secondary'
              className='bg-white/20 text-white border-white/30 hover:bg-white/30 transition-colors'>
              {column.leads.length}
            </Badge>
          </div>
        </CardHeader>

        <Droppable droppableId={column.id}>
          {(provided: DroppableProvided, snapshot) => (
            <CardContent
              className={`p-3 flex-1 transition-colors duration-200 ${
                snapshot.isDraggingOver ? column.gradient : "dark:bg-[#171717]"
              }`}
              {...provided.droppableProps}
              ref={provided.innerRef}>
              <div className='space-y-3 min-h-[500px]'>
                {column.leads.map((lead, index) => {
                  const assignedUser = getUserInfo(lead.assignedTo, users);

                  return (
                    <Draggable
                      key={`lead-${lead.id}`}
                      draggableId={`lead-${lead.id}`}
                      index={index}>
                      {(provided: DraggableProvided, snapshot) => (
                        <LeadCard
                          lead={lead}
                          provided={provided}
                          snapshot={snapshot}
                          user={assignedUser}
                          onClick={() => onLeadClick && onLeadClick(lead)}
                        />
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                {column.leads.length === 0 && (
                  <EmptyColumn icon={column.icon} />
                )}
              </div>
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  );
}
