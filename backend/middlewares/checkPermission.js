// middleware/checkPermission.js

import SecondaryUser from "../models/secondaryUserModel.js";

export const checkPermission = (...keys) => {
    return async (req,res,next)=>{

        const user = await SecondaryUser.findById(req.userId);

        if(!user){
            return res.status(401).json({
                message:"Unauthorized"
            });
        }

        if(user.role==="admin"){
            return next();
        }

        const allowed = keys.every(key=>user.permissions.get(key));

        if(!allowed){
            return res.status(403).json({
                message:"Permission Denied"
            });
        }

        next();

    }
}