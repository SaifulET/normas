import { DashboardNoticeDetailPage } from "@/components/dashboard/notice-page";

export default async function Page({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;

  return <DashboardNoticeDetailPage audience="investor" noticeId={noticeId} />;
}
