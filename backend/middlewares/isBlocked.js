import Primary from "../models/primaryUserModel.js";
import Secondary from "../models/secondaryUserModel.js";

export const primaryIsBlocked = async (req, res, next) => {
  try {
    const userId = req.pUserId;
    const priUser = await Primary.findById(userId);
    if (!priUser) {
      return res.status(404).send("User not found.");
    }
    const isBlocked = priUser.isBlocked;

    if (isBlocked) {
      return res
        .status(403)
        .json({ message: "User is blocked and cannot access this resource." });
      // return res.redirect('/pUsers/login'); 
    }

    next();
  } catch (error) {
    console.error("Error in userIsBlocked middleware:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const secondaryIsBlocked = async (req, res, next) => {
    try {
      const userId = req.sUserId;
      const secUser = await Secondary.findById(userId);
      if (!secUser) {
        return res.status(404).send("User not found.");
      }
      const isBlocked = secUser.isBlocked;
  
      if (isBlocked) {
        return res
          .status(403)
          .json({ message: "User is blocked and cannot access this resource." });
      }
  
      next();
    } catch (error) {
      console.error("Error in userIsBlocked middleware:", error);
      res.status(500).send("Internal Server Error");
    }
  };
