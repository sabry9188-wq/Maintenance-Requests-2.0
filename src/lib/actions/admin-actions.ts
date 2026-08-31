"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { toUserMessage } from "@/lib/utils/error-messages";
import {
  stationSchema,
  departmentSchema,
  areaSchema,
  categorySchema,
  problemTypeSchema,
  slaConfigSchema,
  userUpdateSchema,
  type StationInput,
  type DepartmentInput,
  type AreaInput,
  type CategoryInput,
  type ProblemTypeInput,
  type SlaConfigInput,
  type UserUpdateInput,
} from "@/lib/validation/admin-schema";
import type { ActionResult } from "./request-actions";

export async function saveStation(input: StationInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = stationSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("stations").update(values).eq("id", id)
    : await supabase.from("stations").insert(values);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/stations");
  return { success: true, data: undefined };
}

export async function saveDepartment(input: DepartmentInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = departmentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("departments").update(values).eq("id", id)
    : await supabase.from("departments").insert(values);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/departments");
  return { success: true, data: undefined };
}

export async function saveArea(input: AreaInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = areaSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("areas").update(values).eq("id", id)
    : await supabase.from("areas").insert(values);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/areas");
  return { success: true, data: undefined };
}

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("maintenance_categories").update(values).eq("id", id)
    : await supabase.from("maintenance_categories").insert(values);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/categories");
  return { success: true, data: undefined };
}

export async function saveProblemType(input: ProblemTypeInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = problemTypeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("maintenance_problem_types").update(values).eq("id", id)
    : await supabase.from("maintenance_problem_types").insert(values);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/categories");
  return { success: true, data: undefined };
}

export async function saveSlaConfig(input: SlaConfigInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = slaConfigSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("sla_config")
    .update({
      response_time_minutes: parsed.data.response_time_minutes,
      description: parsed.data.description || null,
    })
    .eq("priority", parsed.data.priority);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/settings/sla");
  return { success: true, data: undefined };
}

export async function updateUserAssignment(input: UserUpdateInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = userUpdateSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid data." };
  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      role: values.role,
      station_id: values.station_id || null,
      department_id: values.department_id || null,
      is_active: values.is_active,
    })
    .eq("id", id);
  if (error) return { success: false, error: toUserMessage(error) };
  revalidatePath("/users");
  return { success: true, data: undefined };
}
