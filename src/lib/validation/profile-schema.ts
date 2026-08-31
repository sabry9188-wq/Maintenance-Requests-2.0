import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  employee_id: z.string().trim().optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;
