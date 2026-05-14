import { notFound } from "next/navigation";
import { PitchPage } from "@/components/pitch/pitch-page";
import { getPitchBySlug, getPitchSlugs, getRelatedPitches } from "@/components/pitch/data";
import { mapApiListToPitchDetail } from "@/components/pitch/list-mappers";
import { isPublicList } from "@/components/listings/public-listing-mappers";
import { getList, getLists } from "@/lib/list-api";

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

  if (pitch) {
    return <PitchPage pitch={pitch} relatedPitches={getRelatedPitches(slug)} />;
  }

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

  return <PitchPage pitch={apiPitch} relatedPitches={relatedPitches} />;
}
