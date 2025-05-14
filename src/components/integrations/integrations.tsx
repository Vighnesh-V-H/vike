"use client";

import { integrations } from "@/lib/constants";
import { IntegrationCard } from "@/components/integrations/integrationCard";

export function Integrations() {
  return (
    <div className='container ml-4 mx-auto py-8'>
      <h2 className='text-2xl font-bold mb-6 dark:text-gray-200'>
        Available Integrations
      </h2>
      <div className='flex gap-8 flex-wrap'>
        {integrations.map((integration) => (
          <IntegrationCard key={integration.name} integration={integration} />
        ))}
      </div>
    </div>
  );
}
