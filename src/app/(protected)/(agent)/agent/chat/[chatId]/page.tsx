import { auth } from "@/auth";
import { ChatForm } from "@/components/agent/chat-form";
import { getMessagesById } from "@/lib/chatQueries";

async function ChatId({ params }: { params: Promise<{ chatId: string }> }) {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const resolvedParams = await params;
  const chatId = resolvedParams.chatId;

  const messages = await getMessagesById(chatId);

  if (messages instanceof Response) {
    return <div>Error loading messages</div>;
  }

  return <ChatForm initialMessages={messages} chatId={chatId} />;
}

export default ChatId;