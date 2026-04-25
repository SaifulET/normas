import Image from "next/image";
import { AppIcon } from "@/components/home/icons";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";

export function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav("Contact")} primaryCta={sitePrimaryCta} />
      </section>

      <section className="bg-white px-4 pb-24 pt-14 sm:px-6 lg:px-[147px] lg:pt-20">
        <div className="grid gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="flex min-h-[420px] items-center justify-center rounded-[28px] bg-white">
            <Image src="/logo.svg" alt="EARLY-N" width={240} height={116} priority className="h-auto w-[240px]" />
          </div>

          <div className="rounded-[32px] bg-white">
            <div className="text-center">
              <h1 className="text-[36px] font-semibold leading-[48px] text-[#1F2937]">Let&apos;s Connect</h1>
              <p className="mt-3 text-[18px] leading-8 text-[#4B5563]">
                Have questions or ideas? Connect with us—we&apos;re here to help!
              </p>
            </div>

            <form className="mt-10 space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="h-14 w-full rounded-none border-0 bg-[#F6F7FA] px-5 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
              />
              <input
                type="text"
                placeholder="Subject"
                className="h-14 w-full rounded-none border-0 bg-[#F6F7FA] px-5 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
              />
              <textarea
                placeholder="Message"
                rows={8}
                className="w-full resize-none rounded-none border-0 bg-[#F6F7FA] px-5 py-4 text-[15px] text-[#1F2937] outline-none placeholder:text-[#7A8190]"
              />

              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-[10px] bg-[#314B6B] px-7 text-[15px] font-semibold text-white transition hover:bg-[#243B5A]"
              >
                Send
                <AppIcon name="mailSend" className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
