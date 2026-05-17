import { AppIcon } from "@/components/home/icons";
import { homePageContent } from "@/components/home/data";
import { FaqSection, FooterSection, PricingSection } from "@/components/home/sections";
import type { FaqItem, PricingPlan } from "@/components/home/types";
import { SiteHeader } from "@/components/site/site-chrome";
import { createSiteNav, sitePrimaryCta } from "@/components/site/site-data";
import { getPublicFaqs } from "@/lib/faq-api";
import { getPricingPlans, type SubscriptionPlan } from "@/lib/pricing-api";

const comparisonRows = [
  {
    feature: "Browse Pitch Listings",
    investorBasic: "20",
    investorPro: "Unlimited",
    investee: "-",
  },
  {
    feature: "Active Pitch Deck",
    investorBasic: "-",
    investorPro: "-",
    investee: "3",
  },
  {
    feature: "AI Queries",
    investorBasic: "50",
    investorPro: "Unlimited",
    investee: "-",
  },
  {
    feature: "Watchlist Pitches",
    investorBasic: "5",
    investorPro: "Unlimited",
    investee: "-",
  },
  {
    feature: "AI Guardrail Protection",
    investorBasic: true,
    investorPro: true,
    investee: true,
  },
  {
    feature: "Draft Unlimited Pitch",
    investorBasic: "-",
    investorPro: "-",
    investee: "Unlimited",
  },
  {
    feature: "KYC Verification",
    investorBasic: "Detailed",
    investorPro: "Detailed",
    investee: "Detailed",
  },
  {
    feature: "Priority Support",
    investorBasic: false,
    investorPro: true,
    investee: true,
  },
];

function ComparisonCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F97316] text-white">
        <AppIcon name="checkmarkCircle" className="h-4 w-4" />
      </span>
    );
  }

  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center text-[#C6CDD8]">
        <AppIcon name="cancel01" className="h-4 w-4" />
      </span>
    );
  }

  return <span>{value}</span>;
}

function ComparisonSection() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-[52px] lg:py-16">
      <div className="text-center">
        <h2 className="text-center text-[36px] font-semibold leading-[48px] text-[#1F2937]">
          Comprehensive Feature Comparison
        </h2>
      </div>

      <div className="mt-12 overflow-x-auto rounded-[24px] border border-[#EDF1F6] bg-white shadow-[0_30px_80px_-70px_rgba(15,23,42,0.25)]">
        <div className="grid min-w-[880px] grid-cols-[1.55fr_0.8fr_0.8fr_0.8fr] border-b border-[#EDF1F6] bg-[#F8FAFC] px-8 py-6 text-left text-[11px] font-semibold uppercase tracking-[0.42em] text-[#2B425D]">
          <div>Features</div>
          <div>Investor Basic</div>
          <div>Investor Pro</div>
          <div>Investee</div>
        </div>

        {comparisonRows.map((row) => (
          <div
            key={row.feature}
            className="grid min-w-[880px] grid-cols-[1.55fr_0.8fr_0.8fr_0.8fr] items-center px-8 py-8 text-[17px] leading-7 text-[#06162D]"
          >
            <div className="font-semibold">{row.feature}</div>
            <div className="flex items-center">
              <ComparisonCell value={row.investorBasic} />
            </div>
            <div className="flex items-center">
              <ComparisonCell value={row.investorPro} />
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

async function getFaqItems(): Promise<FaqItem[]> {
  try {
    const faqs = await getPublicFaqs();
    return faqs.map((faq) => ({
      answer: faq.answer,
      question: faq.question,
    }));
  } catch {
    return homePageContent.faqs;
  }
}

export async function PricingPage() {
  const [{ error, pricingPlans }, faqs] = await Promise.all([
    getSubscriptionCards(),
    getFaqItems(),
  ]);

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
      <FaqSection faqs={faqs} />
      <FooterSection
        linkGroups={homePageContent.footerLinkGroups}
        socialLinks={homePageContent.socialLinks}
      />
    </main>
  );
}
