"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface LeadCreatorProps {
  rowData: {
    fullName?: string;
    companyName?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    originalData?: Record<string, any>;
  };
  onCreateLead: (lead: any) => Promise<void>;
  onCancel: () => void;
}

export function LeadCreator({
  rowData,
  onCreateLead,
  onCancel,
}: LeadCreatorProps) {
  const [leadData, setLeadData] = useState({
    fullName: rowData.fullName || "",
    companyName: rowData.companyName || "",
    email: rowData.email || "",
    phone: rowData.phone || "",
    jobTitle: rowData.jobTitle || "",
    status: "new",
    priority: "medium",
    tags: [] as string[],
    notes: "",
  });
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setLeadData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (newTag && !leadData.tags.includes(newTag)) {
      setLeadData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setLeadData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async () => {
    if (!leadData.fullName) {
      toast.error("Lead name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Format tags as a JSON string for the database
      const formattedTags =
        leadData.tags.length > 0 ? JSON.stringify(leadData.tags) : null;

      // Create lead object with proper formatting for the API
      const lead = {
        fullName: leadData.fullName,
        email: leadData.email,
        phone: leadData.phone,
        companyName: leadData.companyName,
        jobTitle: leadData.jobTitle,
        status: leadData.status,
        priority: leadData.priority,
        tags: formattedTags,
        notes: leadData.notes,
        source: "Google Sheet",
        position: 0,
      };

      await onCreateLead(lead);
      toast.success("Lead created successfully");
    } catch (error: any) {
      console.error("Error creating lead:", error);

      // Handle validation errors specifically
      if (error.response?.data?.error === "Validation failed") {
        const details = error.response.data.details;
        const errorMessages: string[] = [];

        if (details) {
          Object.entries(details).forEach(
            ([field, fieldError]: [string, any]) => {
              if (fieldError._errors && fieldError._errors.length > 0) {
                errorMessages.push(
                  `${field}: ${fieldError._errors.join(", ")}`
                );
              }
            }
          );
        }

        if (errorMessages.length > 0) {
          toast.error(`Validation errors: ${errorMessages.join("; ")}`);
        } else {
          toast.error("Failed to create lead: Validation error");
        }
      } else {
        toast.error("Failed to create lead");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Create Lead from Sheet Row</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='fullName'>Full Name*</Label>
            <Input
              id='fullName'
              value={leadData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder='John Smith'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='companyName'>Company Name</Label>
            <Input
              id='companyName'
              value={leadData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              placeholder='Acme Inc.'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={leadData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder='john@example.com'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone</Label>
            <Input
              id='phone'
              value={leadData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder='(123) 456-7890'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='jobTitle'>Job Title</Label>
            <Input
              id='jobTitle'
              value={leadData.jobTitle}
              onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              placeholder='Software Engineer'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={leadData.status}
              onValueChange={(value) => handleInputChange("status", value)}>
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
          </div>

          <div className='space-y-2'>
            <Label htmlFor='priority'>Priority</Label>
            <Select
              value={leadData.priority}
              onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger id='priority'>
                <SelectValue placeholder='Select a priority' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='tags'>Tags</Label>
          <div className='flex flex-wrap gap-2 mb-2'>
            {leadData.tags.map((tag) => (
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
              id='tags'
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
        </div>

        <div className='space-y-2'>
          <Label htmlFor='notes'>Notes</Label>
          <textarea
            id='notes'
            className='w-full min-h-[100px] p-2 border rounded-md'
            value={leadData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder='Add any additional notes about this lead...'
          />
        </div>

        <div className='flex justify-end gap-2 pt-4'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Lead"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
