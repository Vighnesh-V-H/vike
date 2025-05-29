import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Lead } from "@/lib/types/lead";
import { delay } from "@/lib/utils";
import * as cheerio from "cheerio";
import { URL } from "url";

// Add stealth plugin to avoid detection
//puppeteer.use(StealthPlugin());

// Cache for browsers to avoid multiple launches
let browserInstance: any = null;

/**
 * Initialize the browser if not already done
 */
async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: "shell",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
      ],
    });
  }
  return browserInstance;
}

/**
 * Close the browser instance if it exists
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Generate Google dork queries based on industry and location
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
 * Extract URLs from Google search results using Puppeteer
 */
async function searchDorkQuery(
  query: string,
  maxResults: number = 10
): Promise<string[]> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set user agent and viewport
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1366, height: 768 });

    // Navigate to Google search
    await page.goto("https://www.google.com");

    // Check for and accept consent if needed
    try {
      // Check for consent dialog
      const consentButton = await page.$(
        'button[id="L2AGLb"], button[id="W0wltc"]'
      );
      if (consentButton) {
        await consentButton.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });
      }
    } catch (e) {
      console.log("No consent needed or already accepted");
    }

    // Type the search query
    await page.type('input[name="q"]', query);

    // Submit the search
    await Promise.all([
      page.keyboard.press("Enter"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    // Extract search result URLs
    const urls = await page.evaluate((maxResults) => {
      const links: string[] = [];
      const resultElements = document.querySelectorAll('div.g a[href^="http"]');

      for (const element of resultElements) {
        const href = element.getAttribute("href");
        if (
          href &&
          !href.includes("google.com") &&
          !href.includes("/search?") &&
          !links.includes(href)
        ) {
          links.push(href);
          if (links.length >= maxResults) break;
        }
      }

      return links;
    }, maxResults);

    return urls;
  } catch (error) {
    console.error(`Error searching dork query "${query}":`, error);
    return [];
  } finally {
    await page.close();
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsedUrl.hostname;
  } catch (e) {
    return url;
  }
}

/**
 * Extract email addresses from text
 */
function extractEmails(text: string): string[] {
  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}/g;
  return Array.from(new Set(text.match(emailRegex) || []));
}

/**
 * Extract phone numbers from text
 */
function extractPhoneNumbers(text: string): string[] {
  // Various phone number formats
  const phoneRegexes = [
    /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}/g, // International format
    /\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}/g, // (123) 456-7890
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g, // 123-456-7890
  ];

  const phones: string[] = [];
  for (const regex of phoneRegexes) {
    const matches = text.match(regex) || [];
    phones.push(...matches);
  }

  return Array.from(new Set(phones));
}

/**
 * Scrape a single website for lead information using Puppeteer
 */
async function scrapeWebsiteWithPuppeteer(url: string): Promise<Partial<Lead>> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Normalize URL
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  try {
    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set timeout
    await page.setDefaultNavigationTimeout(30000);

    // Block images and unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (
        resourceType === "image" ||
        resourceType === "media" ||
        resourceType === "font"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Navigate to the URL
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Wait for content to load
    await page.waitForSelector("body", { timeout: 5000 }).catch(() => {});

    // Get page content
    const pageContent = await page.content();
    const $ = cheerio.load(pageContent);

    // Extract lead information
    const company =
      $("title").text().trim() ||
      $('meta[property="og:site_name"]').attr("content") ||
      extractDomain(url);

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Extract all page text for email and phone extraction
    const pageText = await page.evaluate(() => document.body.innerText);

    // Find contact information
    const emails = extractEmails(pageText);
    const phones = extractPhoneNumbers(pageText);

    // Extract LinkedIn URL
    const linkedinUrl = await page.evaluate(() => {
      const linkedinLinks = Array.from(
        document.querySelectorAll('a[href*="linkedin.com"]')
      );
      for (const link of linkedinLinks) {
        const href = link.getAttribute("href");
        if (href && href.includes("linkedin.com/company")) {
          return href;
        }
      }
      return null;
    });

    // Look for location information
    const location = await page.evaluate(() => {
      for (const selector of [
        ".address",
        ".location",
        "address",
        ".contact-info",
        '[itemtype*="PostalAddress"]',
      ]) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return element.textContent.trim();
        }
      }
      return "";
    });

    // Try to find executive/team information
    let nameAndPosition = await page.evaluate(() => {
      for (const selector of [
        ".team",
        ".executives",
        ".leadership",
        ".management",
        "#team",
        "#leadership",
      ]) {
        const element = document.querySelector(selector);
        if (element) {
          // Look for titles that might indicate executives
          const titleElements = element.querySelectorAll(
            "h3, h4, h5, .title, .position"
          );
          for (const titleEl of titleElements) {
            const text = titleEl.textContent?.toLowerCase() || "";
            if (
              text.includes("ceo") ||
              text.includes("founder") ||
              text.includes("director") ||
              text.includes("president")
            ) {
              const position = titleEl.textContent?.trim() || "";
              // Try to find the name
              const nameEl = titleEl.previousElementSibling;
              const name = nameEl?.textContent?.trim() || "";
              if (name) {
                return { name, position };
              }
            }
          }
        }
      }
      return { name: "", position: "" };
    });

    // Check for contact page
    const contactLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="contact"]'))
        .map((a) => a.getAttribute("href"))
        .filter(
          (href) =>
            href &&
            (href.includes("/contact") ||
              href.includes("contact.") ||
              href.includes("contact-"))
        )
        .map((href) => href || "");
    });

    // If contact page exists, visit it to get more information
    if (contactLinks.length > 0) {
      const contactUrl = new URL(contactLinks[0], url).toString();

      try {
        await page.goto(contactUrl, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("body", { timeout: 5000 }).catch(() => {});

        // Get additional contact info
        const contactPageText = await page.evaluate(
          () => document.body.innerText
        );

        // Add new emails and phones
        emails.push(...extractEmails(contactPageText));
        phones.push(...extractPhoneNumbers(contactPageText));
      } catch (e) {
        console.warn(`Error scraping contact page for ${url}:`, e);
      }
    }

    // Prepare contactInfo object
    const contactInfo: Lead["contactInfo"] = {};
    if (emails.length > 0) contactInfo.email = emails[0];
    if (phones.length > 0) contactInfo.phone = phones[0];
    if (linkedinUrl) contactInfo.linkedin = linkedinUrl;

    return {
      company,
      description: description.trim(),
      website: url,
      location: location || undefined,
      contactInfo:
        Object.keys(contactInfo).length > 0 ? contactInfo : undefined,
      name: nameAndPosition.name || undefined,
      position: nameAndPosition.position || undefined,
    };
  } catch (error) {
    console.error(`Error scraping website ${url}:`, error);
    return { website: url, company: extractDomain(url) };
  } finally {
    await page.close();
  }
}

