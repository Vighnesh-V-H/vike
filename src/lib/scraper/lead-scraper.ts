import axios from "axios";
import * as cheerio from "cheerio";
import robotsParser from "robots-parser";
import { URL } from "url";
import { Lead } from "@/lib/types/lead";
import { delay } from "@/lib/utils";

// Lead type definition if not already defined in the types
// export type Lead = {
//   id: string;
//   name?: string;
//   company?: string;
//   position?: string;
//   contactInfo?: {
//     email?: string;
//     phone?: string;
//     linkedin?: string;
//   };
//   website?: string;
//   description?: string;
//   industry?: string;
//   location?: string;
// };

// Cache for robots.txt files to avoid repeated fetching
const robotsCache = new Map<string, any>();

/**
 * Gets the robots.txt content for a domain and parses it
 * @param domain The domain to get robots.txt for
 * @returns Parsed robots.txt or null if not available
 */
async function getRobotsParser(domain: string): Promise<any> {
  // Check cache first
  if (robotsCache.has(domain)) {
    return robotsCache.get(domain);
  }

  try {
    // Construct robots.txt URL
    const robotsUrl = `https://${domain}/robots.txt`;

    // Fetch robots.txt content
    const response = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: {
        "User-Agent":
          "Vike Lead Scraper Bot/1.0 (https://example.com/bot; bot@example.com)",
      },
    });

    // Parse robots.txt content
    const parser = robotsParser(robotsUrl, response.data);

    // Cache the parser
    robotsCache.set(domain, parser);

    return parser;
  } catch (error) {
    console.warn(`Could not fetch robots.txt for ${domain}:`, error);

    // Cache a dummy permissive parser to avoid repeated failures
    const dummyParser = robotsParser("", "");
    robotsCache.set(domain, dummyParser);

    return dummyParser;
  }
}

/**
 * Checks if scraping a URL is allowed by robots.txt
 * @param url The URL to check
 * @returns Boolean indicating if scraping is allowed
 */
async function isScrapingAllowed(url: string): Promise<boolean> {
  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    const robotsParser = await getRobotsParser(domain);

    // Check if the URL is allowed to be scraped by our bot
    return robotsParser.isAllowed(url, "Vike Lead Scraper Bot/1.0");
  } catch (error) {
    console.error("Error checking robots.txt:", error);
    // Default to not allowed in case of error
    return false;
  }
}

/**
 * Extracts an email address from text using regex
 * @param text The text to extract email from
 * @returns Extracted email or null
 */
function extractEmail(text: string): string | null {
  // Basic email regex - could be improved for better matching
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

/**
 * Generates Google dork queries based on industry and location
 * @param industry The target industry
 * @param location Optional location
 * @returns Array of dork queries
 */
function generateDorkQueries(industry: string, location?: string): string[] {
  const baseQueries = [
    // Company directory dorks
    `"${industry} companies" "contact us" ${location || ""}`,
    `"${industry} businesses" "email us" ${location || ""}`,
    `"${industry} providers" inurl:contact ${location || ""}`,

    // Contact information dorks
    `"${industry}" intitle:"contact us" intext:"email" ${location || ""}`,
    `"${industry}" intitle:"meet the team" ${location || ""}`,
    `"${industry}" "mailto:" ${location || ""}`,

    // Job title specific dorks
    `"${industry}" intitle:CEO OR intitle:founder OR intitle:director ${
      location || ""
    }`,

    // Business listing dorks
    `"${industry}" site:linkedin.com/company ${location || ""}`,
    `"${industry}" site:crunchbase.com/organization ${location || ""}`,

    // Phone and email pattern dorks
    `"${industry}" intext:"@" intext:".com" ${location || ""}`,
    `"${industry}" intext:phone OR intext:tel OR intext:call ${location || ""}`,
  ];

  // Filter out any empty queries that might result from no location
  return baseQueries.filter((query) => query.trim() !== "");
}

/**
 * Extract URLs from search results
 * @param html The search results HTML
 * @returns Array of extracted URLs
 */
function extractUrlsFromSearchResults(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];

  // This selector would need to be adapted to the actual search engine being used
  // For a real implementation, you would need to adapt this to Google's HTML structure
  // or use a search API
  $("a.result-link").each((_, element) => {
    const url = $(element).attr("href");
    if (url && !url.includes("google.com") && !url.includes("bing.com")) {
      urls.push(url);
    }
  });

  // Simulated URLs for demonstration purposes
  if (urls.length === 0) {
    return [
      "example.com",
      "acme-industry.com",
      "globaltech.io",
      "innovativesolutions.co",
      "apex-group.com",
      "futuretech.net",
      "smartsystems.org",
      "brilliantpartners.com",
      "nexttechnology.biz",
      "peaksolutions.co",
    ];
  }

  return urls;
}

