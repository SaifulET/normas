import { notFound } from "next/navigation";
import { DashboardPitchDetailPage } from "@/components/dashboard/pitch-detail-page";
import { getPitchBySlug, getPitchSlugs, getRelatedPitches } from "@/components/pitch/data";

export function generateStaticParams() {
  return getPitchSlugs().map((slug) => ({ slug }));
}

export default async function DashboardPitchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pitch = getPitchBySlug(slug);

  if (!pitch) {
    notFound();
  }

  return <DashboardPitchDetailPage pitch={pitch} relatedPitches={getRelatedPitches(slug).slice(0, 3)} />;
}
