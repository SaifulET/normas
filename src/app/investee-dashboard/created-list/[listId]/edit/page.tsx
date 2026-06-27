import { CreateListPage } from "@/components/dashboard/create-list-page";
import { InvesteeSubscriptionGate } from "@/components/dashboard/investee-subscription-gate";

export default async function InvesteeEditCreatedListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;

  return (
    <InvesteeSubscriptionGate feature="listings">
      <CreateListPage listId={listId} />
    </InvesteeSubscriptionGate>
  );
}
