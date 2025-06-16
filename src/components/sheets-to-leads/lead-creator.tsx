"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { leadSchema } from "@/lib/schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";

interface LeadCreatorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rowData?: {
    fullName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    originalData?: Record<string, any>;
  };
  onCreateLead: (lead: any) => Promise<void>;
}

export function LeadCreator({
  isOpen,
  onOpenChange,
  rowData = {},
  onCreateLead,
}: LeadCreatorProps) {
  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      jobTitle: "",
      source: "",
      tags: [],
      status: "new",
      priority: "medium",
      notes: "",
      position: 0,
      value: "",
      assignedTo: "",
    },
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag) {
      const tags = form.getValues("tags") || [];
      if (!tags.includes(newTag)) {
        form.setValue("tags", [...tags, newTag]);
      }
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const tags = form.getValues("tags") || [];
    form.setValue(
      "tags",
      tags.filter((t: string) => t !== tag)
    );
  };

  const onSubmit = async (data: z.infer<typeof leadSchema>) => {
    try {
      const formattedTags =
        data.tags.length > 0 ? JSON.stringify(data.tags) : null;
      const lead = { ...data, tags: formattedTags };
      await onCreateLead(lead);
      toast.success("Lead created successfully");
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error("Failed to create lead");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) reset();
      }}>
      <DialogContent className='sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='fullName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='John Smith' required />
                    </FormControl>
                    <FormMessage>{errors.fullName?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='companyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Acme Inc.' />
                    </FormControl>
                    <FormMessage>{errors.companyName?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                        placeholder='john@example.com'
                      />
                    </FormControl>
                    <FormMessage>{errors.email?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='(123) 456-7890' />
                    </FormControl>
                    <FormMessage>{errors.phone?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='jobTitle'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Software Engineer' />
                    </FormControl>
                    <FormMessage>{errors.jobTitle?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger id='status'>
                          <SelectValue placeholder='Select a status' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='new'>New</SelectItem>
                          <SelectItem value='contacted'>Contacted</SelectItem>
                          <SelectItem value='won'>Won</SelectItem>
                          <SelectItem value='lost'>Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage>{errors.status?.message}</FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name='priority'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <SelectTrigger id='priority'>
                          <SelectValue placeholder='Select a priority' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='high'>High</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='low'>Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage>{errors.priority?.message}</FormMessage>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name='tags'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className='flex flex-wrap gap-2 mb-2'>
                    {(field.value || []).map((tag: string) => (
                      <Badge
                        key={tag}
                        variant='secondary'
                        className='flex items-center gap-1'>
                        {tag}
                        <X
                          className='h-3 w-3 cursor-pointer'
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className='flex gap-2'>
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder='Add a tag'
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type='button' onClick={handleAddTag} size='sm'>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                  <FormMessage>{errors.tags?.message as string}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      className='w-full min-h-[100px] p-2 border rounded-md'
                      placeholder='Add any additional notes about this lead...'
                    />
                  </FormControl>
                  <FormMessage>{errors.notes?.message}</FormMessage>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                variant='outline'
                type='button'
                onClick={() => {
                  onOpenChange(false);
                  reset();
                }}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
