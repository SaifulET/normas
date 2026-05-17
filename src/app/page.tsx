import { HomePage } from "@/components/home/home-page";
import { homePageContent } from "@/components/home/data";
import type { FaqItem } from "@/components/home/types";
import { getPublicFaqs } from "@/lib/faq-api";

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

export default async function Page() {
  const faqs = await getFaqItems();

  return <HomePage faqs={faqs} />;
}
