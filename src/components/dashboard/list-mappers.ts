import type { ListItemResponse } from "@/lib/list-api";
import type { CreatedListItem } from "./created-list-storage";

function formatFundingTarget(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "£0";
  }

  return `£${value.toLocaleString("en-US")}`;
}

export function mapApiListToCreatedListItem(item: ListItemResponse): CreatedListItem {
  return {
    active: item.status === "activated",
    additionalDetails: (item.additionalDetails ?? []).map((detail) => ({
      label: detail.key ?? "",
      value: detail.value ?? "",
    })),
    banner: item.bannerImage ? { kind: "path", src: item.bannerImage } : null,
    country: item.country ?? "",
    createdAt: item.createdAt ?? item.updatedAt ?? new Date().toISOString(),
    description: item.description ?? "",
    fundingTarget: formatFundingTarget(item.fundingTarget),
    id: item._id,
    keyword: item.keyword ?? "",
    sector: item.sector ?? "",
    stage: item.stage ?? "",
    status: item.status ?? "deactivated",
    title: item.title ?? "Untitled list",
    viewCount: item.viewCount ?? 0,
  };
}
