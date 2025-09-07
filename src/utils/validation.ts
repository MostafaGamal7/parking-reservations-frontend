import { z } from "zod";

// Login form validation schema
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  password: z
    .string()
    .min(5, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  role: z.enum(["employee", "admin"], {
    message: "Please select a role",
  }),
});

// Admin login schema (more strict)
export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  password: z
    .string()
    .min(5, "Admin password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
});

// Employee login schema
export const employeeLoginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be less than 50 characters"),
  password: z
    .string()
    .min(5, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
export type EmployeeLoginFormData = z.infer<typeof employeeLoginSchema>;
