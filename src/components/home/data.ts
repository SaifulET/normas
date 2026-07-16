import type { HomePageContent } from "./types";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";
import { listSectorOptions, listStageOptions } from "@/components/listings/list-options";

const sectorOptions = ["All Sectors", ...listSectorOptions];

const fundingOptions = [
  "All Funding",
  "$100K - $500K",
  "$500K - $1M",
  "$1M - $5M",
  "$5M - $10M",
  "$10M+",
];

const stageOptions = ["All Stage", ...listStageOptions];

export const homePageContent: HomePageContent = {
  hero: {
    logoAlt: "EARLY-N",
    nav: createSiteNav("Home"),
    primaryCta: sitePrimaryCta,
    title: "Invest in What Matters.",
    accentTitle: "Fund What's Next.",
    description:
      "Connecting impact-driven investors with ethical startups for a sustainable future. Transparent, secure, and mission-aligned.",
    searchFields: [
      {
        type: "text",
        name: "search",
        label: "Keyword",
        placeholder: "Company or niche...",
      },
      {
        type: "select",
        name: "sector",
        label: "Sector",
        defaultValue: "All Sectors",
        options: sectorOptions,
      },
      {
        type: "select",
        name: "range",
        label: "Range",
        defaultValue: "All Funding",
        options: fundingOptions,
      },
      {
        type: "select",
        name: "stage",
        label: "Stage",
        defaultValue: "All Stage",
        options: stageOptions,
      },
    ],
    searchActionLabel: "Search",
    actions: [
      {
        label: "I'm an Investor - Subscribe to Unlock",
        href: "#pricing",
        variant: "secondary",
      },
      {
        label: "I'm a Founder - Apply to List",
        href: "#founders",
        variant: "primary",
      },
    ],
    backgroundImageSrc: "/bgofhero.png",
  },
  stats: [
    { value: "127+", label: "Active Listings" },
    { value: "420+", label: "Ethical Investors" },
    { value: "23", label: "Deals Facilitated" },
    { value: "$48.5M", label: "Total Capital Raised" },
  ],
  listings: Array.from({ length: 4 }, (_, index) => ({
    id: index,
    title: "CarbonLedger AI",
    location: "United Kingdom",
    description: "AI-powered carbon accounting for SMEs at enterprise accuracy",
    target: "$4.0M",
    stage: "Series A",
    sector: "Climate Tech",
    views: 412,
    image: {
      src: "/howitwork.png",
      alt: "Team reviewing a climate technology investment deck",
      width: 800,
      height: 520,
    },
    href: "/pitch/carbonledger-ai",
  })),
  valueImages: [
    {
      src: "/middlepartimg1.png",
      alt: "Team reviewing a startup plan",
      width: 512,
      height: 512,
    },
    {
      src: "/middlepart2.png",
      alt: "People planning with sticky notes",
      width: 512,
      height: 512,
    },
    {
      src: "/middlepartimg3.png",
      alt: "Business handshake",
      width: 512,
      height: 512,
    },
    {
      src: "/middlepartimg4.png",
      alt: "Inclusive founder group",
      width: 512,
      height: 512,
    },
  ],
  values: [
    {
      title: "Radical Inclusivity",
      text: "Eliminating barriers based on race, origin, or background to ensure the best ethical minds lead the next era of growth.",
      icon: "userGroup",
    },
    {
      title: "Non-Discrimination Policy",
      text: "A strictly meritocratic yet deeply human approach that guarantees equal visibility for founders across the EURO ZONE, AFRICA and all BRICS territories.",
      icon: "shield",
    },
    {
      title: "Shared Success",
      text: "When the collective thrives, the individual prospers. Our model aligns investor returns with tangible community impact.",
      icon: "handHelping",
    },
  ],
  investorSteps: [
    {
      label: "Step 1",
      title: "Subscribe & KYC",
      text: "Complete your professional verification and choose a plan.",
    },
    {
      label: "Step 2",
      title: "Browse Listings",
      text: "Access hundreds of vetted, impact-driven startups.",
    },
    {
      label: "Step 3",
      title: "Chat & Due Diligence",
      text: "Direct secure messaging with founders via the dashboard.",
    },
    {
      label: "Goal",
      title: "Ready to Invest",
      text: "Finalize terms and grow your ethical business.",
    },
  ],
  founderSteps: [
    {
      label: "Step 1",
      title: "Apply to List",
      text: "Submit your impact thesis and business model for vetting.",
    },
    {
      label: "Step 2",
      title: "Vetting & Approval",
      text: "Our AI and admin team verify your ethical credentials.",
    },
    {
      label: "Step 3",
      title: "Upload Pitch Deck",
      text: "Enable secure, gated access for verified investors.",
    },
    {
      label: "Goal",
      title: "Respond & Scale",
      text: "Manage investor inquiries and close your round.",
    },
  ],
  founderImage: {
    src: "/secureAlingfundingImg.png",
    alt: "Founder and investor group reviewing a funding plan",
    width: 900,
    height: 600,
  },
  adminTasks: [
    { label: "Agreement Drafting" },
    { label: "Scheduling Meeting" },
    { label: "Commission Handling" },
  ],
  sectors: [
    { title: "Clean Energy", icon: "flash", listingCount: 0, href: "#" },
    { title: "Sustainable Agriculture", icon: "tractor", listingCount: 0, href: "#" },
    { title: "Climate Tech", icon: "leaf", listingCount: 0, href: "#" },
    { title: "Healthcare", icon: "heartCheck", listingCount: 0, href: "#" },
    { title: "Ed Tech", icon: "school", listingCount: 0, href: "#" },
    { title: "FinTech", icon: "bank", listingCount: 0, href: "#" },
    { title: "Affordable Housing", icon: "home", listingCount: 0, href: "#" },
    { title: "Social", icon: "userGroup", listingCount: 0, href: "#" },
    { title: "Supply Chain", icon: "package", listingCount: 0, href: "#" },
    { title: "Mobility", icon: "car", listingCount: 0, href: "#" },
    { title: "Impact Tech & AI", icon: "aiChip", listingCount: 0, href: "#" },
    { title: "Eco Empowerment", icon: "coinsPound", listingCount: 0, href: "#" },
    { title: "Manufacturing", icon: "factory", listingCount: 0, href: "#" },
    { title: "Cross-Sector", icon: "globe", listingCount: 0, href: "#" },
  ],
  testimonials: [],
  pricingPlans: [
    {
      id: "investor-basic",
      title: "Investor Basic",
      price: "$49",
      annualPrice: "$39",
      discountAnnually: 20,
      suffix: "/mo",
      features: [
        "Browse pitch listings (limited)",
        "View full pitch decks",
        "20 AI queries/month",
        "Watchlist up to 10 pitches",
        "Email support",
      ],
      action: "Start as Investor",
      href: "#",
      featured: false,
    },
    {
      id: "investor-pro",
      title: "Investor Pro",
      price: "$99",
      annualPrice: "$79",
      discountAnnually: 20,
      suffix: "/mo",
      features: [
        "Full pitch listing access",
        "View full pitch decks",
        "Unlimited AI queries",
        "Unlimited watchlist",
        "Priority support",
        "Early access to new listings",
      ],
      action: "Go Pro",
      href: "#",
      featured: true,
    },
    {
      id: "investee-basic",
      title: "Investee",
      price: "$79",
      annualPrice: "$59",
      discountAnnually: 25,
      suffix: "/mo",
      features: [
        "1 active pitch deck",
        "Pitch deck analytics",
        "Investor message inbox",
        "AI guardrail protection",
        "Version history",
        "Priority support",
      ],
      action: "Apply to List",
      href: "#",
      featured: false,
    },
  ],
  faqs: [
    {
      question: "How does the ethical vetting process work?",
      answer:
        "EARLY-N combines platform checks, admin review, and structured communication to keep each investment conversation clear, ethical, and ready for formal completion.",
    },
    {
      question: "What counts as an impact-driven startup?",
      answer:
        "Founders are reviewed against their business model, sector fit, and measurable mission outcomes so investors can evaluate both growth and social contribution.",
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer:
        "Yes. Plans are designed to be flexible, so members can upgrade, downgrade, or cancel as their fundraising or investing workflow changes.",
    },
    {
      question: "How are deals finalized on the platform?",
      answer:
        "Once both sides align, admins coordinate next steps such as formal agreements, meetings, and commission handling to keep the close process professional.",
    },
    {
      question: "What is the commission for closed deals?",
      answer:
        "Commission handling is managed during the closing workflow and can be tailored to the deal structure while staying transparent for both founders and investors.",
    },
  ],
  footerLinkGroups: siteFooterLinkGroups,
  socialLinks: siteSocialLinks,
};
