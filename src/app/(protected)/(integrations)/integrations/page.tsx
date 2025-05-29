import { Integrations } from "@/components/integrations/integrations";
import { IntegrationStatus } from "@/components/integrations/integration-status";

export const metadata = {
  title: "Integrations",
  description: "Connect with other apps and services.",
};

export default function IntegrationsPage() {
  return (
    <div className='flex flex-col gap-10'>
      <div>
        <h1 className='text-2xl font-bold mb-4 dark:text-gray-200'>
          Integrations
        </h1>
        <p className='text-gray-500 dark:text-gray-400 mb-6'>
          Connect your Vike account with other apps and services to enhance
          productivity.
        </p>
        <IntegrationStatus />
      </div>
      <Integrations />
    </div>
  );
}
