"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { assetSchema, type AssetInput } from "@/lib/validation/admin-schema";
import { saveAsset } from "@/lib/actions/asset-actions";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AssetForm({
  asset,
  stations,
  departments,
  areas,
}: {
  asset?: AssetInput;
  stations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  areas: { id: string; station_id: string; name: string }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AssetInput>({
    resolver: zodResolver(assetSchema),
    defaultValues: asset ?? { status: "OPERATIONAL", criticality: "MEDIUM" },
  });
  const stationId = watch("station_id");

  async function onSubmit(values: AssetInput) {
    setSubmitting(true);
    const result = await saveAsset(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Asset saved.");
      router.push("/assets");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="asset_code">Asset ID / Code</Label>
            <Input id="asset_code" placeholder="ST01-PUMP-001" {...register("asset_code")} />
            <FieldError>{errors.asset_code?.message}</FieldError>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="name">Asset Name</Label>
            <Input id="name" {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </FieldGroup>
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
            <Label htmlFor="department_id">Department</Label>
            <Select id="department_id" {...register("department_id")}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="area_id">Area</Label>
            <Select id="area_id" {...register("area_id")}>
              <option value="">Select area</option>
              {areas.filter((a) => a.station_id === stationId).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="equipment_type">Equipment Type</Label>
            <Input id="equipment_type" {...register("equipment_type")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input id="manufacturer" {...register("manufacturer")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="model">Model</Label>
            <Input id="model" {...register("model")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="serial_number">Serial Number</Label>
            <Input id="serial_number" {...register("serial_number")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="installation_date">Installation Date</Label>
            <Input id="installation_date" type="date" {...register("installation_date")} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="OPERATIONAL">Operational</option>
              <option value="DOWN">Down</option>
              <option value="UNDER_REPAIR">Under Repair</option>
              <option value="DECOMMISSIONED">Decommissioned</option>
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="criticality">Criticality</Label>
            <Select id="criticality" {...register("criticality")}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </Select>
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </FieldGroup>
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Asset"}
        </Button>
      </div>
    </form>
  );
}
