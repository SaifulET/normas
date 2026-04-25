import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";
import { isAuthenticated } from "@/lib/auth";

export default async function Page() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[147px]">
        <SiteHeader navItems={createSiteNav()} primaryCta={sitePrimaryCta} />
      </section>

      <section className="bg-white px-4 pb-24 pt-16 sm:px-6 lg:px-[147px]">
        <div className="rounded-[28px] border border-[#E7ECF3] bg-[#F8FAFC] px-8 py-10 shadow-[0_24px_60px_-54px_rgba(15,23,42,0.24)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F97316]">
            Account Overview
          </p>
          <h1 className="mt-5 text-[40px] font-semibold leading-[52px] text-[#1F2937]">
            Dashboard
          </h1>
          <p className="mt-4 max-w-[760px] text-[18px] leading-8 text-[#5F6B7A]">
            You&apos;re logged in. From here you can continue reviewing listings, unlock protected
            pitch details, and move through the investment workflow with full access.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/search"
              className="inline-flex h-12 items-center justify-center rounded-[12px] bg-[#314B6B] px-6 text-sm font-semibold text-white transition hover:bg-[#243B5A]"
            >
              Browse Listings
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-[12px] border border-[#D7DFEA] bg-white px-6 text-sm font-semibold text-[#314B6B] transition hover:bg-[#F3F6FA]"
            >
              Manage Plan
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
