"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/lib/subscription-api";
import { isActiveSubscription } from "@/lib/subscription-status";
import { DashboardIcon } from "./icons";

type AccessStatus = "checking" | "subscribed" | "unsubscribed";

const featureCopy = {
  listings: {
    title: "Subscribe to publish and manage pitch lists",
    description: "The Investee plan includes one active pitch deck, version history, AI guardrails, and pitch analytics.",
  },
  messages: {
    title: "Subscribe to unlock investor messages",
    description: "The Investee plan includes an investor message inbox so you can respond to qualified investor interest.",
  },
  schedule: {
    title: "Subscribe to manage investor meetings",
    description: "Scheduling opens after subscription so conversations and meeting requests stay tied to an active pitch plan.",
  },
  pitch: {
    title: "Subscribe to access pitch workspace",
    description: "Your pitch workspace is available with an active Investee plan.",
  },
} satisfies Record<string, { description: string; title: string }>;

export type InvesteeSubscriptionFeature = keyof typeof featureCopy;

function UpgradePrompt({ feature }: { feature: InvesteeSubscriptionFeature }) {
  const copy = featureCopy[feature];

  return (
    <section className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-[24px] border border-[#E6EBF3] bg-white p-8 text-center shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF4E8] text-[#ED6A06]">
          <DashboardIcon name="upgrade" className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6B7280]">{copy.description}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/investee-dashboard/upgrade-plan/change-plan"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#314B6B] px-5 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
          >
            Choose Investee Plan
          </Link>
          <Link
            href="/investee-dashboard/upgrade-plan"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#DDE4EF] bg-white px-5 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F7F9FC]"
          >
            View Subscription
          </Link>
        </div>
      </div>
    </section>
  );
}

export function InvesteeSubscriptionGate({
  children,
  feature,
}: {
  children: ReactNode;
  feature: InvesteeSubscriptionFeature;
}) {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");

  useEffect(() => {
    let cancelled = false;

    async function loadAccessStatus() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      setAccessStatus("checking");

      try {
        const response = await getCurrentSubscription();

        if (!cancelled) {
          setAccessStatus(isActiveSubscription(response.data) ? "subscribed" : "unsubscribed");
        }
      } catch {
        if (!cancelled) {
          setAccessStatus("unsubscribed");
        }
      }
    }

    void loadAccessStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (accessStatus === "subscribed") {
    return children;
  }

  if (accessStatus === "checking") {
    return (
      <section className="rounded-[24px] border border-[#E6EBF3] bg-white px-6 py-12 text-center text-sm text-[#667085] shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        Checking subscription...
      </section>
    );
  }

  return <UpgradePrompt feature={feature} />;
}
