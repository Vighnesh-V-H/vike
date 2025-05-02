"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  Settings2,
  SquareTerminal,
  ChevronLeft,
} from "lucide-react";

import { NavMain } from "./sidebar-options";
import { NavUser } from "../nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { sideBarOptions } from "@/lib/constants";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='border-b bg-black flex gap-2 relative'>
        <SidebarMenu className='bg-black text-white relative z-10'>
          Vasist
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='bg-black  relative overflow-hidden'>
        {/* <div className='absolute w-[400px] h-[500px] rounded-full bg-[#2e7bef36] -right-32 top-20 blur-3xl' /> */}
        <NavMain items={sideBarOptions.navMain} />
      </SidebarContent>
      <SidebarFooter className='border-t bg-black relative'>
        {/* <NavUser /> */}
      </SidebarFooter>
      <SidebarRail className='' />
    </Sidebar>
  );
}
