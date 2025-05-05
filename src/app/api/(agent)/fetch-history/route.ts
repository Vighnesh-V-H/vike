import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChatHistoryWithMessages } from "@/lib/chatQueries";

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatHistory = await getChatHistoryWithMessages(userId);

    return NextResponse.json(chatHistory);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve chat history" },
      { status: 500 }
    );
  }
}
