"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { checkoutSummary, dashboardPlans } from "./data";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function UpgradePlanPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const pathname = usePathname();
  const dashboardBase = pathname.startsWith("/investee-dashboard") ? "/investee-dashboard" : "/dashboard";

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Upgrade Plan" subtitle="See your plan details" />

      <div className=" bg-white px-6 py-10  lg:px-10">
        <div className="text-center">
          <h2 className="text-[2.3rem] font-semibold tracking-[-0.05em] text-[#1E2746]">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-[#6B7280]">
            For serious investors and founders ready to make an impact.
          </p>

          <div className="mt-6 inline-flex rounded-full border border-[#E5EAF2] bg-[#F7F9FC] p-1">
            {(["monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  billing === option ? "bg-[#1E2746] text-white" : "text-[#475467]",
                )}
              >
                {option === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
            <span className="rounded-full bg-[#FFF0E5] px-3 py-2 text-sm font-medium text-[#ED6A06]">
              Save 20%
            </span>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-5 lg:grid-cols-2">
          {dashboardPlans.map((plan) => (
            <article
              key={plan.name}
              className={cx(
                "relative rounded-[28px] border bg-white p-6 text-left shadow-[0_24px_60px_-52px_rgba(30,39,70,0.32)]",
                plan.featured ? "border-[#314B6B] shadow-[0_28px_80px_-48px_rgba(49,75,107,0.45)]" : "border-[#E6EBF3]",
              )}
            >
              {plan.featured ? (
                <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-[#ED6A06] px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              ) : null}

              <h3 className="text-xl font-semibold text-[#1E2746]">{plan.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-[2.2rem] font-semibold tracking-[-0.04em] text-[#243B5A]">
                  {billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                </span>
                <span className="pb-1 text-sm text-[#6B7280]">/{billing === "monthly" ? "mo" : "yr"}</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-[#475467]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F7EC] text-[#16A34A]">
                      <DashboardIcon name="spark" className="h-3 w-3" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.current ? (
                <button
                  type="button"
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#314B6B] px-4 text-sm font-semibold text-[#314B6B]"
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href={`${dashboardBase}/upgrade-plan/checkout`}
                  className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
                >
                  {plan.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>

     
    </section>
  );
}

export function UpgradeCheckoutPage() {
  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Configure your plan" subtitle="Complete payment method and billing details" />

      <div className="rounded-[32px] border border-[#E6EBF3] bg-white p-6 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <section className="rounded-[26px] border border-[#E9EEF5] p-5">
              <h2 className="text-lg font-semibold text-[#1E2746]">Payment method</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Card number
                  </span>
                  <input
                    defaultValue="0000 0000 0000"
                    className="h-12 w-full rounded-2xl border border-[#E5EAF2] px-4 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                      Expiration date
                    </span>
                    <input
                      defaultValue="MM / YY"
                      className="h-12 w-full rounded-2xl border border-[#E5EAF2] px-4 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                      Security code
                    </span>
                    <input
                      defaultValue="CVC"
                      className="h-12 w-full rounded-2xl border border-[#E5EAF2] px-4 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                    />
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-[#E9EEF5] p-5">
              <h2 className="text-lg font-semibold text-[#1E2746]">Billing address</h2>
              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Full name
                  </span>
                  <input
                    defaultValue="John Doe"
                    className="h-12 w-full rounded-2xl border border-[#E5EAF2] px-4 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Country or region
                  </span>
                  <input
                    defaultValue="Bangladesh"
                    className="h-12 w-full rounded-2xl border border-[#E5EAF2] px-4 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                    Address line 1
                  </span>
                  <input
                    defaultValue="Street name and number"
                    className="h-12 w-full rounded-2xl border border-[#E5EAF2] px-4 text-sm text-[#1E2746] outline-none focus:border-[#314B6B]"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="rounded-[28px] border border-[#E6EBF3] bg-[#FBFCFE] p-6">
            <h3 className="text-[1.7rem] font-semibold tracking-[-0.04em] text-[#1E2746]">
              {checkoutSummary.planName}
            </h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">Features</p>
            <ul className="mt-4 space-y-3 text-sm text-[#475467]">
              {checkoutSummary.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-0.5 text-[#16A34A]">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3 border-t border-[#E2E8F0] pt-5 text-sm text-[#475467]">
              <div className="flex items-center justify-between">
                <span>Monthly subscription</span>
                <span>{checkoutSummary.subscription}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>VAT (15%)</span>
                <span>{checkoutSummary.vat}</span>
              </div>
              <div className="flex items-center justify-between pt-2 text-2xl font-semibold text-[#1E2746]">
                <span>Due today</span>
                <span>{checkoutSummary.dueToday}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
            >
              Pay
            </button>

            <p className="mt-4 text-xs leading-6 text-[#7B8496]">
              Renews monthly until cancelled. Cancel anytime in settings. By subscribing, you agree to the Terms of Use and authorize Early-N to store and charge your payment method.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
