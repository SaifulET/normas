import { CreatedListDetailPage } from "@/components/dashboard/created-list-detail-page";
import { InvesteeSubscriptionGate } from "@/components/dashboard/investee-subscription-gate";

export default async function InvesteeCreatedListDetailPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  return (
    <InvesteeSubscriptionGate feature="listings">
      <CreatedListDetailPage listId={listId} />
    </InvesteeSubscriptionGate>
  );
}
