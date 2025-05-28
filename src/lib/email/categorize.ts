import { GoogleGenerativeAI } from "@google/genai";
import { z } from "zod";

// Email category schema for validating AI response
const emailCategorySchema = z.object({
  name: z.string(),
  color: z.string().optional(),
  confidence: z.number().optional(),
  reasoning: z.string().optional(),
});

export type EmailCategory = z.infer<typeof emailCategorySchema>;

// Common email categories with colors
const commonCategories = [
  { name: "Work", color: "#4285F4" },
  { name: "Personal", color: "#FF5722" },
  { name: "Finance", color: "#009688" },
  { name: "Shopping", color: "#9C27B0" },
  { name: "Travel", color: "#FFC107" },
  { name: "Social", color: "#E91E63" },
  { name: "Newsletters", color: "#FBBC05" },
  { name: "Promotions", color: "#34A853" },
  { name: "Updates", color: "#607D8B" },
  { name: "Forums", color: "#795548" },
  { name: "Meetings", color: "#3F51B5" },
  { name: "Support", color: "#EA4335" },
  { name: "Marketing", color: "#673AB7" },
  { name: "Notifications", color: "#8BC34A" },
  { name: "Bills", color: "#03A9F4" },
];

/**
 * Categorizes an email using Google Gemini AI
 */
export async function categorizeEmail(
  subject: string,
  body: string
): Promise<EmailCategory | null> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Google Gemini API key not found");
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the prompt
    const categoriesJson = JSON.stringify(commonCategories.map((c) => c.name));
    const prompt = `
      You are an AI assistant tasked with categorizing emails.
      
      Here is an email:
      Subject: ${subject}
      
      Body:
      ${body.slice(0, 1000)}...
      
      Please categorize this email into one of the following categories: ${categoriesJson}
      If none of these categories fit, suggest a new appropriate category.
      
      Respond with JSON only in this format:
      {
        "name": "Category Name",
        "confidence": 0.95,
        "reasoning": "Brief explanation of why this category was chosen"
      }
    `;

    // Get AI response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON from AI response");
      return null;
    }

    // Parse and validate the JSON
    const rawCategory = JSON.parse(jsonMatch[0]);
    const validation = emailCategorySchema.safeParse(rawCategory);

    if (!validation.success) {
      console.error("Invalid category format:", validation.error);
      return null;
    }

    const category = validation.data;

    // Find matching color if it exists
    const matchingCategory = commonCategories.find(
      (c) => c.name.toLowerCase() === category.name.toLowerCase()
    );

    if (matchingCategory && !category.color) {
      category.color = matchingCategory.color;
    }

    return category;
  } catch (error) {
    console.error("Error categorizing email:", error);
    return null;
  }
}
