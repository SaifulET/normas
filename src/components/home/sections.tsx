import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { AppIcon } from "./icons";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  FaqList,
  HeroField,
  RatingStars,
  SectionHeading,
  SectionShell,
  StepCards,
} from "./primitives";
import type {
  AdminTask,
  FaqItem,
  FooterLinkGroup,
  HeroContent,
  ImageAsset,
  Listing,
  PricingPlan,
  SectorItem,
  SocialLink,
  StatItem,
  StepItem,
  Testimonial,
  ValueItem,
} from "./types";

const heroFont = Poppins({
  subsets: ["latin"],
  weight: ["300", "800"],
});

export function HeroSection({ content }: { content: HeroContent }) {
  return (
    <SectionShell className="relative isolate overflow-hidden bg-white px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(43,66,93,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(43,66,93,0.08)_1px,transparent_1px)] bg-[size:128px_128px]" />
      <Image
        src={content.backgroundImageSrc}
        alt=""
        fill
        priority
        className="pointer-events-none -z-10 object-cover object-center opacity-20"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-white/55" />

      <SiteHeader navItems={content.nav} primaryCta={content.primaryCta} />

      <div className="mx-auto flex max-w-7xl flex-col items-center pb-8 pt-20 text-center sm:pt-24 lg:pt-28">
        <h1
          className={`${heroFont.className} max-w-5xl text-center text-[72px] font-extrabold leading-[88px] tracking-[-1.8px] text-[#1F2937]`}
        >
          {content.title}
          <span className="block text-[#E65E02]">{content.accentTitle}</span>
        </h1>
        <p
          className={`${heroFont.className} mt-5 max-w-2xl text-center text-[20px] font-light leading-7 text-[#1F2937]`}
        >
          {content.description}
        </p>

        <form
          action="/search"
          className="mt-12 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-[#2B425D]/10 md:grid-cols-[1.25fr_1fr_1fr_1fr_auto]"
        >
          {content.searchFields.map((field) => (
            <HeroField key={field.name} field={field} />
          ))}
          <button
            type="submit"
            className="flex min-h-16 items-center justify-center gap-3 bg-[#2B425D] px-8 text-base font-bold text-white transition hover:bg-[#21344b]"
          >
            <AppIcon name="search" className="h-5 w-5" />
            {content.searchActionLabel}
          </button>
        </form>

        <div className="mt-12 flex w-full max-w-2xl flex-col gap-4 sm:flex-row">
          {content.actions.map((action) => (
            <a
              key={action.label}
              className={`flex h-14 flex-1 items-center justify-center rounded-md px-5 text-base font-extrabold shadow-sm transition ${
                action.variant === "secondary"
                  ? "border-2 border-[#2B425D] bg-white/80 text-[#182231] backdrop-blur hover:bg-white"
                  : "bg-[#2B425D] text-white hover:bg-[#21344b]"
              }`}
              href={action.href}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function StatsBandSection({ stats }: { stats: StatItem[] }) {
  return (
    <SectionShell className="bg-[#2B425D] px-[160px] py-5 text-white">
      <div className=" grid  grid-cols-2 gap-6 text-center md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-black leading-none">{stat.value}</p>
            <p className="mt-2 text-sm font-semibold text-white/55">{stat.label}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function OpportunitiesSection({ listings }: { listings: Listing[] }) {
  return (
    <SectionShell className="bg-[#FFF] mx-[32px] my-[72px] " >
      <div id="opportunities" className="">
        <SectionHeading
          title="Ethical Investment Opportunities"
          description="Explore pre-screened, impact-aligned businesses actively seeking ethical capital"
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {listings.map((listing) => (
            <article key={listing.id} className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-[#2B425D]/10">
              <div className="relative h-32">
                <Image
                  src={listing.image.src}
                  alt={listing.image.alt}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-full bg-[#2B425D] px-3 py-1 text-xs text-white">{listing.stage}</span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-[#2B425D]">{listing.sector}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-[#182231]">{listing.title}</h3>
                  <span className="flex items-center gap-1 text-sm text-[#182231]/55">
                    <AppIcon name="view" className="h-4 w-4" />
                    {listing.views} views
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-1 text-sm text-[#182231]/55">
                  <AppIcon name="mapPin" className="h-4 w-4" />
                  {listing.location}
                </p>
                <p className="mt-4 min-h-12 text-sm leading-6 text-[#182231]/60">{listing.description}</p>
                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#182231]/40">
                      Funding Target
                    </p>
                    <p className="text-xl font-black text-[#2B425D]">{listing.target}</p>
                  </div>
                  <Link
                    href={listing.href}
                    className="rounded-md bg-[#E65E02] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c84f00]"
                  >
                    View Pitch
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <a
            href="#"
            className="inline-flex h-12 items-center justify-center gap-3 rounded-md bg-[#2B425D] px-8 text-base font-semibold text-white transition hover:bg-[#21344b]"
          >
            View All Listings
            <AppIcon name="arrowRight" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </SectionShell>
  );
}

export function ValuesSection({
  images,
  values,
}: {
  images: ImageAsset[];
  values: ValueItem[];
}) {
  return (
    <SectionShell className="bg-white px-4 py-[72px] sm:px-6 lg:px-[147px]">
      <div id="values" className="grid items-center gap-12 lg:grid-cols-[0.9fr_1fr]">
        <div className="grid grid-cols-2 gap-4">
          {images.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              className={`aspect-square rounded-lg object-cover ${
                index === 0 ? "mt-8" : index === 3 ? "mt-6" : ""
              }`}
            />
          ))}
        </div>

        <div>
          <SectionHeading
            eyebrow="Philosophy & Core Values"
            title="The Ubuntu Standard:"
            accentTitle="Unified Humanity"
            description='At the heart of EARLY-N lies the ancient African wisdom of Ubuntu: "I am because we are." We believe that true growth is only possible when it is shared, inclusive, and ethical.'
            align="left"
          />

          <div className="mt-8 space-y-7">
            {values.map((value) => (
              <div key={value.title} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#2B425D] text-white">
                  <AppIcon name={value.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#182231]">{value.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#182231]/65">{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function HowItWorksSection({
  steps,
  image,
}: {
  steps: StepItem[];
  image: ImageAsset;
}) {
  return (
    <SectionShell className="bg-white">
      <div id="how-it-works" className="px-4 pb-8 text-center">
        <SectionHeading
          title="How It Works"
          description="Our platform facilitates seamless, ethical capital flow through a rigorous, transparent process."
        />
      </div>

      <div className="bg-[#2B425D] px-4 py-16 text-white sm:px-6 lg:px-[147px]">
        <div className="grid  items-center gap-12 lg:grid-cols-[0.95fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm font-black">
                01
              </span>
              <p className="text-sm font-black text-[#E65E02]">For Ethical Investors</p>
            </div>
            <h3 className="mt-5 text-3xl font-black tracking-normal">Deploy Capital with Purpose</h3>

            <div className="mt-8">
              <StepCards
                items={steps}
                highlightedIndex={3}
                highlightedClassName="bg-white text-[#182231] ring-white/10"
                defaultClassName="bg-white/7 text-white ring-white/10"
                highlightedLabelClassName="text-[#2B425D]"
                defaultLabelClassName="text-[#E65E02]"
                highlightedTextClassName="text-[#182231]/60"
                defaultTextClassName="text-white/60"
              />
            </div>
          </div>

          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="max-h-[430px] w-full rounded-lg object-cover shadow-2xl"
          />
        </div>
      </div>
    </SectionShell>
  );
}

export function FounderFundingSection({
  image,
  steps,
}: {
  image: ImageAsset;
  steps: StepItem[];
}) {
  return (
    <SectionShell className="bg-white px-4 py-16 sm:px-6 lg:px-[147px]">
      <div id="founders" className=" grid  items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="h-[260px] w-full rounded-lg object-cover sm:h-[330px]"
          sizes="(min-width: 1024px) 48vw, 100vw"
        />

        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B425D] text-sm font-black text-white">
              02
            </span>
            <p className="text-sm font-black text-[#E65E02]">For Impact Founders</p>
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-normal text-[#2B425D] sm:text-4xl">
            Secure Aligned Funding
          </h2>

          <div className="mt-8">
            <StepCards
              items={steps}
              highlightedIndex={3}
              highlightedClassName="bg-[#2B425D] text-white ring-[#2B425D]/10"
              defaultClassName="bg-[#F7F7F7] text-[#182231] ring-[#2B425D]/10"
              highlightedLabelClassName="text-[#E65E02]"
              defaultLabelClassName="text-[#2B425D]"
              highlightedTextClassName="text-white/75"
              defaultTextClassName="text-[#182231]/60"
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function AdminCompletionSection({ tasks }: { tasks: AdminTask[] }) {
  return (
    <SectionShell className="bg-[#FFF] px-4 py-16 text-center sm:px-6 lg:px-[147px]">
      <div className="">
        <AppIcon name="shieldUser" className="mx-auto h-10 w-10 text-[#E65E02]" />
        <h2 className="mt-4 text-2xl font-black tracking-normal text-[#2B425D] sm:text-3xl">
          Admin Facilitated Completion
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[#182231]/65 sm:text-base">
          Once interest is solidified, EARLY-N admins step in to facilitate formal agreements and commission
          tracking, ensuring a professional and legally sound conclusion for both parties.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {tasks.map((task) => (
            <span
              key={task.label}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-[#182231] ring-1 ring-[#2B425D]/10"
            >
              <AppIcon name="checkmarkCircle" className="h-4 w-4 text-[#159953]" />
              {task.label}
            </span>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function SectorCategoriesSection({ sectors }: { sectors: SectorItem[] }) {
  return (
    <SectionShell className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <SectionHeading
          title="Invest Where it Matters"
          description="14 ethical sector categories aligned with established ESG investment classifications"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector) => (
            <a
              key={sector.title}
              href={sector.href}
              className="group flex min-h-28 flex-col items-center justify-center rounded-md bg-white p-5 text-center ring-1 ring-[#2B425D]/10 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <AppIcon name={sector.icon} className="h-6 w-6 text-[#2B425D]" />
              <h3 className="mt-4 text-sm font-black text-[#182231]">{sector.title}</h3>
              <p className="mt-3 flex items-center gap-2 text-xs text-[#182231]/50">
                {sector.listingCount} listings
                <AppIcon name="arrowRight" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </p>
            </a>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <SectionShell className="bg-[#FFF] px-4 py-20 sm:px-6 lg:px-[147px]">
      <div className="">
        <SectionHeading
          title="The User Voice"
          description="Insights into how our community experiences the platform."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#2B425D]/10"
            >
              <p className="relative z-10 text-base leading-7 text-[#141A33]">&quot;{testimonial.quote}&quot;</p>
              <div className="relative z-10 mt-6 flex items-center gap-4">
                <Image
                  src={testimonial.avatar.src}
                  alt={testimonial.avatar.alt}
                  width={testimonial.avatar.width}
                  height={testimonial.avatar.height}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#141A33]">{testimonial.name}</h3>
                  <p className="mt-1 text-[11px] text-[#141A33]/45">{testimonial.role}</p>
                  <RatingStars rating={testimonial.rating} />
                </div>
              </div>
              <Image
                src="/invertedKomma.svg"
                alt=""
                width={88}
                height={68}
                className="absolute bottom-4 right-5 opacity-5"
              />
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function PricingSection({ pricingPlans }: { pricingPlans: PricingPlan[] }) {
  return (
    <SectionShell className="bg-white px-4 py-20 sm:px-6 lg:px-[147px]">
      <div id="pricing" className="">
        <SectionHeading
          title="Simple, Transparent Pricing"
          description="For serious investors and founders ready to make an impact"
          titleClassName="text-center font-semibold text-[36px] leading-[48px] tracking-normal text-[#1F2937] sm:text-[36px]"
        />
        <div className="mt-5 text-center ">
          <div className="inline-flex rounded-md bg-white p-1 ring-1 ring-[#2B425D]/10">
            <span className="rounded bg-[#182231] px-8 py-2 text-sm font-semibold text-white">Monthly</span>
            <span className="px-8 py-2 text-sm font-medium text-[#182231]/70">
              Annual <span className="text-[#E65E02]">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="mt-9  px-[125px] grid items-start gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.title}
              className={`relative rounded-lg bg-white p-7 ring-1 ${
                plan.featured
                  ? "ring-[#2B425D] shadow-2xl shadow-[#182231]/15"
                  : "ring-[#2B425D]/15 shadow-sm"
              }`}
            >
              {plan.featured ? (
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E65E02] px-5 py-2 text-xs font-black text-white">
                  Most Popular
                </span>
              ) : null}
              <h3 className="text-base font-black text-[#182231]">{plan.title}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-black text-[#2B425D]">{plan.price}</span>
                <span className="pb-1 text-sm text-[#182231]/55">{plan.suffix}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#182231]/70">
                    <AppIcon name="checkmarkCircle" className="mt-0.5 h-4 w-4 shrink-0 text-[#159953]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={plan.href}
                className={`mt-7 flex h-12 items-center justify-center rounded-md px-5 text-sm font-black transition ${
                  plan.featured
                    ? "bg-[#2B425D] text-white hover:bg-[#21344b]"
                    : "border-2 border-[#2B425D] text-[#2B425D] hover:bg-[#2B425D] hover:text-white"
                }`}
              >
                {plan.action}
              </a>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  return (
    <SectionShell className="bg-[#FFF] px-4 py-20 sm:px-6 lg:px-[147px]">
      <div className="">
        <SectionHeading
          title="Common Questions"
          description="Everything you need to know about EARLY-N"
          titleClassName="text-center font-semibold text-[36px] leading-[48px] tracking-normal text-[#1F2937] sm:text-[36px]"
        />
        <FaqList items={faqs} />
      </div>
    </SectionShell>
  );
}

export function FooterSection({
  linkGroups,
  socialLinks,
}: {
  linkGroups: FooterLinkGroup[];
  socialLinks: SocialLink[];
}) {
  return <SiteFooter linkGroups={linkGroups} socialLinks={socialLinks} />;
}
