import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { SavedListsGrid } from "@/components/dashboard/saved-lists-grid";

export default function SaveListPage() {
  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Save List" subtitle="Your interested business list is saved here" />

      <SavedListsGrid emptyTitle="No saved lists yet" />
    </section>
  );
}
