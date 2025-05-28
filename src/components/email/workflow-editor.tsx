"use client";
import { useState } from "react";
import {
  Plus,
  Trash2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Save,
  Undo,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Types for workflow conditions and actions
type Condition = {
  id: string;
  type: string;
  operator: string;
  value: string;
};

type Action = {
  id: string;
  type: string;
  value: string | boolean;
};

type Workflow = {
  name: string;
  description: string;
  isActive: boolean;
  conditions: Condition[];
  actions: Action[];
};

// Available condition types and operators
const conditionTypes = [
  { value: "subject", label: "Subject" },
  { value: "from", label: "From" },
  { value: "to", label: "To" },
  { value: "body", label: "Body" },
  { value: "hasAttachment", label: "Has Attachment" },
  { value: "receivedDate", label: "Received Date" },
];

const conditionOperators = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts With" },
  { value: "endsWith", label: "Ends With" },
  { value: "matches", label: "Matches Regex" },
  { value: "before", label: "Before (Date)" },
  { value: "after", label: "After (Date)" },
];

// Available action types
const actionTypes = [
  { value: "categorize", label: "Categorize" },
  { value: "markRead", label: "Mark as Read" },
  { value: "star", label: "Star" },
  { value: "archive", label: "Archive" },
  { value: "move", label: "Move to Folder" },
  { value: "forward", label: "Forward" },
  { value: "reply", label: "Auto Reply" },
  { value: "delete", label: "Delete" },
  { value: "delay", label: "Delay Processing" },
  { value: "notify", label: "Send Notification" },
];

