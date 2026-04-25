import { AppIcon } from "@/components/home/icons";
import { homePageContent } from "@/components/home/data";
import { FaqSection, FooterSection, PricingSection } from "@/components/home/sections";
import { SiteHeader } from "@/components/site/site-chrome";
import { createSiteNav, sitePrimaryCta } from "@/components/site/site-data";

const comparisonRows = [
  {
    feature: "Browse Pitch Listings",
    basic: "20",
    pro: "Unlimited",
    investee: "-",
  },
  {
    feature: "Active Pitch Deck",
    basic: "-",
    pro: "-",
    investee: "3",
  },
  {
    feature: "AI Queries",
    basic: "50",
    pro: "Unlimited",
    investee: "-",
  },
  {
    feature: "Watchlist Pitches",
    basic: "5",
    pro: "Unlimited",
    investee: "-",
  },
  {
    feature: "AI Guardrail Protection",
    basic: true,
    pro: true,
    investee: true,
  },
  {
    feature: "Draft Unlimited Pitch",
    basic: "-",
    pro: "-",
    investee: "Unlimited",
  },
  {
    feature: "KYC Verification",
    basic: "Detailed",
    pro: "Detailed",
    investee: "Detailed",
  },
  {
    feature: "Priority Support",
    basic: false,
    pro: true,
    investee: true,
  },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316] text-white">
        <AppIcon name="checkmarkCircle" className="h-4 w-4" />
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center text-[#C6CDD8]">
        <AppIcon name="cancel01" className="h-4 w-4" />
      </span>
    );
  }

  return <span>{value}</span>;
}

function ComparisonSection() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-[147px] lg:py-16">
      <div className="text-center">
        <h2 className="text-center text-[36px] font-semibold leading-[48px] text-[#1F2937]">
          Comprehensive Feature Comparison
        </h2>
      </div>

      <div className="mt-12 overflow-hidden rounded-[24px] border border-[#EDF1F6] bg-white shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
        <div className="grid grid-cols-[1.55fr_0.8fr_0.8fr_0.8fr] bg-[#F8FAFC] px-8 py-6 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4B5563]">
          <div>Features</div>
          <div>Investor Basic</div>
          <div>Investor Pro</div>
          <div>Investee</div>
        </div>

        {comparisonRows.map((row) => (
          <div
            key={row.feature}
            className="grid grid-cols-[1.55fr_0.8fr_0.8fr_0.8fr] items-center px-8 py-7 text-[17px] text-[#243041]"
          >
            <div className="font-medium">{row.feature}</div>
            <div className="flex items-center">
              <ComparisonCell value={row.basic} />
            </div>
            <div className="flex items-center">
              <ComparisonCell value={row.pro} />
            </div>
            <div className="flex items-center">
              <ComparisonCell value={row.investee} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav("Pricing")} primaryCta={sitePrimaryCta} />
      </section>

      <PricingSection pricingPlans={homePageContent.pricingPlans} />
      <ComparisonSection />
      <FaqSection faqs={homePageContent.faqs} />
      <FooterSection
        linkGroups={homePageContent.footerLinkGroups}
        socialLinks={homePageContent.socialLinks}
      />
    </main>
  );
}
