import { DashboardSupportDetailPage } from "@/components/dashboard/support-center-page";

export default async function Page({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;

  return <DashboardSupportDetailPage conversationId={conversationId} />;
}
