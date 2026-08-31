/** Never expose raw Postgres/Supabase error text to end users. */
export function toUserMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw = typeof error === "object" && error !== null && "message" in error
    ? String((error as { message: unknown }).message)
    : String(error);

  if (raw.includes("INVALID_STATUS_TRANSITION")) {
    return "That status change is not allowed from the current status.";
  }
  if (raw.includes("STATUS_TRANSITION_NOT_ALLOWED_FOR_ROLE")) {
    return "You do not have permission to make that status change.";
  }
  if (raw.includes("ONLY_ADMIN_CAN_CHANGE_ROLE_OR_ASSIGNMENT")) {
    return "Only an Administrator can change a user's role, station or department.";
  }
  if (raw.includes("row-level security") || raw.includes("permission denied")) {
    return "You do not have permission to perform this action.";
  }
  if (raw.includes("duplicate key")) {
    return "This record already exists.";
  }
  if (raw.includes("violates foreign key")) {
    return "This record is linked to other data and cannot be changed right now.";
  }

  return fallback;
}
