import OragnizationModel from "../models/OragnizationModel";

export const companyAuthentication = async (req, res, next) => {
    const cmp_id = req.params.cmp_id;
    try {
        const companyData = await OragnizationModel.findById(cmp_id);
        if (companyData.isBlocked == false) {
            next();
        } else {
            res.status(403).json({ message: "This company is restricted" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
