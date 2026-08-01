import { SuperadminNoticeDetailClient } from "@/components/superadmin/notices-client";

export default async function Page({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;

  return <SuperadminNoticeDetailClient noticeId={noticeId} />;
}
