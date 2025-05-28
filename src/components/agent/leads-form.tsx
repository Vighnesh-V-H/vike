"use client";

import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { ArrowUpIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "@/components/autoresize-textarea";
import { useState } from "react";

interface SearchResult {
  title: string;
  url: string;
  description: string;
  content?: string;
}

interface LeadsFormProps {
  className?: string;
}

export function LeadsForm({ className }: LeadsFormProps) {
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const { messages, input, setInput, append, isLoading, error } = useChat({
    api: "/api/crawler",
    body: {
      timestamp: new Date().toISOString(),
    },
    onResponse: (response) => {
      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        // Clone the response before reading its body to avoid stream already read errors
        const clonedResponse = response.clone();
        clonedResponse.text().then((text) => {
          setDebugInfo(`Response Error (${response.status}): ${text.substring(0, 500)}...`);
        }).catch((e) => {
          console.error("Failed to read error response", e);
          setDebugInfo(`Error reading response: ${e.message}`);
        });
      }
    },
    onError: (error) => {
      console.error("Error in crawler request:", error);
      setDebugInfo(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim().length) return;

    
    void append({ content: input, role: "user" });
    setInput("");
  };

  // Parse the markdown formatted results from the crawler
  const parseResults = (text: string): SearchResult[] => {
    const results: SearchResult[] = [];
    const sections = text.split("##").filter(Boolean);
    
    for (const section of sections) {
      const lines = section.trim().split("\n").filter(Boolean);
      if (lines.length < 2) continue;
      
      const title = lines[0].trim();
      const url = lines[1].trim();
      const description = lines[2]?.trim() || "";
      
      let content = "";
      const contentIndex = lines.findIndex(line => line.includes("Content Preview:"));
      if (contentIndex !== -1 && lines.length > contentIndex + 1) {
        content = lines.slice(contentIndex + 1).join("\n").trim();
      }
      
      results.push({ title, url, description, content });
    }
    
    return results;
  };
  
  // Get search results from the assistant's response
  const searchResults = messages.length > 1 ? parseResults(messages[messages.length - 1].content) : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className="border-input bg-background focus-within:ring-ring/10 relative mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
      >
        <SearchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder="Enter a search query or Google dork (e.g., site:linkedin.com inurl:sales)"
          className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
          disabled={isLoading}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="absolute bottom-1 right-1 size-6 rounded-full"
              disabled={isLoading}
            >
              <ArrowUpIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Search</TooltipContent>
        </Tooltip>
      </form>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error.name}
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Search Results</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-medium line-clamp-2">{result.title}</h3>
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline line-clamp-1 mb-2"
                >
                  {result.url}
                </a>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {result.description}
                </p>
                {result.content && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground">Content Preview:</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {result.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && searchResults.length === 0 && messages.length > 1 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No results found. Try a different search query.</p>
        </div>
      )}

      {!isLoading && !error && messages.length <= 1 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">Enter a search query to find potential leads.</p>
          <div className="mt-4 max-w-md">
            <h3 className="font-medium mb-2">Example Google Dorks:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>site:linkedin.com "sales manager" "email"</li>
              <li>site:twitter.com bio:"founder" "technology"</li>
              <li>intitle:"contact us" intext:"sales" filetype:pdf</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
