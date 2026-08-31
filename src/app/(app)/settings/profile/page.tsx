import { requireSessionUser } from "@/lib/auth/get-session";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { ProfileForm } from "@/components/admin/profile-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await requireSessionUser();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">My Profile</h1>
        <p className="text-sm text-neutral-500">Your account details. Contact an Administrator to change your role, station or department.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs uppercase text-neutral-400">Email</p>
              <p className="font-medium text-neutral-800">{session.profile.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-400">Role</p>
              <p className="font-medium text-neutral-800">{ROLE_LABELS[session.profile.role]}</p>
            </div>
          </div>
          <ProfileForm profile={session.profile} />
        </CardContent>
      </Card>
    </div>
  );
}
