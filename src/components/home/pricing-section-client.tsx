"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "./icons";
import type { PricingPlan } from "./types";
import { useAuthStore } from "@/store";

type BillingCycle = "monthly" | "annual";

function getBillingHref(href: string, billing: BillingCycle) {
  if (!href || href.startsWith("#")) {
    return href;
  }

  try {
    const url = new URL(href, "http://early-n.local");
    url.searchParams.set("billing", billing);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return href;
  }
}

function getAuthenticatedCheckoutHref(plan: PricingPlan, billing: BillingCycle, userRole?: string) {
  const planRole = plan.audienceRole === "investee" ? "investee" : "investor";
  const role = userRole === "investee" ? "investee" : planRole;
  const dashboardBase = role === "investee" ? "/investee-dashboard" : "/dashboard";
  let planType = plan.id || "";

  if (planType === "investor-basic") {
    planType = "investor_basic";
  } else if (planType === "investor-pro") {
    planType = "investor_pro";
  } else if (planType === "investee-basic" || planType === "investee-pro") {
    planType = "investee";
  }

  return `${dashboardBase}/upgrade-plan/checkout?planType=${encodeURIComponent(planType)}&billingCycle=${billing}`;
}

export function PricingCardsClient({
  annualDiscount,
  emptyMessage,
  pricingPlans,
}: {
  annualDiscount: number;
  emptyMessage: string;
  pricingPlans: PricingPlan[];
}) {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.user?.role);

  const showAnnualPrices = billing === "annual";
  const toggleOptions = useMemo(
    () =>
      [
        { label: "Monthly", value: "monthly" },
        {
          label: annualDiscount > 0 ? `Annual Save ${annualDiscount}%` : "Annual",
          value: "annual",
        },
      ] as const,
    [annualDiscount],
  );

  return (
    <>
      <div className="mt-5 text-center">
        <div className="inline-flex rounded-md bg-white p-1 ring-1 ring-[#2B425D]/10">
          {toggleOptions.map((option) => {
            const isActive = billing === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setBilling(option.value)}
                className={`rounded px-8 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#182231] text-white"
                    : "text-[#182231]/70 hover:bg-[#F3F6FA] hover:text-[#182231]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {pricingPlans.length === 0 ? (
        <div className="mx-auto mt-9 max-w-xl rounded-lg border border-[#EDF1F6] bg-[#F8FAFC] px-6 py-8 text-center text-sm leading-6 text-[#182231]/65">
          {emptyMessage}
        </div>
      ) : null}

      <div className="mx-auto mt-9 grid max-w-6xl items-stretch justify-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => {
          const annualAvailable = Boolean(plan.annualPrice);
          const displayPrice = showAnnualPrices && annualAvailable ? plan.annualPrice : plan.price;
          const displaySuffix = showAnnualPrices && annualAvailable ? "/yr" : plan.suffix;
          const href = isAuthenticated
            ? getAuthenticatedCheckoutHref(plan, billing, userRole)
            : getBillingHref(plan.href, billing);

          return (
            <article
              key={plan.id ?? plan.title}
              className={`relative flex w-full min-w-0 flex-col rounded-lg bg-white p-7 ring-1 ${
                plan.featured
                  ? "ring-[#2B425D] shadow-2xl shadow-[#182231]/15"
                  : "ring-[#2B425D]/15 shadow-sm"
              }`}
            >
              {plan.featured ? (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[#E65E02] px-5 py-2 text-xs font-black text-white">
                  {plan.featuredLabel ?? "Most Popular"}
                </span>
              ) : null}
              {plan.audienceRole ? (
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#E65E02]">
                  {plan.audienceRole}
                </p>
              ) : null}
              <h3 className="text-base font-black text-[#182231]">{plan.title}</h3>
              {plan.description ? (
                <p className="mt-2 min-h-10 text-sm leading-5 text-[#182231]/55">{plan.description}</p>
              ) : null}
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-[#2B425D]">{displayPrice}</span>
                <span className="pb-1 text-sm text-[#182231]/55">{displaySuffix}</span>
              </div>
              {annualAvailable ? (
                <p className="mt-2 text-xs font-medium text-[#182231]/45">
                  {showAnnualPrices && (plan.discountAnnually ?? annualDiscount) > 0
                    ? `Save ${plan.discountAnnually ?? annualDiscount}% with annual billing`
                    : `${plan.annualPrice} billed annually`}
                </p>
              ) : null}
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#182231]/70">
                    <AppIcon name="checkmarkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-[#159953]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={href}
                className={`mt-7 flex h-12 items-center justify-center rounded-md px-5 text-center text-sm font-black transition ${
                  plan.featured
                    ? "bg-[#2B425D] text-white hover:bg-[#21344b]"
                    : "border-2 border-[#2B425D] text-[#2B425D] hover:bg-[#2B425D] hover:text-white"
                }`}
              >
                {plan.action}
              </a>
            </article>
          );
        })}
      </div>
    </>
  );
}
