import Image from "next/image";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon as HugeAddIcon,
  AiChipIcon as HugeAiChipIcon,
  ArrowDown01Icon as HugeArrowDownIcon,
  ArrowRight01Icon as HugeArrowRightIcon,
  BankIcon as HugeBankIcon,
  Car01Icon as HugeCarIcon,
  CheckmarkCircle01Icon as HugeCheckmarkCircleIcon,
  CoinsPoundIcon as HugeCoinsPoundIcon,
  Facebook02Icon as HugeFacebookIcon,
  FactoryIcon as HugeFactoryIcon,
  FlashIcon as HugeFlashIcon,
  GlobeIcon as HugeGlobeIcon,
  HandHelpingIcon as HugeHandHelpingIcon,
  HeartCheckIcon as HugeHeartCheckIcon,
  Home01Icon as HugeHomeIcon,
  InstagramIcon as HugeInstagramIcon,
  Leaf01Icon as HugeLeafIcon,
  MapPinIcon as HugeMapPinIcon,
  NewTwitterIcon as HugeNewTwitterIcon,
  PackageIcon as HugePackageIcon,
  SchoolIcon as HugeSchoolIcon,
  Search01Icon as HugeSearchIcon,
  Shield01Icon as HugeShieldIcon,
  ShieldUserIcon as HugeShieldUserIcon,
  StarIcon as HugeStarIcon,
  TiktokIcon as HugeTiktokIcon,
  TractorIcon as HugeTractorIcon,
  UserGroupIcon as HugeUserGroupIcon,
  ViewIcon as HugeViewIcon,
  WhatsappIcon as HugeWhatsappIcon,
  YoutubeIcon as HugeYoutubeIcon,
} from "@hugeicons/core-free-icons";

const sectorOptions = [
  "All Sectors",
  "Clean Energy & Renewables",
  "Sustainable Agriculture & Food",
  "Climate Tech & Environment",
  "Healthcare & Wellbeing",
  "Education & Skills",
  "Financial Inclusion & Fintech",
  "Affordable Housing & Community",
  "Gender Equality & Social Impact",
  "Ethical Supply Chain & Trade",
  "Sustainable Transport & Mobility",
  "Impact Tech & AI for Good",
  "Poverty Alleviation & Economic Empowerment",
  "Responsible Manufacturing",
  "Other / Cross-Sector Impact",
];

const fundingOptions = [
  "£100K - £500K",
  "£500K - £1M",
  "£1M - £5M",
  "£5M - £10M",
  "£10M+",
];

const stageOptions = ["Pre-seed", "Seed", "Series A", "Growth"];

const stats = [
  ["127+", "Active Listings"],
  ["420+", "Ethical Investors"],
  ["23", "Deals Facilitated"],
  ["£48.5M", "Total Capital Raised"],
];

const listings = Array.from({ length: 4 }, (_, index) => ({
  id: index,
  title: "CarbonLedger AI",
  location: "United Kingdom",
  description: "AI-powered carbon accounting for SMEs at enterprise accuracy",
  target: "£4.0M",
}));

const values = [
  {
    title: "Radical Inclusivity",
    text: "Eliminating barriers based on race, origin, or background to ensure the best ethical minds lead the next era of growth.",
    icon: PeopleIcon,
  },
  {
    title: "Non-Discrimination Policy",
    text: "A strictly meritocratic yet deeply human approach that guarantees equal visibility for founders across all BRICS territories.",
    icon: ShieldIcon,
  },
  {
    title: "Shared Success",
    text: "When the collective thrives, the individual prospers. Our model aligns investor returns with tangible community impact.",
    icon: HandshakeIcon,
  },
];

const steps = [
  ["Step 1", "Subscribe & KYC", "Complete your professional verification and choose a plan."],
  ["Step 2", "Browse Listings", "Access hundreds of vetted, impact-driven startups."],
  ["Step 3", "Chat & Due Diligence", "Direct secure messaging with founders via the dashboard."],
  ["Goal", "Ready to Invest", "Finalize terms and grow your ethical business."],
];

