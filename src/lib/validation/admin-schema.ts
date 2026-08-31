import { z } from "zod";

export const stationSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1, "Code is required").max(10),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type StationInput = z.infer<typeof stationSchema>;

export const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type DepartmentInput = z.infer<typeof departmentSchema>;

export const areaSchema = z.object({
  id: z.string().uuid().optional(),
  station_id: z.string().uuid("Please select a station"),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type AreaInput = z.infer<typeof areaSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required"),
  applies_to: z.string().trim().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const problemTypeSchema = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid("Please select a category"),
  name: z.string().trim().min(1, "Name is required"),
  is_active: z.boolean().default(true),
});
export type ProblemTypeInput = z.infer<typeof problemTypeSchema>;

export const slaConfigSchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  response_time_minutes: z.coerce.number().int().min(0),
  description: z.string().trim().optional().or(z.literal("")),
});
export type SlaConfigInput = z.infer<typeof slaConfigSchema>;

export const assetSchema = z.object({
  id: z.string().uuid().optional(),
  asset_code: z.string().trim().min(1, "Asset code is required"),
  name: z.string().trim().min(1, "Name is required"),
  station_id: z.string().uuid("Please select a station"),
  department_id: z.string().uuid().optional().or(z.literal("")),
  area_id: z.string().uuid().optional().or(z.literal("")),
  equipment_type: z.string().trim().optional().or(z.literal("")),
  manufacturer: z.string().trim().optional().or(z.literal("")),
  model: z.string().trim().optional().or(z.literal("")),
  serial_number: z.string().trim().optional().or(z.literal("")),
  installation_date: z.string().optional().or(z.literal("")),
  status: z.enum(["OPERATIONAL", "DOWN", "UNDER_REPAIR", "DECOMMISSIONED"]).default("OPERATIONAL"),
  criticality: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  notes: z.string().trim().optional().or(z.literal("")),
});
export type AssetInput = z.infer<typeof assetSchema>;

export const userUpdateSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["ADMIN", "STATION_USER", "ENGINEERING_MANAGER", "ENGINEER", "MANAGEMENT_VIEW_ONLY"]),
  station_id: z.string().uuid().optional().or(z.literal("")),
  department_id: z.string().uuid().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
