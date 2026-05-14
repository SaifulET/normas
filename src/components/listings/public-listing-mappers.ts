import type { Listing } from "@/components/home/types";
import type { SearchListing } from "@/components/search/types";
import type { ListItemResponse } from "@/lib/list-api";

const FALLBACK_IMAGE_SRC = "/howitwork.png";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function getPublicListDescriptionText(value?: string) {
  if (!value) {
    return "";
  }

  if (typeof window !== "undefined" && "DOMParser" in window) {
    const document = new DOMParser().parseFromString(value, "text/html");
    return normalizeWhitespace(document.body.textContent ?? "");
  }

  return normalizeWhitespace(value.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, " "));
}

function truncate(value: string, maxLength = 138) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function formatFundingTarget(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "\u00A30";
  }

  return `\u00A3${value.toLocaleString("en-US")}`;
}

export function isPublicList(item: ListItemResponse) {
  return !item.status || item.status === "activated";
}

export function mapApiListToSearchListing(item: ListItemResponse): SearchListing {
  const title = item.title?.trim() || "Untitled opportunity";
  const description = truncate(getPublicListDescriptionText(item.description) || item.keyword?.trim() || "Details available in the pitch.");
  const fundingValue = typeof item.fundingTarget === "number" && Number.isFinite(item.fundingTarget)
    ? item.fundingTarget
    : 0;

  return {
    id: item._id,
    title,
    location: item.country?.trim() || "Location not specified",
    country: item.country?.trim() || "",
    description,
    target: formatFundingTarget(fundingValue),
    fundingValue,
    stage: item.stage?.trim() || "Stage not specified",
    sector: item.sector?.trim() || "Other",
    views: item.viewCount ?? 0,
    image: {
      src: item.bannerImage || FALLBACK_IMAGE_SRC,
      alt: title,
      width: 1200,
      height: 675,
    },
    href: `/pitch/${item._id}`,
  };
}

export function mapApiListsToSearchListings(items: ListItemResponse[] = []) {
  return items.filter(isPublicList).map(mapApiListToSearchListing);
}

export function mapApiListsToHomeListings(items: ListItemResponse[] = []): Listing[] {
  return mapApiListsToSearchListings(items);
}
