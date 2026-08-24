"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppIcon } from "@/components/home/icons";
import { mapApiListsToSearchListings } from "@/components/listings/public-listing-mappers";
import { getApiErrorMessage } from "@/lib/api";
import { getFilteredLists, type FilteredListsResponse, type ListItemResponse } from "@/lib/list-api";
import { getCurrentSubscription } from "@/lib/subscription-api";
import { isActiveSubscription } from "@/lib/subscription-status";
import { useAuthStore } from "@/store";
import { searchCountries, searchSectors, searchStages } from "./data";
import type { SearchFilters, SearchListing } from "./types";

type ViewMode = "grid" | "list";
type InvestorAccessStatus = "checking" | "subscribed" | "unsubscribed";

const RESULTS_PER_PAGE = 12;
const DEFAULT_MAX_RANGE = 32500000;
const INITIAL_VISIBLE_SECTOR_COUNT = 5;

function getFundingRangeMax(listings: SearchListing[]) {
  const largestFundingValue = Math.max(0, ...listings.map((listing) => listing.fundingValue));
  return Math.max(DEFAULT_MAX_RANGE, Math.ceil(largestFundingValue / 50000) * 50000);
}

function isListItemArray(value: unknown): value is ListItemResponse[] {
  return Array.isArray(value);
}

function getRecordValue(source: unknown, key: string) {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  return (source as Record<string, unknown>)[key];
}

function parseFilteredListItems(response: FilteredListsResponse) {
  if (isListItemArray(response.data)) {
    return response.data;
  }

  const candidates = [
    getRecordValue(response.data, "lists"),
    getRecordValue(response.data, "data"),
    getRecordValue(response.data, "items"),
    getRecordValue(response, "lists"),
  ];

  return candidates.find(isListItemArray) ?? [];
}

function parsePositiveNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function parseFilteredMeta(response: FilteredListsResponse, itemCount: number) {
  const pagination = getRecordValue(response.data, "pagination");
  const total =
    parsePositiveNumber(getRecordValue(response.data, "totalLists")) ??
    parsePositiveNumber(getRecordValue(response.data, "total")) ??
    parsePositiveNumber(getRecordValue(pagination, "total")) ??
    parsePositiveNumber(getRecordValue(response, "totalLists")) ??
    parsePositiveNumber(getRecordValue(response, "total")) ??
    itemCount;
  const totalPages =
    parsePositiveNumber(getRecordValue(response.data, "totalPages")) ??
    parsePositiveNumber(getRecordValue(pagination, "totalPages")) ??
    parsePositiveNumber(getRecordValue(response, "totalPages")) ??
    Math.max(1, Math.ceil(total / RESULTS_PER_PAGE));

  return {
    total,
    totalPages,
  };
}

function mergeOptions(...optionGroups: Array<Array<string | undefined>>) {
  const options = optionGroups.flat().filter((option): option is string => Boolean(option?.trim()));
  const seen = new Set<string>();

  return options.filter((option) => {
    const key = normalizeOptionKey(option);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeOptionKey(value: string) {
  return value.toLowerCase().replace(/[\s_-]+/g, "");
}

function isSameOption(first: string, second: string) {
  return normalizeOptionKey(first) === normalizeOptionKey(second);
}

function GridGlyph({ active }: { active: boolean }) {
  return (
    <span className={`grid grid-cols-2 gap-0.5 ${active ? "text-[#2B425D]" : "text-[#2B425D]/45"}`}>
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-[2px] bg-current" />
      ))}
    </span>
  );
}

function ListGlyph({ active }: { active: boolean }) {
  return (
    <span className={`flex flex-col gap-0.5 ${active ? "text-[#2B425D]" : "text-[#2B425D]/45"}`}>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className="h-1 w-3 rounded-full bg-current" />
      ))}
    </span>
  );
}

interface ResultCardProps {
  locked: boolean;
  viewMode: ViewMode;
  listing: SearchListing;
}

