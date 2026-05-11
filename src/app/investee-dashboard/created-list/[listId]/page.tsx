import { CreatedListDetailPage } from "@/components/dashboard/created-list-detail-page";

export default async function InvesteeCreatedListDetailPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  return <CreatedListDetailPage listId={listId} />;
}
