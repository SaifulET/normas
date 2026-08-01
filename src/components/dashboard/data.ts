import { getPitchBySlug, pitchDetails, type PitchDetail } from "@/components/pitch/data";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: "website" | "dashboard" | "plus" | "save" | "messages" | "schedule" | "notice" | "support" | "upgrade";
}

export interface DashboardMessageItem {
  id: string;
  sender: "investor" | "team" | "admin";
  author: string;
  body: string;
  time: string;
  warning?: string;
  actionLabel?: string;
  actionHint?: string;
}

export interface DashboardMessageThread {
  id: string;
  pitchSlug: string;
  title: string;
  preview: string;
  unreadCount: number;
  age: string;
  bucket: "Open" | "Request";
  messages: DashboardMessageItem[];
}

export interface DashboardPlan {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  cta: string;
  featured?: boolean;
  current?: boolean;
}

export const dashboardUser = {
  name: "Tuval Ramsey",
  email: "paul@ramsey.com",
  role: "Investor",
  initials: "TR",
};

export const dashboardNavItems: DashboardNavItem[] = [
  { label: "Website", href: "/", icon: "website" },
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Save list", href: "/dashboard/save-list", icon: "save" },
  { label: "Messages", href: "/dashboard/messages", icon: "messages" },
  { label: "Schedule", href: "/dashboard/schedule", icon: "schedule" },
  { label: "Notices", href: "/dashboard/notices", icon: "notice" },
  { label: "Support Center", href: "/dashboard/support-center", icon: "support" },
  { label: "Upgrade Plan", href: "/dashboard/upgrade-plan", icon: "upgrade" },
];

export const investeeDashboardUser = {
  ...dashboardUser,
  role: "Investee",
};

export const investeeDashboardNavItems: DashboardNavItem[] = [
  { label: "Website", href: "/", icon: "website" },
  { label: "Dashboard", href: "/investee-dashboard", icon: "dashboard" },
  { label: "Create list", href: "/investee-dashboard/create-list", icon: "plus" },
  { label: "Created list", href: "/investee-dashboard/created-list", icon: "save" },
  { label: "Messages", href: "/investee-dashboard/messages", icon: "messages" },
  { label: "Schedule", href: "/investee-dashboard/schedule", icon: "schedule" },
  { label: "Notices", href: "/investee-dashboard/notices", icon: "notice" },
  { label: "Support Center", href: "/investee-dashboard/support-center", icon: "support" },
  { label: "Upgrade Plan", href: "/investee-dashboard/upgrade-plan", icon: "upgrade" },
];

function requirePitch(slug: string) {
  const pitch = getPitchBySlug(slug);

  if (!pitch) {
    throw new Error(`Missing dashboard pitch for slug "${slug}".`);
  }

  return pitch;
}

export const dashboardSavedPitches: PitchDetail[] = [
  requirePitch("carbonledger-ai"),
  requirePitch("solarroot-systems"),
  requirePitch("harvest-loop"),
  requirePitch("fairflow-pay"),
  requirePitch("homekind-developments"),
];

export const dashboardOverviewPitches = dashboardSavedPitches.slice(0, 4);

export const dashboardCalendarColumns = ["13", "14", "15", "16", "17", "18", "19"];

export const dashboardCalendarSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export const dashboardCalendarEvent = {
  day: "17",
  time: "02:00 PM",
  label: "Stamford meeting place",
};

