import Image from "next/image";
import Link from "next/link";
import type { PitchDetail } from "@/components/pitch/data";
import { ListingCard } from "./listing-card";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

export function DashboardPitchDetailPage({
  pitch,
  relatedPitches,
}: {
  pitch: PitchDetail;
  relatedPitches: PitchDetail[];
}) {
  return (
    <section className="space-y-6">
      <DashboardPageHeader title="View Pitch" subtitle="Details of the business">
        <Link
          href="/dashboard/save-list"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E5EAF2] bg-white px-4 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F7F9FC]"
        >
          <DashboardIcon name="chevronLeft" className="mr-2 h-4 w-4" />
          Back
        </Link>
      </DashboardPageHeader>

      <article className="overflow-hidden rounded-[30px] border border-[#E6EBF3] bg-white shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        <div className="relative h-[240px] sm:h-[320px] lg:h-[380px]">
          <Image src={pitch.image} alt={pitch.title} fill className="object-cover" priority sizes="100vw" />
        </div>

        <div className="px-5 py-6 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <DashboardIcon name="website" className="h-4 w-4" />
                  {pitch.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DashboardIcon name="views" className="h-4 w-4" />
                  {pitch.views} views
                </span>
              </div>

              <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.05em] text-[#1E2746] lg:text-[2.6rem]">
                {pitch.title}
              </h2>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#D8E0EC] px-3 py-1 text-xs font-medium text-[#314B6B]">
                  {pitch.stage}
                </span>
                <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-medium text-[#586274]">
                  {pitch.sector}
                </span>
                <span className="ml-2 text-xs font-medium uppercase tracking-[0.14em] text-[#98A2B3]">
                  Funding target
                </span>
                <span className="text-[1.45rem] font-semibold text-[#243B5A]">{pitch.target}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard/messages"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
              >
                <DashboardIcon name="query" className="mr-2 h-4 w-4" />
                Query
              </Link>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#E5EAF2] px-4 text-sm font-semibold text-[#314B6B]"
              >
                <DashboardIcon name="save" className="mr-2 h-4 w-4" />
                Save
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section>
                <h3 className="text-xl font-semibold text-[#1E2746]">{pitch.equipmentTitle}</h3>
                <div className="mt-4 space-y-6 text-sm leading-7 text-[#5F6B7A] sm:text-base">
                  <div>
                    <p className="font-medium text-[#243041]">AI Project Overview for Windmill Optimization</p>
                    <p className="mt-3">{pitch.overview}</p>
                  </div>

                  <div>
                    <p className="font-medium text-[#243041]">Key Components:</p>
                    <ol className="mt-3 space-y-2 pl-5">
                      {pitch.keyComponents.map((item) => (
                        <li key={item} className="list-decimal">
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium text-[#243041]">Benefits:</p>
                    <ul className="mt-3 space-y-2">
                      {pitch.benefits.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>

                  <p>{pitch.closing}</p>
                </div>
              </section>
            </div>

            <aside className="rounded-[28px] bg-[#FBFCFE] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">Additional Details</p>
              <div className="mt-4 divide-y divide-[#E9EEF5] overflow-hidden rounded-[22px] border border-[#E9EEF5] bg-white">
                {pitch.additionalDetails.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-6 px-4 py-3 text-sm">
                    <span className="text-[#586274]">{row.label}</span>
                    <span className="text-right font-medium text-[#1E2746]">{row.value}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-[#1E2746]">More like this</h3>
            <p className="mt-1 text-sm text-[#6B7280]">Keep browsing related businesses inside your investor workspace.</p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          {relatedPitches.map((item) => (
            <ListingCard key={item.slug} pitch={item} />
          ))}
        </div>
      </section>
    </section>
  );
}
