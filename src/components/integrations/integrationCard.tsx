"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Integration } from "@/lib/types";
import AuthFlowButton from "./authFlowButton";

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const { name, description, icon: Icon } = integration;

  return (
    <Card
      className={cn(
        "group flex max-w-[300px] flex-col h-full transition-all duration-300",
        "hover:bg-gradient-to-br hover:from-transparent to-[#ffffff02]  transition-opacity duration-300",
        "dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#151515]",
        "dark:border dark:border-[#ffffff15] dark:hover:border-[#ffffff30]",
        " overflow-hidden"
      )}>
      <CardContent className='flex flex-col flex-grow p-6'>
        <div>
          <Icon size={28} />
        </div>
        <h3 className='text-xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent'>
          {name}
        </h3>
        <p className='text-gray-600 dark:text-gray-300 text-sm flex-grow leading-relaxed'>
          {description}
        </p>
      </CardContent>
      <CardFooter className='pb-6 px-6'>
        <AuthFlowButton name={name} />
      </CardFooter>
    </Card>
  );
}