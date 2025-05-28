"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Settings,
  FileText,
  Send,
  Archive,
  Star,
  Trash2,
  Tag,
  PlusCircle,
  BarChart4,
  Bot,
  RefreshCw,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { label: "Inbox", icon: Inbox, href: "/email" },
  { label: "Starred", icon: Star, href: "/email/starred" },
  { label: "Sent", icon: Send, href: "/email/sent" },
  { label: "Archived", icon: Archive, href: "/email/archived" },
  { label: "Drafts", icon: FileText, href: "/email/drafts" },
  { label: "Trash", icon: Trash2, href: "/email/trash" },
];

const smartFeatureItems = [
  { label: "Smart Categories", icon: Tag, href: "/email/categories" },
  { label: "Workflows", icon: RefreshCw, href: "/email/workflows" },
  { label: "Templates", icon: FileText, href: "/email/templates" },
  { label: "Digest Settings", icon: BarChart4, href: "/email/digest-settings" },
  { label: "AI Assistant", icon: Bot, href: "/email/assistant" },
];

export function EmailSidebar() {
  const pathname = usePathname();

  return (
    <Card className='h-full'>
      <CardContent className='p-4'>
        <div className='mb-6'>
          <Button className='w-full mb-2' size='lg'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Compose
          </Button>
          <Button variant='outline' className='w-full' size='sm'>
            <RefreshCw className='mr-2 h-4 w-4' />
            Sync Emails
          </Button>
        </div>

        <nav className='space-y-1 mb-6'>
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}>
              <item.icon className='h-4 w-4' />
              <span>{item.label}</span>
              {item.label === "Inbox" && (
                <span className='ml-auto bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5'>
                  12
                </span>
              )}
            </Link>
          ))}
        </nav>

        <Separator className='my-4' />

        <div className='mb-2'>
          <h3 className='text-sm font-medium mb-2 px-3'>Smart Features</h3>
          <nav className='space-y-1'>
            {smartFeatureItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}>
                <item.icon className='h-4 w-4' />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <Separator className='my-4' />

        <div className='space-y-1'>
          <a
            href='https://mail.google.com'
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent text-muted-foreground"
            )}>
            <Mail className='h-4 w-4' />
            <span>Gmail Service</span>
            <ExternalLink className='h-3 w-3 ml-auto opacity-70' />
          </a>

          <Link
            href='/email/settings'
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              pathname === "/email/settings"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}>
            <Settings className='h-4 w-4' />
            <span>Settings</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
