import { Clock, Loader2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const queryClient = useQueryClient();
  const router = useRouter();

  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    chatId: string;
    currentTitle: string;
  }>({ open: false, chatId: "", currentTitle: "" });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    chatId: string;
    title: string;
  }>({ open: false, chatId: "", title: "" });

  const [newTitle, setNewTitle] = useState("");

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

  const deleteMutation = useMutation({
    mutationFn: async (chatId: string) => {
      const response = await fetch("/api/delete-chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });
      if (!response.ok) throw new Error("Failed to delete chat");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Chat deleted successfully");
      setDeleteDialog({ open: false, chatId: "", title: "" });
      router.push("/agent");
    },
    onError: () => {
      toast.error("Failed to delete chat");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      chatId,
      title,
    }: {
      chatId: string;
      title: string;
    }) => {
      const response = await fetch("/api/update-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, title }),
      });
      if (!response.ok) throw new Error("Failed to update chat title");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Chat title updated successfully");
      setEditDialog({ open: false, chatId: "", currentTitle: "" });
      setNewTitle("");
    },
    onError: () => {
      toast.error("Failed to update chat title");
    },
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

  const handleEditClick = (chatId: string, currentTitle: string) => {
    setEditDialog({ open: true, chatId, currentTitle });
    setNewTitle(currentTitle);
  };

  const handleDeleteClick = (chatId: string, title: string) => {
    setDeleteDialog({ open: true, chatId, title });
  };

  const handleEditSubmit = () => {
    if (newTitle.trim()) {
      updateMutation.mutate({
        chatId: editDialog.chatId,
        title: newTitle.trim(),
      });
    }
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(deleteDialog.chatId);
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
                <div className='flex items-center w-full group'>
                  <SidebarMenuSubButton asChild className='flex-1'>
                    <Link href={`/agent/chat/${historyItem.id}`}>
                      <Clock className='h-4 w-4 mr-2' />
                      <span className='truncate'>{historyItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={() =>
                          handleEditClick(historyItem.id, historyItem.title)
                        }>
                        <Pencil className='h-4 w-4 mr-2' />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleDeleteClick(historyItem.id, historyItem.title)
                        }
                        className='text-destructive'>
                        <Trash2 className='h-4 w-4 mr-2' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => {
          setEditDialog({ open, chatId: "", currentTitle: "" });
          setNewTitle("");
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chat Title</DialogTitle>
            <DialogDescription>
              Enter a new title for this chat conversation.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Title</Label>
              <Input
                id='title'
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='Enter chat title'
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setEditDialog({ open: false, chatId: "", currentTitle: "" });
                setNewTitle("");
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateMutation.isPending || !newTitle.trim()}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          setDeleteDialog({ open, chatId: "", title: "" });
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.title}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() =>
                setDeleteDialog({ open: false, chatId: "", title: "" })
              }>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
