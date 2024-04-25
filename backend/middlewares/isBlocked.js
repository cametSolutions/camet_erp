import Primary from "../models/primaryUserModel.js";
import Secondary from "../models/secondaryUserModel.js";

export const primaryIsBlocked = async (req, res, next) => {
  try {
    const userId = req.pUserId;
    const priUser = await Primary.findById(userId);
    if (!priUser) {
      return res.status(404).send("User not found.");
    }
    const isBlocked =await priUser.get("isBlocked");
  
    if (isBlocked) {
      res.cookie("jwt_primary", "", {
        httpOnly: true,
        expires: new Date(0),
      });
  
      return res
        .status(403)
        .json({ message: "User is blocked and cannot access this resource.",is_blocked:isBlocked });
      // return res.redirect('/pUsers/login'); 
    }

    next();
  } catch (error) {
    console.error("Error in userIsBlocked middleware:", error);
    res.status(500).send("Internal Server Error");
  }
};


export const secondaryIsBlocked = async (req, res, next) => {

  console.log("haiiooo");
    try {

      // console.log("haiiiiiyyyyy");
      const userId = req.sUserId;

      const secUser = await Secondary.findById(userId);

     
      if (!secUser) {
        return res.status(404).send("User not found.");
      }
      
      const isBlocked = secUser.get('isBlocked');
      console.log("isBlocked:", isBlocked); // Add this line to check isBlocked
      if (isBlocked) {
        res.cookie("jwt_secondary", "", {
          httpOnly: true,
          expires: new Date(0),
        });
        return res
          .status(403)
          .json({ message: "User is blocked and cannot access this resource.",is_blocked:isBlocked });
      }
  
      next();
    } catch (error) {
      console.error("Error in userIsBlocked middleware:", error);
      res.status(500).send("Internal Server Error");
    }
  };