/**
 * Main function to scrape leads using puppeteer and dorks
 */
export async function scrapeDorkLeadsWithPuppeteer({
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
    `Starting puppeteer-based dork scraping for ${industry} ${location || ""}`
  );

  try {
    // Generate dork queries
    const dorkQueries = generateDorkQueries(industry, location);
    console.log(`Generated ${dorkQueries.length} dork queries`);

    // Search for results using the first few dork queries (to avoid excessive searches)
    const allUrls = new Set<string>();

    for (const query of dorkQueries.slice(0, 3)) {
      console.log(`Searching for: ${query}`);
      const urls = await searchDorkQuery(query, Math.ceil(maxResults / 2));

      // Add new URLs to the set
      for (const url of urls) {
        allUrls.add(url);
        if (allUrls.size >= maxResults * 2) break; // Get 2x URLs as needed to account for failures
      }

      if (allUrls.size >= maxResults * 2) break;

      // Add delay between searches to avoid detection
      await delay(3000);
    }

    console.log(`Found ${allUrls.size} URLs to scrape`);

    // Convert Set to Array and limit to maxResults * 2
    const urlsToScrape = Array.from(allUrls).slice(0, maxResults * 2);

    // Scrape each website
    const leads: Lead[] = [];

    for (let i = 0; i < urlsToScrape.length; i++) {
      const url = urlsToScrape[i];

      // Add delay between scrapes
      if (i > 0) await delay(2000);

      console.log(`Scraping website ${i + 1}/${urlsToScrape.length}: ${url}`);

      const leadInfo = await scrapeWebsiteWithPuppeteer(url);

      // Skip if we couldn't get basic company info
      if (!leadInfo.company) continue;

      leads.push({
        id: `puppeteer-lead-${i + 1}`,
        company: leadInfo.company,
        description:
          leadInfo.description || `A company in the ${industry} industry`,
        website: leadInfo.website,
        industry,
        location: leadInfo.location || location || "Unknown",
        contactInfo: includeContactInfo ? leadInfo.contactInfo : undefined,
        name: leadInfo.name || undefined,
        position: leadInfo.position || undefined,
      });

      // Stop if we have enough leads
      if (leads.length >= maxResults) break;
    }

    // Filter by keywords if provided
    let filteredLeads = leads;
    if (keywords && keywords.length > 0) {
      filteredLeads = leads.filter((lead) => {
        const text =
          `${lead.company} ${lead.description} ${lead.industry} ${lead.location}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
      });
    }

    console.log(`Finished scraping. Found ${filteredLeads.length} leads.`);

    // Return leads limited to maxResults
    return filteredLeads.slice(0, maxResults);
  } catch (error) {
    console.error("Error in puppeteer-based dork scraping:", error);
    return [];
  }
}
