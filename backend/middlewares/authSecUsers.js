import jwt from "jsonwebtoken";
import secondaryUserModel from "../models/secondaryUserModel.js";

export const authSecondary = async (req, res, next) => {
  let token;
  token = req.cookies.jwt_secondary;

  console.log("tookrnn", token);

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
    console.log(decodedToken);
    req.sUserId = decodedToken.userId;

    const secUser = await secondaryUserModel.findById(req.sUserId);
    // console.log("secUser", secUser);
    const owner=secUser.primaryUser;
    req.owner=owner;

    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
