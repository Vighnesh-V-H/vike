import AuthNav from "@/components/auth/nav";
import { Toaster } from "@/components/ui/sonner";
import { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <>
      <div className='min-h-screen dark:bg-black flex items-center justify-center bg-gray-50'>
        <AuthNav />
        <div className='max-w-md w-full space-y-8 p-8 dark:bg-black bg-white rounded-lg shadow-md'>
          {children}
          <Toaster position='top-center' />
        </div>
      </div>
    </>
  );
}
