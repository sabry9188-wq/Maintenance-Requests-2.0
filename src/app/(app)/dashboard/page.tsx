import { requireSessionUser } from "@/lib/auth/get-session";
import { EngineeringDashboard } from "./engineering-dashboard";
import { StationDashboard } from "./station-dashboard";
import { ManagementDashboard } from "./management-dashboard";

export default async function DashboardPage() {
  const session = await requireSessionUser();
  const role = session.profile.role;

  if (role === "ENGINEERING_MANAGER" || role === "ENGINEER" || role === "ADMIN") {
    return <EngineeringDashboard />;
  }
  if (role === "MANAGEMENT_VIEW_ONLY") {
    return <ManagementDashboard />;
  }
  return <StationDashboard userId={session.id} />;
}
