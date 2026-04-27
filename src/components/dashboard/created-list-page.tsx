"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { CreatedListCard } from "./created-list-card";
import { type CreatedListItem, loadCreatedLists } from "./created-list-storage";
import { DashboardPageHeader } from "./page-header";

export function CreatedListPage() {
  const [items, setItems] = useState<CreatedListItem[]>([]);

  useEffect(() => {
    startTransition(() => {
      setItems(loadCreatedLists());
    });
  }, []);

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Created List" subtitle="Projects you have already created are listed here">
        <Link
          href="/investee-dashboard/create-list"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white px-4 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F7F9FC]"
        >
          Create list
        </Link>
      </DashboardPageHeader>

      {items.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <CreatedListCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#D6DFEA] bg-white px-6 py-12 text-center shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
          <h2 className="text-xl font-semibold text-[#1E2746]">No created lists yet</h2>
          <p className="mt-2 text-sm text-[#6B7280]">Create your first project listing to see it here.</p>
          <Link
            href="/investee-dashboard/create-list"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#314B6B] px-5 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
          >
            Create list
          </Link>
        </div>
      )}
    </section>
  );
}
