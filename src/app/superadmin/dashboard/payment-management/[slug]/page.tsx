import { SuperadminPaymentDetailPage } from "@/components/superadmin/pages";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <SuperadminPaymentDetailPage slug={slug} />;
}
