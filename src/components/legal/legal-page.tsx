import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";

interface LegalSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
}

interface LegalPageProps {
  title: string;
  description: string;
  sections: readonly LegalSection[];
}

export function LegalPage({ title, description, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav()} primaryCta={sitePrimaryCta} />
      </section>

      <section className="bg-white px-4 pb-24 pt-10 sm:px-6 lg:px-[76px] lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6F8C]">
              Legal Documentation
            </p>
            <p className="mt-2 text-xs text-[#9AA3AF]">Last updated: Oct 2023</p>

            <nav className="mt-5 space-y-2">
              {sections.map((section, index) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className={`block rounded-[10px] px-4 py-3 text-sm transition ${
                    index === 0
                      ? "bg-[#F3F5F8] font-medium text-[#243041]"
                      : "text-[#5F6B7A] hover:bg-[#F8FAFC] hover:text-[#243041]"
                  }`}
                >
                  {index + 1}. {section.title}
                </Link>
              ))}
            </nav>
          </aside>

          <article className="rounded-[18px] border border-[#E7ECF3] bg-white px-8 py-8 shadow-[0_24px_60px_-54px_rgba(15,23,42,0.24)] sm:px-10 sm:py-10 lg:px-12 lg:py-12">
            <h1 className="text-[36px] font-semibold leading-[48px] text-[#1F2937]">{title}</h1>
            <p className="mt-4 text-[18px] leading-8 text-[#4B5563]">{description}</p>

            <div className="mt-10 space-y-10">
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-[18px] font-semibold leading-8 text-[#1F2937]">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-[17px] leading-8 text-[#5F6B7A]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
