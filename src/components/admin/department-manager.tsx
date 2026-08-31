"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { departmentSchema, type DepartmentInput } from "@/lib/validation/admin-schema";
import { saveDepartment } from "@/lib/actions/admin-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { DepartmentRow } from "@/lib/types/database.types";

function DepartmentDialog({
  department,
  open,
  onClose,
}: {
  department?: DepartmentRow;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    values: department
      ? { id: department.id, name: department.name, description: department.description ?? "", is_active: department.is_active }
      : { name: "", description: "", is_active: true },
  });

  async function onSubmit(values: DepartmentInput) {
    setSubmitting(true);
    const result = await saveDepartment(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Department saved.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={department ? "Edit Department" : "Add Department"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={2} {...register("description")} />
        </FieldGroup>
        <label className="mb-4 flex items-center gap-2 text-sm text-neutral-700">
          <Checkbox {...register("is_active")} /> Active
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

export function DepartmentManager({ departments }: { departments: DepartmentRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentRow | undefined>(undefined);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditing(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {departments.map((d) => (
            <Tr key={d.id}>
              <Td className="font-medium text-neutral-900">{d.name}</Td>
              <Td className="text-neutral-500">{d.description ?? "-"}</Td>
              <Td>
                <Badge color={d.is_active ? "green" : "neutral"}>{d.is_active ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td>
                <button
                  onClick={() => {
                    setEditing(d);
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
      <DepartmentDialog department={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
