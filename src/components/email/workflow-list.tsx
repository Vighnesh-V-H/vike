"use client";

import { useState } from "react";
import {
  Trash2,
  Edit,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock workflows data
const mockWorkflows = [
  {
    id: "1",
    name: "Newsletter Filter",
    description: "Automatically categorize newsletters into a dedicated folder",
    isActive: true,
    conditions: [
      { type: "subject", operator: "contains", value: "newsletter" },
      { type: "from", operator: "contains", value: "news@" },
    ],
    actions: [
      { type: "categorize", value: "Newsletters" },
      { type: "markRead", value: true },
    ],
    executionCount: 124,
    createdAt: new Date(2023, 5, 10),
  },
  {
    id: "2",
    name: "Important Client Emails",
    description: "Highlight emails from key clients and notify me",
    isActive: true,
    conditions: [
      { type: "from", operator: "contains", value: "clientA@example.com" },
      { type: "from", operator: "contains", value: "clientB@example.com" },
    ],
    actions: [
      { type: "star", value: true },
      { type: "categorize", value: "VIP" },
      { type: "notify", value: true },
    ],
    executionCount: 45,
    createdAt: new Date(2023, 6, 15),
  },
  {
    id: "3",
    name: "Auto Archive Promotions",
    description: "Archive promotional emails after 3 days",
    isActive: false,
    conditions: [
      { type: "subject", operator: "contains", value: "offer" },
      { type: "subject", operator: "contains", value: "discount" },
      { type: "subject", operator: "contains", value: "promotion" },
    ],
    actions: [
      { type: "archive", value: true },
      { type: "delay", value: "3d" },
    ],
    executionCount: 78,
    createdAt: new Date(2023, 7, 22),
  },
];

export function WorkflowList() {
  const [workflows, setWorkflows] = useState(mockWorkflows);

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((workflow) =>
        workflow.id === id
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow
      )
    );
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Workflows</CardTitle>
        <CardDescription>
          Manage your automated email processing rules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {workflows.length === 0 ? (
            <div className='text-center p-6 border rounded-md'>
              <p className='text-muted-foreground'>
                You don't have any workflows yet.
              </p>
              <Button className='mt-2'>Create your first workflow</Button>
            </div>
          ) : (
            workflows.map((workflow) => (
              <div key={workflow.id} className='border rounded-md p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium'>{workflow.name}</h3>
                      <Badge
                        variant={workflow.isActive ? "default" : "outline"}>
                        {workflow.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {workflow.description}
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Switch
                      checked={workflow.isActive}
                      onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Edit className='h-4 w-4 mr-2' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <PlayCircle className='h-4 w-4 mr-2' />
                          Run Now
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <PauseCircle className='h-4 w-4 mr-2' />
                          Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() => deleteWorkflow(workflow.id)}>
                          <Trash2 className='h-4 w-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4 mt-4'>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>
                      Trigger Conditions
                    </h4>
                    <div className='bg-muted p-2 rounded-md text-xs space-y-1'>
                      {workflow.conditions.map((condition, i) => (
                        <div key={i} className='flex items-center gap-1'>
                          <Badge variant='outline' className='text-xs'>
                            {condition.type}
                          </Badge>
                          <span>{condition.operator}</span>
                          <span className='font-mono bg-background px-1 rounded'>
                            "{condition.value}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className='text-sm font-medium mb-2'>Actions</h4>
                    <div className='bg-muted p-2 rounded-md text-xs space-y-1'>
                      {workflow.actions.map((action, i) => (
                        <div key={i} className='flex items-center gap-1'>
                          <Badge variant='outline' className='text-xs'>
                            {action.type}
                          </Badge>
                          <span className='font-mono bg-background px-1 rounded'>
                            {typeof action.value === "boolean"
                              ? action.value
                                ? "true"
                                : "false"
                              : action.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='mt-4 pt-2 border-t flex justify-between text-xs text-muted-foreground'>
                  <span>
                    Created: {workflow.createdAt.toLocaleDateString()}
                  </span>
                  <span>Executed {workflow.executionCount} times</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
