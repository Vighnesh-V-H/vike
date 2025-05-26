import { Suspense } from "react";
import { Integrations } from "@/components/integrations/integrations";
import { Skeleton } from "@/components/ui/skeleton";

function IntegrationsLoading() {
  return (
    <div className='container ml-4 mx-auto py-8'>
      <Skeleton className='h-8 w-64 mb-6' />
      <div className='flex gap-8 flex-wrap'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-[200px] w-[300px]' />
        ))}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<IntegrationsLoading />}>
      <Integrations />
    </Suspense>
  );
}
