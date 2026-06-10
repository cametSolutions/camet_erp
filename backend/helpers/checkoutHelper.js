/// testing 

import mongoose from "mongoose";
import receiptModel from "../models/receiptModel.js";
import TallyData from "../models/TallyData.js";
import Settlement from "../models/settlementModel.js";
import Party from "../models/partyModel.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";

/**
 * createReceiptsAndSettlements
 *
 * Master function called after the for loop in convertCheckOutToSale.
 * Handles all receipt + settlement + tally update logic for checkout.
 *
 * MODES:
 *   "credit" → No receipt, no settlement. Tallies stay outstanding.
 *   "single" → One cash or bank source fills hotel + restaurant tallies.
 *   "split"  → underCategory=room fills hotel tally.
 *              underCategory=food fills restaurant tallies.
 *              sourceType=credit inside split → skip, tally stays outstanding.
 *
 * SEQUENTIAL FILL:
 *   Each source fills tallies one by one until source amount is exhausted.
 *   One (source × tally) = one Receipt + one Settlement.
 *   Example: upi=1000 fills RES-999(638) fully, then partially fills RES-1000(362).
 *
 * PARTY ON RECEIPTS:
 *   Hotel receipts      → customerPartyData (room payer / agent)
 *   Restaurant receipts → guestPartyData    (physical guest who ate)
 */
