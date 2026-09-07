import PrimaryUser from "../models/primaryUserModel.js";
import { getSubscriptionStatus } from "../utils/subscription.js";

export const clearAuthenticationCookies = (res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
  };
  res.clearCookie("jwt_primary", options);
  res.clearCookie("jwt_secondary", options);
};

export const requireActiveSubscription = async (req, res, next) => {
  const primaryUser = await PrimaryUser.findById(req.owner).select(
    "subscription subscriptionExpiry createdAt"
  );

  if (!primaryUser) {
    clearAuthenticationCookies(res);
    return res.status(401).json({ success: false, message: "Account not found" });
  }

  const subscription = getSubscriptionStatus(primaryUser);
  if (subscription.isExpired) {
    clearAuthenticationCookies(res);
    return res.status(403).json({
      success: false,
      code: "SUBSCRIPTION_EXPIRED",
      message: "The subscription has expired. Please renew to continue.",
      subscription,
    });
  }

  req.subscription = subscription;
  next();
};
