"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "./icons";
import { SectionHeading, SectionShell } from "./primitives";
import type { Listing } from "./types";
import { mapApiListsToHomeListings } from "@/components/listings/public-listing-mappers";
import { getLists } from "@/lib/list-api";

const HOME_LISTING_LIMIT = 4;

function OpportunityCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#2B425D]/10">
      <div className="relative h-32">
        <Image
          src={listing.image.src}
          alt={listing.image.alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-[#2B425D] px-3 py-1 text-xs text-white">{listing.stage}</span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-[#2B425D]">{listing.sector}</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold leading-7 text-[#182231]">{listing.title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#182231]/55">
          <span className="inline-flex items-center gap-1">
            <AppIcon name="mapPin" className="h-4 w-4" />
            {listing.location}
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <AppIcon name="view" className="h-4 w-4" />
            {listing.views} views
          </span>
        </div>
        <p className="mt-4 min-h-12 text-sm leading-6 text-[#182231]/60">{listing.description}</p>
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#182231]/40">
              Funding Target
            </p>
            <p className="text-xl font-black text-[#2B425D]">{listing.target}</p>
          </div>
          <Link
            href={listing.href}
            className="rounded-md bg-[#E65E02] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c84f00]"
          >
            View Pitch
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HomeOpportunitiesSection({ fallbackListings }: { fallbackListings: Listing[] }) {
  const fallbackDisplayListings = useMemo(() => fallbackListings.slice(0, HOME_LISTING_LIMIT), [fallbackListings]);
  const [listings, setListings] = useState<Listing[]>(fallbackDisplayListings);
  const [totalListings, setTotalListings] = useState(fallbackListings.length);

  useEffect(() => {
    let cancelled = false;

    async function loadLists() {
      try {
        const response = await getLists();
        const mappedListings = mapApiListsToHomeListings(response.data ?? []);

        if (!cancelled) {
          setListings(mappedListings.slice(0, HOME_LISTING_LIMIT));
          setTotalListings(mappedListings.length);
        }
      } catch {
        if (!cancelled) {
          setListings(fallbackDisplayListings);
          setTotalListings(fallbackListings.length);
        }
      }
    }

    loadLists();

    return () => {
      cancelled = true;
    };
  }, [fallbackDisplayListings, fallbackListings.length]);

  return (
    <SectionShell className="bg-[#FFF] mx-4 sm:mx-8 md:mx-[32px] my-[72px]">
      <div id="opportunities">
        <SectionHeading
          title="Ethical Investment Opportunities"
          description="Explore pre-screened, impact-aligned businesses actively seeking ethical capital"
        />

        {listings.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <OpportunityCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-[#2B425D]/10 bg-white px-6 py-10 text-center text-sm text-[#182231]/60">
            No active investment opportunities are available right now.
          </div>
        )}

        {totalListings > HOME_LISTING_LIMIT ? (
          <div className="mt-9 flex justify-center">
            <Link
              href="/search"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#2B425D] px-8 text-base font-semibold text-white transition hover:bg-[#21344b]"
            >
              View All Listings
              <AppIcon name="arrowRight" className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
