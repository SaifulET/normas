"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { PitchDetail } from "@/components/pitch/data";
import { getApiErrorMessage } from "@/lib/api";
import { removeSavedList, saveList } from "@/lib/list-api";
import { useAuthStore, useSavedListsStore } from "@/store";
import { DashboardIcon } from "./icons";

export function ListingCard({
  initialSaved = false,
  pitch,
  queryHref,
  viewHref,
}: {
  initialSaved?: boolean;
  pitch: PitchDetail;
  queryHref?: string;
  viewHref?: string;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.user?.role);
  const savedFromStore = useSavedListsStore((state) => state.savedIds[pitch.slug]);
  const setSavedState = useSavedListsStore((state) => state.setSavedState);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const saved = savedFromStore ?? initialSaved;
  const resolvedQueryHref = queryHref ?? `/dashboard/messages?listId=${encodeURIComponent(pitch.slug)}`;

  async function handleSaveClick() {
    if (!isAuthenticated || userRole !== "investor") {
      setSaveError("Please login as an investor first.");
      return;
    }

    const nextSaved = !saved;
    setSaving(true);
    setSaveError("");
    setSavedState(pitch.slug, nextSaved, pitch);

    try {
      if (nextSaved) {
        await saveList(pitch.slug);
      } else {
        await removeSavedList(pitch.slug);
      }
    } catch (error) {
      setSavedState(pitch.slug, saved, pitch);
      setSaveError(getApiErrorMessage(error, "Unable to update saved list."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#E6EBF3] bg-white shadow-[0_24px_60px_-52px_rgba(30,39,70,0.4)]">
      <div className="relative h-40">
        <Image src={pitch.image} alt={pitch.shortTitle} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 25vw" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#314B6B]/95 px-3 py-1 text-[11px] font-medium text-white">
            {pitch.stage}
          </span>
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-medium text-[#5B6477]">
            {pitch.sector}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1E2746]">{pitch.shortTitle}</h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#7B8496]">
              <DashboardIcon name="website" className="h-3.5 w-3.5" />
              {pitch.location}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#7B8496]">
            <DashboardIcon name="views" className="h-4 w-4" />
            {pitch.views} views
          </div>
        </div>

        <p className="mt-3 min-h-12 text-sm leading-6 text-[#6B7280]">{pitch.description}</p>

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
              Funding target
            </p>
            <p className="mt-1 text-[1.45rem] font-semibold text-[#243B5A]">{pitch.target}</p>
          </div>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saving}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition disabled:cursor-wait disabled:opacity-75 ${
              saved
                ? "border-[#314B6B] bg-[#314B6B] text-white"
                : "border-[#D7DFEA] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
            }`}
            aria-label={saved ? "Unsave list" : "Save list"}
            aria-pressed={saved}
          >
            <DashboardIcon name="save" className="h-4 w-4" filled={saved} />
          </button>
        </div>

        {saveError ? <p className="mt-2 text-xs font-medium text-[#D92D20]">{saveError}</p> : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href={resolvedQueryHref}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
          >
            Query
          </Link>
          <Link
            href={viewHref ?? `/dashboard/pitch/${pitch.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#ED6A06] px-4 text-sm font-semibold text-white transition hover:bg-[#d35f05]"
          >
            View Pitch
          </Link>
        </div>
      </div>
    </article>
  );
}
