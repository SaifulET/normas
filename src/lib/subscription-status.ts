import type { SubscriptionRecord } from "./subscription-api";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "cancel_at_period_end"]);

export function isActiveSubscription(subscription?: SubscriptionRecord | null) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(String(subscription?.localStatus ?? "").toLowerCase());
}
