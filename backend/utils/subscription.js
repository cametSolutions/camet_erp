const PLAN_MONTHLY = "monthly";
const PLAN_YEARLY = "yearly";

export const normalizeSubscription = (subscription) =>
  String(subscription || "").trim().toLowerCase() === PLAN_YEARLY
    ? PLAN_YEARLY
    : PLAN_MONTHLY;

// Uses calendar months/years (not a fixed number of days), so a plan bought on
// 15 January ends on 15 February / 15 January next year.
export const calculateSubscriptionExpiry = (startDate, subscription) => {
  const expiry = new Date(startDate);
  if (Number.isNaN(expiry.getTime())) return null;

  if (normalizeSubscription(subscription) === PLAN_YEARLY) {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    expiry.setMonth(expiry.getMonth() + 1);
  }
  return expiry;
};

export const getSubscriptionExpiry = (primaryUser) =>
  primaryUser.subscriptionExpiry ||
  calculateSubscriptionExpiry(primaryUser.createdAt, primaryUser.subscription);

export const getSubscriptionStatus = (primaryUser, now = new Date()) => {
  const expiry = getSubscriptionExpiry(primaryUser);
  if (!expiry) return { isExpired: true, expiresAt: null, daysRemaining: 0 };

  const millisecondsRemaining = new Date(expiry).getTime() - now.getTime();
  return {
    isExpired: millisecondsRemaining <= 0,
    expiresAt: new Date(expiry),
    daysRemaining: Math.max(0, Math.ceil(millisecondsRemaining / 86400000)),
  };
};
