"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Integration } from "@/lib/types";
import AuthFlowButton from "./authFlowButton";

interface IntegrationCardProps {
  integration: Integration;
}

export function IntegrationCard({ integration }: IntegrationCardProps) {
  const { name, description, icon: Icon, redirectUrl, color } = integration;

  return (
    <Card className='flex flex-col h-full transition-all duration-200 hover:shadow-md dark:bg-[#0f0f0f] dark:hover:bg-[#171717] dark:border-[#f9f7f7]'>
      <CardContent className='flex flex-col flex-grow p-3'>
        <div
          className={cn(
            "p-3 rounded-lg w-12 h-8 flex items-center justify-center mb-4",
            color
          )}>
          <Icon className='text-white' size={24} />
        </div>
        <h3 className='text-lg font-semibold mb-2'>{name}</h3>
        <p className='text-gray-500 dark:text-gray-400 text-sm flex-grow'>
          {description}
        </p>
      </CardContent>
      <CardFooter className='pt-0 pb-6 px-6'>
        <AuthFlowButton name={name} />
      </CardFooter>
    </Card>
  );
}
