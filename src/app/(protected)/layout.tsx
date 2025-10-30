import { AppSidebar } from "@/components/sidebar/sidebar";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipGlobal } from "@/components/tooltip-global";
import Path from "@/components/path";
import { SpotlightProvider } from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/sonner";
import SpotlightOpen from "@/components/spotlight-open";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightProvider>
      <div className='h-screen  flex overflow-x-hidden'>
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <header className='flex justify-between h-14 shrink-0 border-b-[1px] sticky top-0 dark:border-white/20 border-black/20 dark:text-white items-center backdrop-blur-md bg-white/70 dark:bg-black/70 z-50'>
              <div className='flex items-center gap-2 px-4'>
                <TooltipGlobal content='toggle sidebar'>
                  <SidebarTrigger className='-ml-1' />
                </TooltipGlobal>

                <Separator
                  orientation='vertical'
                  className='mr-2 dark:bg-[#fff] bg-black h-4'
                />

                <Path />
              </div>
              <div className='flex items-center gap-3 mr-4'>
                <div>
                  <SpotlightOpen />
                </div>

                <ThemeToggle />
                <NavUser />
              </div>
            </header>
            <main className={`flex-1 max-h-[92%] dark:text-white`}>
              {children}
              <Toaster />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </SpotlightProvider>
  );
}

export default Layout;
