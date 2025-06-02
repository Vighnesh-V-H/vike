import type React from "react";

/**
 * Lead entity type
 */
export interface Lead {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  status: string;
  priority?: string;
  value?: number;
  assignedTo?: string;
  tags?: string[];
  createdAt: Date;
  lastContactedAt?: Date;
  nextFollowUpDate?: Date;
  position: number;
}

/**
 * User type for leads
 */
export interface UserType {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

/**
 * Column type for Kanban board
 */
export interface Column {
  id: string;
  title: string;
  leads: Lead[];
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

/**
 * Props for the KanbanBoard component
 */
export interface KanbanBoardProps {
  initialLeads?: Lead[];
  users?: UserType[];
  onLeadUpdate?: (lead: Lead) => void;
  onLeadClick?: (lead: Lead) => void;
}

/**
 * Props for the LeadCard component
 */
export interface LeadCardProps {
  lead: Lead;
  provided: any; // DraggableProvided
  snapshot: any;
  user: UserType | null;
  onClick: () => void;
}

/**
 * Props for the KanbanColumn component
 */
export interface KanbanColumnProps {
  column: Column;
  users: UserType[];
  onLeadClick?: (lead: Lead) => void;
}

/**
 * Props for the EmptyColumn component
 */
export interface EmptyColumnProps {
  icon: React.ReactNode;
}
