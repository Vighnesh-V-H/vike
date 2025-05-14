// import { TypeIcon as type, LucideIcon } from "lucide-react";

// import {
//   SidebarGroup,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import Link from "next/link";

// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string;
//     url: string;
//     icon: LucideIcon;
//     isActive?: boolean;
//   }[];
// }) {
//   return (
//     <SidebarGroup>
//       <SidebarGroupLabel>Platform</SidebarGroupLabel>
//       <SidebarMenu>
//         {items.map((item) => (
//           <SidebarMenuItem key={item.title} className='gap-12'>
//             <SidebarMenuButton
//               asChild
//               isActive={item.isActive}
//               tooltip={item.title}
//               className='text-white hover:text-[#2686cb]'>
//               <Link href={item.url}>
//                 <item.icon />
//                 <span>{item.title}</span>
//               </Link>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         ))}
//       </SidebarMenu>
//     </SidebarGroup>
//   );
// }

"use client";

import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

import { History } from "@/components/history";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [isAgentOpen, setIsAgentOpen] = useState(true);

  const handleItemClick = (title: string) => {
    setActiveItem(title);
  };

  return (
    <SidebarGroup>
      <QueryClientProvider client={queryClient}>
        <SidebarGroupLabel>Platform</SidebarGroupLabel>
        <SidebarMenu>
          {items.map((item) =>
            item.title === "Agent" ? (
              <Collapsible
                key={item.title}
                open={isAgentOpen}
                onOpenChange={setIsAgentOpen}
                className='group/collapsible w-full'>
                <SidebarMenuItem className='gap-12'>
                  <div className='flex w-full'>
                    <Link
                      href='/agent'
                      className='flex-grow'
                      onClick={() => handleItemClick(item.title)}>
                      <SidebarMenuButton
                        isActive={activeItem === item.title}
                        className={clsx(
                          "dark:text-white hover:text-[#2686cb] w-full",
                          {
                            "active-class": activeItem === item.title,
                          }
                        )}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </Link>
                    <CollapsibleTrigger className='flex items-center px-2'>
                      {isAgentOpen ? (
                        <ChevronUp className='h-4 w-4' />
                      ) : (
                        <ChevronDown className='h-4 w-4' />
                      )}
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <History />
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.title} className='gap-12'>
                <SidebarMenuButton
                  asChild
                  isActive={activeItem === item.title}
                  tooltip={item.title}
                  className={clsx("dark:text-white hover:text-[#2686cb]", {
                    "active-class": activeItem === item.title,
                  })}
                  onClick={() => handleItemClick(item.title)}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </QueryClientProvider>
    </SidebarGroup>
  );
}
