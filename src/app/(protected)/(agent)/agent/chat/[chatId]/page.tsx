import { auth } from "@/auth";
import { ChatForm } from "@/components/agent/chat-form";
import { getMessagesById } from "@/lib/chatQueries";

async function ChatId({
  params,
}: {
  params: Promise<{ chatId: string }> | { chatId: string };
}) {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  // Handle both Promise and direct object cases
  const resolvedParams = params instanceof Promise ? await params : params;
  const chatId = resolvedParams.chatId;

  console.log("Chat ID:", chatId);

  const messages = await getMessagesById(chatId);

  if (messages instanceof Response) {
    return <div>Error loading messages</div>;
  }

  return <ChatForm initialMessages={messages} />;
}

export default ChatId;
