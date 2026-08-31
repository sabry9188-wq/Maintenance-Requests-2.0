import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-role";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, LayoutGrid, Tag, Clock, User } from "lucide-react";

const SETTINGS_LINKS = [
  { href: "/settings/stations", label: "Stations", description: "Manage Station 01-07 and their details.", icon: Building2 },
  { href: "/settings/departments", label: "Departments", description: "Manage departments across the organization.", icon: LayoutGrid },
  { href: "/settings/areas", label: "Areas", description: "Manage areas/locations within each station.", icon: MapPin },
  { href: "/settings/categories", label: "Categories & Problem Types", description: "Manage the maintenance category taxonomy.", icon: Tag },
  { href: "/settings/sla", label: "SLA / Response Time", description: "Configure response time targets per priority.", icon: Clock },
  { href: "/settings/profile", label: "My Profile", description: "Update your own account details.", icon: User },
];

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">System configuration and reference data.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-3">
                <link.icon className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="font-medium text-neutral-900">{link.label}</p>
                  <p className="mt-1 text-sm text-neutral-500">{link.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
