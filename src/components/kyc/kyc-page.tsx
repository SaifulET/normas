import Image from "next/image";
import Link from "next/link";
import { Public_Sans } from "next/font/google";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

function SectionIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center text-[#8F9AAF]">
      {children}
    </span>
  );
}

function IdCardIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.25" y="4.25" width="13.5" height="11.5" rx="2" />
      <circle cx="7.5" cy="9" r="1.35" />
      <path d="M5.9 12.2c.55-.95 1.18-1.42 1.92-1.42s1.36.47 1.9 1.42" />
      <path d="M11.75 8.25h2.5" />
      <path d="M11.75 11h2.5" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10 17s4.25-4.51 4.25-8A4.25 4.25 0 1 0 5.75 9c0 3.49 4.25 8 4.25 8Z" />
      <circle cx="10" cy="8.75" r="1.4" />
    </svg>
  );
}

function FaceIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="10" cy="7.2" r="2.7" />
      <path d="M5.5 15.1a4.5 4.5 0 0 1 9 0" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 7.25 10 3l7 4.25" />
      <path d="M4.5 8.25h11" />
      <path d="M5.5 8.25v6" />
      <path d="M9 8.25v6" />
      <path d="M12.5 8.25v6" />
      <path d="M3.75 14.75h12.5" />
    </svg>
  );
}

const processSteps = [
  {
    number: "1",
    title: "Identity Verification",
    description:
      "Please provide a valid, government-issued photo ID to confirm your identity.",
    accepted: ["Passport", "Driving License"],
    icon: "/accountIcon1.svg",
    align: "left" as const,
    heading: "Accepted Documents",
    sectionIcon: <IdCardIcon />,
  },
  {
    number: "2",
    title: "Address Verification",
    description:
      "We need proof of your current residential address, dated within the last 3 months.",
    accepted: ["Utility Bill (Gas, Water, Electricity)", "Bank Statement"],
    icon: "/accountIcon2.svg",
    align: "right" as const,
    heading: "Accepted Documents",
    sectionIcon: <PinIcon />,
  },
  {
    number: "3",
    title: "Face Verification",
    description:
      "A live check to ensure the person applying matches the provided identity document.",
    accepted: ["User Selfie Upload", "Short Video Verification"],
    icon: "/accountIcon3.svg",
    align: "left" as const,
    heading: "Accepted Methods",
    sectionIcon: <FaceIcon />,
  },
  {
    number: "4",
    title: "Source of Funds",
    description:
      "To comply with AML regulation, we require documentation showing the origin of your investment funds.",
    accepted: ["Recent Salary Slip", "Business Ownership Documents", "Recent Tax Returns"],
    icon: "/accountIcon4.svg",
    align: "right" as const,
    heading: "Accepted Documents",
    sectionIcon: <BankIcon />,
  },
];

function AcceptedList({
  items,
  heading,
}: {
  items: string[];
  heading: string;
}) {
  return (
    <div className={`mt-3 w-[140px] ${publicSans.className}`}>
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#8F9AAF]">{heading}</p>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[11px] leading-[16px] text-[#1F2937]">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full border border-[#F97316]/40 text-[#F97316]">
              <svg viewBox="0 0 12 12" className="h-[7px] w-[7px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m3 6 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({
  title,
  description,
  sectionIcon,
}: {
  title: string;
  description: string;
  sectionIcon: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[280px]">
      <div className="mb-5 h-[3px] w-[248px] rounded-full bg-[#F97316]" />
      <div className="flex items-center gap-1.5">
        <SectionIcon>{sectionIcon}</SectionIcon>
        <h3
          className={`${publicSans.className} text-[24px] font-bold leading-[32px] text-[#1A1B22]`}
        >
          {title}
        </h3>
      </div>
      <p
        className={`${publicSans.className} mt-3 max-w-[280px] text-[14px] font-normal leading-[20px] text-[#43474D]`}
      >
        {description}
      </p>
    </div>
  );
}

function StepVisual({
  icon,
  accepted,
  heading,
}: {
  icon: string;
  accepted: string[];
  heading: string;
}) {
  return (
    <div className="flex w-full max-w-[360px] items-start gap-3">
      <div className="flex h-[220px] w-[220px] shrink-0 items-center justify-center">
        <Image src={icon} alt="" width={220} height={220} className="h-[220px] w-[220px] object-contain" />
      </div>
      <div className="pt-3">
        <AcceptedList items={accepted} heading={heading} />
      </div>
    </div>
  );
}

