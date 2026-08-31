import type { NotificationType } from "@/lib/types/database.types";

export function notificationTemplate(
  type: NotificationType,
  requestNumber: string,
  extra?: string
): { title: string; body: string } {
  switch (type) {
    case "REQUEST_SUBMITTED":
      return {
        title: `New maintenance request ${requestNumber}`,
        body: `A new maintenance request ${requestNumber} has been submitted and needs review.`,
      };
    case "ACKNOWLEDGED":
      return {
        title: `Request ${requestNumber} received by Engineering`,
        body: `Your maintenance request ${requestNumber} has been received by Engineering.`,
      };
    case "ASSIGNED":
      return {
        title: `Request ${requestNumber} assigned`,
        body: `Maintenance request ${requestNumber} has been assigned to ${extra ?? "a technician"}.`,
      };
    case "WORK_STARTED":
      return {
        title: `Work started on ${requestNumber}`,
        body: `Work has started on your maintenance request ${requestNumber}.`,
      };
    case "STATUS_CHANGED":
      return {
        title: `Request ${requestNumber} status updated`,
        body: `Maintenance request ${requestNumber} status changed to ${extra ?? ""}.`,
      };
    case "WAITING_FOR_PARTS":
      return {
        title: `Request ${requestNumber} waiting for parts`,
        body: `Maintenance request ${requestNumber} is now waiting for parts.`,
      };
    case "COMPLETED":
      return {
        title: `Request ${requestNumber} completed`,
        body: `Maintenance request ${requestNumber} has been completed by Engineering. Please review and confirm.`,
      };
    case "CONFIRMATION_REQUIRED":
      return {
        title: `Please confirm request ${requestNumber}`,
        body: `Engineering has completed maintenance request ${requestNumber}. Please confirm the work or reopen the request.`,
      };
    case "REOPENED":
      return {
        title: `Request ${requestNumber} reopened`,
        body: `Maintenance request ${requestNumber} has been reopened${extra ? `: ${extra}` : "."}`,
      };
    case "CLOSED":
      return {
        title: `Request ${requestNumber} closed`,
        body: `Maintenance request ${requestNumber} has been confirmed and closed.`,
      };
    default:
      return { title: `Update on ${requestNumber}`, body: "" };
  }
}
