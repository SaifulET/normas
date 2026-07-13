import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { DashboardSchedulePreview } from "@/components/dashboard/dashboard-schedule-preview";
import { SavedListsGrid } from "@/components/dashboard/saved-lists-grid";

export default function Page() {
  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Dashboard Overview" subtitle="Here&apos;s what&apos;s happened recently" />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1E2746]">Save list</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Pitch cards that are ready for your next step.</p>
          </div>
          <Link href="/dashboard/save-list" className="text-sm font-semibold text-[#314B6B]">
            See all
          </Link>
        </div>

        <SavedListsGrid emptyTitle="No saved lists yet" limit={3} />
      </section>

      <section className="rounded-[30px] border border-[#E6EBF3] bg-white p-5 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1E2746]">Schedule</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Your schedule has been listed here</p>
          </div>
          <Link href="/dashboard/schedule" className="text-sm font-semibold text-[#314B6B]">
            See all
          </Link>
        </div>

        <DashboardSchedulePreview href="/dashboard/schedule" />
      </section>
    </section>
  );
}
