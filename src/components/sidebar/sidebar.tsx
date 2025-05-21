"use client";

import * as React from "react";
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
import { useSidebar } from "@/components/ui/sidebar";
import { sideBarOptions } from "@/lib/constants";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader className='border-b dark:bg-black bg-white flex gap-2 relative'>
        <SidebarMenu className='dark:bg-black bg-white text-white h-10 relative z-10'>
          Vike
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className='dark:bg-black bg-[#d9d9d9] relative overflow-hidden'>
        <NavMain items={sideBarOptions.navMain} />
      </SidebarContent>
      <SidebarFooter className='border-t bg-black relative'></SidebarFooter>
      <SidebarRail className='' />
    </Sidebar>
  );
}
