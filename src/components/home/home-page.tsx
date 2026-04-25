import { homePageContent } from "./data";
import {
  AdminCompletionSection,
  FaqSection,
  FooterSection,
  FounderFundingSection,
  HeroSection,
  HowItWorksSection,
  OpportunitiesSection,
  PricingSection,
  SectorCategoriesSection,
  StatsBandSection,
  TestimonialsSection,
  ValuesSection,
} from "./sections";
import type { HomePageContent } from "./types";

interface HomePageProps {
  content?: HomePageContent;
}

export function HomePage({ content = homePageContent }: HomePageProps) {
  return (
    <main className="min-h-screen bg-[#FFF] text-[#182231]">
      <HeroSection content={content.hero} />
      <StatsBandSection stats={content.stats} />
      <OpportunitiesSection listings={content.listings} />
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
      <SectorCategoriesSection sectors={content.sectors} />
      <TestimonialsSection testimonials={content.testimonials} />
      <PricingSection pricingPlans={content.pricingPlans} />
      <FaqSection faqs={content.faqs} />
      <FooterSection linkGroups={content.footerLinkGroups} socialLinks={content.socialLinks} />
    </main>
  );
}
