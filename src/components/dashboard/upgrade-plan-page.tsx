"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getPricingPlans, type SubscriptionPlan } from "@/lib/pricing-api";
import {
  cancelCurrentSubscription,
  createSubscriptionCheckoutSession,
  getCurrentSubscription,
  getRolePlanTypes,
  getSubscriptionPayments,
  normalizeRequestedPlanType,
  type BillingCycle,
  type SubscriptionInvoice,
  type SubscriptionRecord,
} from "@/lib/subscription-api";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

type StripeEmbeddedCheckout = {
  destroy: () => void;
  mount: (selector: string) => void;
};

type StripeBrowserClient = {
  initEmbeddedCheckout: (options: {
    fetchClientSecret: () => Promise<string>;
    onComplete?: () => void | Promise<void>;
  }) => Promise<StripeEmbeddedCheckout>;
};

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeBrowserClient;
  }
}

const STRIPE_SCRIPT_ID = "stripe-js";
const STRIPE_SCRIPT_SRC = "https://js.stripe.com/v3/stripe.js";

function loadStripeScript() {
  return new Promise<typeof window.Stripe>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Stripe Checkout can only run in the browser."));
      return;
    }

    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    const existingScript = document.getElementById(STRIPE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.Stripe), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Stripe.js.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = STRIPE_SCRIPT_ID;
    script.src = STRIPE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.Stripe);
    script.onerror = () => reject(new Error("Unable to load Stripe.js."));
    document.head.appendChild(script);
  });
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getDashboardContext(pathname: string) {
  const investee = pathname.startsWith("/investee-dashboard");

  return {
    base: investee ? "/investee-dashboard" : "/dashboard",
    role: investee ? "investee" : "investor",
  } as const;
}

