# Web-based Lead Scraper

This lead scraper is a real-world implementation that scrapes business directories and company websites to find sales leads while respecting robots.txt rules.

## Features

- **Ethical Scraping**: Respects robots.txt files to ensure compliance with website owners' preferences
- **Rate Limiting**: Implements delays between requests to minimize impact on target servers
- **Caching**: Caches robots.txt files to reduce unnecessary requests
- **Comprehensive Data Extraction**: Extracts company details, contact information, and more from target websites
- **User-friendly Interface**: Simple form-based interface with filtering options
- **Export Functionality**: Export leads to CSV for use in other tools

## How It Works

1. **Directory Scraping**: Searches business directories for companies matching specified criteria
2. **Website Analysis**: Visits each company's website to extract additional information
3. **Contact Discovery**: Looks for contact information like email addresses and social profiles
4. **Data Filtering**: Filters results based on user-provided keywords
5. **Data Presentation**: Displays results in an organized card-based layout

## Technical Implementation

### Key Components

- **`robots-parser`**: Parses robots.txt files to determine scraping permissions
- **`cheerio`**: HTML parsing library for extracting data from web pages
- **`axios`**: HTTP client for making requests to websites

### Core Functions

- **`getRobotsParser`**: Fetches and parses robots.txt files for a domain
- **`isScrapingAllowed`**: Checks if scraping a URL is allowed by the site's robots.txt
- **`scrapeCompanyWebsite`**: Extracts lead information from a company website
- **`scrapeIndustryDirectory`**: Scrapes company listings from an industry directory
- **`scrapeLeads`**: Master function that coordinates the scraping process

## Ethical Considerations

This scraper is designed with ethical web scraping principles in mind:

1. **Respect for Site Owners**: Obeys robots.txt directives
2. **Proper Identification**: Uses a descriptive User-Agent string
3. **Rate Limiting**: Implements delays between requests
4. **Data Privacy**: Only collects publicly available information
5. **Minimal Impact**: Designed to minimize server load on target websites

## Example Usage

```typescript
// Server-side API
import { scrapeLeads } from "@/lib/scraper/lead-scraper";

// Example: Scrape tech companies in London
const leads = await scrapeLeads({
  industry: "tech",
  location: "London",
  keywords: ["startup", "ai"],
  maxResults: 10,
  includeContactInfo: true
});
```

## Future Enhancements

- Integration with additional business directories
- Improved contact information extraction using NLP
- Proxy support for higher volume scraping
- Enhanced rate limiting based on server response times
- Company verification against business registries

## Legal Disclaimer

This tool is provided for educational purposes only. Users must ensure their use complies with applicable laws, website terms of service, and ethical guidelines. The developer is not responsible for misuse of this tool. 