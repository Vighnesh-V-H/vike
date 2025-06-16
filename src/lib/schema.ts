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
  value: z.union([z.string(), z.number()]).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().describe("Notes about the lead"),
  position: z.number(),
});
