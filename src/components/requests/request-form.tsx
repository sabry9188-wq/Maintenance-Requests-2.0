"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRequestSchema, type CreateRequestInput } from "@/lib/validation/request-schema";
import { createRequest } from "@/lib/actions/request-actions";
import { recordAttachment } from "@/lib/actions/attachment-actions";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/types/domain";
import { Upload, X } from "lucide-react";

interface FormOptions {
  stations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  areas: { id: string; station_id: string; name: string }[];
  assets: { id: string; station_id: string; name: string; asset_code: string }[];
  categories: { id: string; name: string }[];
  problemTypes: { id: string; category_id: string; name: string }[];
  defaultStationId?: string | null;
  defaultDepartmentId?: string | null;
}

export function RequestForm({ options }: { options: FormOptions }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      station_id: options.defaultStationId ?? "",
      department_id: options.defaultDepartmentId ?? "",
      priority: "MEDIUM",
      safety_risk: false,
      production_impact: false,
    },
  });

  const stationId = watch("station_id");
  const categoryId = watch("category_id");

  const filteredAreas = useMemo(
    () => options.areas.filter((a) => a.station_id === stationId),
    [options.areas, stationId]
  );
  const filteredAssets = useMemo(
    () => options.assets.filter((a) => a.station_id === stationId),
    [options.assets, stationId]
  );
  const filteredProblemTypes = useMemo(
    () => options.problemTypes.filter((p) => p.category_id === categoryId),
    [options.problemTypes, categoryId]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)].slice(0, 8));
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(values: CreateRequestInput) {
    setSubmitting(true);
    try {
      const result = await createRequest(values);
      if (!result.success) {
        toast.error(result.error);
        setSubmitting(false);
        return;
      }

      if (files.length > 0) {
        const supabase = createClient();
        for (const file of files) {
          const path = `${result.data.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("request-photos")
            .upload(path, file);
          if (!uploadError) {
            await recordAttachment(result.data.id, path, file.name, file.type, "REQUEST_PHOTO");
          }
        }
      }

      toast.success(`Request submitted successfully. Request Number: ${result.data.request_number}`);
      router.push(`/requests/${result.data.id}`);
    } catch {
      toast.error("Unable to submit maintenance request. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="station_id">Station</Label>
              <Select id="station_id" {...register("station_id")}>
                <option value="">Select station</option>
                {options.stations.map((s) => (
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
                {options.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors.department_id?.message}</FieldError>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="area_id">Area / Location</Label>
              <Select id="area_id" {...register("area_id")}>
                <option value="">Select area (optional)</option>
                {filteredAreas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="asset_id">Asset / Equipment</Label>
              <Select id="asset_id" {...register("asset_id")}>
                <option value="">Select equipment (optional)</option>
                {filteredAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.asset_code} - {a.name}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="category_id">Maintenance Category</Label>
              <Select id="category_id" {...register("category_id")}>
                <option value="">Select category</option>
                {options.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors.category_id?.message}</FieldError>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="problem_type_id">Problem Type</Label>
              <Select id="problem_type_id" {...register("problem_type_id")} disabled={!categoryId}>
                <option value="">Select problem type</option>
                {filteredProblemTypes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <FieldError>{errors.problem_type_id?.message}</FieldError>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" {...register("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </Select>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="problem_started_at">When did the problem start?</Label>
              <Input id="problem_started_at" type="datetime-local" {...register("problem_started_at")} />
            </FieldGroup>
          </div>

          <FieldGroup>
            <Label htmlFor="problem_title">Problem Title</Label>
            <Input id="problem_title" placeholder="Short summary of the problem" {...register("problem_title")} />
            <FieldError>{errors.problem_title?.message}</FieldError>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="problem_description">Problem Description</Label>
            <Textarea
              id="problem_description"
              rows={4}
              placeholder="Describe the problem in detail"
              {...register("problem_description")}
            />
            <FieldError>{errors.problem_description?.message}</FieldError>
          </FieldGroup>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldGroup>
              <Label htmlFor="is_operational">Is the equipment currently operational?</Label>
              <Select id="is_operational" {...register("is_operational")}>
                <option value="">Select</option>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
                <option value="PARTIALLY">Partially</option>
              </Select>
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="operational_impact">Operational Impact</Label>
              <Select id="operational_impact" {...register("operational_impact")}>
                <option value="">Select</option>
                <option value="NO_IMPACT">No impact</option>
                <option value="MINOR">Minor</option>
                <option value="MODERATE">Moderate</option>
                <option value="MAJOR">Major</option>
                <option value="OPERATION_STOPPED">Operation stopped</option>
              </Select>
            </FieldGroup>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <Checkbox {...register("safety_risk")} /> Safety risk involved
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <Checkbox {...register("production_impact")} /> Affects production
            </label>
          </div>

          <FieldGroup className="mt-4">
            <Label>Photo / Video Upload</Label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-6 text-sm text-neutral-500 hover:border-primary-400 hover:text-primary-600">
              <Upload className="h-4 w-4" />
              Click to upload photos or videos
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
            </label>
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-1.5 text-sm">
                    <span className="truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-neutral-400 hover:text-primary-600">
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="additional_comments">Additional Comments</Label>
            <Textarea id="additional_comments" rows={3} {...register("additional_comments")} />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}
