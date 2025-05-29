import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function LeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className='flex h-screen'>
        <AppSidebar className='h-screen w-64 flex-shrink-0' />
        <div className='flex-1 overflow-auto'>{children}</div>
      </div>
    </SidebarProvider>
  );
}
