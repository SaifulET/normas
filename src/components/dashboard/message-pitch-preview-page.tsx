import Image from "next/image";
import Link from "next/link";
import type { PitchDetail } from "@/components/pitch/data";
import { DashboardIcon } from "./icons";

export function MessagePitchPreviewPage({ pitch }: { pitch: PitchDetail }) {
  return (
    <main className="min-h-screen bg-[#F4F6FB] px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex justify-end">
          <Link
            href="/dashboard/messages"
            className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#314B6B] text-white transition hover:bg-[#243B5A]"
            aria-label="Close preview"
          >
            ×
          </Link>
        </div>

        <article className="rounded-[24px] bg-white p-3 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] sm:p-4 lg:p-5">
          <div className="relative h-[180px] overflow-hidden rounded-[16px] sm:h-[240px] lg:h-[320px]">
            <Image src={pitch.image} alt={pitch.title} fill className="object-cover" priority sizes="100vw" />
          </div>

          <div className="px-1 py-4 sm:px-2 lg:px-4">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#7B8496]">
                  <span className="inline-flex items-center gap-1.5">
                    <DashboardIcon name="website" className="h-3.5 w-3.5" />
                    {pitch.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <DashboardIcon name="views" className="h-3.5 w-3.5" />
                    {pitch.views} views
                  </span>
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <h1 className="text-[1.8rem] font-semibold tracking-[-0.04em] text-[#1E2746] sm:text-[2.1rem]">
                    {pitch.title}
                  </h1>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#ED6A06]"
                    aria-label="Save pitch"
                  >
                    <DashboardIcon name="save" className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#D8E0EC] px-3 py-1 text-[11px] font-medium text-[#314B6B]">
                    {pitch.stage}
                  </span>
                  <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-[11px] font-medium text-[#586274]">
                    {pitch.sector}
                  </span>
                  <span className="ml-1 text-[11px] text-[#7B8496]">Funding target</span>
                  <span className="text-lg font-semibold text-[#243B5A]">{pitch.target}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
              <section className="space-y-7">
                <div>
                  <h2 className="text-base font-semibold text-[#1E2746]">{pitch.equipmentTitle}</h2>
                </div>

                <div className="space-y-6 text-sm leading-7 text-[#5F6B7A]">
                  <div>
                    <p className="font-medium text-[#243041]">AI Project Overview for Windmill Optimization</p>
                    <p className="mt-3">{pitch.overview}</p>
                  </div>

                  <div>
                    <p className="font-medium text-[#243041]">Key Components:</p>
                    <ol className="mt-3 space-y-1.5 pl-5">
                      {pitch.keyComponents.map((item) => (
                        <li key={item} className="list-decimal">
                          {item}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div>
                    <p className="font-medium text-[#243041]">Benefits:</p>
                    <ul className="mt-3 space-y-1.5">
                      {pitch.benefits.map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>

                  <p>{pitch.closing}</p>
                </div>
              </section>

              <aside className="rounded-[20px] bg-[#FBFCFE] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                  Additional Details
                </p>
                <div className="mt-4 divide-y divide-[#E9EEF5] overflow-hidden rounded-[18px] border border-[#E9EEF5] bg-white">
                  {pitch.additionalDetails.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-6 px-4 py-3 text-xs sm:text-sm">
                      <span className="text-[#586274]">{row.label}</span>
                      <span className="text-right font-medium text-[#1E2746]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
