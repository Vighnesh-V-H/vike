"use client";

import { useState, useEffect, useCallback } from "react";
import { Dashboard } from "@/components/leads/dashboard";
import { type Lead } from "@/lib/leads/types";

export function DashboardContainer() {
  const [leadsData, setLeadsData] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fromParam = dateRange.from.toISOString();
      const toParam = dateRange.to.toISOString();

      const leadsResponse = await fetch(
        `/api/leads?from=${fromParam}&to=${toParam}`
      );

      if (!leadsResponse.ok) {
        const errorData = await leadsResponse.json();
        throw new Error(errorData.error || "Failed to fetch leads");
      }

      const leads = await leadsResponse.json();
      setLeadsData(leads);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setDateRange(range);
  };

  return (
    <div className='container mx-auto py-6 space-y-6'>
      {error && (
        <div
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4'
          role='alert'>
          <strong className='font-bold'>Error: </strong>
          <span className='block sm:inline'>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
        </div>
      ) : (
        <Dashboard
          leads={leadsData}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      )}
    </div>
  );
}