export const createReceiptsAndSettlements = async ({
  paymentMode,
  paymentDetails,
  hotelSale,
  hotelTallyData,
  restaurantBaseSaleData = [],
  customerPartyData,
  guestPartyData,
  cmp_id,
  specificVoucherSeries,
  specificVoucherSeriesRestaurant,
  req,
  session,
}) => {

  // ── CREDIT MODE: nothing to do ───────────────────────────────────────────
  if (paymentMode === "credit") {
    console.log("[Receipt] credit mode → no receipts or settlements created");
    return { hotelReceipts: [], restaurantReceipts: [], settlements: [] };
  }

  const allHotelReceipts      = [];
  const allRestaurantReceipts = [];
  const allSettlements        = [];

  // ── BUILD SOURCE ARRAYS ──────────────────────────────────────────────────
  let roomSources = [];
  let foodSources = [];

  if (paymentMode === "single") {
    const cashAmt   = Number(paymentDetails?.cashAmount   || 0);
    const onlineAmt = Number(paymentDetails?.onlineAmount || 0);

    if (cashAmt > 0) {
      const e = {
        sourceId:     paymentDetails?.selectedCash,
        sourceType:   "cash",
        subsource:    paymentDetails?.cashSubsource || "Cash",
        amount:       cashAmt,
        isCreditType: false,
      };
      roomSources.push(e);
      foodSources.push({ ...e });
    }

    if (onlineAmt > 0) {
      const e = {
        sourceId:     paymentDetails?.selectedBank,
        sourceType:   "bank",
        subsource:    paymentDetails?.bankSubsource || "Bank",
        amount:       onlineAmt,
        isCreditType: false,
      };
      roomSources.push(e);
      foodSources.push({ ...e });
    }

  } else if (paymentMode === "split") {
    const splitDetails = paymentDetails?.splitDetails || [];
    console.log("splitDetails", splitDetails);

    for (const split of splitDetails) {
      const entry = {
        sourceId:     split.source,
        sourceType:   split.sourceType,
        subsource:    split.subsource || split.sourceType,
        amount:       Number(split.amount || 0),
        isCreditType: split.sourceType === "credit",
        customer:     split.customer,
        customerName: split.customerName,
      };
      if (split.underCategory === "room") roomSources.push(entry);
      if (split.underCategory === "food") foodSources.push(entry);
    }
  }

  // ── HOTEL SIDE ───────────────────────────────────────────────────────────
  // Split mode: hotelTallyData.bill_pending_amt = 0 → skip entirely
  // Single mode: pending = full amount → create one receipt

  let hotelTallyPending = Number(hotelTallyData?.bill_pending_amt || 0);

    console.log("hotelTallyPending", hotelTallyPending);

  if (hotelTallyPending > 0) {
    for (const source of roomSources) {

      if (source.isCreditType) {
        console.log(`[Hotel] Credit ₹${source.amount} → stays outstanding`);
        hotelTallyPending = Math.max(0, hotelTallyPending - source.amount);
        continue;
      }

      const payAmount = Math.min(source.amount, hotelTallyPending);
      if (payAmount <= 0) continue;

      const sourceParty = await Party.findOne({ _id: source.sourceId }).session(session);

      const receiptNum = await generateVoucherNumber(
        cmp_id, "receipt", specificVoucherSeries._id.toString(), session,
      );

      const [hotelReceipt] = await receiptModel.create([{
        date:              new Date(),
        voucherType:       "receipt",
        receiptNumber:     receiptNum.voucherNumber,
        series_id:         specificVoucherSeries._id.toString(),
        usedSeriesNumber:  receiptNum.usedSeriesNumber,
        serialNumber:      receiptNum.usedSeriesNumber,
        Primary_user_id:   req.pUserId || req.owner,
        Secondary_user_id: req.sUserId,
        cmp_id,
        party: buildPartyEmbedded(customerPartyData),
        billData: [{
          _id:              hotelTallyData._id,
          bill_no:          hotelSale.salesNumber,
          billId:           hotelSale._id,
          bill_date:        hotelTallyData.bill_date,
          bill_pending_amt: hotelTallyPending,
          source:           "sales",
          settledAmount:    payAmount,
          remainingAmount:  hotelTallyPending - payAmount,
        }],
        totalBillAmount: hotelTallyPending,
        enteredAmount:   payAmount,
        advanceAmount:   0,
        remainingAmount: hotelTallyPending - payAmount,
        paymentMethod:   mapSourceTypeToReceiptMethod(source.sourceType),
        paymentDetails:  buildPaymentDetails(source, sourceParty),
        note:            "",
        isCancelled:     false,
      }], { session });

      allHotelReceipts.push(hotelReceipt);

      await TallyData.updateOne(
        { _id: hotelTallyData._id },
        { $inc: { bill_pending_amt: -payAmount } },
        { session },
      );

      hotelTallyPending -= payAmount;

      const hs = await createSettlementForReceipt({
        receipt: hotelReceipt,
        partyDoc: customerPartyData,
        sourceParty, source, payAmount, cmp_id, req, session,
      });
      allSettlements.push(hs);

      console.log(`[Hotel] Receipt: ${hotelReceipt.receiptNumber} | ₹${payAmount} | ${source.subsource}`);
    }
  } else {
    console.log("[Hotel] bill_pending_amt = 0 → split mode, no hotel receipt needed");
  }

  // ── RESTAURANT SIDE ──────────────────────────────────────────────────────
  // ONE receipt per restaurant sale covering ALL non-credit splits
  // Credit splits → skip receipt, keep pending as credit amount


  if (restaurantBaseSaleData.length > 0) {

    const restaurantSaleIds = restaurantBaseSaleData.map((s) => s._id);

    const restaurantTallies = await TallyData.find({
      billId:      { $in: restaurantSaleIds },
      isCancelled: false,
    }).session(session);

    const tallyByBillId = new Map(
      restaurantTallies.map((t) => [t.billId.toString(), t]),
    );

    for (const sale of restaurantBaseSaleData) {

      const tally = tallyByBillId.get(sale._id.toString());
      if (!tally) {
        console.warn(`[Restaurant] No tally for sale ${sale._id} — skipped`);
        continue;
      }

      const saleSplits      = sale.paymentSplittingData || [];
      const nonCreditSplits = saleSplits.filter((s) => s.type !== "credit");
      const creditSplits    = saleSplits.filter((s) => s.type === "credit");

      const creditAmount  = creditSplits.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      const receiptAmount = nonCreditSplits.reduce((sum, s) => sum + Number(s.amount || 0), 0);

      if (nonCreditSplits.length === 0) {
        console.log(`[Restaurant] Sale ${sale.salesNumber} fully credit → no receipt`);
        continue;
      }

      const receiptNum = await generateVoucherNumber(
        cmp_id,
        "receipt",
        specificVoucherSeriesRestaurant._id.toString(),
        session,
      );

      const tallyPending = Number(tally.bill_pending_amt || 0);

      const [restReceipt] = await receiptModel.create([{
        date:              new Date(),
        voucherType:       "receipt",
        receiptNumber:     receiptNum.voucherNumber,
        series_id:         specificVoucherSeriesRestaurant._id.toString(),
        usedSeriesNumber:  receiptNum.usedSeriesNumber,
        serialNumber:      receiptNum.usedSeriesNumber,
        Primary_user_id:   req.pUserId || req.owner,
        Secondary_user_id: req.sUserId,
        cmp_id,
        party: buildPartyEmbedded(guestPartyData),
        billData: [{
          _id:              tally._id,
          bill_no:          sale.salesNumber,
          billId:           sale._id,
          bill_date:        tally.bill_date,
          bill_pending_amt: tallyPending,
          source:           "sales",
          settledAmount:    receiptAmount,
          remainingAmount:  tallyPending - receiptAmount,
        }],
        totalBillAmount:  tallyPending,
        enteredAmount:    receiptAmount,
        advanceAmount:    0,
        remainingAmount:  tallyPending - receiptAmount,
        paymentMethod:    nonCreditSplits.length > 1
                            ? "mixed"
                            : mapSourceTypeToReceiptMethod(nonCreditSplits[0].sourceType),
        paymentDetails:   nonCreditSplits,
        note:             "",
        isCancelled:      false,
      }], { session });

      allRestaurantReceipts.push(restReceipt);

      for (const split of nonCreditSplits) {
        const sourceParty = await Party.findOne({ _id: split.source }).session(session);

        const rs = await createSettlementForReceipt({
          receipt:  restReceipt,
          partyDoc: guestPartyData,
          sourceParty,
          source: {
            sourceId:   split.source,
            sourceType: split.type,
            subsource:  split.subsource,
            amount:     Number(split.amount || 0),
          },
          payAmount: Number(split.amount || 0),
          cmp_id,
          req,
          session,
        });
        allSettlements.push(rs);
      }

      await TallyData.updateOne(
        { _id: tally._id },
        { $set: { bill_pending_amt: creditAmount } },
        { session },
      );

      console.log(
        `[Restaurant] Receipt: ${restReceipt.receiptNumber} | Sale: ${sale.salesNumber} | ₹${receiptAmount} | pending left: ${creditAmount}`,
      );
    }
  }

  console.log(
    `[Done] Hotel: ${allHotelReceipts.length} receipts | Restaurant: ${allRestaurantReceipts.length} receipts | Settlements: ${allSettlements.length}`,
  );

  return {
    hotelReceipts:      allHotelReceipts,
    restaurantReceipts: allRestaurantReceipts,
    settlements:        allSettlements,
  };
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPER: createSettlementForReceipt
// Creates one Settlement document pointing to a Receipt.
// voucherModel = "Receipt" | voucherType = "receipt" | voucherId = receipt._id
// ─────────────────────────────────────────────────────────────────────────────
const createSettlementForReceipt = async ({
  receipt, partyDoc, sourceParty, source, payAmount, cmp_id, req, session,
}) => {
  // Settlement schema sourceType enum = "cash" | "bank"
  // upi / card → "bank" since they go through bank accounts
  const settlementSourceType = source.sourceType === "cash" ? "cash" : "bank";

  const [settlement] = await Settlement.create([{
    voucherNumber:   receipt.receiptNumber,
    voucherId:       receipt._id,
    voucherModel:    "Receipt",
    voucherType:     "receipt",
    amount:          payAmount,
    payment_mode:    source.sourceType,    // Keep original: "upi","card","cash","bank"
    partyId:         partyDoc._id,
    partyName:       partyDoc.partyName,
    partyType:       "party",
    sourceId:        sourceParty._id,
    sourceType:      settlementSourceType,
    cmp_id,
    Primary_user_id: req.pUserId || req.owner,
    settlement_date: new Date(),
    voucher_date:    new Date(),
  }], { session });

  return settlement;
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPER: mapSourceTypeToReceiptMethod
// Maps sourceType → receipt schema paymentMethod enum
// Enum values: "Online" | "Cash" | "Cheque"
// ─────────────────────────────────────────────────────────────────────────────
const mapSourceTypeToReceiptMethod = (sourceType) => {
  switch (sourceType) {
    case "cash":   return "Cash";
    case "cheque": return "Cheque";
    case "bank":
    case "upi":
    case "card":
    default:       return "Online";
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPER: buildPartyEmbedded
// Builds the embedded party sub-document for receipt schema.
// Handles both populated accountGroup object and flat string cases.
// ─────────────────────────────────────────────────────────────────────────────
const buildPartyEmbedded = (partyDoc) => ({
  _id:              partyDoc._id,
  partyName:        partyDoc.partyName        || "",
  partyType:        partyDoc.partyType        || "party",
  accountGroupName: partyDoc.accountGroupName || partyDoc.accountGroup?.accountGroup || "",
  accountGroup_id:  partyDoc.accountGroup_id  || partyDoc.accountGroup?._id          || partyDoc.accountGroup,
  subGroupName:     partyDoc.subGroupName     || null,
  subGroup_id:      partyDoc.subGroup_id      || null,
  mobileNumber:     partyDoc.mobileNumber     || "",
  country:          partyDoc.country          || "",
  state:            partyDoc.state            || "",
  pin:              partyDoc.pin              || "",
  emailID:          partyDoc.emailID          || "",
  gstNo:            partyDoc.gstNo            || "",
  party_master_id:  partyDoc.party_master_id  || partyDoc._id?.toString() || "",
  billingAddress:   partyDoc.billingAddress   || "",
  shippingAddress:  partyDoc.shippingAddress  || "",
});


// ─────────────────────────────────────────────────────────────────────────────
// HELPER: buildPaymentDetails
// Populates cash_id for cash source, bank_id for bank/upi/card source.
// ─────────────────────────────────────────────────────────────────────────────
const buildPaymentDetails = (source, sourceParty) => {
  const isCash = source.sourceType === "cash";
  return {
    _id:          new mongoose.Types.ObjectId(),
    cash_ledname: isCash  ? sourceParty?.partyName || "" : "",
    cash_name:    isCash  ? source.subsource       || "" : "",
    cash_id:      isCash  ? sourceParty?._id       || null : null,
    bank_ledname: !isCash ? sourceParty?.partyName || "" : "",
    bank_name:    !isCash ? source.subsource       || "" : "",
    bank_id:      !isCash ? sourceParty?._id       || null : null,
    chequeNumber: "",
    chequeDate:   null,
  };
};