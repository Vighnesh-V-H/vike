import * as z from "zod";

export const SignUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});

export const SignInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z.string().min(6, "Password must be atleast 6 characters"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ message: "Email is Required" })
    .email("Invalid email format"),
});

export const newPasswordSchema = z.object({
  password: z
    .string({ message: "password is required" })
    .min(6, "Password must be at least 6 characters"), // Adjust minimum length as needed
});

export const googleTaskSchema = z.object({
  title: z.string().describe("the task title"),
  notes: z.string().optional().describe("notes or details about the task"),
  due: z.string().optional().describe("due date/time in ISO 8601 format"),
  taskListId: z
    .string()
    .optional()
    .describe("the ID of the task list to insert into"),
});

export const leadSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z
    .string()
    .email("Invalid email format")
    .describe("Email address")
    .optional(),
  phone: z.string().describe("Phone number"),
  companyName: z.string().describe("Company name"),
  jobTitle: z.string().describe("Job title"),
  source: z.string().describe("Source of the lead"),
  tags: z.array(z.string()),
  status: z.enum(["new", "contacted", "won", "lost"]),
  priority: z.enum(["high", "medium", "low"]),
  value: z.union([z.string(), z.number()]).optional().nullable(),
  assignedTo: z.string().optional(),
  notes: z.string().describe("Notes about the lead"),
  position: z.number(),
});

export const addToLeadSchema = z.object({
  sheetName: z.string().describe("The name of the Google Sheet to import"),
});

export const displayLeadsSchema = z.object({
  status: z
    .string()
    .optional()
    .describe("Filter leads by their status, e.g., 'new', 'contacted'."),
  priority: z
    .string()
    .optional()
    .describe("Filter leads by their priority, e.g., 'high', 'low'."),
  source: z
    .string()
    .optional()
    .describe("Filter leads by their original source."),
  assignedTo: z
    .string()
    .optional()
    .describe("Find leads assigned to a specific person."),
  tag: z.string().optional().describe("Find leads containing a specific tag."),
  email: z
    .string()
    .optional()
    .describe("Find a lead by their exact email address."),
});

export const deleteFilterSchema = z.object({
  identifier: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  source: z.string().optional(),
});

export const deleteLeadsSchema = z.object({
  identifier: z
    .string()
    .optional()
    .describe("The full name or email of a single lead to delete."),

  status: z
    .string()
    .optional()
    .describe("The status for bulk deleting leads (e.g., 'lost', 'won')."),
  priority: z
    .string()
    .optional()
    .describe("The priority for bulk deleting leads."),
  source: z.string().optional().describe("The source for bulk deleting leads."),
});