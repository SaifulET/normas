"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getMyLists } from "@/lib/list-api";
import { CreatedListCard } from "./created-list-card";
import { type CreatedListItem, loadCreatedLists } from "./created-list-storage";
import { mapApiListToCreatedListItem } from "./list-mappers";
import { DashboardPageHeader } from "./page-header";

const LISTS_PER_PAGE = 12;

export function CreatedListPage() {
  const [items, setItems] = useState<CreatedListItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      setLoading(true);

      try {
        const response = await getMyLists();
        const nextItems = (response.data ?? []).map(mapApiListToCreatedListItem);

        if (!active) {
          return;
        }

        startTransition(() => {
          setItems(nextItems);
          setError("");
        });
      } catch (loadError) {
        if (!active) {
          return;
        }

        startTransition(() => {
          setItems(loadCreatedLists());
          setError(getApiErrorMessage(loadError, "Unable to load created lists."));
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadItems();

    return () => {
      active = false;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / LISTS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageStart = items.length === 0 ? 0 : (safePage - 1) * LISTS_PER_PAGE + 1;
  const pageEnd = Math.min(safePage * LISTS_PER_PAGE, items.length);
  const paginatedItems = useMemo(
    () => items.slice((safePage - 1) * LISTS_PER_PAGE, safePage * LISTS_PER_PAGE),
    [items, safePage],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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

      {error ? (
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[24px] border border-[#E6EBF3] bg-white px-6 py-12 text-center text-sm text-[#667085] shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
          Loading created lists...
        </div>
      ) : items.length ? (
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedItems.map((item) => (
              <CreatedListCard key={item.id} item={item} />
            ))}
          </div>

          {items.length > LISTS_PER_PAGE ? (
            <div className="flex flex-col gap-3 rounded-[18px] border border-[#E6EBF3] bg-white px-4 py-3 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing {pageStart}-{pageEnd} of {items.length} lists
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#DDE4EF] px-3 font-semibold ${
                    safePage <= 1 ? "text-[#B8C0CF]" : "text-[#314B6B] hover:bg-[#F7F9FC]"
                  }`}
                >
                  Prev
                </button>
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#DDE4EF] bg-white px-3 font-semibold text-[#314B6B]">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className={`inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] border border-[#DDE4EF] px-3 font-semibold ${
                    safePage >= totalPages ? "text-[#B8C0CF]" : "text-[#314B6B] hover:bg-[#F7F9FC]"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
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
