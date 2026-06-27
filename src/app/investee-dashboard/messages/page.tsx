import { InvesteeSubscriptionGate } from "@/components/dashboard/investee-subscription-gate";
import { MessagesPage } from "@/components/dashboard/messages-page";

export default function InvesteeMessagesPage() {
  return (
    <InvesteeSubscriptionGate feature="messages">
      <MessagesPage />
    </InvesteeSubscriptionGate>
  );
}
