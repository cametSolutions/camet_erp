import jwt from "jsonwebtoken";
import secondaryUserModel from "../models/secondaryUserModel.js";

export const authPrimary = async (req, res, next) => {
  let token;
  token = req.cookies.jwt_secondary;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }
  try {
    const decodedToken = await jwt.verify(
      token,
      process.env.JWT_SECRET_KEY_SECONDARY
    );
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
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
