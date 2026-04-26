import { notFound, redirect } from "next/navigation";
import { MessagePitchPreviewPage } from "@/components/dashboard/message-pitch-preview-page";
import { getPitchBySlug, getPitchSlugs } from "@/components/pitch/data";
import { isAuthenticated } from "@/lib/auth";

export function generateStaticParams() {
  return getPitchSlugs().map((slug) => ({ slug }));
}

export default async function PreviewPitchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/");
  }

  const { slug } = await params;
  const pitch = getPitchBySlug(slug);

  if (!pitch) {
    notFound();
  }

  return <MessagePitchPreviewPage pitch={pitch} />;
}