/**
 * Extract phone numbers using regex
 * @param text The text to extract from
 * @returns Extracted phone number or null
 */
function extractPhoneNumber(text: string): string | null {
  // Various phone number formats
  const phoneRegexes = [
    /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g, // International format
    /\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}/g, // (123) 456-7890
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // 123-456-7890
  ];

  for (const regex of phoneRegexes) {
    const match = text.match(regex);
    if (match) return match[0];
  }

  return null;
}

/**
 * Performs search using dork queries to find target websites
 * @param industry Target industry
 * @param location Optional location
 * @param maxResults Maximum number of results to return
 * @returns Array of URLs to scrape
 */
async function performDorkSearch(
  industry: string,
  location?: string,
  maxResults = 20
): Promise<string[]> {
  const dorkQueries = generateDorkQueries(industry, location);
  console.log(
    `Generated ${dorkQueries.length} dork queries for ${industry} ${
      location || ""
    }`
  );

  // In a production environment, you would integrate with a search API
  // For example, SerpAPI, Google Custom Search API, or Bing Search API
  // Here we'll simulate the search results

  // Normally you would make API requests like:
  // const results = await axios.get('https://serpapi.com/search', {
  //   params: { q: dorkQueries[0], api_key: process.env.SERP_API_KEY }
  // });

  // Instead, we'll simulate results with our mock data
  console.log("Performing dork searches to find target websites...");
  await delay(2000); // Simulate API delay

  // Combine the URLs found from all dork queries (with de-duplication)
  const allUrls = new Set<string>();

  // In a real implementation, you would loop through each dork query
  // and make actual search requests
  for (const query of dorkQueries.slice(0, 3)) {
    // Limit to 3 queries for demonstration
    console.log(`Searching with query: ${query}`);
    await delay(1000); // Rate limiting

    // Simulate search results
    const mockHtml =
      "<html><body><div class='results'>Simulated search results</div></body></html>";
    const urls = extractUrlsFromSearchResults(mockHtml);

    for (const url of urls) {
      allUrls.add(url);
      if (allUrls.size >= maxResults) break;
    }

    if (allUrls.size >= maxResults) break;
  }

  return Array.from(allUrls).slice(0, maxResults);
}

/**
 * Enhanced company website scraper that extracts more contact details
 * @param url The company website URL to scrape
 * @returns Lead information extracted from the website
 */
