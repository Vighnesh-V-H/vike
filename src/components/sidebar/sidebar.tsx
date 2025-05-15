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
        <SidebarMenu className='bg-black text-white h-10 relative z-10'>
          Vike
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='bg-black  relative overflow-hidden'>
        <NavMain items={sideBarOptions.navMain} />
      </SidebarContent>
      <SidebarFooter className='border-t bg-black relative'></SidebarFooter>
      <SidebarRail className='' />
    </Sidebar>
  );
}
