import { getPublicListDescriptionText } from "@/components/listings/public-listing-mappers";
import type { ListItemResponse } from "@/lib/list-api";
import type { PitchDetail } from "./data";

function formatFundingTarget(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "\u00A30";
  }

  return `\u00A3${value.toLocaleString("en-US")}`;
}

function summarize(value: string, maxLength = 132) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

export function mapApiListToPitchDetail(item: ListItemResponse, relatedSlugs: string[] = []): PitchDetail {
  const title = item.title?.trim() || "Untitled opportunity";
  const descriptionText = getPublicListDescriptionText(item.description);
  const summary = summarize(descriptionText || item.keyword?.trim() || "Details available in the pitch.");

  return {
    slug: item._id,
    title,
    shortTitle: title,
    location: item.country?.trim() || "Location not specified",
    views: item.viewCount ?? 0,
    stage: item.stage?.trim() || "Stage not specified",
    sector: item.sector?.trim() || "Other",
    target: formatFundingTarget(item.fundingTarget),
    description: summary,
    image: item.bannerImage || "/howitwork.png",
    equipmentTitle: "Equipment Details",
    overview: descriptionText || summary,
    keyComponents: [],
    benefits: [],
    closing: "",
    additionalDetails: (item.additionalDetails ?? []).map((detail) => ({
      label: detail.key ?? "",
      value: detail.value ?? "",
    })),
    relatedSlugs,
  };
}
