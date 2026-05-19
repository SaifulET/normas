import type { SearchListing } from "./types";
import { listSectorOptions, listStageOptions } from "@/components/listings/list-options";

const listingTemplates: Omit<SearchListing, "id">[] = [
  {
    title: "CarbonLedger AI",
    location: "United Kingdom",
    country: "United Kingdom",
    description: "AI-powered carbon accounting for SMEs at enterprise accuracy",
    target: "\u00A34.0M",
    fundingValue: 4000000,
    stage: "Series A",
    sector: "Climate Tech",
    views: 412,
    image: {
      src: "/howitwork.png",
      alt: "Wind farm at sunrise",
      width: 1200,
      height: 675,
    },
    href: "/pitch/carbonledger-ai",
  },
  {
    title: "SolarRoot Systems",
    location: "United Kingdom",
    country: "United Kingdom",
    description: "Distributed solar infrastructure financing for industrial estates",
    target: "\u00A32.5M",
    fundingValue: 2500000,
    stage: "Seed",
    sector: "Clean Energy",
    views: 287,
    image: {
      src: "/howitwork.png",
      alt: "Renewable energy landscape",
      width: 1200,
      height: 675,
    },
    href: "/pitch/solarroot-systems",
  },
  {
    title: "Harvest Loop",
    location: "Kenya",
    country: "Kenya",
    description: "Climate-smart supply tools connecting growers to fair-value buyers",
    target: "\u00A31.8M",
    fundingValue: 1800000,
    stage: "Seed",
    sector: "Sustainable Agriculture",
    views: 199,
    image: {
      src: "/howitwork.png",
      alt: "Fields and clean energy equipment",
      width: 1200,
      height: 675,
    },
    href: "/pitch/harvest-loop",
  },
  {
    title: "CareBridge Health",
    location: "United Kingdom",
    country: "United Kingdom",
    description: "Accessible diagnostics workflow for underserved community clinics",
    target: "\u00A35.2M",
    fundingValue: 5200000,
    stage: "Growth",
    sector: "Healthcare",
    views: 354,
    image: {
      src: "/howitwork.png",
      alt: "Healthcare technology presentation",
      width: 1200,
      height: 675,
    },
    href: "/pitch/carebridge-health",
  },
  {
    title: "SkillSpring",
    location: "Nigeria",
    country: "Nigeria",
    description: "Workforce upskilling platform focused on green-economy roles",
    target: "\u00A31.1M",
    fundingValue: 1100000,
    stage: "Pre-seed",
    sector: "Ed Tech",
    views: 146,
    image: {
      src: "/howitwork.png",
      alt: "Education technology session",
      width: 1200,
      height: 675,
    },
    href: "/pitch/skill-spring",
  },
  {
    title: "FairFlow Pay",
    location: "United Kingdom",
    country: "United Kingdom",
    description: "Ethical fintech rails helping migrant workers access lower-cost transfers",
    target: "\u00A33.1M",
    fundingValue: 3100000,
    stage: "Series A",
    sector: "FinTech",
    views: 441,
    image: {
      src: "/howitwork.png",
      alt: "Fintech founders at work",
      width: 1200,
      height: 675,
    },
    href: "/pitch/fairflow-pay",
  },
  {
    title: "HomeKind Developments",
    location: "South Africa",
    country: "South Africa",
    description: "Affordable modular housing systems designed for fast urban deployment",
    target: "\u00A34.8M",
    fundingValue: 4800000,
    stage: "Growth",
    sector: "Affordable Housing",
    views: 228,
    image: {
      src: "/howitwork.png",
      alt: "Housing development concept",
      width: 1200,
      height: 675,
    },
    href: "/pitch/homekind-developments",
  },
  {
    title: "Mobility Mosaic",
    location: "United Kingdom",
    country: "United Kingdom",
    description: "Shared electric fleet software for community-first transport networks",
    target: "\u00A32.2M",
    fundingValue: 2200000,
    stage: "Seed",
    sector: "Mobility",
    views: 176,
    image: {
      src: "/howitwork.png",
      alt: "Mobility startup concept",
      width: 1200,
      height: 675,
    },
    href: "/pitch/mobility-mosaic",
  },
];

export const searchListings: SearchListing[] = Array.from({ length: 24 }, (_, index) => {
  const template = listingTemplates[index % listingTemplates.length];

  return {
    ...template,
    id: index + 1,
    views: template.views + index * 3,
  };
});

export const searchSectors = listSectorOptions;

export const searchStages = listStageOptions;

export const searchCountries = ["United Kingdom", "Kenya", "Nigeria", "South Africa"];
