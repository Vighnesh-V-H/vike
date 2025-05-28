import { auth } from "@/auth";
import { type CoreMessage, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { StreamData } from "ai";
import { z } from "zod";
import AIAgentCrawler from "@/lib/crawler/crawler";

// Enhanced function to crawl web content using Google dorks with multiple pages
async function crawlWithDorks(query: string, dorks: string[] = [], maxPages: number = 3) {
  try {
    // Initialize the crawler with optimized options for better performance
    const crawler = new AIAgentCrawler({
      maxConcurrency: 4,
      delay: 1200,
      timeout: 25000,
      maxRetries: 2,
      googleDelay: 2000,
      maxPages: maxPages,
      userAgentRotation: true,
      extractStructuredData: true,
    });

    console.log(`🔍 Executing search: "${query}" with dorks: [${dorks.join(", ")}]`);

    // Use the enhanced search method that handles dorks properly
    const results = await crawler.searchAndCrawlWithDorks(query, dorks, maxPages);

    // Close the crawler to clean up resources
    await crawler.close();

    console.log(`✅ Crawl completed: ${results.stats.successfulCrawls} successful crawls from ${results.stats.totalSearchResults} search results`);

    // Return comprehensive results
    return {
      searchResults: results.combinedResults,
      crawledData: results.dorkResults,
     
      stats: results.stats,
      summary: `Found ${results.stats.totalSearchResults} search results and successfully crawled ${results.stats.successfulCrawls} pages from ${results.stats.uniqueDomains} unique domains.`
    };
  } catch (error) {
    console.error("Error in crawlWithDorks:", error);
    throw error;
  }
}

// Function to format crawl results for AI consumption
function formatCrawlResults(results: any) {
  let formatted = `# Search Results Summary\n${results.summary}\n\n`;
  
  // Add crawled content
  if (results.crawledData && results.crawledData.length > 0) {
    formatted += `## Crawled Content\n\n`;
    
    results.crawledData.forEach((item: any, index: number) => {
      formatted += `### ${index + 1}. ${item.title}\n`;
      formatted += `**Domain:** ${item.domain}\n`;
      formatted += `**URL:** ${item.url}\n\n`;
      
      // Add structured headings if available
      if (item.structuredData.headings.length > 0) {
        formatted += `**Key Headings:**\n`;
        item.structuredData.headings.slice(0, 5).forEach((heading: string) => {
          formatted += `- ${heading}\n`;
        });
        formatted += `\n`;
      }
      
      // Add content preview
      formatted += `**Content Preview:**\n`;
      formatted += `${item.text.substring(0, 500)}${item.text.length > 500 ? '...' : ''}\n\n`;
      
      // Add contact info if available
      if (item.structuredData.contactSections.length > 0) {
        formatted += `**Contact Information:**\n`;
        item.structuredData.contactSections.slice(0, 3).forEach((contact: string) => {
          formatted += `- ${contact}\n`;
        });
        formatted += `\n`;
      }
      
      formatted += `---\n\n`;
    });
  }
  
  return formatted;
}

export async function POST(req: Request) {
  console.log("🚀 Crawler API route called");
  
  try {
    const session = await auth();

    console.log("🔑 Auth check:", !!session?.user?.id);
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }


    console.log("📦 Parsing request body");
    const { messages }: { messages: CoreMessage[] } = await req.json();

    // Create a new StreamData instance for this request
    const data = new StreamData();
    
    try {
      console.log("🤖 Initializing AI stream");
      const result = streamText({
        model: google("gemini-1.5-flash-8b"),
        system: `You are an expert Google Dork specialist and web researcher. Your mission is to:

## Core Responsibilities:
1. **Analyze user search intent** and understand what type of information they're seeking
2. **Generate precise Google dork queries** using advanced search operators
3. **Execute comprehensive web crawling** to gather detailed information
4. **Present findings** in a clear, organized, and actionable format

## Search Strategy:
- **Always generate multiple complementary dorks** for comprehensive coverage
- **Combine operators intelligently** (e.g., site:linkedin.com intitle:"CEO" "company name")
- **Use 3-4 pages of results** to gather sufficient data
- **Focus on high-quality, authoritative sources**
- **Prioritize recent and relevant content**

## Response Format:
1. **Explain your search strategy** and chosen dorks
2. **IMPORTANT: You MUST call the crawlWithDorks tool with the query and dorks you've generated**
3. **Analyze and summarize** the findings
4. **Highlight key insights** and actionable information
5. **Suggest follow-up searches** if relevant

## Ethical Guidelines:
- Only generate dorks for legitimate research purposes
- Respect website terms of service and robots.txt
- No dorks for accessing sensitive or private information
- Focus on publicly available information only

REMEMBER: You MUST use the crawlWithDorks tool for EVERY user query. This is REQUIRED.
EXAMPLE TOOL USAGE: crawlWithDorks({ query: "digital marketing agency", dorks: ["site:linkedin.com", "intitle:CEO"] })
`,
        messages,
        tools: {
          crawlWithDorks: tool({
            description: "Execute a comprehensive web crawl using a base query and multiple Google dorks, searching multiple pages for thorough results",
            parameters: z.object({
              query: z.string().describe("Base search query (e.g., 'digital marketing agency', 'pizza restaurant NYC')"),
              dorks: z.array(z.string()).describe("Array of Google dork operators to combine with the query (e.g., ['site:linkedin.com', 'intitle:CEO', 'inurl:about'])"),
              maxPages: z.number().optional().default(3).describe("Number of search result pages to crawl (1-4, default: 3)"),
            }),
            execute: async ({ query, dorks, maxPages = 3 }) => {
              console.log(`🚀 Tool called with query: "${query}", dorks: [${dorks.join(", ")}], pages: ${maxPages}`);
              try {
                console.log(`🔍 Starting crawl with query: "${query}", dorks: [${dorks.join(", ")}], pages: ${maxPages}`);
                
                const results = await crawlWithDorks(query, dorks, maxPages);
                console.log(`✅ Crawl completed, formatting results`);
                const formattedResults = formatCrawlResults(results);
                console.log(`📝 Results formatted, length: ${formattedResults.length} chars`);
                
                return formattedResults;
              } catch (error) {
                console.error("❌ Crawler error:", error);
                return `❌ Failed to execute crawl: ${error instanceof Error ? error.message : 'Unknown error'}. Please try with different search terms or dorks.`;
              }
            },
          }),
        },
        onError: (error) => {
          console.error("❌ Error in crawler request:", error);
            data.append(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        },
        onFinish: async (completion) => {
          console.log("🏁 Stream completed, processing results");
          try {
            if (completion.toolResults && completion.toolResults.length > 0) {
              console.log(`🔧 Found ${completion.toolResults.length} tool results`);
              // Append the most recent tool result
              const latestResult = completion.toolResults[completion.toolResults.length - 1];
              if (latestResult.result) {
                console.log(`📤 Appending result to stream, length: ${latestResult.result.length} chars`);
                data.append(latestResult.result);
              } else {
                console.log(`⚠️ No result found in the latest tool result`);
                data.append("No search results were found. Please try with different search terms.");
              }
            } else {
              console.log(`⚠️ No tool results found in completion`);
              data.append("No search results were found. Please try with different search terms.");
            }
          } catch (error) {
            console.error("❌ Error in onFinish:", error);
          } finally {
            console.log("🔒 Closing data stream");
            await data.close();
          }
        },
      });

      console.log("📤 Returning stream response");
      // Create a combined stream that includes both AI text and tool results
      const combinedStream = new ReadableStream({
        async start(controller) {
          // Set up a reader for the AI text stream
          const reader = result.textStream.getReader();
          
          try {
            // Process the text stream
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
            }
          } catch (error) {
            console.error("❌ Error reading text stream:", error);
            controller.error(error);
          } finally {
            controller.close();
          }
        }
      });
      
      return new Response(combinedStream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("❌ Error processing Google Dork request:", error);
      // Make sure to close the stream before returning an error response
      await data.close();
      return Response.json(
        { 
          error: "Failed to process search request", 
          details: error instanceof Error ? error.message : "Unknown error" 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Unhandled error in route handler:", error);
    return Response.json(
      { 
        error: "Unhandled error in route handler", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}