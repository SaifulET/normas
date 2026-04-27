export type SuperadminNavIcon =
  | "analytics"
  | "dashboard"
  | "payment"
  | "reports"
  | "settings"
  | "support"
  | "users";

export type SuperadminStatusTone = "active" | "offline" | "pending" | "resolved" | "dismissed" | "solved";

export interface SuperadminNavItem {
  label: string;
  href: string;
  icon: SuperadminNavIcon;
  section: "main" | "core";
}

export interface SuperadminUserRecord {
  slug: string;
  name: string;
  email: string;
  username: string;
  accountType: "Personal" | "Business";
  status: "Active" | "Offline";
  joiningDate: string;
  gender: string;
  age: string;
  address: string;
  deletionLabel: string;
  bio: string;
  initials: string;
  avatarFrom: string;
  avatarTo: string;
  businessDocument?: string;
}

export interface SuperadminPaymentRecord {
  slug: string;
  userSlug: string;
  productType: string;
  paymentDate: string;
  amount: string;
  moomentCredits: string;
  productAmount: string;
  ticketAmount: string;
  totalAmount: string;
}

export interface SuperadminReportRecord {
  slug: string;
  reportBySlug: string;
  reportedUserSlug: string;
  type: string;
  status: "Resolved" | "Dismissed" | "Pending";
  reportId: string;
  reportCount: string;
  reportedReason: string;
  contentText: string;
  imageSrc: string;
}

export interface SuperadminSupportRecord {
  slug: string;
  userSlug: string;
  topic: string;
  status: "Solved" | "Dismissed" | "Pending";
  date: string;
  body: string;
  reply: string;
}

export const superadminUser = {
  email: "paul@ramsey.com",
  name: "Tuval Ramsey",
  role: "Super Admin",
};

export const superadminNavItems: SuperadminNavItem[] = [
  { label: "Dashboard", href: "/superadmin/dashboard", icon: "dashboard", section: "main" },
  { label: "Analytics", href: "/superadmin/dashboard/analytics", icon: "analytics", section: "main" },
  { label: "User Management", href: "/superadmin/dashboard/user-management", icon: "users", section: "core" },
  { label: "Payment Management", href: "/superadmin/dashboard/payment-management", icon: "payment", section: "core" },
  { label: "Reports", href: "/superadmin/dashboard/reports", icon: "reports", section: "core" },
  { label: "Support Center", href: "/superadmin/dashboard/support-center", icon: "support", section: "core" },
  { label: "Settings", href: "/superadmin/dashboard/settings", icon: "settings", section: "core" },
];

export const superadminUsers: SuperadminUserRecord[] = [
  {
    slug: "theresa-webb",
    name: "Theresa Webb",
    email: "bill.sanders@example.com",
    username: "@theresawebb",
    accountType: "Personal",
    status: "Active",
    joiningDate: "Oct 12, 2026",
    gender: "Female",
    age: "29",
    address: "18 Madison avenue, NYC",
    deletionLabel: "20 days left",
    bio: "Theresa is an active platform buyer focused on premium events and community experiences across North America.",
    initials: "TW",
    avatarFrom: "#8E9BFF",
    avatarTo: "#F59E0B",
  },
  {
    slug: "marvin-mckinney",
    name: "Marvin McKinney",
    email: "tim.jennings@example.com",
    username: "@marvinmckinney",
    accountType: "Personal",
    status: "Offline",
    joiningDate: "Oct 12, 2026",
    gender: "Male",
    age: "35",
    address: "22 Park row, Chicago",
    deletionLabel: "41 days left",
    bio: "Marvin works with event-ticket products and maintains a steady purchase history on the platform.",
    initials: "MM",
    avatarFrom: "#FB7185",
    avatarTo: "#C084FC",
  },
  {
    slug: "courtney-henry",
    name: "Courtney Henry",
    email: "georgia.young@example.com",
    username: "@courtneyhenry",
    accountType: "Business",
    status: "Active",
    joiningDate: "Oct 12, 2026",
    gender: "Female",
    age: "31",
    address: "43 John hopkins road, NYC",
    deletionLabel: "20 days left",
    bio: "Courtney manages a business profile and uses the platform for vendor bookings, credits, and ticket operations.",
    initials: "CH",
    avatarFrom: "#22C55E",
    avatarTo: "#38BDF8",
    businessDocument: "Filename.pdf",
  },
  {
    slug: "steve-herd",
    name: "Steve Herd",
    email: "sarah.c@vesioh.com",
    username: "@sfdjfjsd",
    accountType: "Business",
    status: "Offline",
    joiningDate: "Jan 25, 2024",
    gender: "Male",
    age: "21",
    address: "43, John hopkins road, NYC",
    deletionLabel: "20 days left",
    bio: "Meet Alex Johnson, a passionate traveler and tech enthusiast from the USA. With a knack for coding and a love for exploring new cultures, Alex has visited over 15 countries and enjoys sharing stories from his adventures. When he's not working on innovative software solutions, you can find him hiking in the mountains or trying out local cuisines.",
    initials: "SH",
    avatarFrom: "#F97316",
    avatarTo: "#8B5CF6",
    businessDocument: "Filename.pdf",
  },
];

