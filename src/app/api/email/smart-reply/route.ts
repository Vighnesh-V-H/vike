import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/genai";
import { z } from "zod";

const smartReplySchema = z.object({
  emailId: z.string().uuid(),
  count: z.number().optional().default(3),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const validation = smartReplySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 }
      );
    }
    
    const { emailId, count } = validation.data;
    
    // Get email from database
    const email = await db.query.emails.findFirst({
      where: (emails, { eq, and }) => 
        and(
          eq(emails.id, emailId),
          eq(emails.userId, session.user.id)
        ),
    });
    
    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }
    
    // Generate smart replies using Gemini
    const replies = await generateSmartReplies(email.subject, email.body, email.from, count);
    
    return NextResponse.json({
      success: true,
      replies,
    });
    
  } catch (error) {
    console.error("Error generating smart replies:", error);
    return NextResponse.json(
      { error: "Failed to generate smart replies" },
      { status: 500 }
    );
  }
}

interface SmartReply {
  text: string;
  tone: string;
  confidence: number;
}

async function generateSmartReplies(
  subject: string,
  body: string,
  sender: string,
  count: number = 3
): Promise<SmartReply[]> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Google Gemini API key not found");
      return [];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Prepare the prompt
    const prompt = `
      You are an AI assistant that generates smart reply suggestions for emails.
      
      Here is an email:
      From: ${sender}
      Subject: ${subject}
      
      Body:
      ${body.slice(0, 1000)}...
      
      Please generate ${count} different short reply suggestions that would be appropriate
      responses to this email. Each reply should have a different tone or approach.
      
      Respond with JSON only in this format:
      [
        {
          "text": "Reply text here",
          "tone": "professional",
          "confidence": 0.95
        },
        ...
      ]
    `;

    // Get AI response
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Failed to parse JSON from AI response");
      return [];
    }
    
    // Parse the JSON
    const replies = JSON.parse(jsonMatch[0]) as SmartReply[];
    
    return replies.slice(0, count);
  } catch (error) {
    console.error("Error generating smart replies:", error);
    return [];
  }
} 