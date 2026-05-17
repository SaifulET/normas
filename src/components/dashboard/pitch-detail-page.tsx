import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/home/icons";
import { PitchActions } from "@/components/pitch/pitch-actions";
import type { PitchDetail } from "@/components/pitch/data";
import { CollapsibleDetailHtml } from "./collapsible-detail-html";

function getFallbackDetailHtml(pitch: PitchDetail) {
  const parts = [
    `<p>${pitch.overview}</p>`,
    pitch.closing ? `<p>${pitch.closing}</p>` : "",
    pitch.keyComponents.length
      ? `<p>Key Components:</p><ol>${pitch.keyComponents.map((item) => `<li>${item}</li>`).join("")}</ol>`
      : "",
    pitch.benefits.length ? `<p>Benefits:</p><ul>${pitch.benefits.map((item) => `<li>${item}</li>`).join("")}</ul>` : "",
  ];

  return parts.filter(Boolean).join("");
}

function UnlockedPitchDetails({ pitch }: { pitch: PitchDetail }) {
  const detailHtml = pitch.detailHtml || getFallbackDetailHtml(pitch);

  return (
    <div className="mt-[51px] space-y-[51px]">
      <CollapsibleDetailHtml html={detailHtml} />

      {pitch.additionalDetails.length ? (
        <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] pb-4">
          <div className="bg-[#F3F4F6] px-4 py-2.5 text-[12px] font-normal leading-[18px] tracking-[0.008em] text-[#1F2937]">
            Additional Details
          </div>
          <div className="space-y-4 px-4 pt-4">
            {pitch.additionalDetails.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-6 text-[14px] leading-5 text-[#1F2937]"
              >
                <span>{row.label}</span>
                <span className="text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
    <section className="min-h-screen rounded-[16px] bg-[#FCFCFD] px-4 pb-14 pt-8 text-[#243041] sm:px-6 lg:px-6 lg:pt-10">
      <header className="flex items-start gap-5">
        <div className="flex items-start gap-5">
          <Link
            href="/dashboard/save-list"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-white text-[#141B34] transition hover:bg-[#F3F4F6]"
            aria-label="Back to saved lists"
          >
            <AppIcon name="arrowLeft" className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-[32px] font-semibold leading-10 text-[#16123E]">View Pitch</h1>
            <p className="mt-1 text-[16px] font-medium leading-7 text-[#6B7280]">Details of the business</p>
          </div>
        </div>
      </header>

      <div className="relative mt-10 h-[260px] overflow-hidden rounded-[12px] sm:h-[320px] lg:h-[364px]">
        <Image src={pitch.image} alt={pitch.title} fill className="object-cover" priority sizes="100vw" />
      </div>

      <div className="mx-auto mt-10 max-w-[1306px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2.5 text-[#6B7280]">
              <span className="inline-flex items-center gap-1 text-[12px] font-normal leading-5 tracking-[0.01em]">
                <AppIcon name="mapPin" className="h-5 w-5" />
                {pitch.location}
              </span>
              <span className="h-1 w-1 rounded-full bg-[#BFC7D0]" />
              <span className="inline-flex items-center gap-1 text-[14px] font-medium leading-[19px]">
                <AppIcon name="view" className="h-5 w-5" />
                {pitch.views} views
              </span>
            </div>

            <PitchActions authenticated listId={pitch.slug} variant="dashboard" />
          </div>

          <div className="space-y-4">
            <h2 className="text-[32px] font-semibold leading-[42px] text-[#1F2937]">
              {pitch.title}
            </h2>
            <div className="flex flex-wrap items-center gap-[13px]">
              <span className="rounded-full bg-[#BFC7D0] px-5 py-0.5 text-[14px] font-normal leading-[22px] text-[#1F2937]">
                {pitch.stage}
              </span>
              <span className="rounded-full bg-[#BFC7D0] px-5 py-0.5 text-[14px] font-normal leading-[22px] text-[#1F2937]">
                {pitch.sector}
              </span>
              <span className="ml-0 flex items-center gap-3 sm:ml-1">
                <span className="text-[12px] font-normal leading-[10px] text-[#6B7280]">Funding target</span>
                <span className="text-[18px] font-medium leading-6 text-[#2B425D]">{pitch.target}</span>
              </span>
            </div>
          </div>
        </div>

        <UnlockedPitchDetails pitch={pitch} />
      </div>
    </section>
  );
}
