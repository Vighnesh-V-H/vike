import { AppSidebar } from "@/components/sidebar/sidebar";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipGlobal } from "@/components/tooltip-global";
import Path from "@/components/path";
import { SpotlightProvider } from "@/providers/modal-provider";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightProvider>
      <div className='h-screen bg-black flex overflow-x-hidden'>
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <header className='flex justify-between  h-14 shrink-0 dark:bg-black border-b-[1px] sticky top-0 dark:border-white border-black dark:text-white items-center '>
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
                <ThemeToggle />
                <NavUser />
              </div>
            </header>
            <main
              className={`flex-1 dark:bg-black max-h-[92%] dark:text-white`}>
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </SpotlightProvider>
  );
}

export default Layout;