function formatMoney(amount?: number, currency = "usd") {
  if (typeof amount !== "number") {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    style: "currency",
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPlanPrice(plan: SubscriptionPlan, billing: BillingCycle) {
  const amount = billing === "annual" ? plan.annualPrice : plan.monthlyPrice ?? plan.pricePerMonth;
  return formatMoney(amount, plan.currency ?? "usd");
}

function StatusPill({ status }: { status?: string }) {
  const active = status === "active" || status === "trialing";

  return (
    <span
      className={cx(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold capitalize",
        active ? "bg-[#EAFBF0] text-[#15803D]" : "bg-[#FFF4E8] text-[#C85A04]",
      )}
    >
      {status?.replaceAll("_", " ") || "No subscription"}
    </span>
  );
}

function LoadingPanel({ label = "Loading subscription..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-[#E8EDF5] bg-white px-6 py-10 text-center text-sm font-medium text-[#6B7280]">
      {label}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-[#F7C7C7] bg-[#FFF7F7] px-5 py-4 text-sm font-medium text-[#B42318]">
      {message}
    </div>
  );
}

export function UpgradePlanPage() {
  const pathname = usePathname();
  const { base } = getDashboardContext(pathname);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [payments, setPayments] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSubscription() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [subscriptionResponse, paymentsResponse] = await Promise.all([
          getCurrentSubscription(),
          getSubscriptionPayments(),
        ]);

        if (!active) {
          return;
        }

        setSubscription(subscriptionResponse.data ?? null);
        setPayments(paymentsResponse.data ?? []);
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load subscription details."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadSubscription();

    return () => {
      active = false;
    };
  }, []);

  const handleCancel = async () => {
    setCanceling(true);
    setErrorMessage("");

    try {
      const response = await cancelCurrentSubscription();
      setSubscription(response.data);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to cancel subscription."));
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <DashboardPageHeader title="Upgrade Plan" subtitle="See your plan details" />
        <LoadingPanel />
      </section>
    );
  }

  const currency = subscription?.amountSnapshot?.currency ?? "usd";

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Upgrade Plan" subtitle="See your plan details" />

      {errorMessage ? <ErrorPanel message={errorMessage} /> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <article className="rounded-lg border border-[#E8EDF5] bg-white px-6 py-6 shadow-[0_18px_36px_-32px_rgba(30,39,70,0.28)] sm:px-7">
          {subscription ? (
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-[26px] font-semibold text-[#1E2746]">{subscription.planTitle}</h2>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-[42px] font-semibold leading-none text-[#1E2746]">
                    {formatMoney(subscription.amountSnapshot?.subtotal, currency)}
                  </span>
                  <span className="pb-1 text-sm text-[#7B8496]">
                    /{subscription.billingCycle === "annual" ? "year" : "month"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#7B8496]">
                  Next billing date:{" "}
                  <span className="font-medium text-[#314B6B]">{formatDate(subscription.nextBillingDate)}</span>
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={`${base}/upgrade-plan/change-plan`}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#314B6B] px-4 text-sm font-medium text-white transition hover:bg-[#243B5A]"
                  >
                    Change Plan
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={canceling || subscription.cancelAtPeriodEnd}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[#FFF1F2] px-4 text-sm font-medium text-[#EF4444] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {subscription.cancelAtPeriodEnd ? "Cancels at period end" : canceling ? "Canceling..." : "Cancel Subscription"}
                  </button>
                </div>
              </div>

              <StatusPill status={subscription.localStatus} />
            </div>
          ) : (
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[26px] font-semibold text-[#1E2746]">No active subscription</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#7B8496]">
                  Choose a plan and complete payment on Stripe Checkout to activate your subscription.
                </p>
              </div>
              <Link
                href={`${base}/upgrade-plan/change-plan`}
                className="inline-flex h-11 items-center justify-center rounded-md bg-[#314B6B] px-5 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
              >
                Choose Plan
              </Link>
            </div>
          )}
        </article>

        <aside className="rounded-lg bg-[#314B6B] px-5 py-5 text-white shadow-[0_22px_48px_-30px_rgba(49,75,107,0.65)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">Upcoming Invoice</p>
          <p className="mt-4 text-[38px] font-semibold leading-none">
            {formatMoney(subscription?.amountSnapshot?.total, currency)}
          </p>
          <p className="mt-2 text-xs text-white/72">Due on {formatDate(subscription?.nextBillingDate)}</p>

          <div className="mt-8 space-y-3 text-sm text-white/78">
            <div className="flex items-center justify-between gap-4">
              <span>{subscription?.planTitle ?? "Subscription"}</span>
              <span>{formatMoney(subscription?.amountSnapshot?.subtotal, currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span>Tax ({subscription?.amountSnapshot?.taxPercentage ?? 0}%)</span>
              <span>{formatMoney(subscription?.amountSnapshot?.taxAmount, currency)}</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="rounded-lg border border-[#E8EDF5] bg-white shadow-[0_18px_36px_-32px_rgba(30,39,70,0.28)]">
        <div className="flex items-center gap-2 border-b border-[#EEF2F7] px-5 py-4 text-[#1E2746]">
          <DashboardIcon name="upgrade" className="h-5 w-5" />
          <h2 className="text-[18px] font-semibold">Billing History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#F8FAFC]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Invoice ID</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-sm text-[#7B8496]" colSpan={5}>
                    No billing history yet.
                  </td>
                </tr>
              ) : (
                payments.map((invoice) => (
                  <tr key={invoice._id} className="border-t border-[#EEF2F7] text-sm text-[#586274]">
                    <td className="px-5 py-4">{formatDate(invoice.paidAt ?? invoice.createdAt)}</td>
                    <td className="px-5 py-4">{invoice.invoiceNumber || invoice.stripeInvoiceId}</td>
                    <td className="px-5 py-4">{formatMoney(invoice.amountPaid ?? invoice.total, invoice.currency)}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={invoice.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {invoice.invoicePdfUrl || invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.invoicePdfUrl || invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F3F6FA]"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-[#98A2B3]">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function UpgradePlanSelectionPage() {
  const pathname = usePathname();
  const { base, role } = getDashboardContext(pathname);
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      setLoading(true);
      setErrorMessage("");

      try {
        const [allPlans, subscriptionResponse] = await Promise.all([
          getPricingPlans(),
          getCurrentSubscription().catch(() => ({ data: null })),
        ]);

        if (!active) {
          return;
        }

        const allowedPlanTypes = new Set(getRolePlanTypes(role));
        setPlans(allPlans.filter((plan) => allowedPlanTypes.has(plan.planType)));
        setSubscription(subscriptionResponse.data ?? null);
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load subscription plans."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPlans();

    return () => {
      active = false;
    };
  }, [role]);

  const currentPriceId = subscription?.stripePriceId;

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Change Plan" subtitle="Compare plans and choose the best fit for your account" />

      {errorMessage ? <ErrorPanel message={errorMessage} /> : null}

      <div className="bg-white px-6 py-10 lg:px-10">
        <div className="text-center">
          <h2 className="text-[2.3rem] font-semibold text-[#1E2746]">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-[#6B7280]">Payment is completed securely through Stripe Checkout.</p>

          <div className="mt-6 inline-flex rounded-md border border-[#E5EAF2] bg-[#F7F9FC] p-1">
            {(["monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBilling(option)}
                className={cx(
                  "rounded px-4 py-2 text-sm font-medium capitalize transition",
                  billing === option ? "bg-[#1E2746] text-white" : "text-[#475467] hover:bg-white",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="mt-10"><LoadingPanel label="Loading plans..." /></div> : null}

        {!loading && plans.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl rounded-lg border border-[#E8EDF5] px-6 py-8 text-center text-sm text-[#6B7280]">
            No active plans are configured for this account role yet.
          </div>
        ) : null}

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 lg:grid-cols-2">
          {plans.map((plan) => {
            const stripePriceId = billing === "annual" ? plan.stripeAnnualPriceId : plan.stripeMonthlyPriceId;
            const current = Boolean(currentPriceId && currentPriceId === stripePriceId);
            const checkoutHref = `${base}/upgrade-plan/checkout?planType=${encodeURIComponent(
              normalizeRequestedPlanType(plan),
            )}&billingCycle=${billing}&changePlan=${Boolean(subscription)}`;

            return (
              <article
                key={plan.planType}
                className={cx(
                  "relative rounded-lg border bg-white p-6 text-left shadow-[0_24px_60px_-52px_rgba(30,39,70,0.32)]",
                  plan.tier === "pro" ? "border-[#314B6B]" : "border-[#E6EBF3]",
                )}
              >
                {plan.tier === "pro" ? (
                  <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-[#ED6A06] px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </span>
                ) : null}

                <h3 className="text-xl font-semibold text-[#1E2746]">{plan.title}</h3>
                <p className="mt-2 min-h-10 text-sm leading-6 text-[#6B7280]">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-[2.2rem] font-semibold text-[#243B5A]">
                    {getPlanPrice(plan, billing)}
                  </span>
                  <span className="pb-1 text-sm text-[#6B7280]">/{billing === "monthly" ? "mo" : "yr"}</span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-[#475467]">
                  {(plan.features ?? []).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F7EC] text-[#16A34A]">
                        <DashboardIcon name="spark" className="h-3 w-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {current ? (
                  <button
                    type="button"
                    className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md border border-[#314B6B] px-4 text-sm font-semibold text-[#314B6B]"
                  >
                    Current Plan
                  </button>
                ) : (
                  <Link
                    href={checkoutHref}
                    className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-md bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
                  >
                    Continue to Checkout
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function UpgradeCheckoutPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { base, role } = getDashboardContext(pathname);
  const planType = searchParams.get("planType") ?? (role === "investee" ? "investee" : "investor_pro");
  const billingCycle: BillingCycle = searchParams.get("billingCycle") === "annual" ? "annual" : "monthly";
  const changePlan = searchParams.get("changePlan") === "true";
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [mountingCheckout, setMountingCheckout] = useState(true);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPlan() {
      setLoading(true);
      setErrorMessage("");

      try {
        const plans = await getPricingPlans();
        const matchingPlan = plans.find((item) => normalizeRequestedPlanType(item) === planType || item.planType === planType);

        if (active) {
          setPlan(matchingPlan ?? null);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load plan details."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadPlan();

    return () => {
      active = false;
    };
  }, [planType]);

  useEffect(() => {
    if (!plan) {
      return;
    }

    let active = true;

    async function mountCheckout() {
      setMountingCheckout(true);
      setErrorMessage("");

      try {
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
          throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing.");
        }

        const stripeFactory = await loadStripeScript();

        if (!stripeFactory) {
          throw new Error("Stripe.js did not initialize.");
        }

        const sessionResponse = await createSubscriptionCheckoutSession({
          billingCycle,
          changePlan,
          planType,
        });
        const clientSecret = sessionResponse.data.clientSecret;

        if (!clientSecret) {
          throw new Error("Stripe did not return an embedded checkout client secret.");
        }

        const stripe = stripeFactory(publishableKey);
        const checkout = await stripe.initEmbeddedCheckout({
          fetchClientSecret: async () => clientSecret,
          onComplete: async () => {
            if (!active) {
              return;
            }

            checkoutRef.current?.destroy();
            checkoutRef.current = null;
            setPaymentComplete(true);

            for (let attempt = 0; attempt < 10; attempt += 1) {
              try {
                const response = await getCurrentSubscription();

                if (response.data?.localStatus === "active") {
                  router.replace(`${base}/upgrade-plan`);
                  return;
                }
              } catch {
                // The webhook may not have finished syncing yet.
              }

              await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            router.replace(`${base}/upgrade-plan`);
          },
        });

        if (!active) {
          checkout.destroy();
          return;
        }

        checkoutRef.current = checkout;
        checkout.mount("#stripe-embedded-checkout");
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load Stripe Checkout."));
        }
      } finally {
        if (active) {
          setMountingCheckout(false);
        }
      }
    }

    void mountCheckout();

    return () => {
      active = false;
      checkoutRef.current?.destroy();
      checkoutRef.current = null;
    };
  }, [base, billingCycle, changePlan, plan, planType, router]);

  const dueToday = useMemo(() => {
    if (!plan) {
      return "-";
    }

    const amount = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice ?? plan.pricePerMonth;
    return formatMoney(amount, plan.currency ?? "usd");
  }, [billingCycle, plan]);

  if (loading) {
    return (
      <section className="space-y-6">
        <DashboardPageHeader title="Checkout" subtitle="Complete payment securely on this page" />
        <LoadingPanel label="Loading checkout..." />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Checkout" subtitle="Complete payment securely on this page" />

      {errorMessage ? <ErrorPanel message={errorMessage} /> : null}

      <div className="grid gap-6 rounded-lg border border-[#E6EBF3] bg-white p-6 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
        <section className="space-y-5">
          <div className="rounded-lg border border-[#E9EEF5] p-5">
            <h2 className="text-lg font-semibold text-[#1E2746]">Secure payment</h2>
            <p className="mt-3 text-sm leading-6 text-[#6B7280]">
              Card details and billing address are collected inside Stripe's secure embedded checkout. Normas never stores card numbers.
            </p>
          </div>

          <div className="min-h-[560px] rounded-lg border border-[#E9EEF5] p-4">
            {mountingCheckout && !paymentComplete ? (
              <div className="flex min-h-[520px] items-center justify-center text-sm font-medium text-[#6B7280]">
                Loading Stripe Checkout...
              </div>
            ) : null}
            {paymentComplete ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
                <h2 className="text-xl font-semibold text-[#1E2746]">Payment received</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#6B7280]">
                  Stripe is confirming the subscription. We are syncing your plan with the webhook now.
                </p>
              </div>
            ) : (
              <div id="stripe-embedded-checkout" className={mountingCheckout ? "hidden" : ""} />
            )}
          </div>
        </section>

        <aside className="rounded-lg border border-[#E6EBF3] bg-[#FBFCFE] p-6">
          <div className="rounded-lg border border-[#E9EEF5] p-5">
            <h2 className="text-lg font-semibold text-[#1E2746]">Selected billing</h2>
            <div className="mt-4 grid gap-3 text-sm text-[#475467] sm:grid-cols-2">
              <div className="rounded-md bg-[#F8FAFC] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">Plan</p>
                <p className="mt-1 font-semibold text-[#1E2746]">{plan?.title ?? planType}</p>
              </div>
              <div className="rounded-md bg-[#F8FAFC] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">Cycle</p>
                <p className="mt-1 font-semibold capitalize text-[#1E2746]">{billingCycle}</p>
              </div>
            </div>
          </div>

          <h3 className="mt-6 text-[1.7rem] font-semibold text-[#1E2746]">{plan?.title ?? "Subscription"}</h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">Features</p>
          <ul className="mt-4 space-y-3 text-sm text-[#475467]">
            {(plan?.features ?? []).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E8F7EC] text-[#16A34A]">
                  <DashboardIcon name="spark" className="h-3 w-3" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-[#E2E8F0] pt-5 text-sm text-[#475467]">
            <div className="flex items-center justify-between">
              <span>{billingCycle === "annual" ? "Annual subscription" : "Monthly subscription"}</span>
              <span>{dueToday}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-2xl font-semibold text-[#1E2746]">
              <span>Due today</span>
              <span>{dueToday}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push(`${base}/upgrade-plan/change-plan`)}
            className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-[#D8E0EA] px-4 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F5F7FB]"
          >
            Back to Plans
          </button>
        </aside>
      </div>
    </section>
  );
}
