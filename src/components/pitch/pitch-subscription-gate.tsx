"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getCurrentSubscription } from "@/lib/subscription-api";
import { isActiveSubscription } from "@/lib/subscription-status";
import { useAuthStore } from "@/store";

type AccessStatus = "checking" | "subscribed" | "unsubscribed";

function LockedPitchDetails({ preview }: { preview: string }) {
  return (
    <div className="relative mt-10 overflow-hidden rounded-[16px] border border-[#D7DFEA] bg-white shadow-[0_18px_40px_-34px_rgba(31,41,55,0.65)]">
      <div className="max-h-[280px] overflow-hidden p-6">
        <h2 className="text-[24px] font-semibold text-[#1F2937]">Pitch Details</h2>
        <p className="mt-5 max-w-[760px] text-sm leading-7 text-[#667085]">{preview}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Business model", "Market opportunity", "Founder details", "Financial information"].map((item) => (
            <div key={item} className="rounded-xl border border-[#E7ECF3] bg-[#F8FAFC] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">{item}</p>
              <div className="mt-3 h-3 w-4/5 rounded-full bg-[#D7DFEA]" />
              <div className="mt-2 h-3 w-2/3 rounded-full bg-[#E7ECF3]" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 top-[45%] flex items-end bg-gradient-to-b from-white/20 via-white/90 to-white p-6 backdrop-blur-[2px]">
        <div className="w-full rounded-xl border border-[#E2E8F0] bg-white/95 p-5 shadow-[0_18px_40px_-28px_rgba(31,41,55,0.7)]">
          <p className="text-base font-semibold text-[#1F2937]">Subscribe to unlock full pitch details</p>
          <p className="mt-1 text-sm leading-6 text-[#667085]">
            Investor subscriptions unlock full listing details, financial context, and deal actions.
          </p>
          <Link
            href="/dashboard/upgrade-plan/change-plan"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#ED6A06] px-5 text-sm font-semibold text-white transition hover:bg-[#d35f05]"
          >
            Subscribe Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PitchSubscriptionGate({
  children,
  preview,
}: {
  children: ReactNode;
  preview: string;
}) {
  const user = useAuthStore((state) => state.user);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const isInvestor = user?.role === "investor";

  useEffect(() => {
    let cancelled = false;

    async function loadAccessStatus() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      if (!isInvestor) {
        setAccessStatus("subscribed");
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
  }, [isInvestor]);

  if (accessStatus === "subscribed") {
    return children;
  }

  return <LockedPitchDetails preview={preview} />;
}
