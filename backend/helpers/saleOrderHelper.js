import productModel from "../models/productModel.js";
import OragnizationModel from "../models/OragnizationModel.js";
import { truncateToNDecimals } from "./helper.js";

// Helper to fetch last invoice and calculate the serial number
export const fetchLastInvoice = async (model, session) => {
  const lastInvoice = await model
    .findOne({}, {}, { sort: { serialNumber: -1 } })
    .session(session);
  return lastInvoice ? lastInvoice.serialNumber + 1 : 1;
};

// Helper to update item stock and calculate prices and taxes
export const updateItemStockAndCalculatePrice = async (
  item,
  priceLevelFromRedux,
  session
) => {
  // const selectedPriceLevel = item.Priceleveles.find(
  //   (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
  // );

  const selectedPrice = item?.selectedPriceRate || 0;
  let totalPrice = selectedPrice * (item.count || 1) || 0;

  const itemCount = parseFloat(item.count);
  const product = await productModel.findById(item._id).session(session);
  if (!product) throw new Error(`Product with ID ${item._id} not found`);

  const productBalanceStock = parseFloat(product.balance_stock) || 0;
  const newBalanceStock = truncateToNDecimals(
    productBalanceStock - itemCount,
    3
  );

  await productModel.updateOne(
    { _id: product._id },
    { $set: { balance_stock: newBalanceStock } },
    { session }
  );

  // Calculate taxes
  const { 
    cgst = 0, 
    sgst = 0, 
    igst = 0, 
    cess = 0,          // Added cess percentage
    addl_cess = 0,     // Added additional cess per unit
    isTaxInclusive = false 
  } = item;
  
  let basePrice = totalPrice;
  let cgstAmt = 0;
  let sgstAmt = 0;
  let igstAmt = 0;
  let cessAmt = 0;      // Added cess amount
  let addl_cessAmt = 0; // Added additional cess amount
  let subTotal = 0;     // after discount

  if (isTaxInclusive) {
    const totalTaxPercentage = igst / 100;
    basePrice = totalPrice / (1 + totalTaxPercentage);

    // Discount calculation
    let priceAfterDiscount = basePrice;
    if (item.discount || item.discountPercentage) {
      priceAfterDiscount = basePrice - item.discount;
    }

    // Calculate the tax amounts
    cgstAmt = (priceAfterDiscount * cgst) / 100;
    sgstAmt = (priceAfterDiscount * sgst) / 100;
    igstAmt = (priceAfterDiscount * igst) / 100;
    
    // Calculate cess amount based on price after discount
    cessAmt = (priceAfterDiscount * cess) / 100;
    
    // Calculate additional cess amount based on quantity
    addl_cessAmt = itemCount * addl_cess;
    
    subTotal = priceAfterDiscount;
  } else {
    // Discount calculation
    let priceAfterDiscount = basePrice;
    if (item.discount || item.discountPercentage) {
      priceAfterDiscount = totalPrice - item.discount;
    }

    cgstAmt = (priceAfterDiscount * cgst) / 100;
    sgstAmt = (priceAfterDiscount * sgst) / 100;
    igstAmt = (priceAfterDiscount * igst) / 100;
    
    // Calculate cess amount based on price after discount
    cessAmt = (priceAfterDiscount * cess) / 100;
    
    // Calculate additional cess amount based on quantity
    addl_cessAmt = itemCount * addl_cess;
    
    subTotal = priceAfterDiscount;
  }

  return {
    ...item,
    selectedPrice,
    cgstAmt: parseFloat(cgstAmt.toFixed(2)),
    sgstAmt: parseFloat(sgstAmt.toFixed(2)),
    igstAmt: parseFloat(igstAmt.toFixed(2)),
    cessAmt: parseFloat(cessAmt.toFixed(2)),         // Added cess amount
    addl_cessAmt: parseFloat(addl_cessAmt.toFixed(2)), // Added additional cess amount
    subTotal: parseFloat((subTotal || 0).toFixed(2)),
  };
};

// Helper to calculate additional charges with taxes
export const calculateAdditionalCharges = (additionalChargesFromRedux) => {
  return additionalChargesFromRedux.map((charge) => {
    const { value, taxPercentage } = charge;
    const taxAmt = (parseFloat(value) * parseFloat(taxPercentage)) / 100;
    return { ...charge, taxAmt };
  });
};

// Helper to update secondary user configurations
export const updateSecondaryUserConfiguration = async (
  secondaryUser,
  orgId,
  session
) => {
  let orderConfig = false;

  const configuration = secondaryUser.configurations.find(
    (config) => config.organization.toString() === orgId
  );

  if (configuration) {
    orderConfig = true;
  }

  if (orderConfig) {
    secondaryUser.configurations = secondaryUser.configurations.map(
      (config) => {
        if (config.organization.toString() === orgId) {
          return { ...config, orderNumber: (config.orderNumber || 0) + 1 };
        }
        return config;
      }
    );
    await secondaryUser.save({ session });
  } else {
    await OragnizationModel.findByIdAndUpdate(
      orgId,
      { $inc: { orderNumber: 1 } },
      { new: true, session }
    );
  }
};

// Helper to revert stock changes from the original invoice
export const revertStockChanges = async (invoice, session) => {
  for (const item of invoice.items) {
    const product = await productModel.findById(item._id).session(session);
    if (!product) {
      throw new Error(`Product with ID ${item._id} not found`);
    }

    const newBalanceStock = truncateToNDecimals(
      parseFloat(product.balance_stock) + parseFloat(item.count),
      3
    );

    await productModel.updateOne(
      { _id: product._id },
      { $set: { balance_stock: newBalanceStock } },
      { session }
    );
  }
};
