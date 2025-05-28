import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";

interface CrawlerOptions {
  maxConcurrency?: number;
  delay?: number;
  timeout?: number;
  maxRetries?: number;
  googleDelay?: number;
  maxPages?: number;
  userAgentRotation?: boolean;
  extractStructuredData?: boolean;
  batchSize?: number;
  batchDelay?: number;
  maxBatches?: number;
}

interface SearchResult {
  position: number;
  title: string;
  url: string;
  displayUrl: string;
  snippet: string;
  timestamp: string;
  dorkUsed?: string;
}

interface CrawlResult {
  url: string;
  title: string;
  domain: string;
  timestamp: string;
  content: {
    rawText: string;
    structuredText: StructuredTextData;
    cleanText: string;
  };
  success: boolean;
  error?: string;
  batchId?: string;
  dorkUsed?: string;
}

interface StructuredTextData {
  headings: string[];
  paragraphs: string[];
  contactSections: string[];
  businessInfo: string[];
  addresses: string[];
  socialLinks: string[];
  allText: string;
}

interface BatchResult {
  batchId: string;
  urls: string[];
  results: CrawlResult[];
  startTime: string;
  endTime: string;
  duration: number;
  successCount: number;
  failureCount: number;
  dorkUsed?: string;
}

interface DorkResults {
  dork: string;
  searchResults: SearchResult[];
  crawledResults: CrawlResult[];
  batches: BatchResult[];
  successfulCrawls: number;
  totalResults: number;
  summary: string;
}

interface CrawlResponse {
  query: string;
  dorkResults: DorkResults[];
  combinedResults: {
    allSearchResults: SearchResult[];
    allCrawledData: Array<{
      url: string;
      domain: string;
      title: string;
      text: string;
      structuredData: StructuredTextData;
      batchId?: string;
      dorkUsed?: string;
    }>;
    allText: string;
  };
  stats: {
    totalSearchResults: number;
    totalCrawled: number;
    successfulCrawls: number;
    failedCrawls: number;
    uniqueDomains: number;
    totalBatches: number;
    averageBatchTime: number;
    dorksProcessed: number;
  };
  summary: string;
}

export class AIAgentCrawler {
  private options: CrawlerOptions;
  private browser: Browser | null = null;
  private queue: Array<{ url: string; retries: number; batchId?: string; dorkUsed?: string }> = [];
  private visited = new Set<string>();
  private results: CrawlResult[] = [];
  private searchResults: SearchResult[] = [];
  private batches: BatchResult[] = [];
  private currentBatchId = 0;

  private userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  constructor(options: CrawlerOptions = {}) {
    this.options = {
      maxConcurrency: 3,
      delay: 1500,
      timeout: 25000,
      maxRetries: 2,
      googleDelay: 2000,
      maxPages: 3,
      userAgentRotation: true,
      extractStructuredData: true,
      batchSize: 8, // Process URLs in batches of 8
      batchDelay: 3000, // 3 second delay between batches
      maxBatches: 20, // Maximum number of batches to process
      ...options,
    };
  }

