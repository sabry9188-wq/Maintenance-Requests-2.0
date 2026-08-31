"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { areaSchema, type AreaInput } from "@/lib/validation/admin-schema";
import { saveArea } from "@/lib/actions/admin-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AreaRow, StationRow } from "@/lib/types/database.types";

function AreaDialog({
  area,
  stations,
  open,
  onClose,
}: {
  area?: AreaRow;
  stations: StationRow[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AreaInput>({
    resolver: zodResolver(areaSchema),
    values: area
      ? { id: area.id, station_id: area.station_id, name: area.name, description: area.description ?? "", is_active: area.is_active }
      : { station_id: "", name: "", description: "", is_active: true },
  });

  async function onSubmit(values: AreaInput) {
    setSubmitting(true);
    const result = await saveArea(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Area saved.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={area ? "Edit Area" : "Add Area"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="station_id">Station</Label>
          <Select id="station_id" {...register("station_id")}>
            <option value="">Select station</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <FieldError>{errors.station_id?.message}</FieldError>
        </FieldGroup>
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

export function AreaManager({ areas, stations }: { areas: (AreaRow & { station: { name: string } | null })[]; stations: StationRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AreaRow | undefined>(undefined);

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
          <Plus className="h-4 w-4" /> Add Area
        </Button>
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>Station</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {areas.map((a) => (
            <Tr key={a.id}>
              <Td>{a.station?.name ?? "-"}</Td>
              <Td className="font-medium text-neutral-900">{a.name}</Td>
              <Td>
                <Badge color={a.is_active ? "green" : "neutral"}>{a.is_active ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td>
                <button
                  onClick={() => {
                    setEditing(a);
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
      <AreaDialog area={editing} stations={stations} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
