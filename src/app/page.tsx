import { HomePage } from "@/components/home/home-page";
import { homePageContent } from "@/components/home/data";
import type { FaqItem, PricingPlan } from "@/components/home/types";
import { getPublicFaqs } from "@/lib/faq-api";
import { getPublicPricingPlans } from "@/lib/pricing-api";

async function getFaqItems(): Promise<FaqItem[]> {
  try {
    const faqs = await getPublicFaqs();
    return faqs.map((faq) => ({
      answer: faq.answer,
      question: faq.question,
    }));
  } catch {
    return homePageContent.faqs;
  }
}

async function getPricingItems(): Promise<PricingPlan[]> {
  try {
    return await getPublicPricingPlans();
  } catch {
    return homePageContent.pricingPlans;
  }
}

export default async function Page() {
  const [faqs, pricingPlans] = await Promise.all([
    getFaqItems(),
    getPricingItems(),
  ]);

  return <HomePage faqs={faqs} pricingPlans={pricingPlans} />;
}
