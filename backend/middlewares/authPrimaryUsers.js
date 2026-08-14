import jwt from "jsonwebtoken";
import secondaryUserModel from "../models/secondaryUserModel.js";
import PrimaryUser from "../models/primaryUserModel.js";
import { requireActiveSubscription } from "./subscriptionAccess.js";

export const authPrimary = async (req, res, next) => {
  let token;
  const isPrimaryRoute = req.originalUrl.startsWith("/api/pUsers/");
  token = isPrimaryRoute ? req.cookies.jwt_primary : req.cookies.jwt_secondary;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }
  try {
    const isPrimarySession = isPrimaryRoute;
    const decodedToken = await jwt.verify(
      token,
      isPrimarySession
        ? process.env.JWT_SECRET_KEY_PRIMARY
        : process.env.JWT_SECRET_KEY_SECONDARY
    );

    if (isPrimarySession) {
      const primaryUser = await PrimaryUser.findById(decodedToken.userId);
      if (!primaryUser) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
      }
      req.owner = primaryUser._id;
      return requireActiveSubscription(req, res, next);
    }

    req.sUserId = decodedToken.userId;

    const secUser = await secondaryUserModel.findById(req.sUserId);

    if (!secUser) {
      return res
        .status(401)
        .json({ success: false, message: "No token, authorization denied" });
    } 

    if (secUser.role !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized as admin" });
    }
    // console.log("secUser", secUser);
    const owner = secUser.primaryUser;
    req.owner = owner;
    return requireActiveSubscription(req, res, next);
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
