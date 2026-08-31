import { z } from "zod";

export const createRequestSchema = z.object({
  station_id: z.string().uuid("Please select a station"),
  department_id: z.string().uuid("Please select a department"),
  area_id: z.string().uuid().optional().or(z.literal("")),
  asset_id: z.string().uuid().optional().or(z.literal("")),
  category_id: z.string().uuid("Please select a maintenance category"),
  problem_type_id: z.string().uuid("Please select a problem type"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    required_error: "Please select a priority",
  }),
  problem_title: z
    .string()
    .trim()
    .min(5, "Please enter a short title (at least 5 characters)")
    .max(200, "Title is too long"),
  problem_description: z
    .string()
    .trim()
    .min(10, "Please describe the problem in more detail (at least 10 characters)"),
  problem_started_at: z.string().optional().or(z.literal("")),
  is_operational: z.enum(["YES", "NO", "PARTIALLY"]).optional(),
  operational_impact: z
    .enum(["NO_IMPACT", "MINOR", "MODERATE", "MAJOR", "OPERATION_STOPPED"])
    .optional(),
  safety_risk: z.boolean().default(false),
  production_impact: z.boolean().default(false),
  additional_comments: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
