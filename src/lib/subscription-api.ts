import { apiRequest, type ApiSuccessResponse } from "./api";
import type { SubscriptionPlan } from "./pricing-api";

export type BillingCycle = "monthly" | "annual";

export type SubscriptionRecord = {
  _id: string;
  amountSnapshot?: {
    currency?: string;
    subtotal?: number;
    taxAmount?: number;
    taxPercentage?: number;
    total?: number;
  };
  billingCycle?: BillingCycle | string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
  featureSnapshot?: string[];
  latestInvoiceSummary?: {
    amountPaid?: number;
    currency?: string;
    invoiceNumber?: string;
    paidAt?: string | null;
    status?: string;
    stripeInvoiceId?: string;
  };
  localStatus?: string;
  nextBillingDate?: string | null;
  planTitle?: string;
  planType?: string;
  stripePriceId?: string;
  stripeStatus?: string;
};

export type SubscriptionInvoice = {
  _id: string;
  amountPaid?: number;
  currency?: string;
  hostedInvoiceUrl?: string;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  paidAt?: string | null;
  status?: string;
  stripeInvoiceId?: string;
  total?: number;
  createdAt?: string;
};

export type CheckoutSession = {
  clientSecret?: string;
  expiresAt?: string | null;
  sessionId: string;
  url?: string | null;
};

export function createSubscriptionCheckoutSession(payload: {
  billingCycle: BillingCycle;
  cancelUrl?: string;
  changePlan?: boolean;
  planType: string;
  successUrl?: string;
}) {
  const url = payload.changePlan
    ? "payment/subscription/change-plan/checkout-session"
    : "payment/subscription/checkout-session";

  return apiRequest<ApiSuccessResponse<CheckoutSession>>({
    data: payload,
    method: "POST",
    url,
  });
}

export function getCurrentSubscription() {
  return apiRequest<ApiSuccessResponse<SubscriptionRecord | null>>({
    method: "GET",
    url: "payment/subscription/current",
  });
}

export function cancelCurrentSubscription() {
  return apiRequest<ApiSuccessResponse<SubscriptionRecord>>({
    method: "PATCH",
    url: "payment/subscription/cancel",
  });
}

export function getSubscriptionPayments() {
  return apiRequest<ApiSuccessResponse<SubscriptionInvoice[]>>({
    method: "GET",
    url: "payment/subscription/payments",
  });
}

export function getRolePlanTypes(role: "investor" | "investee") {
  return role === "investor"
    ? ["investor_basic", "investor_pro", "investor-basic", "investor-pro"]
    : ["investee", "investee-basic", "investee-pro"];
}

export function normalizeRequestedPlanType(plan: SubscriptionPlan) {
  if (plan.planType === "investor-basic") {
    return "investor_basic";
  }

  if (plan.planType === "investor-pro") {
    return "investor_pro";
  }

  if (plan.planType === "investee-basic" || plan.planType === "investee-pro") {
    return "investee";
  }

  return plan.planType;
}
