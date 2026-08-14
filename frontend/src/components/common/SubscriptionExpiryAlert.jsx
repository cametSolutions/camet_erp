import { AlertTriangle } from "lucide-react";

export const subscriptionHasExpired = (user) => {
  const expiresAt = user?.subscription?.expiresAt;
  return Boolean(expiresAt && new Date(expiresAt).getTime() <= Date.now());
};

function SubscriptionExpiryAlert({ user }) {
  const subscription = user?.subscription;
  if (!subscription?.expiresAt || subscription.isExpired || subscription.daysRemaining > 7) {
    return null;
  }

  const expiryDate = new Date(subscription.expiresAt).toLocaleDateString();
  const days = subscription.daysRemaining;
  return (
    <div className="mx-3 mt-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <span>
        Your subscription ends {days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`} ({expiryDate}). Please renew to avoid losing access.
      </span>
    </div>
  );
}

export default SubscriptionExpiryAlert;