export function WorkflowEditor() {
  const [workflow, setWorkflow] = useState<Workflow>({
    name: "",
    description: "",
    isActive: true,
    conditions: [
      {
        id: crypto.randomUUID(),
        type: "subject",
        operator: "contains",
        value: "",
      },
    ],
    actions: [{ id: crypto.randomUUID(), type: "categorize", value: "" }],
  });

  // Add a new condition
  const addCondition = () => {
    setWorkflow((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: crypto.randomUUID(),
          type: "subject",
          operator: "contains",
          value: "",
        },
      ],
    }));
  };

  // Remove a condition
  const removeCondition = (id: string) => {
    if (workflow.conditions.length > 1) {
      setWorkflow((prev) => ({
        ...prev,
        conditions: prev.conditions.filter((condition) => condition.id !== id),
      }));
    }
  };

  // Update a condition
  const updateCondition = (
    id: string,
    field: keyof Condition,
    value: string
  ) => {
    setWorkflow((prev) => ({
      ...prev,
      conditions: prev.conditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      ),
    }));
  };

  // Add a new action
  const addAction = () => {
    setWorkflow((prev) => ({
      ...prev,
      actions: [
        ...prev.actions,
        { id: crypto.randomUUID(), type: "categorize", value: "" },
      ],
    }));
  };

  // Remove an action
  const removeAction = (id: string) => {
    if (workflow.actions.length > 1) {
      setWorkflow((prev) => ({
        ...prev,
        actions: prev.actions.filter((action) => action.id !== id),
      }));
    }
  };

  // Update an action
  const updateAction = (
    id: string,
    field: keyof Action,
    value: string | boolean
  ) => {
    setWorkflow((prev) => ({
      ...prev,
      actions: prev.actions.map((action) =>
        action.id === id ? { ...action, [field]: value } : action
      ),
    }));
  };

  // Update workflow metadata
  const updateWorkflow = (field: keyof Workflow, value: string | boolean) => {
    setWorkflow((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset the workflow
  const resetWorkflow = () => {
    setWorkflow({
      name: "",
      description: "",
      isActive: true,
      conditions: [
        {
          id: crypto.randomUUID(),
          type: "subject",
          operator: "contains",
          value: "",
        },
      ],
      actions: [{ id: crypto.randomUUID(), type: "categorize", value: "" }],
    });
  };

  // Save the workflow
  const saveWorkflow = () => {
    // Here you would typically call an API to save the workflow
    console.log("Saving workflow:", workflow);
    alert("Workflow saved successfully!");
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='workflow-name'>Workflow Name</Label>
          <Input
            id='workflow-name'
            value={workflow.name}
            onChange={(e) => updateWorkflow("name", e.target.value)}
            placeholder='e.g., Newsletter Filter'
            className='mt-1'
          />
        </div>
        <div className='flex items-end gap-2'>
          <div className='flex-1'>
            <Label htmlFor='workflow-status'>Status</Label>
            <div className='flex items-center gap-2 mt-3'>
              <Switch
                id='workflow-status'
                checked={workflow.isActive}
                onCheckedChange={(value) => updateWorkflow("isActive", value)}
              />
              <span className='text-sm'>
                {workflow.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor='workflow-description'>Description</Label>
        <Input
          id='workflow-description'
          value={workflow.description}
          onChange={(e) => updateWorkflow("description", e.target.value)}
          placeholder='Briefly describe what this workflow does'
          className='mt-1'
        />
      </div>

      <Separator />

      <Accordion type='single' collapsible defaultValue='conditions'>
        <AccordionItem value='conditions'>
          <AccordionTrigger>
            <div className='flex items-center gap-2'>
              <span>Trigger Conditions</span>
              <span className='text-xs text-muted-foreground'>
                ({workflow.conditions.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='space-y-3'>
              {workflow.conditions.map((condition, index) => (
                <div
                  key={condition.id}
                  className='border rounded-md p-3 bg-muted/30'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-sm font-medium'>
                      Condition {index + 1}
                    </h4>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0'
                      onClick={() => removeCondition(condition.id)}
                      disabled={workflow.conditions.length <= 1}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='grid grid-cols-3 gap-3'>
                    <div>
                      <Label className='text-xs'>Field</Label>
                      <Select
                        value={condition.type}
                        onValueChange={(value) =>
                          updateCondition(condition.id, "type", value)
                        }>
                        <SelectTrigger className='h-8 mt-1'>
                          <SelectValue placeholder='Select field' />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className='text-xs'>Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(condition.id, "operator", value)
                        }>
                        <SelectTrigger className='h-8 mt-1'>
                          <SelectValue placeholder='Select operator' />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionOperators.map((operator) => (
                            <SelectItem
                              key={operator.value}
                              value={operator.value}>
                              {operator.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className='text-xs'>Value</Label>
                      <Input
                        className='h-8 mt-1'
                        value={condition.value}
                        onChange={(e) =>
                          updateCondition(condition.id, "value", e.target.value)
                        }
                        placeholder='Value to match'
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant='outline'
                size='sm'
                onClick={addCondition}
                className='w-full'>
                <Plus className='h-4 w-4 mr-2' />
                Add Condition
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value='actions'>
          <AccordionTrigger>
            <div className='flex items-center gap-2'>
              <span>Actions to Perform</span>
              <span className='text-xs text-muted-foreground'>
                ({workflow.actions.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className='space-y-3'>
              {workflow.actions.map((action, index) => (
                <div
                  key={action.id}
                  className='border rounded-md p-3 bg-muted/30'>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-sm font-medium'>Action {index + 1}</h4>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0'
                      onClick={() => removeAction(action.id)}
                      disabled={workflow.actions.length <= 1}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <Label className='text-xs'>Action Type</Label>
                      <Select
                        value={action.type}
                        onValueChange={(value) =>
                          updateAction(action.id, "type", value)
                        }>
                        <SelectTrigger className='h-8 mt-1'>
                          <SelectValue placeholder='Select action' />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className='text-xs'>Value</Label>
                      {action.type === "markRead" ||
                      action.type === "star" ||
                      action.type === "archive" ||
                      action.type === "notify" ? (
                        <div className='flex items-center h-8 mt-1'>
                          <Switch
                            checked={Boolean(action.value)}
                            onCheckedChange={(value) =>
                              updateAction(action.id, "value", value)
                            }
                          />
                          <span className='ml-2 text-sm'>
                            {Boolean(action.value) ? "Yes" : "No"}
                          </span>
                        </div>
                      ) : (
                        <Input
                          className='h-8 mt-1'
                          value={String(action.value)}
                          onChange={(e) =>
                            updateAction(action.id, "value", e.target.value)
                          }
                          placeholder={
                            action.type === "categorize"
                              ? "Category name"
                              : action.type === "move"
                              ? "Folder name"
                              : action.type === "forward"
                              ? "Email address"
                              : action.type === "reply"
                              ? "Template name"
                              : action.type === "delay"
                              ? "Duration (e.g. 3d)"
                              : "Value"
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant='outline'
                size='sm'
                onClick={addAction}
                className='w-full'>
                <Plus className='h-4 w-4 mr-2' />
                Add Action
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className='flex justify-between items-center pt-4'>
        <Button variant='outline' onClick={resetWorkflow}>
          <Undo className='h-4 w-4 mr-2' />
          Reset
        </Button>
        <Button onClick={saveWorkflow}>
          <Save className='h-4 w-4 mr-2' />
          Save Workflow
        </Button>
      </div>
    </div>
  );
}
