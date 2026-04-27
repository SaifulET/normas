import { SuperadminUserDetailPage } from "@/components/superadmin/pages";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <SuperadminUserDetailPage slug={slug} />;
}
