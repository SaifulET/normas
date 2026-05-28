import { API_BASE_URL } from "./api-config";
import type { PricingPlan } from "@/components/home/types";

export type SubscriptionPlan = {
  annualPrice?: number;
  audienceRole?: "investor" | "investee" | string;
  currency?: string;
  description?: string;
  discountAnnually?: number;
  discountMonthly?: number;
  features?: string[];
  isActive?: boolean;
  monthlyPrice?: number;
  planType: string;
  pricePerMonth?: number;
  stripeAnnualPriceId?: string;
  stripeMonthlyPriceId?: string;
  stripeProductId?: string;
  subscriptionTopics?: string[];
  tier?: "basic" | "pro" | string;
  title: string;
};

type PricingPlansResponse = {
  data?:
    | SubscriptionPlan[]
    | {
        plans?: SubscriptionPlan[];
      };
  message?: string;
  success?: boolean;
};

function getApiUrl(path: string) {
  const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  return new URL(path, baseUrl).toString();
}

export async function getPricingPlans() {
  const response = await fetch(getApiUrl("pricing/plans"), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Pricing plans request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as PricingPlansResponse;
  const plans = Array.isArray(payload.data) ? payload.data : payload.data?.plans;

  if (payload.success === false || !Array.isArray(plans)) {
    throw new Error(payload.message ?? "Pricing plans response was invalid");
  }

  return plans.filter((plan) => plan.isActive !== false);
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

export function mapSubscriptionPlan(plan: SubscriptionPlan): PricingPlan {
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

export async function getPublicPricingPlans() {
  const plans = await getPricingPlans();
  return plans.map(mapSubscriptionPlan);
}
