"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { CreatedListCard } from "./created-list-card";
import { type CreatedListItem, loadCreatedLists } from "./created-list-storage";
import { dashboardScheduleHighlights } from "./data";
import { DashboardPageHeader } from "./page-header";

export function DashboardOverviewPage() {
  const [createdLists, setCreatedLists] = useState<CreatedListItem[]>([]);

  useEffect(() => {
    startTransition(() => {
      setCreatedLists(loadCreatedLists().slice(0, 4));
    });
  }, []);

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Dashboard Overview" subtitle="Here&apos;s what&apos;s happened recently" />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1E2746]">Created list</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Project cards that are ready for your next step.</p>
          </div>
          <Link href="/investee-dashboard/created-list" className="text-sm font-semibold text-[#314B6B]">
            See all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {createdLists.map((item) => (
            <CreatedListCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-[#E6EBF3] bg-white p-5 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1E2746]">Schedule</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Your schedule has been listed here</p>
          </div>
          <Link href="/investee-dashboard/schedule" className="text-sm font-semibold text-[#314B6B]">
            See all
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {dashboardScheduleHighlights.map((item) => (
            <Link
              key={item.day}
              href="/investee-dashboard/schedule"
              className="flex items-center justify-between gap-4 rounded-[22px] bg-[#F8FAFC] px-4 py-4 transition hover:bg-[#F2F6FB]"
            >
              <div>
                <p className="text-sm font-semibold text-[#1E2746]">{item.day}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{item.time}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[#98A2B3]">{item.note}</p>
              </div>
              <span className="text-xl text-[#314B6B]">→</span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
