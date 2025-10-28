"use client";

import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AutoResizeTextarea } from "@/components/autoresize-textarea";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Message = {
  id: string;
  chatId: string;
  role: "data" | "system" | "user" | "assistant";
  content: string;
  createdAt: Date;
};

interface ChatFormProps extends React.ComponentProps<"form"> {
  initialMessages?: Message[];
  chatId?: string;
}

export function ChatForm({
  className,
  initialMessages,
  chatId,
  ...props
}: ChatFormProps) {
  let id: string | null;
  const router = useRouter();

  const { messages, input, setInput, append, isLoading } = useChat({
    api: "/api/chat",
    id: chatId,
    streamProtocol: "text",
    onResponse: (response) => {
      id = response.headers.get("X-Chat-ID");
    },
    onFinish: () => {
      if (id && id !== chatId) {
        router.push(`/agent/chat/${id}`);
      }
    },
    initialMessages: initialMessages,
  });

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const savedInput = localStorage.getItem("chat-input");
    if (savedInput && input.trim() === "") {
      setInput(savedInput);
    }
  }, []);

  useEffect(() => {
    if (input.trim()) {
      localStorage.setItem("chat-input", input);
    } else {
      localStorage.removeItem("chat-input");
    }
  }, [input]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim().length) {
      void append({ content: input, role: "user" });
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const header = (
    <header className="flex flex-col items-center gap-4 text-center max-w-md">
      <h1 className="text-3xl font-bold text-gray-900">Ask Anything</h1>
      <p className="text-gray-600 max-w-sm">Start a conversation with our AI assistant.</p>
    </header>
  );

  const messageList = (
    <div className="my-4 flex flex-col gap-4">
      {messages.map((message: any, index) => {
        if (message.role === "assistant") {
          const hasToolCalls =
            message.toolInvocations && message.toolInvocations.length > 0;
          const hasContent =
            message.content && message.content.trim().length > 0;

          if (!hasContent && !hasToolCalls) {
            return null;
          }

          return (
            <div
              key={message.id || index}
              className="flex flex-col gap-2 self-start max-w-[80%]">
              {hasToolCalls &&
                message.toolInvocations.map((tool: any, toolIndex: number) => (
                  <div
                    key={toolIndex}
                    className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 font-semibold">
                        🔧 {tool.toolName}
                      </span>
                      {tool.state === "call" && (
                        <span className="text-xs text-blue-500 animate-pulse">
                          executing...
                        </span>
                      )}
                      {tool.state === "result" && (
                        <span className="text-xs text-green-600">
                          ✓ completed
                        </span>
                      )}
                    </div>
                    {tool.state === "result" && tool.result && (
                      <div className="mt-2 text-gray-700 text-xs whitespace-pre-wrap bg-white rounded-lg p-2">
                        {typeof tool.result === "string"
                          ? tool.result
                          : JSON.stringify(tool.result, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              {hasContent && (
                <div className="rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 whitespace-pre-wrap shadow-sm">
                  {message.content}
                </div>
              )}
            </div>
          );
        }

        if (message.role === "user") {
          return (
            <div
              key={message.id || index}
              className="rounded-xl px-4 py-3 text-sm bg-blue-500 text-white whitespace-pre-wrap self-end max-w-[80%] shadow-sm">
              {message.content}
            </div>
          );
        }

        return null;
      })}
    </div>
  );

  const formClassName = "border-input bg-background focus-within:ring-ring/10 relative flex items-center rounded-[20px] border px-4 py-2 pr-10 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0 shadow-sm";

  if (!messages.length) {
    return (
      <main
        className={cn(
          "ring-none mx-auto flex h-svh max-h-[90vh] w-full max-w-full flex-col items-stretch border-none",
          className
        )}
        {...props}>
        <div className="flex-1 flex flex-col justify-center items-center gap-8 px-6">
          {header}
          <form onSubmit={handleSubmit} className={cn(formClassName, "w-full max-w-2xl")}>
            <AutoResizeTextarea
              onKeyDown={handleKeyDown}
              onChange={(v) => setInput(v)}
              value={input}
              placeholder="Enter a message"
              className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none min-h-[40px]"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 right-2 size-8 rounded-full bg-blue-500 hover:bg-blue-600">
                  <ArrowUpIcon size={16} className="text-white" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={12}>Submit</TooltipContent>
            </Tooltip>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-[90vh] w-full max-w-full flex-col items-stretch border-none",
        className
      )}
      {...props}>
      <div className="flex-1 overflow-y-auto px-6">
        {messageList}
        {isLoading && (
          <div
            data-role="assistant"
            className="self-start max-w-[80%] rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className={cn(formClassName, "mx-auto mb-6 w-full max-w-4xl")}>
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder="Enter a message"
          className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none min-h-[40px]"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-2 right-2 size-8 rounded-full bg-blue-500 hover:bg-blue-600">
              <ArrowUpIcon size={16} className="text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Submit</TooltipContent>
        </Tooltip>
      </form>
    </main>
  );
}