  async init(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-web-security",
          "--disable-blink-features=AutomationControlled",
          "--disable-features=VizDisplayCompositor",
        ],
      });

      console.log("✅ AI Agent Crawler initialized successfully");
    } catch (error) {
      console.error(
        "❌ Failed to initialize crawler:",
        (error as Error).message
      );
      throw error;
    }
  }

  /**
   * Main method to search with Google dorks and return structured results as string
   */
  async searchAndCrawlWithDorks(
    query: string,
    dorks: string[] = [],
    maxPages: number = 3
  ): Promise<CrawlResponse> {
    if (!this.browser) await this.init();

    console.log(`🔍 Starting batch crawl with query: "${query}"`);
    console.log(`🎯 Processing ${dorks.length} dorks with batch processing`);
    console.log(`📄 Will crawl up to ${maxPages} pages per dork`);

    // Reset state
    this.resetState();

    const dorkResults: DorkResults[] = [];
    const allSearchResults: SearchResult[] = [];
    const allCrawledData: CrawlResult[] = [];

    try {
      // Process each dork separately for better organization
      for (let i = 0; i < dorks.length; i++) {
        const dork = dorks[i];
        console.log(`\n🚀 Processing dork ${i + 1}/${dorks.length}: "${dork}"`);
        
        // Reset for each dork
        this.resetStateForNewDork();
        
        const dorkResult = await this.processSingleDork(query, dork, maxPages);
        dorkResults.push(dorkResult);
        
        // Collect all results
        allSearchResults.push(...dorkResult.searchResults);
        allCrawledData.push(...dorkResult.crawledResults);
        
        // Delay between dorks to avoid rate limiting
        if (i < dorks.length - 1) {
          console.log(`⏳ Waiting ${this.options.googleDelay! / 1000}s before next dork...`);
          await this.sleep(this.options.googleDelay!);
        }
      }

      // Generate final response
      const response = this.generateFinalResponse(query, dorkResults, allSearchResults, allCrawledData);
      
      console.log(`✅ Batch crawling completed successfully!`);
      console.log(`📊 Final Stats: ${response.stats.successfulCrawls} successful crawls from ${response.stats.totalSearchResults} search results across ${response.stats.dorksProcessed} dorks`);
      
      return response;
    } catch (error) {
      console.error("❌ Batch crawling failed:", (error as Error).message);
      throw error;
    }
  }

  private async processSingleDork(query: string, dork: string, maxPages: number): Promise<DorkResults> {
    const searchQuery = `${query} ${dork}`;
    const dorkSearchResults: SearchResult[] = [];
    
    // Search with the dork
    for (let page = 0; page < maxPages; page++) {
      const startIndex = page * 10;
      const pageResults = await this.performGoogleSearch(searchQuery, startIndex, dork);
      dorkSearchResults.push(...pageResults);
      
      if (page < maxPages - 1) {
        await this.sleep(this.options.googleDelay!);
      }
    }

    console.log(`📄 Found ${dorkSearchResults.length} search results for dork: "${dork}"`);

    // Extract URLs for batch crawling
    const urls = dorkSearchResults
      .map(result => result.url)
      .filter(url => url && this.isValidUrl(url));

    console.log(`🎯 Found ${urls.length} valid URLs to crawl for dork: "${dork}"`);

    // Batch crawl the URLs
    const crawledResults = await this.batchCrawlUrls(urls, dork);

    // Generate summary for this dork
    const summary = this.generateDorkSummary(dork, dorkSearchResults.length, crawledResults.length);

    return {
      dork,
      searchResults: dorkSearchResults,
      crawledResults,
      batches: this.batches.filter(b => b.dorkUsed === dork),
      successfulCrawls: crawledResults.filter(r => r.success).length,
      totalResults: dorkSearchResults.length,
      summary
    };
  }

  private async batchCrawlUrls(urls: string[], dorkUsed: string): Promise<CrawlResult[]> {
    if (urls.length === 0) return [];

    const batches = this.createBatches(urls);
    const results: CrawlResult[] = [];

    console.log(`📦 Processing ${batches.length} batches for dork: "${dorkUsed}"`);

    for (let i = 0; i < batches.length && i < this.options.maxBatches!; i++) {
      const batch = batches[i];
      const batchId = `${dorkUsed.replace(/[^a-zA-Z0-9]/g, '_')}_batch_${i + 1}`;
      
      console.log(`🔄 Processing batch ${i + 1}/${Math.min(batches.length, this.options.maxBatches!)} (${batch.length} URLs) for dork: "${dorkUsed}"`);
      
      const batchResults = await this.processBatch(batch, batchId, dorkUsed);
      results.push(...batchResults.results);
      
      // Add batch info
      this.batches.push(batchResults);
      
      // Delay between batches
      if (i < Math.min(batches.length, this.options.maxBatches!) - 1) {
        console.log(`⏳ Batch delay: ${this.options.batchDelay! / 1000}s`);
        await this.sleep(this.options.batchDelay!);
      }
    }

    return results;
  }

  private createBatches(urls: string[]): string[][] {
    const batches: string[][] = [];
    const batchSize = this.options.batchSize!;
    
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private async processBatch(urls: string[], batchId: string, dorkUsed: string): Promise<BatchResult> {
    const startTime = new Date();
    const results: CrawlResult[] = [];
    
    // Create workers for concurrent processing
    const workers = [];
    const queue = urls.map(url => ({ url, retries: 0, batchId, dorkUsed }));
    
    for (let i = 0; i < Math.min(this.options.maxConcurrency!, urls.length); i++) {
      workers.push(this.batchWorker(queue, results, batchId, dorkUsed));
    }
    
    await Promise.all(workers);
    
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    const batchResult: BatchResult = {
      batchId,
      urls,
      results,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      dorkUsed
    };
    
    console.log(`✅ Batch ${batchId} completed: ${batchResult.successCount}/${urls.length} successful (${duration}ms)`);
    
    return batchResult;
  }

  private async batchWorker(
    queue: Array<{ url: string; retries: number; batchId: string; dorkUsed: string }>,
    results: CrawlResult[],
    batchId: string,
    dorkUsed: string
  ): Promise<void> {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item || this.visited.has(item.url)) continue;

      try {
        const result = await this.crawlPage(item.url, item.batchId, item.dorkUsed);
        results.push(result);
        this.visited.add(item.url);
        
        // Small delay between requests
        await this.sleep(this.options.delay!);
      } catch (error) {
        console.error(`❌ Error crawling ${item.url}:`, (error as Error).message);

        if (item.retries < this.options.maxRetries!) {
          item.retries++;
          queue.push(item);
          console.log(`🔄 Retrying ${item.url} (attempt ${item.retries + 1})`);
        } else {
          // Add failed result
          results.push({
            url: item.url,
            title: "",
            domain: new URL(item.url).hostname,
            timestamp: new Date().toISOString(),
            content: {
              rawText: "",
              structuredText: this.createEmptyStructuredData(),
              cleanText: "",
            },
            success: false,
            error: (error as Error).message,
            batchId: item.batchId,
            dorkUsed: item.dorkUsed
          });
        }
      }
    }
  }

  private async performGoogleSearch(
    query: string,
    startIndex: number,
    dorkUsed: string
  ): Promise<SearchResult[]> {
    const page = await this.browser!.newPage();

    try {
      if (this.options.userAgentRotation) {
        const randomUA = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        await page.setUserAgent(randomUA);
      }

      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&start=${startIndex}&hl=en&gl=us`;

      await page.goto(searchUrl, {
        waitUntil: "networkidle2",
        timeout: this.options.timeout,
      });

      await page.waitForSelector("div[data-sokoban-grid]", { timeout: 10000 });

      const results = await page.evaluate((dork) => {
        const searchResults: SearchResult[] = [];
        const resultElements = document.querySelectorAll("div[data-sokoban-grid] > div");

        resultElements.forEach((element, index) => {
          const titleElement = element.querySelector("h3");
          const linkElement = element.querySelector("a");
          const snippetElement = element.querySelector("span[data-st]") || 
                                element.querySelector(".VwiC3b") || 
                                element.querySelector(".s3v9rd");

          if (titleElement && linkElement) {
            const title = titleElement.textContent?.trim() || "";
            const url = linkElement.href || "";
            const snippet = snippetElement?.textContent?.trim() || "";

            if (url && !url.includes("google.com") && !url.includes("youtube.com")) {
              searchResults.push({
                position: index + 1,
                title,
                url,
                displayUrl: url,
                snippet,
                timestamp: new Date().toISOString(),
                dorkUsed: dork
              });
            }
          }
        });

        return searchResults;
      }, dorkUsed);

      return results;
    } catch (error) {
      console.error(`❌ Error during search: ${(error as Error).message}`);
      return [];
    } finally {
      await page.close();
    }
  }

  private async crawlPage(url: string, batchId?: string, dorkUsed?: string): Promise<CrawlResult> {
    const page = await this.browser!.newPage();

    try {
      if (this.options.userAgentRotation) {
        const randomUA = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        await page.setUserAgent(randomUA);
      }

      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: this.options.timeout,
      });

      await this.sleep(1500);

      const content = await page.content();
      const title = await page.title();
      const domain = new URL(url).hostname;

      const extractedContent = this.extractTextContent(content);

      return {
        url,
        title,
        domain,
        timestamp: new Date().toISOString(),
        content: extractedContent,
        success: true,
        batchId,
        dorkUsed
      };
    } catch (error) {
      throw error;
    } finally {
      await page.close();
    }
  }

  private extractTextContent(html: string): {
    rawText: string;
    structuredText: StructuredTextData;
    cleanText: string;
  } {
    const $ = cheerio.load(html);

    $("script, style, nav, header, footer, .cookie, .popup, .modal, .advertisement, .ads").remove();

    const structuredText: StructuredTextData = {
      headings: [],
      paragraphs: [],
      contactSections: [],
      businessInfo: [],
      addresses: [],
      socialLinks: [],
      allText: "",
    };

    // Extract headings
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2) {
        structuredText.headings.push(text);
      }
    });

    // Extract paragraphs
    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) {
        structuredText.paragraphs.push(text);
      }
    });

    // Extract contact sections
    $("div, section, span").each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const fullText = $(el).text().trim();

      if ((text.includes("contact") || text.includes("phone") || text.includes("email") || 
           text.includes("address") || text.includes("call") || text.includes("reach") || 
           text.includes("get in touch")) && fullText.length > 5 && fullText.length < 500) {
        structuredText.contactSections.push(fullText);
      }
    });

    // Extract business information
    $("div, span, p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 10 && text.length < 200 &&
          (text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/) ||
           text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/) ||
           text.match(/\b\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i))) {
        structuredText.businessInfo.push(text);
      }
    });

    // Extract social media links
    $("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();

      if (href.match(/(facebook|twitter|instagram|linkedin|youtube|tiktok)\.com/i)) {
        structuredText.socialLinks.push(`${text}: ${href}`);
      }
    });

    const allText = $.text().replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
    structuredText.allText = allText;

    const cleanText = [
      ...structuredText.headings,
      ...structuredText.paragraphs,
      ...structuredText.contactSections,
      ...structuredText.businessInfo,
    ].join("\n\n");

    return {
      rawText: allText,
      structuredText,
      cleanText: cleanText || allText,
    };
  }

  private generateFinalResponse(
    query: string, 
    dorkResults: DorkResults[], 
    allSearchResults: SearchResult[], 
    allCrawledData: CrawlResult[]
  ): CrawlResponse {
    const successfulCrawls = allCrawledData.filter(r => r.success);
    const uniqueDomains = new Set(allCrawledData.map(r => r.domain)).size;
    const totalBatches = this.batches.length;
    const averageBatchTime = totalBatches > 0 ? 
      this.batches.reduce((sum, b) => sum + b.duration, 0) / totalBatches : 0;

    // Combine all text
    const allText = successfulCrawls
      .map(result => `\n=== ${result.title} (${result.domain}) [${result.dorkUsed}] ===\n${result.content.cleanText}\n${"=".repeat(60)}\n`)
      .join("\n");

    const combinedResults = {
      allSearchResults,
      allCrawledData: successfulCrawls.map(result => ({
        url: result.url,
        domain: result.domain,
        title: result.title,
        text: result.content.cleanText,
        structuredData: result.content.structuredText,
        batchId: result.batchId,
        dorkUsed: result.dorkUsed
      })),
      allText
    };

    const stats = {
      totalSearchResults: allSearchResults.length,
      totalCrawled: allCrawledData.length,
      successfulCrawls: successfulCrawls.length,
      failedCrawls: allCrawledData.length - successfulCrawls.length,
      uniqueDomains,
      totalBatches,
      averageBatchTime: Math.round(averageBatchTime),
      dorksProcessed: dorkResults.length
    };

    const summary = `Batch crawl completed for query "${query}". Processed ${stats.dorksProcessed} dorks, found ${stats.totalSearchResults} search results, successfully crawled ${stats.successfulCrawls} pages from ${stats.uniqueDomains} unique domains across ${stats.totalBatches} batches. Average batch processing time: ${stats.averageBatchTime}ms.`;

    return {
      query,
      dorkResults,
      combinedResults,
      stats,
      summary
    };
  }

  private generateDorkSummary(dork: string, searchResults: number, crawledResults: number): string {
    return `Dork "${dork}": Found ${searchResults} search results, successfully crawled ${crawledResults} pages.`;
  }

  private resetState(): void {
    this.searchResults = [];
    this.results = [];
    this.visited.clear();
    this.queue = [];
    this.batches = [];
    this.currentBatchId = 0;
  }

  private resetStateForNewDork(): void {
    this.searchResults = [];
    this.results = [];
    this.queue = [];
  }

  private createEmptyStructuredData(): StructuredTextData {
    return {
      headings: [],
      paragraphs: [],
      contactSections: [],
      businessInfo: [],
      addresses: [],
      socialLinks: [],
      allText: "",
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      const skipDomains = ["facebook.com", "twitter.com", "instagram.com", "youtube.com"];
      return !skipDomains.some((domain) => hostname.includes(domain));
    } catch {
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log("🔒 Browser closed");
    }
  }

  // Convert response to formatted string
  formatResponseAsString(response: CrawlResponse): string {
    let output = "";
    
    output += `# Batch Crawl Results for: "${response.query}"\n\n`;
    output += `## Summary\n${response.summary}\n\n`;
    
    output += `## Statistics\n`;
    output += `- Dorks Processed: ${response.stats.dorksProcessed}\n`;
    output += `- Total Search Results: ${response.stats.totalSearchResults}\n`;
    output += `- Successful Crawls: ${response.stats.successfulCrawls}\n`;
    output += `- Failed Crawls: ${response.stats.failedCrawls}\n`;
    output += `- Unique Domains: ${response.stats.uniqueDomains}\n`;
    output += `- Total Batches: ${response.stats.totalBatches}\n`;
    output += `- Average Batch Time: ${response.stats.averageBatchTime}ms\n\n`;
    
    output += `## Results by Dork\n\n`;
    
    response.dorkResults.forEach((dorkResult, index) => {
      output += `### ${index + 1}. Dork: "${dorkResult.dork}"\n`;
      output += `${dorkResult.summary}\n\n`;
      
      if (dorkResult.crawledResults.length > 0) {
        output += `#### Crawled Content:\n\n`;
        
        dorkResult.crawledResults
          .filter(result => result.success)
          .slice(0, 5) // Limit to top 5 results per dork
          .forEach((result, resultIndex) => {
            output += `**${resultIndex + 1}. ${result.title}**\n`;
            output += `- Domain: ${result.domain}\n`;
            output += `- URL: ${result.url}\n`;
            output += `- Batch: ${result.batchId}\n\n`;
            
            if (result.content.structuredText.headings.length > 0) {
              output += `Key Headings:\n`;
              result.content.structuredText.headings.slice(0, 3).forEach(heading => {
                output += `- ${heading}\n`;
              });
              output += `\n`;
            }
            
            output += `Content Preview:\n`;
            output += `${result.content.cleanText.substring(0, 400)}${result.content.cleanText.length > 400 ? '...' : ''}\n\n`;
            
            if (result.content.structuredText.contactSections.length > 0) {
              output += `Contact Information:\n`;
              result.content.structuredText.contactSections.slice(0, 2).forEach(contact => {
                output += `- ${contact}\n`;
              });
              output += `\n`;
            }
            
            output += `---\n\n`;
          });
      }
    });
    
    return output;
  }
}

// Main export function that returns formatted string
export async function crawlWithDorks(
  query: string, 
  dorks: string[], 
  maxPages: number = 3
): Promise<string> {
  const crawler = new AIAgentCrawler({
    maxPages,
    delay: 1500,
    googleDelay: 2000,
    batchSize: 8,
    batchDelay: 3000,
    maxBatches: 15
  });

  try {
    const results = await crawler.searchAndCrawlWithDorks(query, dorks, maxPages);
    const formattedString = crawler.formatResponseAsString(results);
    await crawler.close();
    
    return formattedString;
  } catch (error) {
    await crawler.close();
    throw error;
  }
}

export default AIAgentCrawler;