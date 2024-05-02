import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import BankDetailsModel from "../models/bankModel.js";
import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import AdditionalCharges from "../models/additionalChargesModel.js";
import invoiceModel from "../models/invoiceModel.js";
import salesModel from "../models/salesModel.js";

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

    const { Primary_user_id, cmp_id } = bankDetailsArray[0];

    await BankDetailsModel.deleteMany({ Primary_user_id, cmp_id });

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

// @desc for saving products to tally
// route GET/api/tally/giveTransaction

export const saveProductsFromTally = async (req, res) => {
  try {
    // console.log("body", req.body);
    const productsToSave = req?.body?.data;

    // Extract primary user id and company id from the first product
    const { Primary_user_id, cmp_id } = productsToSave[0];

    // Delete existing documents with the same primary user id and company id
    await productModel.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each product to save
    const savedProducts = await Promise.all(
      productsToSave.map(async (productItem) => {
        // Check if the product already exists
        const existingProduct = await productModel.findOne({
          cmp_id: productItem.cmp_id,
          product_name: productItem.product_name,
          Primary_user_id: productItem.Primary_user_id,
        });

        console.log("existingProduct", existingProduct);

        // If the product doesn't exist, create a new one; otherwise, update it
        if (!existingProduct) {
          const newProduct = new productModel(productItem);
          return await newProduct.save();
        } else {
          // Update the existing product
          return await productModel.findOneAndUpdate(
            {
              cmp_id: productItem.cmp_id,
              product_name: productItem.product_name,
              Primary_user_id: productItem.Primary_user_id,
            },
            productItem,
            { new: true }
          );
        }
      })
    );

    res
      .status(201)
      .json({ message: "Products saved successfully", savedProducts });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for saving parties/costumers from tally
// route GET/api/tally/giveTransaction

export const savePartyFromTally = async (req, res) => {
  try {
    // console.log("body", req.body);
    const partyToSave = req?.body?.data;

    // Check if partyToSave is defined and has elements
    if (!partyToSave || partyToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract primary user id and company id from the first product
    const { Primary_user_id, cmp_id } = partyToSave[0];

    // Delete existing documents with the same primary user id and company id
    await partyModel.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each product to save
    const savedParty = await Promise.all(
      partyToSave.map(async (party) => {
        // Check if the product already exists
        const existingParty = await partyModel.findOne({
          cmp_id: party.cmp_id,
          partyName: party.partyName,
          Primary_user_id: party.Primary_user_id,
        });

        console.log("existingParty", existingParty);

        // If the product doesn't exist, create a new one; otherwise, update it
        if (!existingParty) {
          const newParty = new partyModel(party);
          return await newParty.save();
        } else {
          // Update the existing product
          return await partyModel.findOneAndUpdate(
            {
              cmp_id: party.cmp_id,
              partyName: party.partyName,
              Primary_user_id: party.Primary_user_id,
            },
            party,
            { new: true }
          );
        }
      })
    );

    res.status(201).json({ message: "Party saved successfully", savedParty });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for saving additionalCharges from tally
// route GET/api/tally/giveTransaction

export const saveAdditionalChargesFromTally = async (req, res) => {
  try {
    const additionalChargesToSave = req?.body?.data;

    // Check if additionalChargesToSave is defined and has elements
    if (!additionalChargesToSave || additionalChargesToSave.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    // Extract primary user id and company id from the first additional charge
    const { Primary_user_id, cmp_id } = additionalChargesToSave[0];

    // Delete existing documents with the same primary user id and company id
    await AdditionalCharges.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each additional charge to save
    const savedAdditionalCharges = await Promise.all(
      additionalChargesToSave.map(async (charge) => {
        // Check if the additional charge already exists
        const existingCharge = await AdditionalCharges.findOne({
          cmp_id: charge.cmp_id,
          name: charge.name,
          Primary_user_id: charge.Primary_user_id,
        });

        // If the additional charge doesn't exist, create a new one; otherwise, update it
        if (!existingCharge) {
          const newCharge = new AdditionalCharges(charge);
          return await newCharge.save();
        } else {
          // Update the existing additional charge
          return await AdditionalCharges.findOneAndUpdate(
            {
              cmp_id: charge.cmp_id,
              name: charge.name,
              Primary_user_id: charge.Primary_user_id,
            },
            charge,
            { new: true }
          );
        }
      })
    );

    res.status(201).json({
      message: "Additional charges saved successfully",
      savedAdditionalCharges,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc for giving invoices to tally
// route GET/api/tally/giveInvoice

export const giveInvoice = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  try {
    const invoices = await invoiceModel.find({
      cmp_id: cmp_id,
      serialNumber: { $gt: serialNumber }, // Assuming serialNumber is the correct field name
    });
    if (invoices.length > 0) {
      return res.status(200).json({
        message: "Orders fetched",
        data: invoices,
      
      });
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });``
  }
};

// @desc for giving sales to tally
// route GET/api/tally/giveSales

export const giveSales = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo; // Assuming SNo is the correct parameter name for serial number

  try {
    const sales = await salesModel.find({
      cmp_id: cmp_id,
      serialNumber: { $gt: serialNumber }, // Assuming serialNumber is the correct field name in your sales schema
    });
    if (sales.length > 0) {
      return res.status(200).json({
        message: "Sales fetched",
        data: sales,
      });
    } else {
      return res.status(404).json({ message: "Sales not found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
