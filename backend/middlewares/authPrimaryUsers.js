import jwt from "jsonwebtoken";

export const authPrimary = async (req, res, next) => {
  let token;
  token = req.cookies.jwt_primary;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET_KEY_PRIMARY);
    console.log(decodedToken);
    req.pUserId = decodedToken.userId;
    next();
  } catch (error) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token is expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};
