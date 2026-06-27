import { CreateListPage } from "@/components/dashboard/create-list-page";
import { InvesteeSubscriptionGate } from "@/components/dashboard/investee-subscription-gate";

export default function InvesteeCreateListPage() {
  return (
    <InvesteeSubscriptionGate feature="listings">
      <CreateListPage />
    </InvesteeSubscriptionGate>
  );
}
