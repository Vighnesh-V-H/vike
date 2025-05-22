import { Clock, Loader2 } from "lucide-react";
import { useRef } from "react";
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
  const data = await response.json();
  return data;
}

export function History() {
  const historyContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["history"],
    queryFn: () => fetchHistory(),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: 5000, // Built-in polling every 5 seconds
    staleTime: 0,
  });

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

  // Simple scroll handler for infinite loading
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
      onScroll={handleScroll}
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
