"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarIcon,
  DollarSign,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { LeadCardProps } from "@/lib/leads/types";
import { formatCurrency, getPriorityColor } from "@/lib/leads/utils";


export function LeadCard({
  lead,
  provided,
  snapshot,
  user,
  onClick,
}: LeadCardProps) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={snapshot.isDragging ? "relative z-50" : ""}>
      <Card
        className={`group bg-white dark:bg-[#111010c9] dark:text-gray-100 border-0 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
          snapshot.isDragging ? "rotate-3 shadow-2xl z-50 relative" : ""
        }`}
        onClick={onClick}>
        <CardContent className='p-4'>
          <div className='flex justify-between items-start mb-3'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-semibold text-slate-900 dark:text-gray-100 truncate text-sm'>
                {lead.fullName}
              </h3>
              {lead.companyName && (
                <p className='text-xs text-slate-500 dark:text-gray-400 mt-1 flex items-center gap-1'>
                  <Building2 className='h-3 w-3' />
                  <span className='truncate'>
                    {lead.companyName}
                    {lead.jobTitle && ` • ${lead.jobTitle}`}
                  </span>
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                  onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                <DropdownMenuItem>Add Activity</DropdownMenuItem>
                <DropdownMenuItem>Send Email</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='text-red-600'>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {lead.tags && (
            <div className='flex flex-wrap gap-1 mb-3'>
              {(() => {
                try {
                  const parsedTags =
                    typeof lead.tags === "string" ? JSON.parse(lead.tags) : [];
                  if (Array.isArray(parsedTags) && parsedTags.length > 0) {
                    return (
                      <>
                        {parsedTags
                          .slice(0, 2)
                          .map((tag: string, index: number) => (
                            <Badge
                              key={`${tag}-${index}`}
                              variant='secondary'
                              className='text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors'>
                              {tag}
                            </Badge>
                          ))}
                        {parsedTags.length > 2 && (
                          <Badge
                            variant='secondary'
                            className='text-xs bg-slate-100 text-slate-700 dark:bg-gray-700 dark:text-gray-300'>
                            +{parsedTags.length - 2}
                          </Badge>
                        )}
                      </>
                    );
                  }
                } catch (e) {
                  if (lead.tags) {
                    return (
                      <Badge
                        variant='secondary'
                        className='text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors'>
                        {lead.tags}
                      </Badge>
                    );
                  }
                }
                return null;
              })()}
            </div>
          )}

          <div className='flex justify-between items-center mb-3'>
            {lead.value ? (
              <Badge
                variant='outline'
                className='gap-1 text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-gray-900 dark:text-emerald-400 dark:border-emerald-800'>
                <DollarSign className='h-3 w-3' />
                {formatCurrency(lead.value)}
              </Badge>
            ) : (
              <div />
            )}

            {lead.priority && (
              <Badge className={getPriorityColor(lead.priority)}>
                {lead.priority.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className='flex justify-between items-center text-xs text-slate-500 dark:text-gray-400 mb-3'>
            <div className='flex items-center gap-1'>
              <CalendarIcon className='h-3 w-3' />
              <span>
                {formatDistanceToNow(new Date(lead.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {user && (
              <div className='flex items-center gap-2'>
                <span className='text-xs'>Assigned to</span>
                <Avatar className='h-6 w-6 ring-2 ring-white dark:ring-gray-900 shadow-sm'>
                  <AvatarImage
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                  />
                  <AvatarFallback className='text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {(lead.email || lead.phone) && (
            <div className='flex gap-2 pt-2 border-t border-slate-100 dark:border-gray-700'>
              {lead.email && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-colors'
                  onClick={(e) => e.stopPropagation()}>
                  <Mail className='h-3 w-3 mr-1' />
                  <span className='text-xs'>Email</span>
                </Button>
              )}
              {lead.phone && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 px-2 text-slate-600 hover:text-green-600 hover:bg-green-50 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-green-900/20 transition-colors'
                  onClick={(e) => e.stopPropagation()}>
                  <Phone className='h-3 w-3 mr-1' />
                  <span className='text-xs'>Call</span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