const founderSteps = [
  ["Step 1", "Apply to List", "Submit your impact thesis and business model for vetting."],
  ["Step 2", "Vetting & Approval", "Our AI and admin team verify your ethical credentials."],
  ["Step 3", "Upload Pitch Deck", "Enable secure, gated access for verified investors."],
  ["Goal", "Respond & Scale", "Manage investor inquiries and close your round."],
];

const adminTasks = ["Agreement Drafting", "Scheduling Meeting", "Commission Handling"];

const sectors = [
  ["Clean Energy", "bolt"],
  ["Sustainable Agriculture", "tractor"],
  ["Climate Tech", "climate"],
  ["Healthcare", "heart"],
  ["Ed Tech", "education"],
  ["FinTech", "bank"],
  ["Affordable Housing", "home"],
  ["Social", "people"],
  ["Supply Chain", "box"],
  ["Mobility", "car"],
  ["Impact Tech & AI", "chip"],
  ["Eco Empowerment", "coin"],
  ["Manufacturing", "factory"],
  ["Cross-Sector", "globe"],
];

const testimonials = Array.from({ length: 6 }, (_, index) => ({
  id: index,
  name: "Jasmine Synthia",
  role: "Operation Manager, MasterPlan LLC",
  quote:
    "Vesioh transformed our response times. Coordination is now seamless across the entire team. It's the best investment we've made this year.",
}));

const pricingPlans = [
  {
    title: "Investor Basic",
    price: "£49",
    suffix: "/mo",
    features: [
      "Browse pitch listings (limited)",
      "View full pitch decks",
      "20 AI queries/month",
      "Watchlist up to 10 pitches",
      "Email support",
    ],
    action: "Start as Investor",
    featured: false,
  },
  {
    title: "Investor Pro",
    price: "£99",
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
    featured: true,
  },
  {
    title: "Investee",
    price: "£79",
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
    featured: false,
  },
];

const faqs = [
  "How does the ethical vetting process work?",
  "What counts as an 'impact-driven' startup?",
  "Can I cancel my subscription at any time?",
  "How are deals finalized on the platform?",
  "What is the commission for closed deals?",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F7F7] text-[#182231]">
      <Hero />
      <StatsBand />
      <Opportunities />
      <UbuntuSection />
      <HowItWorks />
      <FounderFunding />
      <AdminCompletion />
      <SectorCategories />
      <Testimonials />
      <Pricing />
      <Faq />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(43,66,93,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(43,66,93,0.08)_1px,transparent_1px)] bg-[size:128px_128px]" />
      <Image
        src="/bgofhero.png"
        alt=""
        fill
        priority
        className="pointer-events-none -z-10 object-cover object-center opacity-20"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-white/55" />

      <header className="mx-auto flex h-12 max-w-7xl items-center justify-between rounded-full bg-[#F2F2F280] px-5 shadow-sm backdrop-blur">
        <Image src="/logo.svg" alt="EARLY-N" width={69} height={33} priority />
        <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase tracking-[0.22em] text-[#182231] md:flex">
          <a className="text-[#E65E02]" href="#">Home</a>
          <a href="#">Search</a>
          <a href="#">About</a>
          <a href="#">Pricing</a>
          <a href="#">Contact</a>
        </nav>
        <div className="flex items-center gap-5 text-xs font-bold">
          <a className="hidden uppercase tracking-[0.18em] text-[#2B425D] sm:inline" href="#">Login</a>
          <a
            className="rounded-full bg-[#E65E02] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c84f00]"
            href="#"
          >
            Get Started
          </a>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col items-center pb-8 pt-20 text-center sm:pt-24 lg:pt-28">
        <h1 className="max-w-5xl text-5xl font-black leading-[1.08] tracking-normal text-[#182231] sm:text-6xl lg:text-7xl">
          Invest in What Matters.
          <span className="block text-[#E65E02]">Fund What&apos;s Next.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-[#2B425D]">
          Connecting impact-driven investors with ethical startups for a
          sustainable future. Transparent, secure, and mission-aligned.
        </p>

        <form className="mt-12 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-[#2B425D]/10 md:grid-cols-[1.25fr_1fr_1fr_1fr_auto]">
          <SearchField label="Keyword" placeholder="Company or niche..." />
          <SelectField label="Sector" defaultValue="All Sectors" options={sectorOptions} />
          <SelectField label="Range" defaultValue="£50k - £500k" options={fundingOptions} />
          <SelectField label="Stage" defaultValue="Seed" options={stageOptions} />
          <button className="flex min-h-16 items-center justify-center gap-3 bg-[#2B425D] px-8 text-base font-bold text-white transition hover:bg-[#21344b]">
            <SearchIcon className="h-5 w-5" />
            Search
          </button>
        </form>

        <div className="mt-12 flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
          <a
            className="flex h-14 flex-1 items-center justify-center rounded-md border-2 border-[#2B425D] bg-white/80 px-5 text-base font-extrabold text-[#182231] shadow-sm backdrop-blur transition hover:bg-white"
            href="#"
          >
            I&apos;m an Investor - Subscribe to Unlock
          </a>
          <a
            className="flex h-14 flex-1 items-center justify-center rounded-md bg-[#2B425D] px-5 text-base font-extrabold text-white shadow-sm transition hover:bg-[#21344b]"
            href="#"
          >
            I&apos;m a Founder - Apply to List
          </a>
        </div>
      </div>
    </section>
  );
}

