import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateChatTitle } from "@/lib/chatQueries";

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId, title } = await request.json();

    if (!chatId || !title) {
      return NextResponse.json(
        { error: "Chat ID and title are required" },
        { status: 400 }
      );
    }

    if (title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    const updatedChat = await updateChatTitle(chatId, userId, title.trim());

    return NextResponse.json({
      success: true,
      message: "Chat title updated successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    return NextResponse.json(
      { error: "Failed to update chat title" },
      { status: 500 }
    );
  }
}
