"use client";

import { LeadsForm } from "@/components/agent/leads-form";

export default function LeadsPage() {
  return (
    <main className="mx-auto flex h-full w-full max-w-full flex-col items-stretch p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Lead Generation</h1>
        <p className="text-muted-foreground">
          Enter a search query or Google dork to find potential leads
        </p>
      </header>
      
      <LeadsForm />
    </main>
  );
}
