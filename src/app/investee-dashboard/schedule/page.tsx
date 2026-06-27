import { InvesteeSubscriptionGate } from "@/components/dashboard/investee-subscription-gate";
import { SchedulePage } from "@/components/dashboard/schedule-page";

export default function InvesteeSchedulePage() {
  return (
    <InvesteeSubscriptionGate feature="schedule">
      <SchedulePage audience="investee" />
    </InvesteeSubscriptionGate>
  );
}
