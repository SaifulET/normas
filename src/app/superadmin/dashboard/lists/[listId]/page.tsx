import { SuperadminListDetailClient } from "@/components/superadmin/list-review-client";

export default async function SuperadminListDetailPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  return <SuperadminListDetailClient listId={listId} />;
}
