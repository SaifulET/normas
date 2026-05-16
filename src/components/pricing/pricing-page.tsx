import { AppIcon } from "@/components/home/icons";
import { homePageContent } from "@/components/home/data";
import { FaqSection, FooterSection, PricingSection } from "@/components/home/sections";
import type { PricingPlan } from "@/components/home/types";
import { SiteHeader } from "@/components/site/site-chrome";
import { createSiteNav, sitePrimaryCta } from "@/components/site/site-data";
import { getPricingPlans, type SubscriptionPlan } from "@/lib/pricing-api";

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

function formatPlanPrice(amount?: number, currency = "gbp") {
  if (typeof amount !== "number") {
    return "";
  }

  return new Intl.NumberFormat("en-GB", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    style: "currency",
  }).format(amount);
}

function getPlanAction(plan: SubscriptionPlan) {
  if (plan.audienceRole === "investee") {
    return plan.tier === "pro" ? "Start Investee Pro" : "Apply to List";
  }

  return plan.tier === "pro" ? "Go Pro" : "Start as Investor";
}

function mapSubscriptionPlan(plan: SubscriptionPlan): PricingPlan {
  const currency = plan.currency ?? "gbp";
  const monthlyPrice = plan.monthlyPrice ?? plan.pricePerMonth;

  return {
    annualPrice: formatPlanPrice(plan.annualPrice, currency),
    audienceRole: plan.audienceRole,
    description: plan.description,
    discountAnnually: plan.discountAnnually,
    featured: plan.planType === "investor-pro",
    featuredLabel: "Most Popular",
    features: plan.features ?? [],
    href: `/signup?role=${plan.audienceRole ?? "investor"}&plan=${plan.planType}`,
    id: plan.planType,
    price: formatPlanPrice(monthlyPrice, currency),
    suffix: "/mo",
    title: plan.title,
    action: getPlanAction(plan),
  };
}

async function getSubscriptionCards() {
  try {
    const plans = await getPricingPlans();
    return {
      error: null,
      pricingPlans: plans.map(mapSubscriptionPlan),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch pricing plans";

    return {
      error: message,
      pricingPlans: [],
    };
  }
}

export async function PricingPage() {
  const { error, pricingPlans } = await getSubscriptionCards();

  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav("Pricing")} primaryCta={sitePrimaryCta} />
      </section>

      <PricingSection
        emptyMessage={error ? "We could not load subscription plans right now." : undefined}
        pricingPlans={pricingPlans}
      />
      <ComparisonSection />
      <FaqSection faqs={homePageContent.faqs} />
      <FooterSection
        linkGroups={homePageContent.footerLinkGroups}
        socialLinks={homePageContent.socialLinks}
      />
    </main>
  );
}