function SearchField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="flex min-h-16 flex-col justify-center border-b border-[#2B425D]/10 px-5 text-left md:border-b-0 md:border-r">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#182231]/60">{label}</span>
      <input
        className="mt-1 w-full bg-transparent text-sm text-[#182231] outline-none placeholder:text-[#182231]/40"
        placeholder={placeholder}
      />
    </label>
  );
}

function SelectField({
  label,
  defaultValue,
  options,
}: {
  label: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="relative flex min-h-16 flex-col justify-center border-b border-[#2B425D]/10 px-5 text-left md:border-b-0 md:border-r">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#182231]/60">{label}</span>
      <select
        defaultValue={defaultValue}
        className="mt-1 w-full appearance-none bg-transparent pr-7 text-sm text-[#182231] outline-none"
      >
        {!options.includes(defaultValue) && <option>{defaultValue}</option>}
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2B425D]" />
    </label>
  );
}

function StatsBand() {
  return (
    <section className="bg-[#2B425D] px-4 py-5 text-white">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 text-center md:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label}>
            <p className="text-3xl font-black leading-none">{value}</p>
            <p className="mt-2 text-sm font-semibold text-white/55">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Opportunities() {
  return (
    <section className="bg-[#F7F7F7] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-normal text-[#182231]">
            Ethical Investment Opportunities
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-6 text-[#182231]/60">
            Explore pre-screened, impact-aligned businesses actively seeking ethical capital
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <article key={listing.id} className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#2B425D]/10">
              <div className="relative h-32">
                <Image
                  src="/howitwork.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-[#2B425D] px-3 py-1 text-xs text-white">Series A</span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-[#2B425D]">Climate Tech</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-[#182231]">{listing.title}</h3>
                  <span className="flex items-center gap-1 text-sm text-[#182231]/55">
                    <EyeIcon className="h-4 w-4" />
                    412 views
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-sm text-[#182231]/55">
                  <PinIcon className="h-4 w-4" />
                  {listing.location}
                </p>
                <p className="mt-4 min-h-12 text-sm leading-6 text-[#182231]/60">{listing.description}</p>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#182231]/40">
                      Funding Target
                    </p>
                    <p className="text-xl font-black text-[#2B425D]">{listing.target}</p>
                  </div>
                  <a
                    href="#"
                    className="rounded-md bg-[#E65E02] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c84f00]"
                  >
                    View Pitch
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <a
            href="#"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#2B425D] px-8 text-base font-semibold text-white transition hover:bg-[#21344b]"
          >
            View All Listings
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function UbuntuSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
        <div className="grid grid-cols-2 gap-4">
          <Image
            src="/middlepartimg1.png"
            alt="Team reviewing a startup plan"
            width={512}
            height={512}
            className="mt-8 aspect-square rounded-lg object-cover"
          />
          <Image
            src="/middlepart2.png"
            alt="People planning with sticky notes"
            width={512}
            height={512}
            className="aspect-square rounded-lg object-cover"
          />
          <Image
            src="/middlepartimg3.png"
            alt="Business handshake"
            width={512}
            height={512}
            className="aspect-square rounded-lg object-cover"
          />
          <Image
            src="/middlepartimg4.png"
            alt="Inclusive founder group"
            width={512}
            height={512}
            className="mt-6 aspect-square rounded-lg object-cover"
          />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#E65E02]">
            Philosophy & Core Values
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight tracking-normal text-[#182231] sm:text-5xl">
            The Ubuntu Standard:
            <span className="block text-[#E65E02]">Unified Humanity</span>
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#182231]/70">
            At the heart of EARLY-N lies the ancient African wisdom of{" "}
            <strong className="text-[#182231]">Ubuntu: &quot;I am because we are.&quot;</strong>{" "}
            We believe that true growth is only possible when it is shared,
            inclusive, and ethical.
          </p>

          <div className="mt-8 space-y-7">
            {values.map(({ title, text, icon: Icon }) => (
              <div key={title} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2B425D] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#182231]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#182231]/65">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="px-4 pb-8 text-center">
        <h2 className="text-4xl font-black tracking-normal text-[#182231]">How It Works</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#182231]/60">
          Our platform facilitates seamless, ethical capital flow through a rigorous, transparent process.
        </p>
      </div>

      <div className="bg-[#2B425D] px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black">01</span>
              <p className="text-sm font-black text-[#E65E02]">For Ethical Investors</p>
            </div>
            <h3 className="mt-5 text-3xl font-black tracking-normal">Deploy Capital with Purpose</h3>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {steps.map(([label, title, text], index) => (
                <article
                  key={title}
                  className={`rounded-md p-5 ring-1 ring-white/10 ${
                    index === 3 ? "bg-white text-[#182231]" : "bg-white/7 text-white"
                  }`}
                >
                  <p className={`text-[10px] font-black ${index === 3 ? "text-[#2B425D]" : "text-[#E65E02]"}`}>
                    {label}
                  </p>
                  <h4 className="mt-3 text-base font-black">{title}</h4>
                  <p className={`mt-1 text-xs leading-5 ${index === 3 ? "text-[#182231]/60" : "text-white/60"}`}>
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <Image
            src="/howitwork.png"
            alt="Investors reviewing market analytics"
            width={1024}
            height={1024}
            className="max-h-[430px] w-full rounded-lg object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

function FounderFunding() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <Image
          src="/secureAlingfundingImg.png"
          alt="Founder and investor group reviewing a funding plan"
          width={900}
          height={600}
          className="h-[260px] w-full rounded-lg object-cover sm:h-[330px]"
          sizes="(min-width: 1024px) 48vw, 100vw"
        />

        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B425D] text-sm font-black text-white">
              02
            </span>
            <p className="text-sm font-black text-[#E65E02]">For Impact Founders</p>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-normal text-[#2B425D] sm:text-4xl">
            Secure Aligned Funding
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {founderSteps.map(([label, title, text], index) => (
              <article
                key={title}
                className={`rounded-md p-5 ring-1 ring-[#2B425D]/10 ${
                  index === 3 ? "bg-[#2B425D] text-white" : "bg-[#F7F7F7] text-[#182231]"
                }`}
              >
                <p className={`text-[10px] font-black ${index === 3 ? "text-[#E65E02]" : "text-[#2B425D]"}`}>
                  {label}
                </p>
                <h3 className="mt-3 text-base font-black">{title}</h3>
                <p className={`mt-1 text-xs leading-5 ${index === 3 ? "text-white/75" : "text-[#182231]/60"}`}>
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminCompletion() {
  return (
    <section className="bg-[#F7F7F7] px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <ShieldCheckIcon className="mx-auto h-10 w-10 text-[#E65E02]" />
        <h2 className="mt-4 text-2xl font-black tracking-normal text-[#2B425D] sm:text-3xl">
          Admin Facilitated Completion
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#182231]/65 sm:text-base">
          Once interest is solidified, EARLY-N admins step in to facilitate formal agreements and commission
          tracking, ensuring a professional and legally sound conclusion for both parties.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {adminTasks.map((task) => (
            <span
              key={task}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#182231] ring-1 ring-[#2B425D]/10"
            >
              <TinyCheckIcon className="h-4 w-4 text-[#159953]" />
              {task}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectorCategories() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-black tracking-normal text-[#182231]">Invest Where it Matters</h2>
        <p className="mt-4 text-sm leading-6 text-[#182231]/55 sm:text-base">
          14 ethical sector categories aligned with established ESG investment classifications
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map(([title, icon]) => (
            <a
              key={title}
              href="#"
              className="group flex min-h-28 flex-col items-center justify-center rounded-md bg-white p-5 text-center ring-1 ring-[#2B425D]/10 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <SectorIcon name={icon} className="h-6 w-6 text-[#2B425D]" />
              <h3 className="mt-4 text-sm font-black text-[#182231]">{title}</h3>
              <p className="mt-3 flex items-center gap-2 text-xs text-[#182231]/50">
                12 listings
                <ArrowRightIcon className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-[#F7F7F7] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-normal text-[#182231]">The User Voice</h2>
          <p className="mt-4 text-sm leading-6 text-[#182231]/55 sm:text-base">
            Insights into how our community experiences the platform.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#2B425D]/10"
            >
              <p className="relative z-10 text-base leading-7 text-[#141A33]">&quot;{testimonial.quote}&quot;</p>
              <div className="relative z-10 mt-6 flex items-center gap-4">
                <Image
                  src="/middlepartimg4.png"
                  alt=""
                  width={52}
                  height={52}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#141A33]">{testimonial.name}</h3>
                  <p className="mt-1 text-[11px] text-[#141A33]/45">{testimonial.role}</p>
                  <div className="mt-2 flex gap-1 text-[#E7A018]">
                    {Array.from({ length: 5 }, (_, index) => (
                      <StarIcon key={index} className="h-3.5 w-3.5" filled={index < 4} />
                    ))}
                  </div>
                </div>
              </div>
              <Image
                src="/invertedKomma.svg"
                alt=""
                width={88}
                height={68}
                className="absolute bottom-4 right-5 opacity-5"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-normal text-[#182231]">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-sm leading-6 text-[#182231]/55 sm:text-base">
            For serious investors and founders ready to make an impact
          </p>
          <div className="mt-5 inline-flex rounded-md bg-white p-1 ring-1 ring-[#2B425D]/10">
            <span className="rounded bg-[#182231] px-8 py-2 text-sm font-semibold text-white">Monthly</span>
            <span className="px-8 py-2 text-sm font-medium text-[#182231]/70">
              Annual <span className="text-[#E65E02]">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="mt-9 grid items-start gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.title}
              className={`relative rounded-lg bg-white p-7 ring-1 ${
                plan.featured
                  ? "ring-[#2B425D] shadow-2xl shadow-[#182231]/15"
                  : "ring-[#2B425D]/15 shadow-sm"
              }`}
            >
              {plan.featured && (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E65E02] px-5 py-2 text-xs font-black text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-base font-black text-[#182231]">{plan.title}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-[#2B425D]">{plan.price}</span>
                <span className="pb-1 text-sm text-[#182231]/55">{plan.suffix}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#182231]/70">
                    <TinyCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#159953]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className={`mt-7 flex h-12 items-center justify-center rounded-md px-5 text-sm font-black transition ${
                  plan.featured
                    ? "bg-[#2B425D] text-white hover:bg-[#21344b]"
                    : "border-2 border-[#2B425D] text-[#2B425D] hover:bg-[#2B425D] hover:text-white"
                }`}
              >
                {plan.action}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-[#F7F7F7] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-4xl font-black tracking-normal text-[#182231]">Common Questions</h2>
          <p className="mt-4 text-sm leading-6 text-[#182231]/55 sm:text-base">
            Everything you need to know about EARLY-N
          </p>
        </div>

        <div className="mt-12 divide-y divide-[#2B425D]/10">
          {faqs.map((question) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-xl font-semibold text-[#2B425D] marker:hidden sm:text-2xl">
                {question}
                <PlusIcon className="h-5 w-5 shrink-0 transition group-open:rotate-45" />
              </summary>
              <p className="max-w-3xl pb-7 text-sm leading-7 text-[#182231]/60">
                EARLY-N combines platform checks, admin review, and structured communication to keep each
                investment conversation clear, ethical, and ready for formal completion.
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#2B425D] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.7fr_1fr_1fr_1fr]">
          <div>
            <Image src="/logo.svg" alt="EARLY-N" width={112} height={52} className="brightness-0 invert" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/85">
              Impact-driven investment for a better future. Connecting capital with conscience.
            </p>
          </div>
          <FooterLinks title="Navigation" links={["How it Works", "Listings", "Pricing"]} />
          <FooterLinks title="Company" links={["About", "Contact"]} />
          <FooterLinks title="Legal" links={["Privacy Policy", "Terms of Service"]} />
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/80">© 2026 EARLY-N. Impact-driven investment for a better future.</p>
          <div className="flex items-center gap-5">
            {["wa", "f", "ig", "yt", "x", "tt"].map((name) => (
              <a key={name} href="#" className="text-white transition hover:text-[#E65E02]" aria-label={name}>
                <SocialIcon name={name} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-black">{title}</h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link}>
            <a href="#" className="text-sm text-white/85 transition hover:text-white">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppIcon({ icon, className }: { icon: IconSvgElement; className?: string }) {
  return (
    <HugeiconsIcon
      icon={icon}
      className={className}
      size={24}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}

function SearchIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeSearchIcon} className={className} />;
}

function ChevronIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeArrowDownIcon} className={className} />;
}

function EyeIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeViewIcon} className={className} />;
}

function PinIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeMapPinIcon} className={className} />;
}

function ArrowRightIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeArrowRightIcon} className={className} />;
}

function PeopleIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeUserGroupIcon} className={className} />;
}

function ShieldIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeShieldIcon} className={className} />;
}

function HandshakeIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeHandHelpingIcon} className={className} />;
}

function TinyCheckIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeCheckmarkCircleIcon} className={className} />;
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeShieldUserIcon} className={className} />;
}

function PlusIcon({ className }: { className?: string }) {
  return <AppIcon icon={HugeAddIcon} className={className} />;
}

function StarIcon({ className, filled = true }: { className?: string; filled?: boolean }) {
  return <AppIcon icon={HugeStarIcon} className={`${className ?? ""} ${filled ? "" : "opacity-55"}`} />;
}

function SectorIcon({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, IconSvgElement> = {
    bolt: HugeFlashIcon,
    tractor: HugeTractorIcon,
    climate: HugeLeafIcon,
    heart: HugeHeartCheckIcon,
    education: HugeSchoolIcon,
    bank: HugeBankIcon,
    home: HugeHomeIcon,
    people: HugeUserGroupIcon,
    box: HugePackageIcon,
    car: HugeCarIcon,
    chip: HugeAiChipIcon,
    coin: HugeCoinsPoundIcon,
    factory: HugeFactoryIcon,
    globe: HugeGlobeIcon,
  };

  return <AppIcon icon={iconMap[name] ?? HugeGlobeIcon} className={className} />;
}

function SocialIcon({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, IconSvgElement> = {
    wa: HugeWhatsappIcon,
    f: HugeFacebookIcon,
    ig: HugeInstagramIcon,
    yt: HugeYoutubeIcon,
    x: HugeNewTwitterIcon,
    tt: HugeTiktokIcon,
  };

  return <AppIcon icon={iconMap[name] ?? HugeGlobeIcon} className={className} />;
}
