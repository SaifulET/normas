export type IconName =
  | "add"
  | "aiChip"
  | "aiLock"
  | "balanceScale"
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "bank"
  | "bookmark"
  | "car"
  | "cancel01"
  | "chartUp"
  | "checkmarkCircle"
  | "coinsPound"
  | "facebook"
  | "factory"
  | "flash"
  | "globe"
  | "handHelping"
  | "heartCheck"
  | "home"
  | "instagram"
  | "leaf"
  | "mapPin"
  | "mailSend"
  | "package"
  | "school"
  | "search"
  | "shield"
  | "shieldUser"
  | "star"
  | "tiktok"
  | "tractor"
  | "twitter"
  | "userGroup"
  | "view"
  | "whatsapp"
  | "youtube";

export interface LinkItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type HeroSearchField =
  | {
      type: "text";
      name: string;
      label: string;
      placeholder: string;
    }
  | {
      type: "select";
      name: string;
      label: string;
      defaultValue: string;
      options: string[];
    };

export interface HeroAction {
  label: string;
  href: string;
  variant: "primary" | "secondary";
}

export interface HeroContent {
  logoAlt: string;
  nav: LinkItem[];
  primaryCta: LinkItem;
  title: string;
  accentTitle: string;
  description: string;
  searchFields: HeroSearchField[];
  searchActionLabel: string;
  actions: HeroAction[];
  backgroundImageSrc: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface Listing {
  id: number | string;
  title: string;
  location: string;
  description: string;
  target: string;
  stage: string;
  sector: string;
  views: number;
  image: ImageAsset;
  href: string;
}

export interface ValueItem {
  title: string;
  text: string;
  icon: IconName;
}

export interface StepItem {
  label: string;
  title: string;
  text: string;
}

export interface AdminTask {
  label: string;
}

export interface SectorItem {
  title: string;
  icon: IconName;
  listingCount: number;
  href: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar: ImageAsset;
}

export interface PricingPlan {
  title: string;
  price: string;
  suffix: string;
  features: string[];
  action: string;
  href: string;
  featured?: boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FooterLinkGroup {
  title: string;
  links: LinkItem[];
}

export interface SocialLink {
  name: string;
  href: string;
  icon: IconName;
}

export interface HomePageContent {
  hero: HeroContent;
  stats: StatItem[];
  listings: Listing[];
  valueImages: ImageAsset[];
  values: ValueItem[];
  investorSteps: StepItem[];
  founderSteps: StepItem[];
  founderImage: ImageAsset;
  adminTasks: AdminTask[];
  sectors: SectorItem[];
  testimonials: Testimonial[];
  pricingPlans: PricingPlan[];
  faqs: FaqItem[];
  footerLinkGroups: FooterLinkGroup[];
  socialLinks: SocialLink[];
}
