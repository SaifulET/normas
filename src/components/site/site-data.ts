import type { FooterLinkGroup, LinkItem, SocialLink } from "@/components/home/types";

const siteNavItems: LinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function createSiteNav(activeLabel?: string) {
  return siteNavItems.map((item) => ({
    ...item,
    active: item.label === activeLabel,
  }));
}

export const sitePrimaryCta: LinkItem = {
  label: "Get Started",
  href: "/pricing",
};

export const siteFooterLinkGroups: FooterLinkGroup[] = [
  {
    title: "Navigation",
    links: [
      { label: "How it Works", href: "/#how-it-works" },
      { label: "Listings", href: "/search" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "KYC", href: "#" },
      { label: "Terms & Conditions", href: "/terms-and-conditions" },
    ],
  },
];

export const siteSocialLinks: SocialLink[] = [
  { name: "WhatsApp", href: "#", icon: "whatsapp" },
  { name: "Facebook", href: "#", icon: "facebook" },
  { name: "Instagram", href: "#", icon: "instagram" },
  { name: "YouTube", href: "#", icon: "youtube" },
  { name: "X", href: "#", icon: "twitter" },
  { name: "TikTok", href: "#", icon: "tiktok" },
];
