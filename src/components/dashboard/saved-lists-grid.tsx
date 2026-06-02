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
}: {
  emptyTitle?: string;
  limit?: number;
}) {
  const savedLists = useSavedListsStore((state) => state.items);
  const setSavedLists = useSavedListsStore((state) => state.setSavedLists);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  const visibleLists = useMemo<PitchDetail[]>(
    () => (limit ? savedLists.slice(0, limit) : savedLists),
    [limit, savedLists],
  );

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
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {visibleLists.map((pitch) => (
        <ListingCard key={pitch.slug} pitch={pitch} initialSaved />
      ))}
    </div>
  );
}
