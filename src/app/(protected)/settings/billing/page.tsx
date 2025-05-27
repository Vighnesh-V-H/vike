import { getUserSubscriptionPlan } from "@/lib/subscription";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Billing",
  description: "Manage your subscription and billing",
};

interface PlanProps {
  plan: keyof typeof PLANS;
  isActive?: boolean;
}

async function PricingCard({ plan, isActive }: PlanProps) {
  const planDetails = PLANS[plan];

  return (
    <Card
      className={cn(
        "flex flex-col p-6",
        isActive && "border-2 border-primary"
      )}>
      {" "}
      <div className='flex justify-between items-baseline'>
        <h3 className='text-2xl font-bold'>{planDetails.name}</h3>
        <div className='flex flex-col items-end'>
          <div className='text-2xl font-bold'>
            {planDetails.price === 0 ? (
              "Free"
            ) : (
              <span>
                ${planDetails.price}
                <span className='text-base font-normal text-muted-foreground'>
                  /mo
                </span>
              </span>
            )}
          </div>
          {planDetails.price > 0 && (
            <div className='text-xs text-muted-foreground mt-1'>
              Billed monthly
            </div>
          )}
        </div>
      </div>
      <ul className='mt-4 space-y-3 flex-1'>
        {planDetails.features.map((feature) => (
          <li key={feature} className='flex items-center gap-2'>
            <CheckIcon className='h-4 w-4 text-primary' />
            <span className='text-sm'>{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        className='mt-6'
        variant={isActive ? "outline" : "default"}
        disabled={isActive || planDetails.price === 0}>
        {isActive ? "Current Plan" : "Upgrade"}
      </Button>
    </Card>
  );
}

export default async function BillingPage() {
  const subscriptionPlan = await getUserSubscriptionPlan();

  return (
    <div className='container max-w-5xl py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Billing</h1>
        <p className='text-muted-foreground'>
          Manage your subscription and billing information
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((plan) => (
          <PricingCard
            key={plan}
            plan={plan}
            isActive={PLANS[plan].name === subscriptionPlan.name}
          />
        ))}
      </div>
    </div>
  );
}
