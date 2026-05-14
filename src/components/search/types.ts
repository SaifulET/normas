import type { Listing } from "@/components/home/types";

export interface SearchListing extends Listing {
  country: string;
  fundingValue: number;
}

export interface SearchFilters {
  country: string;
  fundingFilterActive: boolean;
  maxFundingTarget: number;
  minFundingTarget: number;
  page: number;
  search: string;
  sector: string;
  stage: string;
}