function ProcessStep({
  step,
}: {
  step: (typeof processSteps)[number];
}) {
  const leftAligned = step.align === "left";

  return (
    <div className="relative grid min-h-[250px] grid-cols-[minmax(0,280px)_1fr_minmax(0,360px)] items-center">
      <div className="col-start-1 row-start-1">
        {leftAligned ? (
          <StepCard
            title={step.title}
            description={step.description}
            sectionIcon={step.sectionIcon}
          />
        ) : (
          <StepVisual icon={step.icon} accepted={step.accepted} heading={step.heading} />
        )}
      </div>

      <div className="col-start-3 row-start-1">
        {leftAligned ? (
          <StepVisual icon={step.icon} accepted={step.accepted} heading={step.heading} />
        ) : (
          <StepCard
            title={step.title}
            description={step.description}
            sectionIcon={step.sectionIcon}
          />
        )}
      </div>

      <span className="absolute left-1/2 top-1/2 z-10 inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#213B5A] text-[9px] font-semibold text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.55)]">
        {step.number}
      </span>
    </div>
  );
}

function MobileStep({ step }: { step: (typeof processSteps)[number] }) {
  return (
    <div className="rounded-[22px] border border-[#E7ECF3] bg-white p-5 shadow-[0_22px_60px_-48px_rgba(15,23,42,0.24)] lg:hidden">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#213B5A] text-sm font-semibold text-white">
          {step.number}
        </span>
        <div className="min-w-0">
          <div className="mb-4 h-[2px] w-[96px] bg-[#F97316]" />
          <div className="flex items-center gap-2">
            <SectionIcon>{step.sectionIcon}</SectionIcon>
            <h3 className={`${publicSans.className} text-[24px] font-bold leading-[32px] text-[#1A1B22]`}>
              {step.title}
            </h3>
          </div>
          <p className={`${publicSans.className} mt-3 text-[14px] font-normal leading-[20px] text-[#43474D]`}>
            {step.description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-center px-4 py-2">
        <Image src={step.icon} alt="" width={220} height={220} className="h-[220px] w-[220px] object-contain" />
      </div>

      <div className="mt-3 flex justify-center">
        <AcceptedList items={step.accepted} heading={step.heading} />
      </div>
    </div>
  );
}

export async function KycInfoPage() {
  return (
    <main className="min-h-screen bg-white text-[#1F2937]">
      <section className="relative z-20 bg-white px-4 py-6 sm:px-6 lg:px-[150px]">
        <SiteHeader navItems={createSiteNav()} primaryCta={sitePrimaryCta} />
      </section>

      <section className="bg-white px-4 pb-10 pt-6 sm:px-6 lg:px-[150px] lg:pb-20 lg:pt-10">
        <div className="grid items-center lg:grid-cols-[minmax(0,581px)_minmax(0,1fr)] ">
          <div>
            <h1 className="text-[48px] font-semibold leading-[48px] tracking-[-1.2px] text-[#111]">
              KYC Requirements
            </h1>
            <p className="mt-8 text-[20px] font-light leading-[32px] text-[#111]">
              To maintain the highest standards of institutional security and ethical investment integrity,
              we require all users to complete our Know Your Customer verification process. This ensures a
              safe, compliant environment for everyone.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
           
            <Image
              src="/kycheroimg.png"
              alt="KYC verification collage"
              width={455}
              height={408}
              className="relative z-10  h-auto w-full max-w-[455px] object-contain"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-[150px] lg:py-16">
        <div className="text-center">
          <h2 className="text-[16px] font-medium tracking-[-0.02em] text-[#111827] sm:text-[16px]">
            Process to validate your account
          </h2>
        </div>

        <div className="mt-14 space-y-8 lg:hidden">
          {processSteps.map((step) => (
            <MobileStep key={step.number} step={step} />
          ))}
        </div>

        <div className="relative mt-14 hidden w-full lg:block">
          <div className="absolute bottom-[24px] left-1/2 top-[24px] w-[2px] -translate-x-1/2 bg-[#D7DEE8]" />
          {processSteps.map((step) => (
            <ProcessStep key={step.number} step={step} />
          ))}
        </div>
      </section>

      <section className="bg-white px-4 pb-16 pt-4 sm:px-6 lg:px-[150px] lg:pb-24">
        <div className="mx-auto max-w-[820px] rounded-[18px] bg-[#EEF2F6] px-6 py-12 text-center sm:px-10 lg:px-16 lg:py-14">
          <h3 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1F2937] sm:text-[42px]">
            Ready to invest ethically?
          </h3>
          <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-7 text-[#667085]">
            Have your documents ready. The verification process typically takes less than 5 minutes to complete.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#F97316] px-7 text-sm font-semibold text-white transition hover:bg-[#E06510]"
            >
              Begin Verification
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4.5 10h11" strokeLinecap="round" />
                <path d="m11 6.5 3.5 3.5-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#98A2B3]">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="4.25" y="7" width="7.5" height="5.5" rx="1.2" />
              <path d="M6 7V5.75a2 2 0 1 1 4 0V7" />
            </svg>
            <span>Your data is encrypted and securely stored.</span>
          </p>
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}