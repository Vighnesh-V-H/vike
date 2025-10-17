"use client";

import { integrations } from "@/lib/constants";
import { IntegrationCard } from "@/components/integrations/integrationCard";


export function Integrations() {
  return (
    <div className='container mx-auto mb-10 px-4 sm:px-6 lg:px-8 py-8'>
      <h2 className='text-2xl font-bold mb-6 dark:text-gray-200'>
        Available Integrations
      </h2>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6'>
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>
    </div>
  );
}
