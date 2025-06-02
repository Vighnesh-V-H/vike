"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "@/components/leads/dashboard";

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

function DashboardPage() {
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

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

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
    // In a real app, this would trigger a data refresh with the new date range
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <Dashboard
        leads={leads}
        users={MOCK_USERS}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
}

export default DashboardPage;
