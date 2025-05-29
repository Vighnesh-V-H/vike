import { LeadScraper } from "@/components/lead-scraper/lead-scraper";
import { WebLeadScraper } from "@/components/lead-scraper/web-scraper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "AI Lead Scraper",
  description: "Find potential leads using AI and web scraping",
};

export default function LeadsPage() {
  return (
    <main className='min-h-screen p-4'>
      <Tabs defaultValue='ai' className='max-w-6xl mx-auto'>
        <TabsList className='grid w-full grid-cols-2 mb-8'>
          <TabsTrigger value='ai'>AI Lead Generator</TabsTrigger>
          <TabsTrigger value='web'>Web Lead Scraper</TabsTrigger>
        </TabsList>

        <TabsContent value='ai'>
          <div className='bg-white dark:bg-gray-950 rounded-lg shadow-sm'>
            <LeadScraper />
          </div>
        </TabsContent>

        <TabsContent value='web'>
          <div className='bg-white dark:bg-gray-950 rounded-lg shadow-sm'>
            <WebLeadScraper />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
