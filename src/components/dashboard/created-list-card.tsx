"use client";

import { useEffect, useState } from "react";
import { DashboardIcon } from "./icons";
import {
  type CreatedListBanner,
  type CreatedListItem,
  getCreatedListBannerBlob,
} from "./created-list-storage";

function formatCreatedListDate(createdAt: string) {
  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

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

  return (
    <article className="overflow-hidden rounded-[20px] border border-[#E6EBF3] bg-white shadow-[0_24px_60px_-52px_rgba(30,39,70,0.4)]">
      <div className="relative h-44 bg-[#EEF3FA]">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bannerUrl} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#98A2B3]">No banner uploaded</div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#314B6B]/95 px-3 py-1 text-[11px] font-medium text-white">
            {item.stage}
          </span>
          <span className="rounded-full bg-white/92 px-3 py-1 text-[11px] font-medium text-[#5B6477]">
            {item.sector}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              item.active ? "bg-[#E8F7ED] text-[#15703B]" : "bg-white/92 text-[#667085]"
            }`}
          >
            {item.active ? "Active" : "Draft"}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-[#1E2746]">{item.title}</h3>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#7B8496]">
              <DashboardIcon name="website" className="h-3.5 w-3.5" />
              {item.country}
            </p>
          </div>

          <div className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[11px] font-medium text-[#667085]">
            {formatCreatedListDate(item.createdAt)}
          </div>
        </div>

        <p className="min-h-16 text-sm leading-6 text-[#6B7280]">{item.description}</p>

        <div className="grid gap-3 rounded-[16px] bg-[#F8FAFC] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
              Funding target
            </span>
            <span className="text-[1.2rem] font-semibold text-[#243B5A]">{item.fundingTarget}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">Keyword</span>
            <span className="text-sm font-medium text-[#475467]">{item.keyword}</span>
          </div>
        </div>

        <div className="space-y-2">
          {item.additionalDetails.slice(0, 3).map((detail) => (
            <div key={`${detail.label}-${detail.value}`} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[#667085]">{detail.label}</span>
              <span className="text-right font-medium text-[#1E2746]">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
