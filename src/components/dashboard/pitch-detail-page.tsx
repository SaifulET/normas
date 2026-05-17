import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/home/icons";
import { PitchActions } from "@/components/pitch/pitch-actions";
import type { PitchDetail } from "@/components/pitch/data";

function UnlockedPitchDetails({ pitch }: { pitch: PitchDetail }) {
  return (
    <div className="mt-10">
      <h2 className="text-[24px] font-semibold text-[#1F2937]">{pitch.equipmentTitle}</h2>

      <div className="mt-6 max-w-[860px] space-y-8 text-[17px] leading-8 text-[#5F6B7A]">
        <div>
          <p className="font-medium text-[#243041]">AI Project Overview for Windmill Optimization</p>
          <p className="mt-3">{pitch.overview}</p>
        </div>

        {pitch.keyComponents.length ? (
          <div>
            <p className="font-medium text-[#243041]">Key Components:</p>
            <ol className="mt-3 list-decimal space-y-1 pl-5">
              {pitch.keyComponents.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {pitch.benefits.length ? (
          <div>
            <p className="font-medium text-[#243041]">Benefits:</p>
            <ul className="mt-3 space-y-1">
              {pitch.benefits.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {pitch.closing ? (
          <div>
            <p>
              {pitch.closing}{" "}
              <button type="button" className="rounded bg-[#F3F5F8] px-2 py-0.5 text-xs text-[#667085]">
                Read more
              </button>
            </p>
          </div>
        ) : null}

        {pitch.additionalDetails.length ? (
          <div className="overflow-hidden rounded-[14px] border border-[#E7ECF3]">
            <div className="bg-[#F8FAFC] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              Additional Details
            </div>
            <div className="divide-y divide-[#EEF2F7]">
              {pitch.additionalDetails.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-6 px-4 py-3 text-sm">
                  <span className="text-[#475467]">{row.label}</span>
                  <span className="font-medium text-[#243041]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardPitchDetailPage({
  pitch,
}: {
  pitch: PitchDetail;
  relatedPitches: PitchDetail[];
}) {
  return (
    <section className="bg-white pb-12 text-[#243041]">
      <div className="flex items-center gap-3 text-sm text-[#667085]">
        <Link
          href="/dashboard/save-list"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6FA] text-[#475467] transition hover:bg-[#EAEFF6]"
          aria-label="Back to saved lists"
        >
          <AppIcon name="arrowLeft" className="h-4 w-4" />
        </Link>
        <Link href="/dashboard" className="hover:text-[#243B5A]">
          Dashboard
        </Link>
        <span>{">"}</span>
        <span>View Pitch Deck</span>
      </div>

      <div className="relative mt-8 h-[340px] overflow-hidden rounded-[18px] lg:h-[390px]">
        <Image src={pitch.image} alt={pitch.title} fill className="object-cover" priority sizes="100vw" />
      </div>

      <div className="px-0 py-8 2xl:px-[172px]">
        <div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#667085]">
              <span className="inline-flex items-center gap-1.5">
                <AppIcon name="mapPin" className="h-4 w-4" />
                {pitch.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <AppIcon name="view" className="h-4 w-4" />
                {pitch.views} views
              </span>
            </div>

            <PitchActions authenticated listId={pitch.slug} />
          </div>
          <h1 className="mt-4 text-[38px] font-semibold leading-[50px] text-[#1F2937]">
            {pitch.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#BCC7D3] px-4 py-1.5 text-sm font-medium text-[#3D4E63]">
              {pitch.stage}
            </span>
            <span className="rounded-full bg-[#BCC7D3] px-4 py-1.5 text-sm font-medium text-[#3D4E63]">
              {pitch.sector}
            </span>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[14px] text-[#6B7280]">Funding target</span>
            <span className="text-[30px] font-semibold text-[#243B5A]">{pitch.target}</span>
          </div>
        </div>

        <UnlockedPitchDetails pitch={pitch} />
      </div>
    </section>
  );
}
