"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Lead = {
  id: string;
  name?: string;
  company?: string;
  position?: string;
  website?: string;
  industry?: string;
  location?: string;
  description?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
};

export function LeadScraper() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const {
    messages,
    input,
    setInput,
    append,
    isLoading: isChatLoading,
  } = useChat({
    api: "/api/leads",
    maxSteps: 1,
    onFinish: (res) => {
      try {
        // Extract the JSON from the response
        const responseContent = res.content;
        if (responseContent) {
          try {
            const parsedData = JSON.parse(responseContent);
            if (parsedData.leads) {
              setLeads(parsedData.leads);
            } else {
              // Set empty leads if no leads property
              setLeads([]);
            }

            // Display error if present
            if (parsedData.error) {
              console.warn("Lead scraper error:", parsedData.error);
            }
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError);
            setLeads([]);
          }
        } else {
          // No content in response
          setLeads([]);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to process lead data:", error);
        setLeads([]);
        setIsLoading(false);
      }
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    setIsLoading(true);
    setLeads([]);

    await append({
      content: input,
      role: "user",
    });
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold mb-2'>AI Lead Scraper</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Find potential leads by describing your target audience
        </p>
      </div>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Find Leads</CardTitle>
          <CardDescription>
            Describe the industry, location, and type of leads you're looking
            for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className='flex items-center gap-2'>
            <Search className='h-5 w-5 text-gray-400' />
            <Input
              ref={inputRef}
              type='text'
              placeholder="e.g., 'tech startups in London' or 'renewable energy companies in California'"
              className='flex-1'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type='submit' disabled={isLoading}>
              {isLoading ? (
                <Loader2 className='h-4 w-4 animate-spin mr-2' />
              ) : (
                <RefreshCw className='h-4 w-4 mr-2' />
              )}
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className='flex justify-center items-center py-8'>
          <Loader2 className='h-8 w-8 text-primary animate-spin' />
          <span className='ml-2'>Searching for leads...</span>
        </div>
      )}

      {leads.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {leads.map((lead) => (
            <Card key={lead.id} className='h-full'>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <CardTitle className='text-lg'>
                    {lead.company || "Company"}
                  </CardTitle>
                  {lead.industry && (
                    <Badge variant='outline'>{lead.industry}</Badge>
                  )}
                </div>
                {lead.location && (
                  <CardDescription>{lead.location}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {lead.name && (
                    <div>
                      <div className='font-medium'>Contact Person</div>
                      <div>{lead.name}</div>
                      {lead.position && (
                        <div className='text-sm text-gray-500'>
                          {lead.position}
                        </div>
                      )}
                    </div>
                  )}

                  {lead.description && (
                    <div>
                      <div className='font-medium'>Description</div>
                      <div className='text-sm'>{lead.description}</div>
                    </div>
                  )}

                  {lead.website && (
                    <div>
                      <div className='font-medium'>Website</div>
                      <a
                        href={
                          lead.website.startsWith("http")
                            ? lead.website
                            : `https://${lead.website}`
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 hover:underline'>
                        {lead.website}
                      </a>
                    </div>
                  )}

                  {lead.contactInfo &&
                    Object.keys(lead.contactInfo).length > 0 && (
                      <div>
                        <div className='font-medium'>Contact Information</div>
                        <div className='text-sm space-y-1'>
                          {lead.contactInfo.email && (
                            <div>Email: {lead.contactInfo.email}</div>
                          )}
                          {lead.contactInfo.phone && (
                            <div>Phone: {lead.contactInfo.phone}</div>
                          )}
                          {lead.contactInfo.linkedin && (
                            <div>
                              LinkedIn:
                              <a
                                href={lead.contactInfo.linkedin}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-500 hover:underline ml-1'>
                                Profile
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && leads.length === 0 && messages.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>
            No leads found. Try adjusting your search query.
          </p>
        </div>
      )}
    </div>
  );
}
