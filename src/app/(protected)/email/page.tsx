import { Suspense } from "react";
import { Metadata } from "next";
import { Inbox, Settings, FileText, Send, Archive, Star, Trash2, Tag } from "lucide-react";
import { EmailDashboard } from "@/components/email/dashboard";
import { EmailSidebar } from "@/components/email/sidebar";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Email Intelligence | Vike",
  description: "Smart email management with AI-powered workflows and categorization",
};

export default function EmailPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Email Intelligence</h1>
      
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3">
          <EmailSidebar />
        </div>
        
        <div className="col-span-12 lg:col-span-9">
          <Suspense fallback={<EmailDashboardSkeleton />}>
            <EmailDashboard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function EmailDashboardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 