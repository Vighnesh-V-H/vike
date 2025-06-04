import type React from "react";


export interface Lead {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  jobTitle?: string | null;
  status: string;
  priority?: string;
  value?: string | null;
  assignedTo?: string | null;
  tags?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt?: Date;
  position: number;
}

export interface UserType {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

export interface Column {
  id: string;
  title: string;
  leads: Lead[];
  color: string;
  gradient: string;
  icon: React.ReactNode;
}

export interface KanbanBoardProps {
  initialLeads?: Lead[];
  users?: UserType[];
  onLeadUpdate?: (lead: Lead) => void;
  onLeadClick?: (lead: Lead) => void;
}

export interface LeadCardProps {
  lead: Lead;
  provided: any; // DraggableProvided
  snapshot: any;
  user: UserType | null;
  onClick: () => void;
}

export interface KanbanColumnProps {
  column: Column;
  users: UserType[];
  onLeadClick?: (lead: Lead) => void;
}


export interface EmptyColumnProps {
  icon: React.ReactNode;
}
