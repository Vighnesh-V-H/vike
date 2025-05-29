"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Loader2, RefreshCw, Download, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lead } from "@/lib/types/lead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WebLeadScraper() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [maxResults, setMaxResults] = useState("10");
  const [includeContactInfo, setIncludeContactInfo] = useState(true);
  const [useDorks, setUseDorks] = useState(true);
  const [usePuppeteer, setUsePuppeteer] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScrapingMethodChange = (method: "dorks" | "puppeteer") => {
    if (method === "dorks") {
      setUseDorks(true);
      setUsePuppeteer(false);
    } else {
      setUseDorks(false);
      setUsePuppeteer(true);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!industry.trim()) {
      setError("Industry is required");
      return;
    }

    setError(null);
    setIsLoading(true);
    setLeads([]);

    try {
      // Prepare the request body
      const body = {
        industry: industry.trim(),
        location: location.trim() || undefined,
        keywords: keywords.trim()
          ? keywords.split(",").map((k) => k.trim())
          : undefined,
        maxResults: parseInt(maxResults),
        includeContactInfo,
        useDorks,
        usePuppeteer,
      };

      // Call the web scraper API
      const response = await fetch("/api/leads/web-scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(
          `Server responded with ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.leads && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Error scraping leads:", err);
      setError(err instanceof Error ? err.message : "Failed to scrape leads");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to export leads to CSV
  const exportToCSV = () => {
    if (leads.length === 0) return;

    // Create CSV content
    const headers = [
      "Company",
      "Name",
      "Position",
      "Description",
      "Industry",
      "Location",
      "Website",
      "Email",
      "LinkedIn",
    ];

    const csvContent = [
      headers.join(","),
      ...leads.map((lead) =>
        [
          `"${lead.company || ""}"`,
          `"${lead.name || ""}"`,
          `"${lead.position || ""}"`,
          `"${lead.description || ""}"`,
          `"${lead.industry || ""}"`,
          `"${lead.location || ""}"`,
          `"${lead.website || ""}"`,
          `"${lead.contactInfo?.email || ""}"`,
          `"${lead.contactInfo?.linkedin || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leads-${industry}-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-2xl font-bold mb-2'>Web Lead Scraper</h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Find potential leads by scraping business directories and company
          websites
        </p>
      </div>

      <Tabs defaultValue='form'>
        <TabsList className='mb-4'>
          <TabsTrigger value='form'>Search Form</TabsTrigger>
          <TabsTrigger value='about'>About Web Scraping</TabsTrigger>
        </TabsList>

        <TabsContent value='form'>
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>Find Leads</CardTitle>
              <CardDescription>
                Specify your search criteria for web scraping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScrape} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='industry'>Industry (required)</Label>
                  <Input
                    id='industry'
                    ref={inputRef}
                    placeholder='e.g., tech, healthcare, construction'
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='location'>Location (optional)</Label>
                  <Input
                    id='location'
                    placeholder='e.g., London, New York, California'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='keywords'>
                    Keywords (optional, comma-separated)
                  </Label>
                  <Input
                    id='keywords'
                    placeholder='e.g., startup, software, AI'
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='maxResults'>Maximum Results</Label>
                    <Select value={maxResults} onValueChange={setMaxResults}>
                      <SelectTrigger id='maxResults'>
                        <SelectValue placeholder='Select maximum results' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='5'>5 results</SelectItem>
                        <SelectItem value='10'>10 results</SelectItem>
                        <SelectItem value='15'>15 results</SelectItem>
                        <SelectItem value='20'>20 results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex items-center space-x-2 pt-8'>
                    <Checkbox
                      id='includeContactInfo'
                      checked={includeContactInfo}
                      onCheckedChange={(checked: boolean) =>
                        setIncludeContactInfo(checked)
                      }
                    />
                    <Label htmlFor='includeContactInfo'>
                      Include contact information
                    </Label>
                  </div>
                </div>

                <div className='space-y-2 mt-4'>
                  <Label>Scraping Method</Label>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    <div
                      className={`border rounded-md p-3 cursor-pointer ${
                        useDorks
                          ? "border-primary bg-primary/5"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleScrapingMethodChange("dorks")}>
                      <div className='flex items-center space-x-2'>
                        <div
                          className={`h-4 w-4 rounded-full ${
                            useDorks ? "bg-primary" : "border border-gray-300"
                          }`}></div>
                        <div>
                          <p className='font-medium'>Search Engine Dorks</p>
                          <p className='text-sm text-gray-500'>
                            Faster, simulated results
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`border rounded-md p-3 cursor-pointer ${
                        usePuppeteer
                          ? "border-primary bg-primary/5"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleScrapingMethodChange("puppeteer")}>
                      <div className='flex items-center space-x-2'>
                        <div
                          className={`h-4 w-4 rounded-full ${
                            usePuppeteer
                              ? "bg-primary"
                              : "border border-gray-300"
                          }`}></div>
                        <div>
                          <p className='font-medium'>Puppeteer Live Scraping</p>
                          <p className='text-sm text-gray-500'>
                            Real-time but slower
                          </p>
                          <HelpCircle className='h-4 w-4 text-gray-400 inline ml-1' />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='pt-2'>
                  <Button type='submit' className='w-full' disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        Scraping websites...
                      </>
                    ) : (
                      <>
                        <Search className='h-4 w-4 mr-2' />
                        Scrape Leads
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='about'>
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle>About Web Scraping</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p>
                This lead scraper uses web scraping techniques to find potential
                leads based on your criteria.
              </p>

              <div className='space-y-2'>
                <h3 className='font-medium'>How it works:</h3>
                <ol className='list-decimal pl-5 space-y-1'>
                  <li>
                    Searches business directories for companies matching your
                    industry and location
                  </li>
                  <li>
                    Visits each company website to gather additional information
                  </li>
                  <li>Extracts contact details when available and permitted</li>
                  <li>
                    Respects website robots.txt rules for ethical scraping
                  </li>
                </ol>
              </div>

              <div className='space-y-2'>
                <h3 className='font-medium'>Ethical considerations:</h3>
                <ul className='list-disc pl-5 space-y-1'>
                  <li>Only public information is collected</li>
                  <li>Rate limiting is employed to minimize server impact</li>
                  <li>
                    Robots.txt files are respected to follow site owner wishes
                  </li>
                  <li>
                    Use the collected information responsibly and in accordance
                    with applicable laws
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className='bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6'>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className='flex justify-center items-center py-8'>
          <Loader2 className='h-8 w-8 text-primary animate-spin' />
          <span className='ml-2'>Scraping websites for leads...</span>
        </div>
      )}

      {useDorks && (
        <div className='text-sm text-gray-500 mt-2'>
          <p>
            Search Engine Dorks method will generate specialized search queries
            to find relevant leads based on your criteria.
          </p>
        </div>
      )}
      {usePuppeteer && (
        <div className='text-sm text-gray-500 mt-2'>
          <p>
            Puppeteer Live Scraping uses a headless browser to search and
            extract data in real-time. This may take longer but produces more
            accurate results.
          </p>
        </div>
      )}

      {leads.length > 0 && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-bold'>
              Results{" "}
              <Badge variant='outline'>{leads.length} leads found</Badge>
            </h2>
            <Button onClick={exportToCSV} variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Export CSV
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {leads.map((lead) => (
              <Card key={lead.id} className='h-full'>
                <CardHeader className='pb-2'>
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
                  <div className='space-y-3'>
                    {lead.name && (
                      <div>
                        <div className='font-medium text-sm'>
                          Contact Person
                        </div>
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
                        <div className='font-medium text-sm'>Description</div>
                        <div className='text-sm'>{lead.description}</div>
                      </div>
                    )}

                    {lead.website && (
                      <div>
                        <div className='font-medium text-sm'>Website</div>
                        <a
                          href={
                            lead.website.startsWith("http")
                              ? lead.website
                              : `https://${lead.website}`
                          }
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-500 hover:underline text-sm'>
                          {lead.website}
                        </a>
                      </div>
                    )}

                    {lead.contactInfo &&
                      Object.keys(lead.contactInfo).length > 0 && (
                        <div>
                          <div className='font-medium text-sm'>
                            Contact Information
                          </div>
                          <div className='text-sm space-y-1'>
                            {lead.contactInfo.email && (
                              <div className='truncate'>
                                Email:{" "}
                                <span className='text-blue-500'>
                                  {lead.contactInfo.email}
                                </span>
                              </div>
                            )}
                            {lead.contactInfo.phone && (
                              <div>Phone: {lead.contactInfo.phone}</div>
                            )}
                            {lead.contactInfo.linkedin && (
                              <div className='truncate'>
                                LinkedIn:{" "}
                                <a
                                  href={
                                    lead.contactInfo.linkedin.startsWith("http")
                                      ? lead.contactInfo.linkedin
                                      : lead.contactInfo.linkedin
                                  }
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='text-blue-500 hover:underline'>
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
        </div>
      )}

      {!isLoading && leads.length === 0 && !error && (
        <div className='text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg'>
          <p className='text-gray-500 dark:text-gray-400'>
            Enter your search criteria and click "Scrape Leads" to find
            potential leads.
          </p>
        </div>
      )}
    </div>
  );
}
