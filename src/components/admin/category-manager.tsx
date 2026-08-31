"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, ChevronDown, ChevronRight } from "lucide-react";
import { categorySchema, problemTypeSchema, type CategoryInput, type ProblemTypeInput } from "@/lib/validation/admin-schema";
import { saveCategory, saveProblemType } from "@/lib/actions/admin-actions";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MaintenanceCategoryRow, MaintenanceProblemTypeRow } from "@/lib/types/database.types";

type CategoryWithTypes = MaintenanceCategoryRow & { maintenance_problem_types: MaintenanceProblemTypeRow[] };

function CategoryDialog({ category, open, onClose }: { category?: MaintenanceCategoryRow; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    values: category
      ? { id: category.id, name: category.name, applies_to: category.applies_to ?? "", is_active: category.is_active }
      : { name: "", applies_to: "", is_active: true },
  });

  async function onSubmit(values: CategoryInput) {
    setSubmitting(true);
    const result = await saveCategory(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Category saved.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={category ? "Edit Category" : "Add Category"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="cat_name">Name</Label>
          <Input id="cat_name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
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

function ProblemTypeDialog({
  categoryId,
  problemType,
  open,
  onClose,
}: {
  categoryId: string;
  problemType?: MaintenanceProblemTypeRow;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ProblemTypeInput>({
    resolver: zodResolver(problemTypeSchema),
    values: problemType
      ? { id: problemType.id, category_id: categoryId, name: problemType.name, is_active: problemType.is_active }
      : { category_id: categoryId, name: "", is_active: true },
  });

  async function onSubmit(values: ProblemTypeInput) {
    setSubmitting(true);
    const result = await saveProblemType(values);
    setSubmitting(false);
    if (result.success) {
      toast.success("Problem type saved.");
      onClose();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={problemType ? "Edit Problem Type" : "Add Problem Type"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Label htmlFor="pt_name">Name</Label>
          <Input id="pt_name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
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

export function CategoryManager({ categories }: { categories: CategoryWithTypes[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MaintenanceCategoryRow | undefined>(undefined);
  const [ptDialogOpen, setPtDialogOpen] = useState(false);
  const [ptCategoryId, setPtCategoryId] = useState<string>("");
  const [editingProblemType, setEditingProblemType] = useState<MaintenanceProblemTypeRow | undefined>(undefined);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            setEditingCategory(undefined);
            setCatDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => toggle(cat.id)} className="flex items-center gap-2 text-left">
                {expanded.has(cat.id) ? (
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-neutral-400" />
                )}
                <span className="font-medium text-neutral-900">{cat.name}</span>
                <Badge color={cat.is_active ? "green" : "neutral"}>{cat.is_active ? "Active" : "Inactive"}</Badge>
                <span className="text-xs text-neutral-400">{cat.maintenance_problem_types.length} problem types</span>
              </button>
              <button
                onClick={() => {
                  setEditingCategory(cat);
                  setCatDialogOpen(true);
                }}
                className="text-neutral-400 hover:text-primary-600"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            {expanded.has(cat.id) && (
              <div className="bg-neutral-50 px-8 py-3">
                <ul className="space-y-1.5">
                  {cat.maintenance_problem_types.map((pt) => (
                    <li key={pt.id} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-700">{pt.name}</span>
                      <button
                        onClick={() => {
                          setPtCategoryId(cat.id);
                          setEditingProblemType(pt);
                          setPtDialogOpen(true);
                        }}
                        className="text-neutral-400 hover:text-primary-600"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setPtCategoryId(cat.id);
                    setEditingProblemType(undefined);
                    setPtDialogOpen(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Problem Type
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <CategoryDialog category={editingCategory} open={catDialogOpen} onClose={() => setCatDialogOpen(false)} />
      <ProblemTypeDialog
        categoryId={ptCategoryId}
        problemType={editingProblemType}
        open={ptDialogOpen}
        onClose={() => setPtDialogOpen(false)}
      />
    </div>
  );
}
