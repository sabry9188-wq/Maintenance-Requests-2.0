import { requireAdmin } from "@/lib/auth/require-role";
import { getCategoriesWithProblemTypes } from "@/lib/data/categories";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function CategoriesSettingsPage() {
  await requireAdmin();
  const categories = await getCategoriesWithProblemTypes(true);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Categories & Problem Types</h1>
        <p className="text-sm text-neutral-500">
          Manage the maintenance category taxonomy used across all maintenance requests.
        </p>
      </div>
      <CategoryManager categories={categories as never} />
    </div>
  );
}