async function scrapeCompanyWebsiteEnhanced(
  url: string
): Promise<Partial<Lead>> {
  // Normalize URL
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  try {
    // Check robots.txt first
    const allowed = await isScrapingAllowed(url);
    if (!allowed) {
      console.log(`Scraping not allowed for ${url} according to robots.txt`);
      return { website: url };
    }

    // Fetch the website content
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Vike Lead Scraper Bot/1.0 (https://example.com/bot; bot@example.com)",
      },
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Extract company name
    let company = $("title").text().trim();

    // Try to find better company name in metadata or common elements
    const metaCompany =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="application-name"]').attr("content");

    if (metaCompany) {
      company = metaCompany;
    }

    // Extract description
    let description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Clean up description
    description = description.trim();

    // Look for contact information
    const contactInfo: Lead["contactInfo"] = {};

    // Find emails on the page
    const pageText = $("body").text();
    const email = extractEmail(pageText);
    if (email) {
      contactInfo.email = email;
    }

    // Find phone numbers
    const phone = extractPhoneNumber(pageText);
    if (phone) {
      contactInfo.phone = phone;
    }

    // Look for LinkedIn links
    $('a[href*="linkedin.com"]').each((_, element) => {
      const href = $(element).attr("href");
      if (href && href.includes("linkedin.com")) {
        contactInfo.linkedin = href;
      }
    });

    // Look for contact pages for additional scraping
    let contactPageUrl = "";
    $('a[href*="contact"]').each((_, element) => {
      const href = $(element).attr("href");
      if (
        href &&
        (href.includes("/contact") ||
          href.includes("contact.") ||
          href.includes("contact-"))
      ) {
        contactPageUrl = href.startsWith("http")
          ? href
          : new URL(href, url).toString();
      }
    });

    // If contact page found, scrape it for additional info
    if (contactPageUrl && contactPageUrl !== url) {
      try {
        console.log(`Scraping contact page: ${contactPageUrl}`);
        const contactResponse = await axios.get(contactPageUrl, {
          timeout: 8000,
          headers: {
            "User-Agent":
              "Vike Lead Scraper Bot/1.0 (https://example.com/bot; bot@example.com)",
          },
        });

        const contact$ = cheerio.load(contactResponse.data);
        const contactPageText = contact$("body").text();

        // Look for additional contact info on contact page
        if (!contactInfo.email) {
          const contactEmail = extractEmail(contactPageText);
          if (contactEmail) contactInfo.email = contactEmail;
        }

        if (!contactInfo.phone) {
          const contactPhone = extractPhoneNumber(contactPageText);
          if (contactPhone) contactInfo.phone = contactPhone;
        }
      } catch (error) {
        console.warn(`Error scraping contact page ${contactPageUrl}:`, error);
      }
    }

    // Extract location from common patterns
    const locationElements = [
      $(".address"),
      $(".location"),
      $('[itemtype*="PostalAddress"]'),
      $("footer address"),
      $("footer .address"),
      $(".contact address"),
      $(".contact .address"),
    ];

    let location = "";
    for (const element of locationElements) {
      if (element.length > 0) {
        location = element.text().trim();
        if (location) break;
      }
    }

    // Look for executive/team information
    let teamInfo = extractTeamInfo($);

    return {
      company,
      description,
      website: url,
      contactInfo:
        Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
      location: location || undefined,
      ...teamInfo,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { website: url };
  }
}

/**
 * Extract team information from the website
 * @param $ Cheerio instance
 * @returns Team member information if found
 */
function extractTeamInfo($: cheerio.CheerioAPI): Partial<Lead> {
  // Look for common team page patterns
  const teamSelectors = [
    ".team",
    ".executives",
    ".leadership",
    ".management",
    "#team",
    "#leadership",
    "[class*='team']",
    "[class*='executive']",
  ];

  for (const selector of teamSelectors) {
    const teamSection = $(selector);
    if (teamSection.length > 0) {
      // Look for CEO, founder, or director
      const executives = teamSection
        .find("h3, h4, h5, .title, .position")
        .filter((_, el) => {
          const text = $(el).text().toLowerCase();
          return (
            text.includes("ceo") ||
            text.includes("founder") ||
            text.includes("director") ||
            text.includes("president") ||
            text.includes("chief")
          );
        });

      if (executives.length > 0) {
        const positionEl = executives.first();
        const position = positionEl.text().trim();

        // Try to find the name, usually in a heading element near the position
        let name = "";
        const nameEl = positionEl.prev("h2, h3, h4, .name, .person");
        if (nameEl.length > 0) {
          name = nameEl.text().trim();
        } else {
          // Try parent element approach
          const parentEl = positionEl.parent();
          const possibleName = parentEl
            .find("h2, h3, h4, .name, .person")
            .first()
            .text()
            .trim();
          if (possibleName) name = possibleName;
        }

        if (name && position) {
          return { name, position };
        }
      }
    }
  }

  return {};
}

