"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardIcon } from "./icons";
import { sanitizeHtml } from "./html-utils";
import {
  type CreatedListBanner,
  type CreatedListItem,
  getCreatedListBannerBlob,
} from "./created-list-storage";

function useCreatedListBannerUrl(banner: CreatedListBanner | null) {
  const [assetUrl, setAssetUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (!banner || banner.kind !== "asset") {
      return () => undefined;
    }

    const loadAsset = async () => {
      try {
        const blob = await getCreatedListBannerBlob(banner.id);

        if (!active || !blob) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setAssetUrl(objectUrl);
      } catch {
        if (active) {
          setAssetUrl(null);
        }
      }
    };

    void loadAsset();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [banner]);

  if (!banner) {
    return null;
  }

  if (banner.kind === "path") {
    return banner.src;
  }

  return assetUrl;
}

export function CreatedListCard({ item }: { item: CreatedListItem }) {
  const bannerUrl = useCreatedListBannerUrl(item.banner);
  const safeDescription = useMemo(() => sanitizeHtml(item.description), [item.description]);
  const status = item.status || (item.active ? "activated" : "deactivated");
  const moderationReasons = item.moderationReasons ?? [];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[10px] border border-[#E6EBF3] bg-white shadow-[0_24px_60px_-52px_rgba(30,39,70,0.4)]">
      <div className="relative h-44 shrink-0 bg-[#EEF3FA]">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#98A2B3]">No banner uploaded</div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#314B6B]/90 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
            {item.stage}
          </span>
          <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-medium text-[#5B6477] shadow-sm">
            {item.sector}
          </span>
          {status === "suspended" ? (
            <span className="rounded-full bg-[#B42318]/95 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              Suspended
            </span>
          ) : null}
          {status === "under_review" ? (
            <span className="rounded-full bg-[#B45309]/95 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              Under review
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3
              className="min-h-[3.125rem] overflow-hidden break-words text-lg font-semibold leading-[1.35] text-[#1E2746]"
              style={{
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                display: "-webkit-box",
              }}
            >
              {item.title}
            </h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#7B8496]">
              <DashboardIcon name="website" className="h-3.5 w-3.5" />
              {item.country}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B8496]">
              <DashboardIcon name="views" className="h-4 w-4" />
              {item.viewCount ?? 0} views
            </span>
            <button type="button" className="rounded-full p-1 text-[#64748B]" aria-label="Save pitch">
              <DashboardIcon name="save" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="mt-3 min-h-12 overflow-hidden text-sm leading-6 text-[#6B7280]"
          style={{
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            display: "-webkit-box",
          }}
          dangerouslySetInnerHTML={{ __html: safeDescription }}
        />

        {status === "suspended" || status === "under_review" ? (
          <div className="mt-3 rounded-[10px] border border-[#F7C98B] bg-[#FFF7ED] px-3 py-2 text-xs leading-5 text-[#9A4B00]">
            {status === "under_review"
              ? "This pitch is under superadmin review and is not public."
              : "This pitch is suspended and is not public."}
            {moderationReasons.length ? (
              <span className="mt-1 block text-[#B45309]">{moderationReasons.join(", ")}</span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto border-t border-[#EEF2F7] pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
              Funding target
            </p>
            <p className="mt-1 text-[1.45rem] font-semibold leading-none text-[#243B5A]">{item.fundingTarget}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/investee-dashboard/messages"
            className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
          >
            Query
          </Link>
          <Link
            href={`/investee-dashboard/created-list/${item.id}`}
            className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#ED6A06] px-4 text-sm font-semibold text-white transition hover:bg-[#d35f05]"
          >
            View Pitch
          </Link>
        </div>
      </div>
    </article>
  );
}
