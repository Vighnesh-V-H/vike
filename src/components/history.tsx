"use client";

import { Clock, Loader2 } from "lucide-react";
import { useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";

import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";


async function fetchHistory() {
  const response = await fetch(`/api/fetch-history`);
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
}

export function History() {
  const historyContainerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam }) => fetchHistory(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true,
  });

  const historyItems = data?.pages.flat() || [];

  useEffect(() => {
    const currentRef = historyContainerRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
      return () => {
        currentRef.removeEventListener("scroll", handleScroll);
      };
    }
  }, [hasNextPage, isFetchingNextPage]);

  const handleScroll = () => {
    if (!historyContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      historyContainerRef.current;

    if (scrollHeight - scrollTop - clientHeight < 20) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <div
      ref={historyContainerRef}
      className='max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent'>
      <SidebarMenuSub>
        {isLoading ? (
          <SidebarMenuSubItem>
            <SidebarMenuSubButton className='flex items-center justify-center'>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Loading history...
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ) : error ? (
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>Failed to load history</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        ) : historyItems.length > 0 ? (
          <>
            {historyItems.map((historyItem) => (
              <SidebarMenuSubItem key={historyItem.id}>
                <SidebarMenuSubButton asChild>
                  <Link href={`/agent/chat/${historyItem.id}`}>
                    <Clock className='h-4 w-4 mr-2' />
                    <span>{historyItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
            {isFetchingNextPage && (
              <SidebarMenuSubItem>
                <SidebarMenuSubButton className='flex items-center justify-center py-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            )}
          </>
        ) : (
          <SidebarMenuSubItem>
            <SidebarMenuSubButton>No history found</SidebarMenuSubButton>
          </SidebarMenuSubItem>
        )}
      </SidebarMenuSub>
    </div>
  );
}
