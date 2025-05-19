"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { useRouter } from "next/navigation";

interface SpotlightSearchProps {
  onClose: () => void;
}

interface ChatResponse {
  message: string;
}

export function SpotlightSearch({ onClose }: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const router = useRouter();
  let chatId: string | null = null;

  const { messages, input, setInput, append, isLoading } = useChat({
    api: "/api/chat",
    maxSteps: 1,

    onResponse: (response) => {
      chatId = response.headers.get("X-Chat-ID");
    },
    onFinish: (res) => {
      // @ts-expect-error
      const toolResult = res.toolInvocations?.[0]?.result;

      if (!res.content && typeof toolResult === "string") {
        append({
          role: "assistant",
          content: toolResult,
        });
      }
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    await append({ content: input, role: "user" });
  };

  return (
    <div className='flex flex-col w-full'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-800'>
        <form onSubmit={handleSearch} className='flex items-center gap-2'>
          <Search className='h-5 w-5 text-gray-400' />
          <Input
            ref={inputRef}
            type='text'
            placeholder='Search anything...'
            className='flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent text-base dark:text-gray-200 dark:placeholder:text-gray-400'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {isLoading && (
            <Loader2 className='h-5 w-5 text-gray-400 animate-spin' />
          )}
        </form>
      </div>

      <div className='max-h-[400px] overflow-y-auto p-4'>
        {messages.length > 0 ? (
          <div className='flex flex-col gap-4'>
            {messages.map((message, index) => (
              <div
                key={index}
                data-role={message.role}
                className='text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap data-[role=assistant]:text-gray-700 data-[role=assistant]:dark:text-gray-300 data-[role=user]:text-gray-500 data-[role=user]:dark:text-gray-400'>
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className='flex items-center py-2'>
                <Loader2 className='h-4 w-4 text-gray-400 animate-spin mr-2' />
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  Thinking...
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className='text-sm text-gray-500 dark:text-gray-400 text-center py-8'>
            Type your query and press Enter
          </div>
        )}
      </div>
    </div>
  );
}
