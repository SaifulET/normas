import { SearchPage } from "@/components/search/search-page";
import type { SearchFilters } from "@/components/search/types";

const DEFAULT_MAX_FUNDING_TARGET = 32500000;

type SearchPageParams = {
  country?: string | string[];
  keyword?: string | string[];
  maxFundingTarget?: string | string[];
  minFundingTarget?: string | string[];
  page?: string | string[];
  range?: string | string[];
  search?: string | string[];
  sector?: string | string[];
  stage?: string | string[];
};

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function normalizeOptionalFilter(value: string, allValues: string[]) {
  const trimmedValue = value.trim();
  const normalizedValue = trimmedValue.toLowerCase();

  return allValues.some((item) => item.toLowerCase() === normalizedValue) ? "" : trimmedValue;
}

function parseNumberParam(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function parseFundingToken(value: string) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(k|m)?$/i);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);
  const suffix = match[2]?.toLowerCase();

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  if (suffix === "m") {
    return amount * 1000000;
  }

  if (suffix === "k") {
    return amount * 1000;
  }

  return amount;
}

function parseFundingRange(value: string) {
  const normalizedValue = value
    .toLowerCase()
    .replace(/\$|,/g, "")
    .replace(/\s+/g, "");

  if (!normalizedValue || normalizedValue === "allfunding") {
    return null;
  }

  if (normalizedValue.endsWith("+")) {
    const min = parseFundingToken(normalizedValue.slice(0, -1));
    return min === undefined ? null : { max: DEFAULT_MAX_FUNDING_TARGET, min };
  }

  const [minValue, maxValue] = normalizedValue.split("-");
  const min = parseFundingToken(minValue ?? "");
  const max = parseFundingToken(maxValue ?? "");

  if (min === undefined && max === undefined) {
    return null;
  }

  return {
    max: max ?? DEFAULT_MAX_FUNDING_TARGET,
    min: min ?? 0,
  };
}

function parseSearchFilters(params: SearchPageParams): SearchFilters {
  const minFundingTarget = parseNumberParam(getFirstParam(params.minFundingTarget));
  const maxFundingTarget = parseNumberParam(getFirstParam(params.maxFundingTarget));
  const range = parseFundingRange(getFirstParam(params.range));
  const fundingFilterActive = minFundingTarget !== undefined || maxFundingTarget !== undefined || Boolean(range);

  return {
    country: normalizeOptionalFilter(getFirstParam(params.country), ["All Countries"]),
    fundingFilterActive,
    maxFundingTarget: maxFundingTarget ?? range?.max ?? DEFAULT_MAX_FUNDING_TARGET,
    minFundingTarget: minFundingTarget ?? range?.min ?? 0,
    page: Math.max(1, parseNumberParam(getFirstParam(params.page)) ?? 1),
    search: getFirstParam(params.search) || getFirstParam(params.keyword),
    sector: normalizeOptionalFilter(getFirstParam(params.sector), ["All Sectors"]),
    stage: normalizeOptionalFilter(getFirstParam(params.stage), ["All Stage", "All Stages"]),
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
}) {
  const params = await searchParams;

  return <SearchPage initialFilters={parseSearchFilters(params)} />;
}
