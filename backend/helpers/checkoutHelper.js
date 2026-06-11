import mongoose from "mongoose";
import receiptModel from "../models/receiptModel.js";
import TallyData from "../models/TallyData.js";
import Settlement from "../models/settlementModel.js";
import Party from "../models/partyModel.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";

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
  if (paymentMode === "credit") {
    console.log("[Receipt] credit mode → no receipts or settlements created");
    return { hotelReceipts: [], restaurantReceipts: [], settlements: [] };
  }

  const allHotelReceipts = [];
  const allRestaurantReceipts = [];
  const allSettlements = [];

  let roomSources = [];
  let foodSources = [];

  if (paymentMode === "single") {
    const cashAmt = Number(paymentDetails?.cashAmount || 0);
    const onlineAmt = Number(paymentDetails?.onlineAmount || 0);

    if (cashAmt > 0) {
      const e = {
        sourceId: paymentDetails?.selectedCash,
        sourceType: "cash",
        subsource: paymentDetails?.cashSubsource || "Cash",
        amount: cashAmt,
        isCreditType: false,
      };
      roomSources.push(e);
      foodSources.push({ ...e });
    }

    if (onlineAmt > 0) {
      const e = {
        sourceId: paymentDetails?.selectedBank,
        sourceType: "bank",
        subsource: paymentDetails?.bankSubsource || "Bank",
        amount: onlineAmt,
        isCreditType: false,
      };
      roomSources.push(e);
      foodSources.push({ ...e });
    }
  } else if (paymentMode === "split") {
    const splitDetails = paymentDetails?.splitDetails || [];

    for (const split of splitDetails) {
      const entry = {
        sourceId:
          split.sourceType === "credit"
            ? split.customer?._id || split.customer
            : split.source,
        sourceType: split.sourceType,
        subsource: split.subsource || split.sourceType,
        amount: Number(split.amount || 0),
        isCreditType: split.sourceType === "credit",
        customer: split.customer?._id || split.customer,
        customerName: split.customerName,
        underCategory: split.underCategory,
      };

      if (split.underCategory === "room") roomSources.push(entry);
      if (split.underCategory === "food") foodSources.push(entry);
    }
  }

  let hotelTallyPending = Number(hotelTallyData?.bill_pending_amt || 0);

  // ── HOTEL SIDE ────────────────────────────────────────────────────
  if (paymentMode === "single") {
    if (hotelTallyPending > 0) {
      for (const source of roomSources) {
        if (source.isCreditType) {
          console.log(`[Hotel] Credit ₹${source.amount} → stays outstanding`);
          continue;
        }

        const payAmount = Math.min(
          Number(source.amount || 0),
          hotelTallyPending,
        );
        if (payAmount <= 0) continue;

        const sourceParty = await Party.findOne({
          _id: source.sourceId,
        }).session(session);
        if (!sourceParty) {
          throw new Error(`Hotel source party not found: ${source.sourceId}`);
        }

        const receiptNum = await generateVoucherNumber(
          cmp_id,
          "receipt",
          specificVoucherSeries._id.toString(),
          session,
        );

        const [hotelReceipt] = await receiptModel.create(
          [
            {
              date: new Date(),
              voucherType: "receipt",
              receiptNumber: receiptNum.voucherNumber,
              series_id: specificVoucherSeries._id.toString(),
              usedSeriesNumber: receiptNum.usedSeriesNumber,
              serialNumber: receiptNum.usedSeriesNumber,
              Primary_user_id: req.pUserId || req.owner,
              Secondary_user_id: req.sUserId,
              cmp_id,
              party: buildPartyEmbedded(customerPartyData),
              billData: [
                {
                  _id: hotelTallyData._id,
                  bill_no: hotelSale.salesNumber,
                  billId: hotelSale._id,
                  bill_date: hotelTallyData.bill_date,
                  bill_pending_amt: hotelTallyPending,
                  source: "sales",
                  settledAmount: payAmount,
                  remainingAmount: hotelTallyPending - payAmount,
                },
              ],
              totalBillAmount: hotelTallyPending,
              enteredAmount: payAmount,
              advanceAmount: 0,
              remainingAmount: hotelTallyPending - payAmount,
              paymentMethod: mapSourceTypeToReceiptMethod(source.sourceType),
              paymentDetails: buildPaymentDetails(source, sourceParty),
              note: "",
              isCancelled: false,
            },
          ],
          { session },
        );

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
          sourceParty,
          source,
          payAmount,
          cmp_id,
          req,
          session,
        });

        allSettlements.push(hs);
      }
    }
  } else if (paymentMode === "split") {
    for (const source of roomSources) {
      if (source.isCreditType) {
        console.log(`[Hotel] Credit ₹${source.amount} → stays outstanding`);
        continue;
      }

      const payAmount = Number(source.amount || 0);
      if (payAmount <= 0) continue;

      const sourceParty = await Party.findOne({ _id: source.sourceId }).session(
        session,
      );
      if (!sourceParty) {
        throw new Error(`Hotel source party not found: ${source.sourceId}`);
      }

      const receiptNum = await generateVoucherNumber(
        cmp_id,
        "receipt",
        specificVoucherSeries._id.toString(),
        session,
      );

      const [hotelReceipt] = await receiptModel.create(
        [
          {
            date: new Date(),
            voucherType: "receipt",
            receiptNumber: receiptNum.voucherNumber,
            series_id: specificVoucherSeries._id.toString(),
            usedSeriesNumber: receiptNum.usedSeriesNumber,
            serialNumber: receiptNum.usedSeriesNumber,
            Primary_user_id: req.pUserId || req.owner,
            Secondary_user_id: req.sUserId,
            cmp_id,
            party: buildPartyEmbedded(customerPartyData),
            billData: [
              {
                _id: hotelTallyData._id,
                bill_no: hotelSale.salesNumber,
                billId: hotelSale._id,
                bill_date: hotelTallyData.bill_date,
                bill_pending_amt: payAmount,
                source: "sales",
                settledAmount: payAmount,
                remainingAmount: 0,
              },
            ],
            totalBillAmount: payAmount,
            enteredAmount: payAmount,
            advanceAmount: 0,
            remainingAmount: 0,
            paymentMethod: mapSourceTypeToReceiptMethod(source.sourceType),
            paymentDetails: buildPaymentDetails(source, sourceParty),
            note: "",
            isCancelled: false,
          },
        ],
        { session },
      );

      allHotelReceipts.push(hotelReceipt);

      const hs = await createSettlementForReceipt({
        receipt: hotelReceipt,
        partyDoc: customerPartyData,
        sourceParty,
        source,
        payAmount,
        cmp_id,
        req,
        session,
      });

      allSettlements.push(hs);
    }
  }

  // ── RESTAURANT SIDE ──────────────────────────────────────────────
  if (restaurantBaseSaleData.length > 0) {
    const restaurantSaleIds = restaurantBaseSaleData.map((s) => s._id);

    const restaurantTallies = await TallyData.find({
      billId: { $in: restaurantSaleIds },
      isCancelled: false,
    }).session(session);

    const tallyByBillId = new Map(
      restaurantTallies.map((t) => [t.billId.toString(), t]),
    );

    for (const sale of restaurantBaseSaleData) {
      const tally = tallyByBillId.get(sale._id.toString());
      if (!tally) continue;

      const saleAmount = Number(tally.bill_amount || sale.finalAmount || 0);

      let saleSplits = Array.isArray(sale.paymentSplittingData)
        ? sale.paymentSplittingData.map((s) => ({
            sourceId: s.sourceId || s.source || s.ref_id || null,
            sourceType: s.sourceType || s.type,
            subsource: s.subsource || s.sourceType || s.type,
            amount: Number(s.amount || 0),
            isCreditType: (s.sourceType || s.type) === "credit",
            customer: s.customer || null,
            customerName: s.customerName || null,
            underCategory: s.underCategory || "food",
          }))
        : [];

      saleSplits = saleSplits.filter((s) => Number(s.amount || 0) > 0);

      const nonCreditSaleSplits = saleSplits.filter((s) => !s.isCreditType);
      const creditSaleSplits = saleSplits.filter((s) => s.isCreditType);

      const settleNow = nonCreditSaleSplits.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0,
      );

      const creditAmount = creditSaleSplits.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0,
      );

      const cappedSettleNow = Math.min(saleAmount, settleNow);
      const pendingAfterReceipt = Math.max(0, saleAmount - cappedSettleNow);

      if (cappedSettleNow > 0) {
        let running = cappedSettleNow;
        const receiptPaymentSplits = [];

        for (const split of nonCreditSaleSplits) {
          if (running <= 0) break;

          const take = Math.min(running, Number(split.amount || 0));
          if (take <= 0) continue;

          receiptPaymentSplits.push({
            source: split.sourceId,
            sourceId: split.sourceId,
            sourceType: split.sourceType,
            subsource: split.subsource,
            amount: take,
          });

          running = parseFloat((running - take).toFixed(2));
        }

        const receiptNum = await generateVoucherNumber(
          cmp_id,
          "receipt",
          specificVoucherSeriesRestaurant._id.toString(),
          session,
        );

        const firstSplit = receiptPaymentSplits[0];
        const firstType = firstSplit?.sourceType;

        let restaurantPaymentDetails = null;

        if (firstSplit?.sourceId) {
          const firstSourceParty = await Party.findOne({
            _id: firstSplit.sourceId,
          }).session(session);

          if (!firstSourceParty) {
            throw new Error(
              `Restaurant first source party not found: ${firstSplit.sourceId}`,
            );
          }

          restaurantPaymentDetails = buildPaymentDetails(
            {
              sourceType: firstSplit.sourceType,
              subsource: firstSplit.subsource,
            },
            firstSourceParty,
          );
        }

        const [restReceipt] = await receiptModel.create(
          [
            {
              date: new Date(),
              voucherType: "receipt",
              receiptNumber: receiptNum.voucherNumber,
              series_id: specificVoucherSeriesRestaurant._id.toString(),
              usedSeriesNumber: receiptNum.usedSeriesNumber,
              serialNumber: receiptNum.usedSeriesNumber,
              Primary_user_id: req.pUserId || req.owner,
              Secondary_user_id: req.sUserId,
              cmp_id,
              party: buildPartyEmbedded(guestPartyData),
              billData: [
                {
                  _id: tally._id,
                  bill_no: sale.salesNumber,
                  billId: sale._id,
                  bill_date: tally.bill_date,
                  bill_pending_amt: saleAmount,
                  source: "sales",
                  settledAmount: cappedSettleNow,
                  remainingAmount: pendingAfterReceipt,
                },
              ],
              totalBillAmount: saleAmount,
              enteredAmount: cappedSettleNow,
              advanceAmount: 0,
              remainingAmount: pendingAfterReceipt,
              paymentMethod: mapSourceTypeToReceiptMethod(firstType),
              paymentDetails: restaurantPaymentDetails,
              paymentSplittingData: receiptPaymentSplits,
              note: "",
              isCancelled: false,
            },
          ],
          { session },
        );

        allRestaurantReceipts.push(restReceipt);

        for (const split of receiptPaymentSplits) {
          const sourceParty = await Party.findOne({
            _id: split.sourceId,
          }).session(session);

          if (!sourceParty) {
            throw new Error(
              `Source party not found for restaurant split source ${split.sourceId}`,
            );
          }

          const rs = await createSettlementForReceipt({
            receipt: restReceipt,
            partyDoc: guestPartyData,
            sourceParty,
            source: {
              sourceId: split.sourceId,
              sourceType: split.sourceType,
              subsource: split.subsource,
              amount: Number(split.amount || 0),
            },
            payAmount: Number(split.amount || 0),
            cmp_id,
            req,
            session,
          });

          allSettlements.push(rs);
        }
      }

      await TallyData.updateOne(
        { _id: tally._id },
        {
          $set: {
            bill_pending_amt: Math.max(0, pendingAfterReceipt - creditAmount),
          },
        },
        { session },
      );
    }
  }

  return {
    hotelReceipts: allHotelReceipts,
    restaurantReceipts: allRestaurantReceipts,
    settlements: allSettlements,
  };
};

