"use client";

import { useState } from "react";
import { dashboardSettingsDefaults } from "./data";
import { DashboardPageHeader } from "./page-header";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
        checked ? "bg-[#314B6B]" : "bg-[#CBD5E1]"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white transition ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState(dashboardSettingsDefaults);

  const items = [
    {
      key: "instantNotifications" as const,
      title: "Instant notifications",
      description: "Get notified as soon as founders reply or meetings are confirmed.",
    },
    {
      key: "weeklyDigest" as const,
      title: "Weekly digest",
      description: "Receive a clean summary of saved listings, new pitches, and activity.",
    },
    {
      key: "savedListingAlerts" as const,
      title: "Saved listing alerts",
      description: "Surface changes to valuations, funding targets, and pitch availability.",
    },
    {
      key: "privateMode" as const,
      title: "Private mode",
      description: "Hide your activity from collaborative team views unless you choose to share.",
    },
  ];

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Settings" subtitle="Adjust notifications, privacy, and workspace behavior" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-[30px] border border-[#E6EBF3] bg-white p-6 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
          <h2 className="text-xl font-semibold text-[#1E2746]">Workspace preferences</h2>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex flex-col gap-4 rounded-[24px] border border-[#E8EDF4] bg-[#FBFCFE] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="max-w-xl">
                  <h3 className="text-sm font-semibold text-[#1E2746]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#6B7280]">{item.description}</p>
                </div>
                <Toggle
                  checked={settings[item.key]}
                  onChange={() =>
                    setSettings((current) => ({
                      ...current,
                      [item.key]: !current[item.key],
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-[30px] border border-[#E6EBF3] bg-white p-6 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
          <h2 className="text-xl font-semibold text-[#1E2746]">Security</h2>
          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] bg-[#F8FAFC] px-4 py-4">
              <p className="text-sm font-semibold text-[#1E2746]">Two-factor authentication</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Add one more layer of protection before you approve sensitive actions.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl bg-[#314B6B] px-4 text-sm font-semibold text-white"
              >
                Enable
              </button>
            </div>

            <div className="rounded-[24px] bg-[#F8FAFC] px-4 py-4">
              <p className="text-sm font-semibold text-[#1E2746]">Session activity</p>
              <p className="mt-1 text-sm leading-6 text-[#6B7280]">
                Last active from London, United Kingdom on a Chrome desktop session.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-2xl border border-[#314B6B] px-4 text-sm font-semibold text-[#314B6B]"
              >
                Review sessions
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
