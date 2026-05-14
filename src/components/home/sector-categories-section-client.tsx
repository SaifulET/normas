"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppIcon } from "./icons";
import { SectionHeading, SectionShell } from "./primitives";
import type { SectorItem } from "./types";
import { getListSectors } from "@/lib/list-api";

function normalizeSectorName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function withZeroCounts(sectors: SectorItem[]) {
  return sectors.map((sector) => ({
    ...sector,
    listingCount: 0,
  }));
}

function applySectorCounts(sectors: SectorItem[], counts: Map<string, number>) {
  return sectors.map((sector) => ({
    ...sector,
    listingCount: counts.get(normalizeSectorName(sector.title)) ?? 0,
  }));
}

function getSectorSearchHref(sector: string) {
  const params = new URLSearchParams({
    sector,
  });

  return `/search?${params.toString()}`;
}

export function SectorCategoriesSectionClient({ sectors }: { sectors: SectorItem[] }) {
  const emptySectors = useMemo(() => withZeroCounts(sectors), [sectors]);
  const [displaySectors, setDisplaySectors] = useState<SectorItem[]>(emptySectors);

  useEffect(() => {
    let cancelled = false;

    async function loadSectorCounts() {
      try {
        const response = await getListSectors();
        const counts = new Map(
          (response.data?.sectors ?? []).map((item) => [
            normalizeSectorName(item.sector ?? ""),
            item.listAmount ?? 0,
          ]),
        );

        if (!cancelled) {
          setDisplaySectors(applySectorCounts(sectors, counts));
        }
      } catch {
        if (!cancelled) {
          setDisplaySectors(emptySectors);
        }
      }
    }

    loadSectorCounts();

    return () => {
      cancelled = true;
    };
  }, [emptySectors, sectors]);

  return (
    <SectionShell className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <SectionHeading
          title="Invest Where it Matters"
          description="14 ethical sector categories aligned with established ESG investment classifications"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {displaySectors.map((sector) => (
            <Link
              key={sector.title}
              href={sector.href === "#" ? getSectorSearchHref(sector.title) : sector.href}
              className="group flex min-h-28 flex-col items-center justify-center rounded-md bg-white p-5 text-center ring-1 ring-[#2B425D]/10 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <AppIcon name={sector.icon} className="h-6 w-6 text-[#2B425D]" />
              <h3 className="mt-4 text-sm font-black text-[#182231]">{sector.title}</h3>
              <p className="mt-3 flex items-center gap-2 text-xs text-[#182231]/50">
                {sector.listingCount} listings
                <AppIcon name="arrowRight" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
