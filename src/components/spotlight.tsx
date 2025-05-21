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

export function SpotlightSearch({ onClose }: SpotlightSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTaskMode, setIsTaskMode] = useState(false);

  useEffect(() => {
    // Focus the input when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const router = useRouter();
  let chatId: string | null = null;

  // Chat API handler
  const {
    messages: chatMessages,
    input: chatInput,
    setInput: setChatInput,
    append: appendChat,
    isLoading: isChatLoading,
  } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      chatId = response.headers.get("X-Chat-ID");
    },
  });

  // Task API handler
  const {
    messages: taskMessages,
    input: taskInput,
    setInput: setTaskInput,
    append: appendTask,
    isLoading: isTaskLoading,
  } = useChat({
    api: "/api/google/tasks",
    maxSteps: 1,
    onFinish: (res) => {
      // @ts-expect-error
      const toolResult = res.parts?.[0]?.result;

      if (!res.content && typeof toolResult === "string") {
        appendTask({
          role: "assistant",
          content: toolResult,
        });
      }
    },
  });

  // Combined messages and loading state for rendering
  const messages = isTaskMode ? taskMessages : chatMessages;
  const isLoading = isTaskMode ? isTaskLoading : isChatLoading;

  // Combined input state management
  const input = isTaskMode ? taskInput : chatInput;
  const setInput = (value: string) => {
    // When input changes, detect if it's a task or regular chat
    const newIsTaskMode = value.trim().toLowerCase().startsWith("t:");
    setIsTaskMode(newIsTaskMode);

    // Update the appropriate input state
    if (newIsTaskMode) {
      setTaskInput(value);
    } else {
      setChatInput(value);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Route to appropriate API based on whether input starts with "t:"
    if (isTaskMode) {
      await appendTask({ content: input, role: "user" });
    } else {
      await appendChat({ content: input, role: "user" });
    }
  };

  return (
    <div className='flex flex-col w-full'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-800'>
        <form onSubmit={handleSearch} className='flex items-center gap-2'>
          <Search className='h-5 w-5 text-gray-400' />
          <Input
            ref={inputRef}
            type='text'
            placeholder={
              isTaskMode
                ? "Create a task... (t: prefix detected)"
                : "Search anything... (use t: prefix for tasks)"
            }
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
                  {isTaskMode ? "Creating task..." : "Thinking..."}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className='text-sm text-gray-500 dark:text-gray-400 text-center py-8'>
            Type your query and press Enter, start with t: to add a task
          </div>
        )}
      </div>
    </div>
  );
}