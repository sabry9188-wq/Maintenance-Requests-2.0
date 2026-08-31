"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { stationSchema, type StationInput } from "@/lib/validation/admin-schema";
import { saveStation } from "@/lib/actions/admin-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { StationRow } from "@/lib/types/database.types";

function StationDialog({
  station,
  open,
  onClose,
}: {
  station?: StationRow;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StationInput>({
    resolver: zodResolver(stationSchema),
    values: station
      ? { id: station.id, code: station.code, name: station.name, description: station.description ?? "", is_active: station.is_active }
      : { code: "", name: "", description: "", is_active: true },
  });

  async function onSubmit(values: StationInput) {
    setSubmitting(true);
    const result = await saveStation(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Station saved.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={station ? "Edit Station" : "Add Station"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="code">Code</Label>
          <Input id="code" placeholder="01" {...register("code")} />
          <FieldError>{errors.code?.message}</FieldError>
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Station 01" {...register("name")} />
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

export function StationManager({ stations }: { stations: StationRow[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StationRow | undefined>(undefined);

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
          <Plus className="h-4 w-4" /> Add Station
        </Button>
      </div>
      <Table>
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {stations.map((s) => (
            <Tr key={s.id}>
              <Td className="font-medium text-neutral-900">{s.code}</Td>
              <Td>{s.name}</Td>
              <Td className="text-neutral-500">{s.description ?? "-"}</Td>
              <Td>
                <Badge color={s.is_active ? "green" : "neutral"}>{s.is_active ? "Active" : "Inactive"}</Badge>
              </Td>
              <Td>
                <button
                  onClick={() => {
                    setEditing(s);
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
      <StationDialog station={editing} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
