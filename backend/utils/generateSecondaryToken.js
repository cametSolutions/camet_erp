import jwt from "jsonwebtoken";

const generateSecToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY_SECONDARY, {
    expiresIn: "30d",
  });

  res.cookie("jwt_secondary", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};



export default generateSecToken
