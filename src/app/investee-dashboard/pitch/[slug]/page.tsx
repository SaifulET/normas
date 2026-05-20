import { notFound } from "next/navigation";
import { DashboardPitchDetailPage } from "@/components/dashboard/pitch-detail-page";
import { isPublicList } from "@/components/listings/public-listing-mappers";
import { getPitchBySlug, getPitchSlugs, getRelatedPitches } from "@/components/pitch/data";
import { mapApiListToPitchDetail } from "@/components/pitch/list-mappers";
import { getList, getLists } from "@/lib/list-api";

export function generateStaticParams() {
  return getPitchSlugs().map((slug) => ({ slug }));
}

export default async function InvesteeDashboardPitchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pitch = getPitchBySlug(slug);

  if (!pitch) {
    let apiPitch;
    let relatedPitches;

    try {
      const response = await getList(slug);
      const list = response.data;

      if (!list || !isPublicList(list)) {
        notFound();
      }

      const relatedListsResponse = await getLists().catch(() => ({ data: [] }));
      const relatedLists = (relatedListsResponse.data ?? [])
        .filter((item) => item._id !== list._id && isPublicList(item))
        .slice(0, 4);
      const relatedSlugs = relatedLists.map((item) => item._id);
      apiPitch = mapApiListToPitchDetail(list, relatedSlugs);
      relatedPitches = relatedLists.map((item) => mapApiListToPitchDetail(item));
    } catch {
      notFound();
    }

    if (!apiPitch || !relatedPitches) {
      notFound();
    }

    return <DashboardPitchDetailPage pitch={apiPitch} relatedPitches={relatedPitches} />;
  }

  return <DashboardPitchDetailPage pitch={pitch} relatedPitches={getRelatedPitches(slug).slice(0, 4)} />;
}