const createSettlementForReceipt = async ({
  receipt,
  partyDoc,
  sourceParty,
  source,
  payAmount,
  cmp_id,
  req,
  session,
}) => {
  const settlementSourceType = source.sourceType === "cash" ? "cash" : "bank";

  const [settlement] = await Settlement.create(
    [
      {
        voucherNumber: receipt.receiptNumber,
        voucherId: receipt._id,
        voucherModel: "Receipt",
        voucherType: "receipt",
        amount: payAmount,
        payment_mode: source.sourceType,
        partyId: partyDoc._id,
        partyName: partyDoc.partyName,
        partyType: "party",
        sourceId: sourceParty._id,
        sourceType: settlementSourceType,
        cmp_id,
        Primary_user_id: req.pUserId || req.owner,
        settlement_date: new Date(),
        voucher_date: new Date(),
      },
    ],
    { session },
  );

  return settlement;
};

const mapSourceTypeToReceiptMethod = (sourceType) => {
  switch (sourceType) {
    case "cash":
      return "Cash";
    case "cheque":
      return "cheque";
    case "bank":
      return "Bank";
    case "upi":
      return "upi";
    case "card":
      return "card";
    case "credit":
      return "credit";
    default:
      return "Bank";
  }
};

const buildPartyEmbedded = (partyDoc) => ({
  _id: partyDoc._id,
  partyName: partyDoc.partyName || "",
  partyType: partyDoc.partyType || "party",
  accountGroupName:
    partyDoc.accountGroupName || partyDoc.accountGroup?.accountGroup || "",
  accountGroup_id:
    partyDoc.accountGroup_id ||
    partyDoc.accountGroup?._id ||
    partyDoc.accountGroup,
  subGroupName: partyDoc.subGroupName || null,
  subGroup_id: partyDoc.subGroup_id || null,
  mobileNumber: partyDoc.mobileNumber || "",
  country: partyDoc.country || "",
  state: partyDoc.state || "",
  pin: partyDoc.pin || "",
  emailID: partyDoc.emailID || "",
  gstNo: partyDoc.gstNo || "",
  party_master_id: partyDoc.party_master_id || partyDoc._id?.toString() || "",
  billingAddress: partyDoc.billingAddress || "",
  shippingAddress: partyDoc.shippingAddress || "",
});

const buildPaymentDetails = (source, sourceParty) => {
  const isCash = source.sourceType === "cash";
  return {
    _id: new mongoose.Types.ObjectId(),
    cash_ledname: isCash ? sourceParty?.partyName || "" : "",
    cash_name: isCash ? source.subsource || "" : "",
    cash_id: isCash ? sourceParty?._id || null : null,
    bank_ledname: !isCash ? sourceParty?.partyName || "" : "",
    bank_name: !isCash ? source.subsource || "" : "",
    bank_id: !isCash ? sourceParty?._id || null : null,
    chequeNumber: "",
    chequeDate: null,
  };
};