export const superadminPayments: SuperadminPaymentRecord[] = [
  {
    slug: "payment-theresa-webb",
    userSlug: "theresa-webb",
    productType: "Ticket",
    paymentDate: "Oct 25, 2026",
    amount: "$50.00",
    moomentCredits: "$105.00",
    productAmount: "$45.00",
    ticketAmount: "$105.00",
    totalAmount: "$105.00",
  },
  {
    slug: "payment-marvin-mckinney",
    userSlug: "marvin-mckinney",
    productType: "Product",
    paymentDate: "Oct 25, 2026",
    amount: "$50.00",
    moomentCredits: "$85.00",
    productAmount: "$50.00",
    ticketAmount: "$35.00",
    totalAmount: "$85.00",
  },
  {
    slug: "payment-courtney-henry",
    userSlug: "courtney-henry",
    productType: "Mooment Credits",
    paymentDate: "Oct 25, 2026",
    amount: "$50.00",
    moomentCredits: "$95.00",
    productAmount: "$25.00",
    ticketAmount: "$70.00",
    totalAmount: "$95.00",
  },
  {
    slug: "payment-steve-herd",
    userSlug: "steve-herd",
    productType: "Ticket",
    paymentDate: "Oct 25, 2026",
    amount: "$50.00",
    moomentCredits: "$105.00",
    productAmount: "$45.00",
    ticketAmount: "$105.00",
    totalAmount: "$105.00",
  },
];

export const superadminReports: SuperadminReportRecord[] = [
  {
    slug: "report-theresa-webb",
    reportBySlug: "theresa-webb",
    reportedUserSlug: "theresa-webb",
    type: "Post",
    status: "Resolved",
    reportId: "1235",
    reportCount: "45",
    reportedReason: "Inappropriate content",
    contentText: "Here's some totally pointless content that doesn't really say anything useful. It's just a bunch of words thrown together to fill space. Enjoy!",
    imageSrc: "/howitwork.png",
  },
  {
    slug: "report-marvin-mckinney",
    reportBySlug: "marvin-mckinney",
    reportedUserSlug: "marvin-mckinney",
    type: "Event",
    status: "Dismissed",
    reportId: "1236",
    reportCount: "12",
    reportedReason: "Misleading event info",
    contentText: "The event details listed by this account do not match the latest public information submitted by the host team.",
    imageSrc: "/middlepart2.png",
  },
  {
    slug: "report-courtney-henry",
    reportBySlug: "courtney-henry",
    reportedUserSlug: "courtney-henry",
    type: "User",
    status: "Pending",
    reportId: "1237",
    reportCount: "8",
    reportedReason: "Content violations",
    contentText: "Multiple reports were filed against this profile for messaging behavior that appears to violate the community policy.",
    imageSrc: "/middlepartimg3.png",
  },
  {
    slug: "report-steve-herd",
    reportBySlug: "steve-herd",
    reportedUserSlug: "steve-herd",
    type: "Room",
    status: "Pending",
    reportId: "1238",
    reportCount: "17",
    reportedReason: "Inappropriate content",
    contentText: "The room contains repeated community-flagged uploads that should be reviewed by the platform operations team.",
    imageSrc: "/middlepartimg4.png",
  },
];

export const superadminSupportThreads: SuperadminSupportRecord[] = [
  {
    slug: "support-theresa-webb",
    userSlug: "theresa-webb",
    topic: "I have issue with my dashboard",
    status: "Solved",
    date: "October 12, 2026",
    body: "This is the body, of the message the client wants to know. Help him with your assistance. If you can mark as solve then the status will be automatically updated to “solved”.",
    reply: "We reviewed the dashboard cache and restored the metrics panel. Please refresh the browser and confirm the issue is resolved.",
  },
  {
    slug: "support-marvin-mckinney",
    userSlug: "marvin-mckinney",
    topic: "I don know how to say",
    status: "Dismissed",
    date: "October 12, 2026",
    body: "The client wants clarification about how event product charges are broken down in the billing section.",
    reply: "We shared a fee breakdown article and marked the request closed after confirmation from the buyer.",
  },
  {
    slug: "support-courtney-henry",
    userSlug: "courtney-henry",
    topic: "What is the use of your",
    status: "Pending",
    date: "October 12, 2026",
    body: "The business account holder is asking how Mooment Credits can be applied to their future transactions.",
    reply: "Credits can be applied automatically during checkout when enabled on the wallet settings page.",
  },
  {
    slug: "support-steve-herd",
    userSlug: "steve-herd",
    topic: "Help me with the website",
    status: "Pending",
    date: "October 12, 2026",
    body: "This is the body, of the message the client wants to know. Help him with your assistance. If you can mark as solve then the status will be automatically updated to “solved”.",
    reply: "This is the body, of the message the client wants to know. Help him with your assistance. If you can mark as solve then the status will be automatically updated to “solved”.",
  },
];

export const superadminStatusToneMap: Record<string, SuperadminStatusTone> = {
  Active: "active",
  Offline: "offline",
  Pending: "pending",
  Resolved: "resolved",
  Dismissed: "dismissed",
  Solved: "solved",
};

export const superadminSettingsTabs = [
  { label: "General", href: "/superadmin/dashboard/settings" },
  { label: "Mooment Credit", href: "/superadmin/dashboard/settings/mooment-credit" },
  { label: "Pricing", href: "/superadmin/dashboard/settings/pricing" },
  { label: "Terms & Conditions", href: "/superadmin/dashboard/settings/terms-conditions" },
  { label: "Privacy & Policy", href: "/superadmin/dashboard/settings/privacy-policy" },
];

export function getSuperadminUser(slug: string) {
  return superadminUsers.find((user) => user.slug === slug);
}

export function getSuperadminPayment(slug: string) {
  return superadminPayments.find((payment) => payment.slug === slug);
}

export function getSuperadminReport(slug: string) {
  return superadminReports.find((report) => report.slug === slug);
}

export function getSuperadminSupportThread(slug: string) {
  return superadminSupportThreads.find((thread) => thread.slug === slug);
}
