import { type CoreMessage, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { StreamData } from "ai";
import { leadScraperSchema } from "@/lib/schema";

type Lead = {
  id: string;
  name?: string;
  company?: string;
  position?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  website?: string;
  description?: string;
  industry?: string;
  location?: string;
};

export async function POST(req: Request) {
  const session = await auth();
  const data = new StreamData();

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = session.user;

  if (!user || !user.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages }: { messages: CoreMessage[] } = await req.json();

  try {
    // Extract the user message
    const userMessage =
      messages.filter((m) => m.role === "user").pop()?.content || "";

    // Convert the content to a string to handle different content types
    const messageText =
      typeof userMessage === "string"
        ? userMessage
        : Array.isArray(userMessage)
        ? userMessage
            .filter((part) => typeof part === "string" || part.type === "text")
            .map((part) =>
              typeof part === "string" ? part : (part as any).text || ""
            )
            .join(" ")
        : "";

    console.log("Processing user message:", messageText);

    // Simple parsing logic to extract common parameters
    let detectedIndustry = "";
    let detectedLocation = "";
    let detectedKeywords: string[] = [];
    let detectedMaxResults = 5;

    // Extract industry (look for common patterns)
    const industryPatterns = [
      /(?:find|looking for|need|get|search for)\s+([^.]+?)\s+(?:companies|businesses|startups|firms|organizations|leads|enterprises)/i,
      /([^.]+?)\s+(?:companies|businesses|startups|firms|organizations|leads|enterprises)/i,
    ];

    for (const pattern of industryPatterns) {
      const match = messageText.match(pattern);
      if (match && match[1]) {
        detectedIndustry = match[1].trim();
        break;
      }
    }

    // Extract location
    const locationPattern =
      /\b(?:in|from|at|near|around)\s+([A-Za-z\s,]+)(?:\.|$|\s)/i;
    const locationMatch = messageText.match(locationPattern);
    if (locationMatch && locationMatch[1]) {
      detectedLocation = locationMatch[1].trim();
    }

    // Fallback defaults if nothing detected
    if (!detectedIndustry) detectedIndustry = "technology";

    console.log("Detected industry:", detectedIndustry);
    console.log("Detected location:", detectedLocation);

    // Function to generate leads based on parameters
    function generateLeads(
      industry: string,
      location?: string,
      keywords?: string[],
      maxResults = 5
    ) {
      const leads: Lead[] = [];

      const companyPrefixes = [
        "Tech",
        "Smart",
        "Future",
        "Eco",
        "Global",
        "Bright",
        "Innovative",
        "Next",
        "Peak",
        "Prime",
      ];

      const companySuffixes = [
        "Solutions",
        "Systems",
        "Technologies",
        "Innovations",
        "Group",
        "Partners",
        "Labs",
        "Ventures",
        "Connect",
        "Fusion",
      ];

      const nameOptions = [
        "John Smith",
        "Sarah Johnson",
        "Michael Chen",
        "Emma Wilson",
        "David Martinez",
        "Jennifer Lee",
        "Robert Kim",
        "Lisa Garcia",
      ];

      const positionOptions = [
        "CEO",
        "Founder",
        "CTO",
        "COO",
        "Director",
        "President",
        "VP of Sales",
        "Managing Director",
      ];

      for (let i = 0; i < maxResults; i++) {
        const leadNumber = i + 1;
        const companyPrefix = companyPrefixes[i % companyPrefixes.length];
        const companySuffix = companySuffixes[i % companySuffixes.length];
        const name = nameOptions[i % nameOptions.length];
        const position = positionOptions[i % positionOptions.length];

        const lead: Lead = {
          id: `lead-${leadNumber}`,
          company: `${companyPrefix} ${companySuffix}`,
          description: `A leading provider of ${industry} solutions${
            location ? ` based in ${location}` : ""
          }.`,
          name: name,
          position: position,
          website: `${companyPrefix.toLowerCase()}${companySuffix.toLowerCase()}.com`,
          industry,
          location: location || "Global",
          contactInfo: {
            linkedin: "Contact via LinkedIn",
          },
        };

        leads.push(lead);
      }

      return leads;
    }

    // Detect if this is a simple lead search query we can directly handle
    const isSimpleLeadQuery =
      /\b(?:find|get|search|looking for|need)\b.*\b(?:leads|companies|businesses|startups)\b/i.test(
        messageText
      ) ||
      /\b(?:leads|companies|businesses|startups)\b.*\b(?:in|for|related to)\b/i.test(
        messageText
      );

    if (isSimpleLeadQuery && detectedIndustry) {
      console.log("Direct lead generation without AI");

      // Generate leads directly without using the AI model
      const generatedLeads = generateLeads(
        detectedIndustry,
        detectedLocation || undefined,
        detectedKeywords.length > 0 ? detectedKeywords : undefined,
        detectedMaxResults
      );

      const response = JSON.stringify({
        leads: generatedLeads,
        metadata: {
          source: "Direct lead generation",
          timestamp: new Date().toISOString(),
          query: {
            industry: detectedIndustry,
            location: detectedLocation || undefined,
            keywords:
              detectedKeywords.length > 0 ? detectedKeywords : undefined,
          },
        },
      });

      data.append(response);
      await data.close();

      return new Response(response, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // If we get here, use the AI approach
    console.log("Using AI for lead generation");

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: `You are an AI lead generation assistant. Your primary and ONLY function is to generate sales leads.

IMPORTANT INSTRUCTIONS:
1. For ANY lead-related request, you MUST use the generateLeads tool.
2. DO NOT respond with text or explanations. ONLY use the tool.
3. Extract industry, location, and relevant keywords from the user's request.
4. If the user doesn't specify parameters clearly, make reasonable assumptions.
5. NEVER skip using the tool, even for vague requests.
6. For ANY request about companies, businesses, or leads, use the generateLeads tool.

For example, if a user asks for "tech startups in London", immediately use the generateLeads tool with "tech" as industry and "London" as location.`,
      messages,
      tools: {
        generateLeads: tool({
          description:
            "Generate a list of potential leads based on user criteria",
          parameters: leadScraperSchema,
          execute: async ({
            industry,
            location,
            keywords,
            maxResults,
            includeContactInfo,
          }) => {
            try {
              // Use detected values as fallbacks
              const finalIndustry = industry || detectedIndustry;
              const finalLocation = location || detectedLocation;
              const finalKeywords = keywords || detectedKeywords;
              const finalMaxResults = maxResults || detectedMaxResults;

              // Generate the leads
              const generatedLeads = generateLeads(
                finalIndustry,
                finalLocation,
                finalKeywords,
                finalMaxResults
              );

              console.log("Generated leads:", generatedLeads.length);

              // Return the JSON response
              return JSON.stringify({
                leads: generatedLeads,
                metadata: {
                  source: "AI-generated leads",
                  timestamp: new Date().toISOString(),
                  query: {
                    industry: finalIndustry,
                    location: finalLocation,
                    keywords: finalKeywords,
                  },
                },
              });
            } catch (error) {
              console.error("Lead generation failed:", error);
              return JSON.stringify({
                error: "Failed to generate leads",
                leads: [],
              });
            }
          },
        }),
      },
      onError: (a) => {
        console.log(a);
      },
      onFinish: async (completion) => {
        try {
          if (
            completion.toolResults &&
            completion.toolResults.length > 0 &&
            completion.toolResults[0]?.result
          ) {
            // Valid tool result found
            data.append(completion.toolResults[0].result);
          } else {
            // No valid tool results, use the fallback approach
            console.warn("No tool results found, using manual lead generation");

            // Generate leads directly
            const generatedLeads = generateLeads(
              detectedIndustry,
              detectedLocation,
              detectedKeywords,
              5
            );

            data.append(
              JSON.stringify({
                leads: generatedLeads,
                metadata: {
                  source: "Fallback lead generation",
                  timestamp: new Date().toISOString(),
                  query: {
                    industry: detectedIndustry,
                    location: detectedLocation,
                  },
                },
              })
            );
          }
        } catch (error) {
          console.error("Error in onFinish handler:", error);

          // Provide a fallback response
          data.append(
            JSON.stringify({
              leads: [],
              error: "An error occurred while processing lead data",
            })
          );
        } finally {
          await data.close();
        }
      },
    });

    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "application/json",
      },
      data,
    });
  } catch (error) {
    console.error("Lead scraper error:", error);

    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        error: "Lead generation process failed",
        message: error instanceof Error ? error.message : "Unknown error",
        leads: [],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