export const dashboardMessageThreads: DashboardMessageThread[] = [
  {
    id: "thread-carbonledger",
    pitchSlug: "carbonledger-ai",
    title: "Carbonledger AI Project for windmill",
    preview: "Hi team, we're experiencing some latency with the reporting dashboard.",
    unreadCount: 1,
    age: "10m",
    bucket: "Open",
    messages: [
      {
        id: "carbonledger-1",
        sender: "investor",
        author: dashboardUser.name,
        body: "Hello there, I want to know about the project. Can you tell me more about it?",
        time: "8:20 AM",
      },
      {
        id: "carbonledger-2",
        sender: "investor",
        author: dashboardUser.name,
        body:
          "Can you share the location or contact information? Or you can share your WhatsApp number, maybe social media handle. I'll contact you from there.",
        time: "8:20 AM",
        warning: "You can't ask or share any contact information.",
      },
      {
        id: "carbonledger-3",
        sender: "team",
        author: "Project Team",
        body:
          "Yes, I can help you with that. Our project is about AI windmill optimization that increases energy output and reduces downtime, helping investors proceed with confidence.",
        time: "8:30 AM",
      },
      {
        id: "carbonledger-4",
        sender: "admin",
        author: "Admin",
        body: "We can arrange a meeting to confirm the investment.",
        time: "8:30 AM",
      },
      {
        id: "carbonledger-5",
        sender: "admin",
        author: "Admin",
        body: "We can arrange a meeting to confirm the investment.",
        time: "8:30 AM",
        actionLabel: "Schedule",
        actionHint: "Set if you are available or not",
      },
    ],
  },
  {
    id: "thread-solarroot",
    pitchSlug: "solarroot-systems",
    title: "SolarRoot Systems",
    preview: "Thanks for the interest. We can share deployment milestones next.",
    unreadCount: 0,
    age: "24m",
    bucket: "Open",
    messages: [],
  },
  {
    id: "thread-harvest",
    pitchSlug: "harvest-loop",
    title: "Harvest Loop",
    preview: "Our buyer network expanded by 18% this month and the data room is ready.",
    unreadCount: 2,
    age: "1h",
    bucket: "Request",
    messages: [
      {
        id: "harvest-1",
        sender: "team",
        author: "Founder",
        body: "We uploaded a fresh diligence summary with onboarding and logistics metrics.",
        time: "7:10 AM",
      },
    ],
  },
  {
    id: "thread-fairflow",
    pitchSlug: "fairflow-pay",
    title: "FairFlow Pay",
    preview: "We can walk through unit economics and compliance readiness on a call.",
    unreadCount: 0,
    age: "2h",
    bucket: "Open",
    messages: [
      {
        id: "fairflow-1",
        sender: "team",
        author: "Founder",
        body: "Happy to share our latest transfer volume and margin trendlines.",
        time: "6:40 AM",
      },
    ],
  },
];

export const dashboardPlans: DashboardPlan[] = [
  {
    name: "Investor Basic",
      monthlyPrice: "$49",
      yearlyPrice: "$470",
    cta: "Current Plan",
    current: true,
    features: [
      "Browse pitch listings (limited)",
      "View full pitch decks",
      "20 AI queries/month",
      "Watchlist up to 10 pitches",
      "Email support",
    ],
  },
  {
    name: "Investor Pro",
      monthlyPrice: "$99",
      yearlyPrice: "$950",
    cta: "Upgrade to Pro",
    featured: true,
    features: [
      "Full pitch listing access",
      "View full pitch decks",
      "Unlimited AI queries",
      "Unlimited watchlist",
      "Priority support",
      "Early access to new listings",
    ],
  },
];

export const checkoutSummary = {
  planName: "Pro plan",
  subscription: "$20.00",
  vat: "$3.00",
  dueToday: "$23.00",
  features: dashboardPlans[1].features,
};

export const dashboardBillingHistory = [
  { date: "Sep 12, 2026", invoiceId: "INV-2023-009", amount: "$49.00", status: "Paid" },
  { date: "Aug 12, 2026", invoiceId: "INV-2023-008", amount: "$49.00", status: "Paid" },
  { date: "Jul 12, 2026", invoiceId: "INV-2023-007", amount: "$49.00", status: "Paid" },
];

export const dashboardProfileStats = [
  { label: "Saved listings", value: "48" },
  { label: "Live conversations", value: "12" },
  { label: "Meetings this month", value: "7" },
  { label: "Plan", value: "Investor Basic" },
];

export const dashboardProfileSections = [
  {
    title: "Personal Details",
    items: [
      { label: "Full name", value: dashboardUser.name },
      { label: "Email", value: dashboardUser.email },
      { label: "Role", value: dashboardUser.role },
      { label: "Region", value: "United Kingdom" },
    ],
  },
  {
    title: "Investment Preferences",
    items: [
      { label: "Preferred sectors", value: "Climate Tech, Clean Energy, FinTech" },
  { label: "Cheque size", value: "$150k - $1.2M" },
      { label: "Stage focus", value: "Seed to Series A" },
      { label: "Preferred markets", value: "United Kingdom, Kenya, Nigeria" },
    ],
  },
];

export const dashboardPitchFeed = pitchDetails;
