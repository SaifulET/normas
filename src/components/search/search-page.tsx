import { SearchMarketplace } from "./search-marketplace";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";
import type { SearchFilters } from "./types";

export function SearchPage({ initialFilters }: { initialFilters: SearchFilters }) {
  const marketplaceKey = JSON.stringify(initialFilters);

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <section className="px-4 pt-6 sm:px-6 lg:px-[32px]">
        <div className="">
          <SiteHeader navItems={createSiteNav("Search")} primaryCta={sitePrimaryCta} />
        </div>
      </section>

      <SearchMarketplace key={marketplaceKey} initialFilters={initialFilters} />

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