/**
 * Enhanced lead scraper using dork-based search approach
 * @param params Parameters for lead scraping
 * @returns Array of leads
 */
export async function scrapeDorkLeads({
  industry,
  location,
  keywords,
  maxResults = 10,
  includeContactInfo = true,
}: {
  industry: string;
  location?: string;
  keywords?: string[];
  maxResults?: number;
  includeContactInfo?: boolean;
}): Promise<Lead[]> {
  console.log(
    `Scraping leads for ${industry} industry${
      location ? ` in ${location}` : ""
    } using dork-based approach`
  );

  try {
    // Step 1: Generate and perform dork queries to find relevant websites
    const targetUrls = await performDorkSearch(industry, location, maxResults);
    console.log(`Found ${targetUrls.length} target websites to scrape`);

    // Step 2: Scrape each website for lead information
    const leads: Lead[] = [];

    for (let i = 0; i < targetUrls.length; i++) {
      const url = targetUrls[i];

      // Respect rate limiting with a delay between requests
      if (i > 0) {
        await delay(1500); // 1.5 second delay between requests
      }

      console.log(`Scraping website ${i + 1}/${targetUrls.length}: ${url}`);
      const companyInfo = await scrapeCompanyWebsiteEnhanced(url);

      leads.push({
        id: `dork-lead-${i + 1}`,
        company: companyInfo.company || `Company ${i + 1}`,
        description:
          companyInfo.description || `A company in the ${industry} industry`,
        website: companyInfo.website,
        industry,
        location: companyInfo.location || location || "Unknown",
        contactInfo: companyInfo.contactInfo,
        name: companyInfo.name || `Contact Person ${i + 1}`,
        position:
          companyInfo.position ||
          ["CEO", "Founder", "Director", "Manager"][i % 4],
      });
    }

    // Step 3: Filter results if keywords provided
    let filteredLeads = leads;
    if (keywords && keywords.length > 0) {
      filteredLeads = leads.filter((lead) => {
        const text =
          `${lead.company} ${lead.description} ${lead.industry} ${lead.location}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
      });
    }

    // Remove contact info if not requested
    if (!includeContactInfo) {
      filteredLeads = filteredLeads.map((lead) => ({
        ...lead,
        contactInfo: undefined,
      }));
    }

    // Return the leads, limited to maxResults
    return filteredLeads.slice(0, maxResults);
  } catch (error) {
    console.error("Error in scrapeDorkLeads:", error);
    return [];
  }
}

// Export the new dork-based scraping function
export async function testDorkScraper(
  industry: string,
  location?: string,
  maxResults = 5
): Promise<Lead[]> {
  return scrapeDorkLeads({
    industry,
    location,
    maxResults,
    includeContactInfo: true,
  });
}

/**
 * Scrapes company listings from an industry directory
 * @param industry The industry to search for
 * @param location Optional location to filter by
 * @param maxResults Maximum number of results to return
 * @returns Array of lead objects
 */
export async function scrapeIndustryDirectory(
  industry: string,
  location?: string,
  maxResults = 10
): Promise<Lead[]> {
  // For demonstration, we'll show how to scrape from a hypothetical business directory
  // In a real implementation, you would target actual directories like Yelp, Yellow Pages, etc.

  try {
    // Example search URL (in a real implementation, use an actual directory)
    // Modify this to target real directories based on the industry
    const searchUrl = `https://example-business-directory.com/search?industry=${encodeURIComponent(
      industry
    )}${location ? `&location=${encodeURIComponent(location)}` : ""}`;

    // Check if we're allowed to scrape this URL
    const allowed = await isScrapingAllowed(searchUrl);
    if (!allowed) {
      console.log(
        `Scraping not allowed for ${searchUrl} according to robots.txt`
      );
      return [];
    }

    // In a real implementation, fetch and parse the directory page
    // For this demo, we'll simulate finding company websites
    const mockCompanyWebsites = [
      "example.com",
      "acme-industry.com",
      "globaltech.io",
      "innovativesolutions.co",
      "apex-group.com",
      "futuretech.net",
      "smartsystems.org",
      "brilliantpartners.com",
      "nexttechnology.biz",
      "peaksolutions.co",
    ];

    // Limit to maxResults
    const websitesToScrape = mockCompanyWebsites.slice(0, maxResults);

    // Process each company website to extract lead information
    const leads: Lead[] = [];

    for (let i = 0; i < websitesToScrape.length; i++) {
      const website = websitesToScrape[i];

      // Respect rate limiting with a delay between requests
      if (i > 0) {
        await delay(1000); // 1 second delay between requests
      }

      // Use the enhanced scraper for better results
      const companyInfo = await scrapeCompanyWebsiteEnhanced(website);

      leads.push({
        id: `scraped-lead-${i + 1}`,
        company: companyInfo.company || `Company ${i + 1}`,
        description:
          companyInfo.description || `A company in the ${industry} industry`,
        website: companyInfo.website,
        industry,
        location: companyInfo.location || location || "Unknown",
        contactInfo: companyInfo.contactInfo,
        // Use extracted name/position if available
        name: companyInfo.name || `Contact Person ${i + 1}`,
        position:
          companyInfo.position ||
          ["CEO", "Founder", "Director", "Manager"][i % 4],
      });
    }

    return leads;
  } catch (error) {
    console.error("Error scraping industry directory:", error);
    return [];
  }
}

/**
 * Master function to scrape leads based on criteria (original approach)
 * @param params Parameters for lead scraping
 * @returns Array of leads
 */
export async function scrapeLeads({
  industry,
  location,
  keywords,
  maxResults = 10,
  includeContactInfo = true,
  useDorkMethod = false,
}: {
  industry: string;
  location?: string;
  keywords?: string[];
  maxResults?: number;
  includeContactInfo?: boolean;
  useDorkMethod?: boolean;
}): Promise<Lead[]> {
  // If the dork method is requested, use that instead
  if (useDorkMethod) {
    return scrapeDorkLeads({
      industry,
      location,
      keywords,
      maxResults,
      includeContactInfo,
    });
  }

  console.log(
    `Scraping leads for ${industry} industry${
      location ? ` in ${location}` : ""
    }`
  );

  try {
    // Scrape leads from industry directory
    const leads = await scrapeIndustryDirectory(industry, location, maxResults);

    // If keywords are provided, filter the results
    let filteredLeads = leads;
    if (keywords && keywords.length > 0) {
      filteredLeads = leads.filter((lead) => {
        const text =
          `${lead.company} ${lead.description} ${lead.industry} ${lead.location}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
      });
    }

    // Remove contact info if not requested
    if (!includeContactInfo) {
      filteredLeads = filteredLeads.map((lead) => ({
        ...lead,
        contactInfo: undefined,
      }));
    }

    // Return the leads, limited to maxResults
    return filteredLeads.slice(0, maxResults);
  } catch (error) {
    console.error("Error in scrapeLeads:", error);
    return [];
  }
}

// Export a simplified interface for testing
export async function testScraper(
  industry: string,
  location?: string,
  maxResults = 5
): Promise<Lead[]> {
  return scrapeLeads({
    industry,
    location,
    maxResults,
    includeContactInfo: true,
  });
}
