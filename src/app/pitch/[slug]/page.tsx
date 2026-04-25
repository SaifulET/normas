import { notFound } from "next/navigation";
import { PitchPage } from "@/components/pitch/pitch-page";
import { getPitchBySlug, getPitchSlugs, getRelatedPitches } from "@/components/pitch/data";

export function generateStaticParams() {
  return getPitchSlugs().map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pitch = getPitchBySlug(slug);

  if (!pitch) {
    notFound();
  }

  return <PitchPage pitch={pitch} relatedPitches={getRelatedPitches(slug)} />;
}