function LockedListingOverlay() {
  return (
    <div className="absolute inset-x-0 bottom-0 top-1/2 z-10 flex items-end bg-gradient-to-b from-white/25 via-white/88 to-white p-5 backdrop-blur-[2px]">
      <div className="w-full rounded-xl border border-[#E2E8F0] bg-white/95 p-4 shadow-[0_18px_40px_-28px_rgba(31,41,55,0.7)]">
        <p className="text-sm font-semibold text-[#1F2937]">Subscribe to unlock full listing details</p>
        <p className="mt-1 text-xs leading-5 text-[#667085]">
          Investor subscriptions unlock full pitch details, funding data, and direct deal actions.
        </p>
        <Link
          href="/dashboard/upgrade-plan/change-plan"
          className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-[#ED6A06] px-4 text-xs font-semibold text-white transition hover:bg-[#d35f05]"
        >
          Subscribe Now
        </Link>
      </div>
    </div>
  );
}

function ResultCard({ locked, viewMode, listing }: ResultCardProps) {
  if (viewMode === "list") {
    return (
      <article className="relative grid grid-cols-1 overflow-hidden rounded-2xl border border-[#D7DFEA] bg-white shadow-[0_14px_32px_-28px_rgba(31,41,55,0.55)] md:grid-cols-[260px_1fr]">
        <div className="relative min-h-[200px]">
          <Image
            src={listing.image.src}
            alt={listing.image.alt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 260px, 100vw"
          />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-[22px] font-semibold text-[#1F2937]">{listing.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon name="mapPin" className="h-4 w-4" />
                  {listing.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <AppIcon name="view" className="h-4 w-4" />
                  {listing.views} views
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#314B6B] px-3 py-1 text-xs font-semibold text-white">
                {listing.stage}
              </span>
              <span className="rounded-full border border-[#D7DFEA] bg-white px-3 py-1 text-xs font-medium text-[#475467]">
                {listing.sector}
              </span>
            </div>
          </div>

          <p className="max-w-3xl text-sm leading-6 text-[#667085]">{listing.description}</p>

          <div className="mt-auto flex flex-col gap-4 border-t border-[#E8EDF3] pt-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">
                Funding Target
              </p>
              <p className="mt-1 text-[28px] font-semibold text-[#243B5A]">{listing.target}</p>
            </div>

            <Link
              href={locked ? "/dashboard/upgrade-plan/change-plan" : listing.href}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ED6A06] px-5 text-sm font-semibold text-white transition hover:bg-[#d35f05]"
            >
              {locked ? "Subscribe to Unlock" : "View Pitch"}
            </Link>
          </div>
        </div>
        {locked ? <LockedListingOverlay /> : null}
      </article>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[#D7DFEA] bg-white shadow-[0_14px_32px_-28px_rgba(31,41,55,0.55)]">
      <div className="relative h-44">
        <Image
          src={listing.image.src}
          alt={listing.image.alt}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-[#314B6B] px-3 py-1 text-xs font-semibold text-white">
            {listing.stage}
          </span>
          <span className="rounded-full border border-white/75 bg-white/90 px-3 py-1 text-xs font-medium text-[#475467]">
            {listing.sector}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[22px] font-semibold text-[#1F2937]">{listing.title}</h3>
          <span className="inline-flex items-center gap-1.5 text-sm text-[#667085]">
            <AppIcon name="view" className="h-4 w-4" />
            {listing.views} views
          </span>
        </div>

        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[#667085]">
          <AppIcon name="mapPin" className="h-4 w-4" />
          {listing.location}
        </p>

        <p className="mt-4 min-h-12 text-sm leading-6 text-[#667085]">{listing.description}</p>

        <div className="mt-6 flex flex-col gap-4 border-t border-[#E8EDF3] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">
              Funding Target
            </p>
            <p className="mt-1 text-[28px] font-semibold text-[#243B5A]">{listing.target}</p>
          </div>

          <Link
            href={locked ? "/dashboard/upgrade-plan/change-plan" : listing.href}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ED6A06] px-5 text-sm font-semibold text-white transition hover:bg-[#d35f05] sm:w-auto w-full"
          >
            {locked ? "Subscribe to Unlock" : "View Pitch"}
          </Link>
        </div>
      </div>
      {locked ? <LockedListingOverlay /> : null}
    </article>
  );
}

export function SearchMarketplace({ initialFilters }: { initialFilters: SearchFilters }) {
  const user = useAuthStore((state) => state.user);
  const [listings, setListings] = useState<SearchListing[]>([]);
  const [query, setQuery] = useState(initialFilters.search);
  const [selectedSector, setSelectedSector] = useState(initialFilters.sector);
  const [selectedStage, setSelectedStage] = useState(initialFilters.stage);
  const [minFunding, setMinFunding] = useState(initialFilters.minFundingTarget);
  const [maxFunding, setMaxFunding] = useState(initialFilters.maxFundingTarget);
  const [fundingFilterActive, setFundingFilterActive] = useState(initialFilters.fundingFilterActive);
  const [country, setCountry] = useState(initialFilters.country);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(initialFilters.page);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAllSectors, setShowAllSectors] = useState(false);
  const [investorAccessStatus, setInvestorAccessStatus] = useState<InvestorAccessStatus>("checking");
  const isInvestor = user?.role === "investor";

  const requestParams = useMemo(
    () => ({
      country: country || undefined,
      limit: RESULTS_PER_PAGE,
      maxFundingTarget: fundingFilterActive ? maxFunding : undefined,
      minFundingTarget: fundingFilterActive ? minFunding : undefined,
      page,
      search: query.trim() || undefined,
      sector: selectedSector || undefined,
      stage: selectedStage || undefined,
    }),
    [country, fundingFilterActive, maxFunding, minFunding, page, query, selectedSector, selectedStage],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      try {
        await Promise.resolve();

        if (cancelled) {
          return;
        }

        setLoading(true);

        const response = await getFilteredLists(requestParams);
        const items = parseFilteredListItems(response);
        const mappedListings = mapApiListsToSearchListings(items);
        const meta = parseFilteredMeta(response, mappedListings.length);

        if (!cancelled) {
          setListings(mappedListings);
          setTotalResults(meta.total);
          setTotalPages(meta.totalPages);
          setLoadError("");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(error, "Unable to load investment opportunities."));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      cancelled = true;
    };
  }, [requestParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadInvestorSubscription() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      if (!isInvestor) {
        setInvestorAccessStatus("subscribed");
        return;
      }

      setInvestorAccessStatus("checking");

      try {
        const response = await getCurrentSubscription();

        if (!cancelled) {
          setInvestorAccessStatus(isActiveSubscription(response.data) ? "subscribed" : "unsubscribed");
        }
      } catch {
        if (!cancelled) {
          setInvestorAccessStatus("unsubscribed");
        }
      }
    }

    void loadInvestorSubscription();

    return () => {
      cancelled = true;
    };
  }, [isInvestor]);

  const availableSectors = useMemo(() => {
    return mergeOptions(searchSectors, [selectedSector], listings.map((listing) => listing.sector));
  }, [listings, selectedSector]);

  const visibleSectors = useMemo(() => {
    return showAllSectors ? availableSectors : availableSectors.slice(0, INITIAL_VISIBLE_SECTOR_COUNT);
  }, [availableSectors, showAllSectors]);

  const availableStages = useMemo(() => {
    return mergeOptions(searchStages, [selectedStage], listings.map((listing) => listing.stage));
  }, [listings, selectedStage]);

  const availableCountries = useMemo(() => {
    return mergeOptions(searchCountries, [country], listings.map((listing) => listing.country));
  }, [country, listings]);

  const fundingRangeMax = useMemo(() => {
    return Math.max(maxFunding, getFundingRangeMax(listings));
  }, [listings, maxFunding]);

  const currentPage = Math.min(page, totalPages);
  const paginationStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, index) => paginationStart + index);
  const lockInvestorListings = isInvestor && investorAccessStatus !== "subscribed";

  function toggleSector(sector: string) {
    setPage(1);
    setSelectedSector((current) => (isSameOption(current, sector) ? "" : sector));
  }

  return (
    <section className="bg-[#F8FAFC] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-[#D7DFEA] bg-white p-5 shadow-[0_14px_32px_-28px_rgba(31,41,55,0.55)]">
          <div className="flex items-center gap-2 text-[#243B5A]">
            <span className="text-base font-semibold">Filters</span>
          </div>

          <div className="mt-5 flex min-w-0 gap-2">
            <input
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Search opportunities..."
              className="h-12 min-w-0 flex-1 rounded-xl border border-[#D7DFEA] px-4 text-sm text-[#1F2937] outline-none transition placeholder:text-[#98A2B3] focus:border-[#243B5A]"
            />
            <button
              type="button"
              onClick={() => setPage(1)}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#637792] text-white transition hover:bg-[#51647c]"
              aria-label="Search opportunities"
            >
              <AppIcon name="search" className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#1F2937]">Sector</h3>
            <div className="mt-4 space-y-2.5">
              {visibleSectors.map((sector) => {
                const checked = isSameOption(selectedSector, sector);

                return (
                  <label key={sector} className="flex cursor-pointer items-center gap-3 text-sm text-[#667085]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSector(sector)}
                      className="h-4 w-4 rounded border-[#CBD5E1] text-[#ED6A06] focus:ring-[#ED6A06]"
                    />
                    <span>{sector}</span>
                  </label>
                );
              })}
              {availableSectors.length > INITIAL_VISIBLE_SECTOR_COUNT ? (
                <button
                  type="button"
                  onClick={() => setShowAllSectors((current) => !current)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] transition hover:text-[#243B5A]"
                >
                  {showAllSectors ? "See Less" : "See More"}
                  <span aria-hidden="true">{showAllSectors ? "↑" : "→"}</span>
                </button>
              ) : null}
            </div>

          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#1F2937]">Business Stage</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#D7DFEA]">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setSelectedStage("");
                }}
                className={`flex h-11 w-full items-center px-4 text-left text-sm transition ${
                  selectedStage === ""
                    ? "bg-[#637792] text-white"
                    : "bg-white text-[#667085] hover:bg-[#F8FAFC]"
                }`}
              >
                All Stage
              </button>
              {availableStages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setSelectedStage(stage);
                  }}
                  className={`flex h-11 w-full items-center px-4 text-left text-sm transition ${
                    isSameOption(selectedStage, stage)
                      ? "bg-[#637792] text-white"
                      : "border-t border-[#D7DFEA] bg-white text-[#667085] first:border-t-0 hover:bg-[#F8FAFC]"
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#1F2937]">Funding Range</h3>
            <div className="mt-4">
              <input
                type="range"
                min={0}
                max={fundingRangeMax}
                step={50000}
                value={maxFunding}
                onChange={(event) => {
                  setPage(1);
                  setFundingFilterActive(true);
                  setMinFunding(0);
                  setMaxFunding(Number(event.target.value));
                }}
                className="w-full accent-[#243B5A]"
              />
              <div className="mt-2 flex justify-between text-xs text-[#98A2B3]">
                    <span>{"$0"}</span>
                <span>
                        {"$"}
                  {(fundingRangeMax / 1000000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M+
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#1F2937]">Country</h3>
            <label className="relative mt-4 block">
              <select
                value={country}
                onChange={(event) => {
                  setPage(1);
                  setCountry(event.target.value);
                }}
                className="h-12 w-full appearance-none rounded-xl border border-[#D7DFEA] bg-white px-4 pr-10 text-sm text-[#667085] outline-none transition focus:border-[#243B5A]"
              >
                <option value="">All Countries</option>
                {availableCountries.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <AppIcon
                name="arrowDown"
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => setPage(1)}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#314B6B] px-5 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
          >
            Apply Filters
          </button>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#344054]">
              {loading ? "Loading investment opportunities..." : `Showing ${totalResults} Investment Opportunities`}
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setViewMode("list");
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  viewMode === "list"
                    ? "border-[#CBD5E1] bg-[#EFF3F8]"
                    : "border-[#D7DFEA] bg-white hover:bg-[#F8FAFC]"
                }`}
                aria-label="List view"
              >
                <ListGlyph active={viewMode === "list"} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setViewMode("grid");
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  viewMode === "grid"
                    ? "border-[#CBD5E1] bg-[#EFF3F8]"
                    : "border-[#D7DFEA] bg-white hover:bg-[#F8FAFC]"
                }`}
                aria-label="Grid view"
              >
                <GridGlyph active={viewMode === "grid"} />
              </button>
            </div>
          </div>

          {loadError ? (
            <div className="mt-5 rounded-xl border border-[#F4C7C3] bg-[#FFF5F4] px-4 py-3 text-sm text-[#9A3412]">
              {loadError}
            </div>
          ) : null}

          <div className={`mt-5 ${viewMode === "grid" ? "grid grid-cols-1 gap-5 xl:grid-cols-2" : "space-y-4"}`}>
            {listings.map((listing) => (
              <ResultCard key={listing.id} locked={lockInvestorListings} viewMode={viewMode} listing={listing} />
            ))}
          </div>

          {!loading && listings.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-[#D7DFEA] bg-white px-6 py-12 text-center text-sm text-[#667085]">
              No investment opportunities match these filters.
            </div>
          ) : null}

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7DFEA] bg-white text-[#98A2B3] transition hover:text-[#243B5A]"
              aria-label="Previous page"
            >
              {"<"}
            </button>

            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                  currentPage === pageNumber
                    ? "border-[#CBD5E1] bg-white text-[#243B5A]"
                    : "border-[#D7DFEA] bg-transparent text-[#98A2B3] hover:text-[#243B5A]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D7DFEA] bg-white text-[#98A2B3] transition hover:text-[#243B5A]"
              aria-label="Next page"
            >
              {">"}
            </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
