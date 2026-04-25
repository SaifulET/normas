import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/home/icons";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";

const stats = [
  { value: "127+", label: "Active Listings" },
  { value: "420+", label: "Ethical Investors" },
  { value: "23", label: "Deals Facilitated" },
  { value: "\u00A348.5M", label: "Total Capital Raised" },
];

const pillars = [
  {
    title: "Transparency",
    description:
      "Transparent, open-ledger vetting lets every stakeholder verify the integrity of the business structure.",
    icon: "view" as const,
  },
  {
    title: "Performance",
    description: "We optimize for Alpha. Ethics drive our outperformance.",
    icon: "chartUp" as const,
  },
  {
    title: "Stewardship",
    description:
      "Actively managing our ecosystem to ensure long-term stability and fair resource distribution.",
    icon: "shield" as const,
  },
  {
    title: "Equity",
    description:
      "Opening access to high-quality investments that were once limited by traditional barriers.",
    icon: "balanceScale" as const,
  },
];

const processSteps = [
  {
    number: "01",
    title: "Submit Pitch",
    description: "Founders upload decks and set funding goals.",
  },
  {
    number: "02",
    title: "AI Screening",
    description: "Our system scans every detail for legitimacy.",
  },
  {
    number: "03",
    title: "Secure Chat",
    description: "Investors and founders discuss the project anonymously.",
  },
  {
    number: "04",
    title: "Deal Closing",
    description: "Our team steps in to facilitate the final introduction.",
  },
];

