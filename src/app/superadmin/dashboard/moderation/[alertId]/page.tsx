import { ModerationAlertDetailClient } from "@/components/superadmin/moderation-alert-detail-client";

export default async function SuperadminModerationAlertDetailPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;

  return <ModerationAlertDetailClient alertId={alertId} />;
}
