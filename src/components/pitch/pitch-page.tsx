import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "@/components/home/icons";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";
import { isAuthenticated } from "@/lib/auth";
import { CollapsibleDetailHtml } from "./collapsible-detail-html";
import type { PitchDetail } from "./data";
import { PitchActions } from "./pitch-actions";

function RelatedPitchCard({ pitch }: { pitch: PitchDetail }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#D7DFEA] bg-white shadow-[0_14px_32px_-28px_rgba(31,41,55,0.55)]">
      <div className="relative h-36">
        <Image src={pitch.image} alt={pitch.shortTitle} fill className="object-cover" sizes="25vw" />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-[#314B6B] px-3 py-1 text-xs font-semibold text-white">{pitch.stage}</span>
          <span className="rounded-full border border-white/75 bg-white/90 px-3 py-1 text-xs font-medium text-[#475467]">
            {pitch.sector}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[18px] font-semibold text-[#1F2937]">{pitch.shortTitle}</h3>
          <span className="inline-flex items-center gap-1.5 text-sm text-[#667085]">
            <AppIcon name="view" className="h-4 w-4" />
            {pitch.views} views
          </span>
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#667085]">
          <AppIcon name="mapPin" className="h-4 w-4" />
          {pitch.location}
        </p>
        <p className="mt-3 min-h-12 text-sm leading-6 text-[#667085]">{pitch.description}</p>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#E8EDF3] pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">Funding Target</p>
            <p className="mt-1 text-[24px] font-semibold text-[#243B5A]">{pitch.target}</p>
          </div>

          <Link
            href={`/pitch/${pitch.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ED6A06] px-5 text-sm font-semibold text-white transition hover:bg-[#d35f05]"
          >
            View Pitch
          </Link>
        </div>
      </div>
    </article>
  );
}

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
    <div className="mt-10">
      <h2 className="text-[24px] font-semibold text-[#1F2937]">{pitch.equipmentTitle}</h2>

      <div className="mt-6 max-w-[860px] space-y-8">
        <CollapsibleDetailHtml html={detailHtml} collapse={false} />

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
      </div>
    </div>
  );
}

export async function PitchPage({
  pitch,
  relatedPitches,
}: {
  pitch: PitchDetail;
  relatedPitches: PitchDetail[];
}) {
  const authenticated = await isAuthenticated();

  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader
          navItems={createSiteNav("Search")}
          primaryCta={sitePrimaryCta}
        />
      </section>

      <section className="bg-white px-4 pb-14 pt-4 sm:px-6 lg:px-[144px]">
        <div className="flex items-center gap-3 text-sm text-[#667085]">
          <Link
            href="/search"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F6FA] text-[#475467] transition hover:bg-[#EAEFF6]"
            aria-label="Back to search"
          >
            <AppIcon name="arrowLeft" className="h-4 w-4" />
          </Link>
          <Link href="/" className="hover:text-[#243B5A]">
            Home
          </Link>
          <span>{">"}</span>
          <span>View Pitch Deck</span>
        </div>

        <div className="relative mt-8 h-[340px] overflow-hidden rounded-[18px] lg:h-[390px]">
          <Image src={pitch.image} alt={pitch.title} fill className="object-cover" priority sizes="100vw" />
        </div>

        <div className="px-0 py-8 lg:px-[172px]">
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

              <PitchActions authenticated={authenticated} listId={pitch.slug} />
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

      <section className="bg-white px-4 pb-20 pt-4 sm:px-6 lg:px-[32px]">
        <h2 className="text-[28px] font-semibold text-[#1F2937]">More Listing Like This</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {relatedPitches.map((item) => (
            <RelatedPitchCard key={item.slug} pitch={item} />
          ))}
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