export function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav("About")} primaryCta={sitePrimaryCta} />
      </section>

      <section className="overflow-hidden bg-[#0A2743]">
        <div className="relative px-4 py-16 sm:px-6 sm:py-20 lg:px-[147px] lg:py-24">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_0%,transparent_35%),linear-gradient(160deg,transparent_40%,rgba(255,255,255,0.03)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_54%,rgba(255,255,255,0.05)_54.2%,transparent_54.4%),linear-gradient(155deg,transparent_0%,transparent_63%,rgba(255,255,255,0.04)_63.2%,transparent_63.4%)] opacity-80" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                The North Star
              </p>
              <h1 className="mt-6 text-[48px] font-extrabold leading-[1.06] tracking-[-0.04em] text-white sm:text-[60px] lg:text-[68px]">
                Democratizing
                <span className="mt-3 block text-[#F97316]">Ethical Alpha</span>
              </h1>
              <div className="mt-8 h-px w-[292px] bg-white/55" />
              <p className="mt-6 w-full text-[19px] font-light leading-8 text-white/72 lg:pr-24">
                We are building the future of decentralized capital where high-performance returns meet
                uncompromising ethical standards.
              </p>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>

        <div className="bg-[#38506E] px-4 py-6 sm:px-6 lg:px-[147px]">
          <div className="grid gap-6 text-white sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="py-3 text-center lg:text-left">
                <p className="text-[40px] font-extrabold leading-none tracking-[-0.03em]">{stat.value}</p>
                <p className="mt-3 text-sm font-medium text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-[147px] lg:py-24">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F97316]">
            Architectural Integrity
          </p>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-[-0.03em] text-[#243041] sm:text-[44px]">
            The Core Pillars
          </h2>
          <p className="mt-5 text-base leading-7 text-[#6B7280]">
            The foundational values that guide every decision from the drafting board to the final
            deployment.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[28px] border border-[#EEF2F7] bg-white px-6 py-8 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.28)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F7FB] text-[#243041]">
                <AppIcon name={pillar.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-8 text-[24px] font-semibold tracking-[-0.02em] text-[#243041]">
                {pillar.title}
              </h3>
              <p className="mt-4 text-[15px] leading-7 text-[#7A8190]">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 lg:px-[147px] lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="relative">
            <div className="relative h-[540px] overflow-hidden rounded-[24px]">
              <Image src="/aboutImg.png" alt="Architectural glass space" fill className="object-cover" />
            </div>
            <div className="absolute -bottom-4 right-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#F97316] text-white shadow-lg">
              <AppIcon name="userGroup" className="h-5 w-5" />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F97316]">
              Our Narrative
            </p>
            <h2 className="mt-5 text-[34px] font-extrabold leading-[1.15] tracking-[-0.03em] text-[#243041] sm:text-[48px]">
              Bridging the Gap Between Profit and Purpose.
            </h2>

            <div className="mt-8 space-y-6 text-[17px] leading-8 text-[#5F6B7A]">
              <p>
                EARLY-N was built to bring structure and trust to early-stage investing. Founders upload
                their pitch decks, define their terms, and present their ventures in a clear, standardized
                format.
              </p>
              <p>
                Investors explore opportunities and engage through AI-moderated conversations without
                sharing personal or contact information. Our platform currently supports ventures and
                investors across BRICS countries, enabling cross-border collaboration within a structured
                and secure environment.
              </p>
              <p>
                All interactions are filtered and verified to ensure legitimacy, while our team steps in
                when discussions move toward formal investment, coordinating the process with full
                transparency. We do not just connect founders and investors, we create a controlled
                environment where secure, meaningful investment decisions can happen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-[147px] lg:py-24">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F97316]">
            Precision Methodology
          </p>
          <h2 className="mt-5 text-[32px] font-extrabold tracking-[-0.03em] text-[#243041] sm:text-[44px]">
            The Architectural Vetting Process
          </h2>
        </div>

        <div className="mt-16 hidden h-px w-full bg-[#E7ECF3] lg:block" />

        <div className="mt-[-18px] hidden lg:grid lg:grid-cols-3 lg:gap-10">
          {processSteps.slice(0, 3).map((step) => (
            <div key={step.number} className="text-center">
              <div className="flex justify-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#E7ECF3] bg-white text-[28px] font-bold text-[#F97316]">
                  {step.number}
                </div>
              </div>
              <h3 className="mt-8 text-[24px] font-semibold tracking-[-0.02em] text-[#243041]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#7A8190]">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 hidden lg:flex lg:justify-center">
          <div className="w-[28%] text-center">
            <div className="flex justify-center">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#E7ECF3] bg-white text-[28px] font-bold text-[#F97316]">
                {processSteps[3].number}
              </div>
            </div>
            <h3 className="mt-8 text-[24px] font-semibold tracking-[-0.02em] text-[#243041]">
              {processSteps[3].title}
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-[#7A8190]">{processSteps[3].description}</p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:hidden">
          {processSteps.map((step) => (
            <div key={step.number} className="rounded-[24px] border border-[#E7ECF3] px-6 py-8 text-center">
              <div className="flex justify-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-[#E7ECF3] bg-white text-[28px] font-bold text-[#F97316]">
                  {step.number}
                </div>
              </div>
              <h3 className="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-[#243041]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#7A8190]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 pb-16 pt-4 sm:px-6 lg:px-[147px] lg:pb-20">
        <div className="relative overflow-hidden rounded-[24px] bg-[#0A2743] px-8 py-12 text-white sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute inset-0 opacity-10">
            <Image src="/aboutImg.png" alt="" fill className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,39,67,0.95)_0%,rgba(10,39,67,0.88)_45%,rgba(10,39,67,0.92)_100%)]" />

          <div className="relative z-10">
            <h2 className="text-[36px] font-extrabold tracking-[-0.03em] text-white sm:text-[48px]">
              Ready to Lead the Change?
            </h2>
            <p className="mt-5 text-[18px] leading-8 text-white/75">
              Join a global network of ethical architects building a sustainable financial future.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/search"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#314B6B] px-6 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
              >
                I am an Investor
              </Link>
              <Link
                href="/#founders"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#F97316] px-6 text-sm font-semibold text-white transition hover:bg-[#e36810]"
              >
                I am a Founder
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
