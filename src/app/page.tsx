import { HomePage } from "@/components/home/home-page";
import { homePageContent } from "@/components/home/data";
import type { FaqItem, PricingPlan, Testimonial } from "@/components/home/types";
import { getPublicFaqs } from "@/lib/faq-api";
import { getPublicPricingPlans } from "@/lib/pricing-api";
import { getPublicReviews } from "@/lib/review-api";

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

async function getReviewItems(): Promise<Testimonial[]> {
  try {
    const reviews = await getPublicReviews();

    return reviews
      .filter((review) => review.name?.trim() && review.quote?.trim())
      .map((review, index) => ({
        id: review._id ?? review.id ?? index,
        name: review.name.trim(),
        role: review.role?.trim() ?? "",
        quote: review.quote.trim(),
        rating: Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5))),
        avatar: review.avatarImage
          ? {
              alt: `${review.name.trim()} portrait`,
              height: 52,
              src: review.avatarImage,
              width: 52,
            }
          : undefined,
      }));
  } catch {
    return [];
  }
}

export default async function Page() {
  const [faqs, pricingPlans, testimonials] = await Promise.all([
    getFaqItems(),
    getPricingItems(),
    getReviewItems(),
  ]);

  return <HomePage faqs={faqs} pricingPlans={pricingPlans} testimonials={testimonials} />;
}
