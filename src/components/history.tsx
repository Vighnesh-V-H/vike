"use client";

import { Clock, Loader2 } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
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
  const data = await response.json();
  console.log("Raw API response:", data);
  return data;
}

export function History() {
  const historyContainerRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: ({ pageParam }) => fetchHistory(),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: true,
    staleTime: 0,
  });

  console.log("History data structure:", data);

  const historyItems =
    data?.pages.flatMap((page) => {
      if (Array.isArray(page)) {
        return page;
      } else if (page?.items && Array.isArray(page.items)) {
        return page.items;
      } else if (page && typeof page === "object") {
        return [page];
      }
      return [];
    }) || [];

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

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    }, 5000);
    const setupWebSocketListener = () => {
      try {
        const ws = new WebSocket(
          `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
            window.location.host
          }/api/history-updates`
        );

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "history-update") {
            queryClient.invalidateQueries({ queryKey: ["history"] });
          }
        };

        ws.onclose = () => {
          setTimeout(setupWebSocketListener, 2000);
        };

        return ws;
      } catch (err) {
        console.error(
          "WebSocket connection failed, falling back to polling",
          err
        );
        return null;
      }
    };

    // Try WebSocket first, fall back to polling
    const ws = setupWebSocketListener();

    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [queryClient]);

  useEffect(() => {
    const handleNewMessage = () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
    };

    window.addEventListener("chat:new-message", handleNewMessage);

    return () => {
      window.removeEventListener("chat:new-message", handleNewMessage);
    };
  }, [queryClient]);

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