import { auth } from "@/auth";
import { scrapeLeads } from "@/lib/scraper/lead-scraper";
import { scrapeDorkLeadsWithPuppeteer } from "@/lib/scraper/puppeteer-scraper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      industry,
      location,
      keywords,
      maxResults = 10,
      includeContactInfo = true,
      useDorks = false,
      usePuppeteer = false,
    } = body;

    if (!industry) {
      return NextResponse.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    // Log the scraping request
    console.log(
      `User ${session.user.id} requested leads scraping for ${industry} in ${
        location || "any location"
      } using ${
        usePuppeteer
          ? "puppeteer"
          : useDorks
          ? "dork method"
          : "standard method"
      }`
    );

    // Perform the web scraping with proper error handling
    try {
      let leads;

      // If puppeteer is requested, use the puppeteer scraper
      if (usePuppeteer) {
        leads = await scrapeDorkLeadsWithPuppeteer({
          industry,
          location,
          keywords,
          maxResults: Math.min(maxResults, 20),
          includeContactInfo,
        });
      } else {
        // Otherwise use the standard scraper
        leads = await scrapeLeads({
          industry,
          location,
          keywords,
          maxResults: Math.min(maxResults, 20),
          includeContactInfo,
          useDorkMethod: useDorks,
        });
      }

      return NextResponse.json({
        leads,
        metadata: {
          source: usePuppeteer
            ? "Puppeteer live scraping"
            : useDorks
            ? "Dork-based web scraping"
            : "Directory scraping",
          timestamp: new Date().toISOString(),
          query: {
            industry,
            location,
            keywords,
            method: usePuppeteer
              ? "puppeteer"
              : useDorks
              ? "dorks"
              : "directory",
          },
          resultCount: leads.length,
        },
      });
    } catch (scrapingError) {
      console.error("Scraping error:", scrapingError);

      return NextResponse.json(
        {
          error: "Failed to scrape leads",
          message:
            scrapingError instanceof Error
              ? scrapingError.message
              : "Unknown error",
          leads: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        leads: [],
      },
      { status: 500 }
    );
  }
}
