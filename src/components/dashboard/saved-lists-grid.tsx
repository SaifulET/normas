"use client";

import { useEffect, useMemo, useState } from "react";
import { mapApiListToPitchDetail } from "@/components/pitch/list-mappers";
import type { PitchDetail } from "@/components/pitch/data";
import { getApiErrorMessage } from "@/lib/api";
import { getMySavedLists, type ListItemResponse, type SavedListItemResponse } from "@/lib/list-api";
import { useSavedListsStore } from "@/store";
import { ListingCard } from "./listing-card";

function isListItem(value: unknown): value is ListItemResponse {
  return Boolean(value && typeof value === "object" && "_id" in value);
}

function getSavedListItem(item: SavedListItemResponse) {
  if (isListItem(item) && ("title" in item || "bannerImage" in item || "fundingTarget" in item)) {
    return item;
  }

  if ("list" in item && isListItem(item.list)) {
    return item.list;
  }

  if ("listId" in item && isListItem(item.listId)) {
    return item.listId;
  }

  return null;
}

function mapSavedLists(items: SavedListItemResponse[] = []) {
  return items
    .map(getSavedListItem)
    .filter((item): item is ListItemResponse => Boolean(item))
    .filter((item) => !item.status || item.status === "activated")
    .map((item) => mapApiListToPitchDetail(item));
}

export function SavedListsGrid({
  emptyTitle = "No saved lists yet",
  limit,
  pageSize = 12,
}: {
  emptyTitle?: string;
  limit?: number;
  pageSize?: number;
}) {
  const savedLists = useSavedListsStore((state) => state.items);
  const setSavedLists = useSavedListsStore((state) => state.setSavedLists);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadSavedLists() {
      try {
        const response = await getMySavedLists();
        const responseItems = Array.isArray(response) ? response : response.data;
        const nextItems = mapSavedLists(responseItems);

        if (active) {
          setSavedLists(nextItems);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, "Unable to load saved lists."));
          setSavedLists([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSavedLists();

    return () => {
      active = false;
    };
  }, [setSavedLists]);

  const shouldPaginate = !limit && pageSize > 0;
  const totalPages = shouldPaginate ? Math.max(1, Math.ceil(savedLists.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages);
  const pageStart = savedLists.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = shouldPaginate ? Math.min(safePage * pageSize, savedLists.length) : savedLists.length;

  const visibleLists = useMemo<PitchDetail[]>(
    () => {
      if (limit) {
        return savedLists.slice(0, limit);
      }

      if (!shouldPaginate) {
        return savedLists;
      }

      return savedLists.slice((safePage - 1) * pageSize, safePage * pageSize);
    },
    [limit, pageSize, safePage, savedLists, shouldPaginate],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  if (loading) {
    return (
      <div className="rounded-[24px] border border-[#E6EBF3] bg-white px-6 py-12 text-center text-sm text-[#667085] shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        Loading saved lists...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
        {error}
      </div>
    );
  }

  if (!visibleLists.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-[#D6DFEA] bg-white px-6 py-12 text-center shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        <h2 className="text-xl font-semibold text-[#1E2746]">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-[#6B7280]">Save interesting pitch listings to find them here later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {visibleLists.map((pitch) => (
          <ListingCard key={pitch.slug} pitch={pitch} initialSaved />
        ))}
      </div>

      {shouldPaginate && savedLists.length > pageSize ? (
        <div className="flex flex-col gap-3 rounded-[18px] border border-[#E6EBF3] bg-white px-4 py-3 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {pageStart}-{pageEnd} of {savedLists.length} lists
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
  );
}
