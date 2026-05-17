import { homePageContent } from "./data";
import { HomeOpportunitiesSection } from "./opportunities-section-client";
import { SectorCategoriesSectionClient } from "./sector-categories-section-client";
import {
  AdminCompletionSection,
  FaqSection,
  FooterSection,
  FounderFundingSection,
  HeroSection,
  HowItWorksSection,
  PricingSection,
  StatsBandSection,
  TestimonialsSection,
  ValuesSection,
} from "./sections";
import type { FaqItem, HomePageContent, PricingPlan } from "./types";

interface HomePageProps {
  content?: HomePageContent;
  faqs?: FaqItem[];
  pricingPlans?: PricingPlan[];
}

export function HomePage({ content = homePageContent, faqs, pricingPlans }: HomePageProps) {
  const faqItems = faqs && faqs.length > 0 ? faqs : content.faqs;
  const planItems = pricingPlans && pricingPlans.length > 0 ? pricingPlans : content.pricingPlans;

  return (
    <main className="min-h-screen bg-[#FFF] text-[#182231]">
      <HeroSection content={content.hero} />
      <StatsBandSection stats={content.stats} />
      <HomeOpportunitiesSection fallbackListings={content.listings} />
      <ValuesSection images={content.valueImages} values={content.values} />
      <HowItWorksSection
        steps={content.investorSteps}
        image={{
          src: "/howitwork.png",
          alt: "Investors reviewing market analytics",
          width: 1024,
          height: 1024,
        }}
      />
      <FounderFundingSection image={content.founderImage} steps={content.founderSteps} />
      <AdminCompletionSection tasks={content.adminTasks} />
      <SectorCategoriesSectionClient sectors={content.sectors} />
      <TestimonialsSection testimonials={content.testimonials} />
      <PricingSection pricingPlans={planItems} />
      <FaqSection faqs={faqItems} />
      <FooterSection linkGroups={content.footerLinkGroups} socialLinks={content.socialLinks} />
    </main>
  );
}
