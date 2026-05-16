import { API_BASE_URL } from "./api";

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
