"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Star,
  StarOff,
  MoreHorizontal,
  ChevronDown,
  Tag,
  Trash2,
  Archive,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// Mock data for the emails
const mockEmails = [
  {
    id: "1",
    from: "John Doe",
    fromEmail: "john.doe@example.com",
    subject: "Project Update - Q3 Results",
    snippet:
      "Hi team, I wanted to share the latest updates from our Q3 results...",
    read: false,
    starred: true,
    date: new Date(2023, 9, 15, 14, 30),
    category: { name: "Work", color: "#4285F4" },
  },
  {
    id: "2",
    from: "Jane Smith",
    fromEmail: "jane.smith@example.com",
    subject: "Meeting Invitation: Strategic Planning",
    snippet:
      "You're invited to a strategic planning session next Friday at 2 PM...",
    read: true,
    starred: false,
    date: new Date(2023, 9, 14, 10, 15),
    category: { name: "Meetings", color: "#34A853" },
  },
  {
    id: "3",
    from: "Newsletter",
    fromEmail: "newsletter@tech.com",
    subject: "This Week in Tech: AI Breakthroughs",
    snippet:
      "The latest in AI research shows promising results in natural language...",
    read: true,
    starred: false,
    date: new Date(2023, 9, 13, 8, 0),
    category: { name: "Newsletters", color: "#FBBC05" },
  },
  {
    id: "4",
    from: "Support Team",
    fromEmail: "support@service.com",
    subject: "Your Ticket #45678 Has Been Resolved",
    snippet:
      "We've successfully resolved your support ticket regarding the login issue...",
    read: false,
    starred: false,
    date: new Date(2023, 9, 12, 16, 45),
    category: { name: "Support", color: "#EA4335" },
  },
  {
    id: "5",
    from: "Marketing Department",
    fromEmail: "marketing@company.com",
    subject: "Campaign Performance Report - September",
    snippet:
      "Here's a summary of last month's marketing campaign performance...",
    read: true,
    starred: true,
    date: new Date(2023, 9, 11, 11, 20),
    category: { name: "Marketing", color: "#673AB7" },
  },
];

// Smart email categories based on machine learning
const smartCategories = [
  { name: "All", count: 5 },
  { name: "Work", count: 2, color: "#4285F4" },
  { name: "Meetings", count: 1, color: "#34A853" },
  { name: "Newsletters", count: 1, color: "#FBBC05" },
  { name: "Support", count: 1, color: "#EA4335" },
  { name: "Marketing", count: 1, color: "#673AB7" },
  { name: "Personal", count: 0, color: "#FF5722" },
  { name: "Finance", count: 0, color: "#009688" },
];

export function EmailDashboard() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const filteredEmails =
    selectedCategory === "All"
      ? mockEmails
      : mockEmails.filter((email) => email.category?.name === selectedCategory);

  const toggleSelectEmail = (id: string) => {
    setSelectedEmails((prev) =>
      prev.includes(id)
        ? prev.filter((emailId) => emailId !== id)
        : [...prev, id]
    );
  };

  const selectAllEmails = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map((email) => email.id));
    }
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle>Smart Inbox</CardTitle>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm'>
                <Filter className='h-4 w-4 mr-2' />
                Filter
              </Button>
              <div className='relative'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Search emails...'
                  className='pl-8 w-[200px] md:w-[300px]'
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-2 mb-4'>
            {smartCategories.map((category) => (
              <Badge
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                className={cn(
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                  category.color &&
                    selectedCategory !== category.name &&
                    `border-l-4 border-l-[${category.color}]`
                )}
                onClick={() => setSelectedCategory(category.name)}>
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>

          <div className='bg-muted p-2 rounded-md flex items-center gap-2 mb-4'>
            <input
              type='checkbox'
              className='h-4 w-4'
              checked={
                selectedEmails.length === filteredEmails.length &&
                filteredEmails.length > 0
              }
              onChange={selectAllEmails}
            />

            {selectedEmails.length > 0 ? (
              <>
                <span className='text-sm text-muted-foreground'>
                  {selectedEmails.length} selected
                </span>
                <Separator orientation='vertical' className='h-4 mx-1' />
                <Button variant='ghost' size='sm' className='h-8 px-2'>
                  <Archive className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' className='h-8 px-2'>
                  <Trash2 className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' className='h-8 px-2'>
                  <Tag className='h-4 w-4' />
                </Button>
              </>
            ) : (
              <span className='text-sm text-muted-foreground'>
                Select emails to perform actions
              </span>
            )}

            <div className='ml-auto'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 px-2'>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>Mark as read</DropdownMenuItem>
                  <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                  <DropdownMenuItem>Star</DropdownMenuItem>
                  <DropdownMenuItem>Remove star</DropdownMenuItem>
                  <DropdownMenuItem>Categorize</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className='space-y-1'>
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer",
                  !email.read && "bg-blue-50/50 dark:bg-blue-950/20 font-medium"
                )}>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 mt-1'
                    checked={selectedEmails.includes(email.id)}
                    onChange={() => toggleSelectEmail(email.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={(e) => e.stopPropagation()}>
                    {email.starred ? (
                      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    ) : (
                      <StarOff className='h-4 w-4 text-muted-foreground' />
                    )}
                  </button>
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <div className='font-medium truncate'>{email.from}</div>
                    {email.category && (
                      <Badge
                        variant='outline'
                        className='text-xs py-0 h-5'
                        style={{
                          borderLeftColor: email.category.color,
                          borderLeftWidth: "3px",
                        }}>
                        {email.category.name}
                      </Badge>
                    )}
                    <span className='text-xs text-muted-foreground ml-auto whitespace-nowrap'>
                      {formatDistanceToNow(email.date, { addSuffix: true })}
                    </span>
                  </div>

                  <div className='font-medium text-sm mb-1 truncate'>
                    {email.subject}
                  </div>
                  <div className='text-sm text-muted-foreground truncate'>
                    {email.snippet}
                  </div>
                </div>

                <div className='flex items-center'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-8 w-8 p-0'
                    onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center'>
            <Clock className='h-5 w-5 mr-2' />
            Smart Reply Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground mb-3'>
            AI-generated reply suggestions for selected email:
          </p>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 p-2 border rounded-md hover:bg-accent/5 cursor-pointer'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span className='text-sm'>
                Thanks for the update. I'll review the results and get back to
                you by tomorrow.
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded-md hover:bg-accent/5 cursor-pointer'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span className='text-sm'>
                Great work on the Q3 results! Can we schedule a quick call to
                discuss next steps?
              </span>
            </div>
            <div className='flex items-center gap-2 p-2 border rounded-md hover:bg-accent/5 cursor-pointer'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span className='text-sm'>
                I need more details about the marketing spend. Could you share
                the breakdown?
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center'>
            <Tag className='h-5 w-5 mr-2' />
            Auto-Categorization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground mb-3'>
            AI has automatically categorized your incoming emails:
          </p>
          <div className='space-y-2'>
            {smartCategories
              .slice(1)
              .filter((cat) => cat.count > 0)
              .map((category) => (
                <div
                  key={category.name}
                  className='flex items-center justify-between p-2 border rounded-md'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{ backgroundColor: category.color }}></div>
                    <span className='text-sm font-medium'>{category.name}</span>
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {category.count} emails
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
