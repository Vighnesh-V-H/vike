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
    <header className='m-auto flex max-w-96 flex-col gap-5 text-center'>
      Ask Anything
    </header>
  );

  const messageList = (
    <div className='my-4 flex h-fit min-h-full flex-col gap-4'>
      {messages.map((message: any, index) => {
        if (message.role === 'assistant') {
         
          const hasToolCalls = message.toolInvocations && message.toolInvocations.length > 0;
          const hasContent = message.content && message.content.trim().length > 0;

          if (!hasContent && !hasToolCalls) {
            return null;
          }

          return (
            <div key={message.id || index} className='flex flex-col gap-2 self-start max-w-[80%]'>
              
              {hasToolCalls && message.toolInvocations.map((tool: any, toolIndex: number) => (
                <div
                  key={toolIndex}
                  className='rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-sm'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='text-blue-600 font-medium'>🔧 {tool.toolName}</span>
                    {tool.state === 'call' && (
                      <span className='text-xs text-blue-500 animate-pulse'>executing...</span>
                    )}
                    {tool.state === 'result' && (
                      <span className='text-xs text-green-600'>✓ completed</span>
                    )}
                  </div>
               
                  {tool.state === 'result' && tool.result && (
                    <div className='mt-2 text-gray-700 text-xs whitespace-pre-wrap'>
                      {typeof tool.result === 'string'
                        ? tool.result
                        : JSON.stringify(tool.result, null, 2)}
                    </div>
                  )}
                </div>
              ))}
              
              
              {hasContent && (
                <div className='rounded-xl bg-gray-100 px-3 py-2 text-sm text-black whitespace-pre-wrap'>
                  {message.content}
                </div>
              )}
            </div>
          );
        }
        
        if (message.role === 'user') {
          return (
            <div
              key={message.id || index}
              className='rounded-xl px-3 py-2 text-sm bg-blue-500 text-white whitespace-pre-wrap self-end max-w-[80%]'>
              {message.content}
            </div>
          );
        }

        return null;
      })}
    </div>
  );

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-[90vh] w-full max-w-full flex-col items-stretch border-none",
        className
      )}
      {...props}>
      <div className='flex-1 content-center  overflow-y-auto px-6'>
        {messages.length ? messageList : header}
        {isLoading && (
          <div
            data-role='assistant'
            className='max-w-[20%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-black'>
            <div className='flex items-center gap-1.5'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s]' />
              <span className='h-2 w-2 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.15s]' />
              <span className='h-2 w-2 animate-pulse rounded-full bg-blue-500' />
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className='border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0'>
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder='Enter a message'
          className='placeholder:text-muted-foreground  flex-1 bg-transparent focus:outline-none'
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='absolute bottom-1 right-1 size-6 rounded-full'>
              <ArrowUpIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Submit</TooltipContent>
        </Tooltip>
      </form>
    </main>
  );
}