import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import BankDetailsModel from "../models/bankModel.js";

export const saveDataFromTally = async (req, res) => {
  try {
    console.log("body", req.body);
    const dataToSave = await req.body.data;
      console.log("dataToSave", dataToSave);
    const { Primary_user_id, cmp_id } = dataToSave[0];

    await TallyData.deleteMany({ Primary_user_id, cmp_id });
  

    // Use Promise.all to parallelize document creation or update
    const savedData = await Promise.all(
      dataToSave.map(async (dataItem) => {
        // Use findOne to check if the document already exists
        const existingDocument = await TallyData.findOne({
          cmp_id: dataItem.cmp_id,
          bill_no: dataItem.bill_no,
          Primary_user_id: dataItem.Primary_user_id,
          party_id: dataItem.party_id,
        });

        // Use findOneAndUpdate to find an existing document based on some unique identifier
        const updatedDocument = await TallyData.findOneAndUpdate(
          {
            cmp_id: dataItem.cmp_id,
            bill_no: dataItem.bill_no,
            Primary_user_id: dataItem.Primary_user_id,
            party_id: dataItem.party_id,
          },
          dataItem,
          { upsert: true, new: true }
        );

        return updatedDocument;
      })
    );

    res.status(201).json({ message: "Data saved successfully", savedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for giving transactions to tally
// route GET/api/tally/giveTransaction

export const giveTransaction = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const SNo = req.params.SNo;

  console.log("SNo", SNo);
  try {
    const transactions = await TransactionModel.find({
      cmp_id: cmp_id,
      serialNumber: { $gt: SNo },
    });
    if (transactions.length > 0) {
      return res.status(200).json({
        message: "Transactions fetched",
        data: transactions,
      });
    } else {
      return res.status(404).json({ message: "Transactions not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// @desc for giving transactions to tally
// route GET/api/tally/giveTransaction

export const addBankData = async (req, res) => {
  try {
    const bankDetailsArray = req.body.bankdetails;

    // Loop through each bank detail in the array
    for (const bankDetail of bankDetailsArray) {
      const {
        cmp_id,
        Primary_user_id,
        bank_ledname,
        acholder_name,
        bank_id,
        ac_no,
        ifsc,
        swift_code,
        bank_name,
        branch,
        upi_id,
        bsr_code,
        client_code,
      } = bankDetail;

      console.log(bankDetail);

      // Check if the same data already exists
      const existingData = await BankDetailsModel.findOne({
        cmp_id,
        Primary_user_id,
        bank_ledname,
        acholder_name,
        bank_id,
        ac_no,
        ifsc,
        swift_code,
        bank_name,
        branch,
        upi_id,
        bsr_code,
        client_code,
      });

      if (existingData) {
        // If data exists, update the existing document
        const updatedData = await BankDetailsModel.findOneAndUpdate(
          {
            cmp_id,
            Primary_user_id,
            bank_ledname,
            acholder_name,
            bank_id,
            ac_no,
            ifsc,
            swift_code,
            bank_name,
            branch,
            upi_id,
            bsr_code,
            client_code,
          },
          bankDetail,
          { new: true }
        );

        // console.log('Bank data updated:', updatedData);
      } else {
        // If data doesn't exist, create a new document
        const newBankData = await BankDetailsModel.create(bankDetail);

        // console.log('Bank data added:', newBankData);
      }
    }

    return res.status(200).json({
      message: "Bank data added/updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
