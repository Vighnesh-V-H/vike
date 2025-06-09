import { Lead, UserType } from "@/lib/leads/types";

/**
 * Format currency for display
 */
export const formatCurrency = (value?: number | string | null) => {
  if (!value) return "";
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(numericValue);
};

/**
 * Get priority badge color based on priority level
 */
export const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "high":
      return "bg-gradient-to-r from-red-500 to-red-600 text-white border-0";
    case "medium":
      return "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0";
    case "low":
      return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0";
    default:
      return "bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0";
  }
};

/**
 * Get user information for a given user ID
 */
export const getUserInfo = (
  userId: string | null | undefined,
  users: UserType[]
): UserType | null => {
  if (!userId) return null;
  return users.find((user) => user.id === userId) || null;
};

/**
 * Status columns configuration for the Kanban board
 */
export const getStatusColumns = (icon: {
  sparkles: React.ReactNode;
  user: React.ReactNode;
  dollarSign: React.ReactNode;
  building: React.ReactNode;
}) => [
  {
    id: "new",
    title: "New Leads",
    color: "from-blue-500 to-blue-600",
    gradient: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    icon: icon.sparkles,
  },
  {
    id: "contacted",
    title: "Contacted",
    color: "from-purple-500 to-purple-600",
    gradient: "bg-gradient-to-br from-purple-50 to-purple-100/50",
    icon: icon.user,
  },
  {
    id: "won",
    title: "Won",
    color: "from-emerald-500 to-emerald-600",
    gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100/50",
    icon: icon.dollarSign,
  },
  {
    id: "lost",
    title: "Lost",
    color: "from-slate-400 to-slate-500",
    gradient: "bg-gradient-to-br from-slate-50 to-slate-100/50",
    icon: icon.building,
  },
];
