"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { userUpdateSchema, type UserUpdateInput } from "@/lib/validation/admin-schema";
import { updateUserAssignment } from "@/lib/actions/admin-actions";
import { Dialog } from "@/components/ui/dialog";
import { Select, Label, FieldGroup } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ALL_ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import type { ProfileRow, StationRow, DepartmentRow } from "@/lib/types/database.types";

type UserRow = ProfileRow & { station: { name: string } | null; department: { name: string } | null };

function UserDialog({
  user,
  stations,
  departments,
  open,
  onClose,
}: {
  user?: UserRow;
  stations: StationRow[];
  departments: DepartmentRow[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    values: user
      ? {
          id: user.id,
          role: user.role,
          station_id: user.station_id ?? "",
          department_id: user.department_id ?? "",
          is_active: user.is_active,
        }
      : undefined,
  });

  async function onSubmit(values: UserUpdateInput) {
    setSubmitting(true);
    const result = await updateUserAssignment(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("User updated.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} title={`Edit ${user.full_name}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="role">Role</Label>
          <Select id="role" {...register("role")}>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="station_id">Station</Label>
          <Select id="station_id" {...register("station_id")}>
            <option value="">No station</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="department_id">Department</Label>
          <Select id="department_id" {...register("department_id")}>
            <option value="">No department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
        <label className="mb-4 flex items-center gap-2 text-sm text-neutral-700">
          <Checkbox {...register("is_active")} /> Active
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </Dialog>
  );
}

export function UserRoleManager({
  users,
  stations,
  departments,
}: {
  users: UserRow[];
  stations: StationRow[];
  departments: DepartmentRow[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | undefined>(undefined);

  return (
    <div>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Station</Th>
            <Th>Department</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td className="font-medium text-neutral-900">{u.full_name}</Td>
              <Td className="text-neutral-500">{u.email}</Td>
              <Td>{ROLE_LABELS[u.role]}</Td>
              <Td>{u.station?.name ?? "-"}</Td>
              <Td>{u.department?.name ?? "-"}</Td>
              <Td>
                <Badge color={u.is_active ? "green" : "neutral"}>{u.is_active ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td>
                <button
                  onClick={() => {
                    setEditing(u);
                    setDialogOpen(true);
                  }}
                  className="text-neutral-400 hover:text-primary-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <UserDialog user={editing} stations={stations} departments={departments} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
