import { SearchMarketplace } from "./search-marketplace";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";

export function SearchPage({ initialKeyword = "" }: { initialKeyword?: string }) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <section className="px-4 pt-6 sm:px-6 lg:px-[32px]">
        <div className="">
          <SiteHeader navItems={createSiteNav("Search")} primaryCta={sitePrimaryCta} />
        </div>
      </section>

      <SearchMarketplace initialKeyword={initialKeyword} />

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
