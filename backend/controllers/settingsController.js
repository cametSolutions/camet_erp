import OragnizationModel from "../models/OragnizationModel.js";

/**
 * @desc  add email configuration for a company
 * @route POST/api/settings/addEmailConfiguration/:cmp_id
 * @access Private
 */
export const addEmailConfiguration = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  try {
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const emailConfiguration = req.body;
    company.configurations[0].emailConfiguration = emailConfiguration;
    const save = await company.save();
    return res.status(200).json({
      success: true,
      message: "Email configuration saved successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

/**
 * @desc get configuration of a company
 * @route GET/api/settings/getConfiguration/:cmp_id?selectedConfiguration=
 * @access Private
 */
export const getConfiguration = async (req, res) => {
  const selectedConfiguration = req.query.selectedConfiguration;
  const cmp_id = req.params.cmp_id;
  try {
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    const configuration = company.configurations[0];
    if (!configuration) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    const dataToSend = configuration[selectedConfiguration];

    return res
      .status(200)
      .json({ message: "Configuration fetched", data: dataToSend });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error, try again!" });
  }
};

