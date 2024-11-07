import TallyData from "../models/TallyData.js";
import TransactionModel from "../models/TransactionModel.js";
import BankDetailsModel from "../models/bankModel.js";
import CashModel from "../models/cashModel.js";

import partyModel from "../models/partyModel.js";
import productModel from "../models/productModel.js";
import AdditionalCharges from "../models/additionalChargesModel.js";
import receipt from "../models/receiptModel.js";
import { fetchData } from "../helpers/tallyHelper.js";

export const saveDataFromTally = async (req, res) => {
  try {
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
export const addCashData = async (req, res) => {
  try {
    const cashDetailsArray = req.body.cashdetails;

    const { Primary_user_id, cmp_id } = cashDetailsArray[0];

    await CashModel.deleteMany({ Primary_user_id, cmp_id });

    // Loop through each bank detail in the array
    for (const cashDetails of cashDetailsArray) {
      const {
        cmp_id,
        Primary_user_id,
        cash_ledname,
        cash_id,
        cash_grpname
      } = cashDetails;


      // Check if the same data already exists
      const existingData = await CashModel.findOne({
        cmp_id,
        Primary_user_id,
        cash_id,
      });

      if (existingData) {
        // If data exists, update the existing document
        const updatedData = await CashModel.findOneAndUpdate(
          {
            cmp_id,
            Primary_user_id,
            cash_id,
          },
          cashDetails,
          { new: true }
        );

        // console.log('Bank data updated:', updatedData);
      } else {
        // If data doesn't exist, create a new document
        const newCashData = await CashModel.create(cashDetails);

      }
    }

    return res.status(200).json({
      message: "Cash data added/updated successfully",
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
    const productsToSave = req?.body?.data;

    if (!productsToSave || !productsToSave.length) {
      return res.status(400).json({ message: "No products to save" });
    }

    const savedProducts = await Promise.all(
      productsToSave.map(async (productItem) => {
        const { Primary_user_id, cmp_id, product_master_id } = productItem;
        let savedProduct;

        try {
          if (product_master_id) {
            const existingProduct = await productModel.findOne({
              Primary_user_id,
              cmp_id,
              product_master_id,
            });



            if (existingProduct) {
            // console.log("existingProduct", existingProduct.product_name)

              // Update the existing product
              savedProduct = await productModel.findOneAndUpdate(
                {
                  Primary_user_id,
                  cmp_id,
                  product_master_id,
                },
                productItem,
                { new: true }
              );
            }
          }

          // If no existing product was found or updated, create a new one
          if (!savedProduct) {
            const newProduct = new productModel(productItem);
            savedProduct = await newProduct.save();
          }

          return savedProduct;
        } catch (error) {
          console.error(`Error saving product with product_master_id ${product_master_id}:`, error);
          return null; // Return null if there is an error to continue processing other products
        }
      })
    );

    // Filter out any null values from the savedProducts array
    const successfulSaves = savedProducts.filter((product) => product !== null);

    res.status(201).json({ message: "Products saved successfully", savedProducts: successfulSaves });
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


// // @desc for giving invoices to tally
// // route GET/api/tally/giveInvoice
export const giveInvoice = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('invoices', cmp_id, serialNumber, res);
};

// // @desc for giving sales to tally
// // route GET/api/tally/giveSales

export const giveSales = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('sales', cmp_id, serialNumber, res);
};

// // @desc for giving van sales to tally
// // route GET/api/tally/giveVanSales

export const giveVanSales = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('vanSales', cmp_id, serialNumber, res);
};

// @desc for giving transactions to tally
// route GET/api/tally/giveTransaction
export const giveTransaction = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('transactions', cmp_id, serialNumber, res);
};
// @desc for giving stock transactions to tally
// route GET/api/tally/getStockTransfers
export const getStockTransfers = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('stockTransfers', cmp_id, serialNumber, res);
};
export const giveReceipts = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('receipt', cmp_id, serialNumber, res);
};
export const givePayments = async (req, res) => {
  const cmp_id = req.params.cmp_id;
  const serialNumber = req.params.SNo;
  return fetchData('payment', cmp_id, serialNumber, res);
};
