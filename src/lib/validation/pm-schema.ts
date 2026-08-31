import { z } from "zod";

export const pmSchema = z.object({
  id: z.string().uuid().optional(),
  asset_id: z.string().uuid("Please select an asset"),
  maintenance_type: z.string().trim().min(1, "Maintenance type is required"),
  frequency_days: z.coerce.number().int().positive("Frequency must be greater than 0"),
  next_due_date: z.string().min(1, "Next due date is required"),
  responsible_person_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "PAUSED", "RETIRED"]).default("ACTIVE"),
  notes: z.string().trim().optional().or(z.literal("")),
});
export type PmInput = z.infer<typeof pmSchema>;
