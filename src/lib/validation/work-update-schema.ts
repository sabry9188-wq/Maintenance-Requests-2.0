import { z } from "zod";

export const workUpdateSchema = z.object({
  request_id: z.string().uuid(),
  work_description: z.string().trim().min(3, "Please describe the update"),
  diagnosis: z.string().trim().optional().or(z.literal("")),
  action_taken: z.string().trim().optional().or(z.literal("")),
  additional_notes: z.string().trim().optional().or(z.literal("")),
  parts: z
    .array(
      z.object({
        part_name: z.string().trim().min(1, "Part name is required"),
        part_number: z.string().trim().optional().or(z.literal("")),
        quantity: z.coerce.number().positive("Quantity must be greater than 0"),
        unit: z.string().trim().optional().or(z.literal("")),
        unit_cost: z.coerce.number().min(0).optional(),
        remarks: z.string().trim().optional().or(z.literal("")),
      })
    )
    .default([]),
});

export type WorkUpdateInput = z.infer<typeof workUpdateSchema>;

export const completionReportSchema = z.object({
  request_id: z.string().uuid(),
  root_cause: z.string().trim().min(3, "Please describe the root cause"),
  problem_found: z.string().trim().min(3, "Please describe the problem found"),
  work_performed: z.string().trim().min(3, "Please describe the work performed"),
  downtime_minutes: z.coerce.number().min(0).optional(),
  total_labour_hours: z.coerce.number().min(0).optional(),
  external_contractor_used: z.boolean().default(false),
  contractor_name: z.string().trim().optional().or(z.literal("")),
  final_remarks: z.string().trim().optional().or(z.literal("")),
});

export type CompletionReportInput = z.infer<typeof completionReportSchema>;
