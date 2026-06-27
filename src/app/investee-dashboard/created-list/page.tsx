import { CreatedListPage } from "@/components/dashboard/created-list-page";
import { InvesteeSubscriptionGate } from "@/components/dashboard/investee-subscription-gate";

export default function InvesteeCreatedListPage() {
  return (
    <InvesteeSubscriptionGate feature="listings">
      <CreatedListPage />
    </InvesteeSubscriptionGate>
  );
}
