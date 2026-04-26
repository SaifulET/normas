import { dashboardSavedPitches } from "@/components/dashboard/data";
import { ListingCard } from "@/components/dashboard/listing-card";
import { DashboardPageHeader } from "@/components/dashboard/page-header";

export default function SaveListPage() {
  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Save List" subtitle="Your interested business list is saved here" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {dashboardSavedPitches.map((pitch) => (
          <ListingCard key={pitch.slug} pitch={pitch} />
        ))}
      </div>
    </section>
  );
}
