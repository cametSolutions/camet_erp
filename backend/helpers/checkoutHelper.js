import mongoose from "mongoose";
import receiptModel from "../models/receiptModel.js";
import TallyData from "../models/TallyData.js";
import Settlement from "../models/settlementModel.js";
import Party from "../models/partyModel.js";
import salesModel from "../models/salesModel.js";
import { generateVoucherNumber } from "../helpers/voucherHelper.js";

export const createReceiptsAndSettlements = async ({
  paymentMode,
  paymentDetails,
  hotelSale,
  hotelTallyData,
  hotelSales = [],
  hotelTallyDataList = [],
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
    console.log("[Receipt] credit mode -> no receipts / settlements");
    return {
      hotelReceipts: [],
      restaurantReceipts: [],
      settlements: [],
    };
  }

  const allHotelReceipts = [];
  const allRestaurantReceipts = [];
  const allSettlements = [];

  let roomSources = [];
  let foodSources = [];

  // ------------------------------------------------------------
  // Build roomSources + foodSources from paymentDetails
  // ------------------------------------------------------------
  if (paymentMode === "single") {
    const cashAmt = Number(paymentDetails?.cashAmount || 0);
    const onlineAmt = Number(paymentDetails?.onlineAmount || 0);

    if (cashAmt > 0) {
      const cashEntry = {
        sourceId: paymentDetails?.selectedCash,
        sourceType: "cash",
        subsource: paymentDetails?.cashSubsource || "Cash",
        amount: cashAmt,
        isCreditType: false,
      };
      roomSources.push(cashEntry);
      foodSources.push({ ...cashEntry });
    }

    if (onlineAmt > 0) {
      const onlineType = normalizeSourceType(
        paymentDetails?.bankSubsource || "bank",
      );

      const onlineEntry = {
        sourceId: paymentDetails?.selectedBank,
        sourceType: onlineType || "bank",
        subsource: paymentDetails?.bankSubsource || "Bank",
        amount: onlineAmt,
        isCreditType: false,
      };
      roomSources.push(onlineEntry);
      foodSources.push({ ...onlineEntry });
    }
  } else if (paymentMode === "split") {
    const splitDetails = paymentDetails?.splitDetails || [];

    for (const split of splitDetails) {
      const normalizedType = normalizeSourceType(
        split.sourceType || split.type || split.subsource,
      );

      const entry = {
        sourceId:
          normalizedType === "credit"
            ? split.customer?._id || split.customer
            : split.source || split.sourceId || split.ref_id || split.refid,
        sourceType: normalizedType,
        subsource: split.subsource || normalizedType,
        amount: Number(split.amount || 0),
        isCreditType: normalizedType === "credit",
        customer: split.customer?._id || split.customer,
        customerName: split.customerName,
        underCategory: split.underCategory,
      };

      if (split.underCategory === "room") {
        roomSources.push(entry);
      } else if (split.underCategory === "food") {
        foodSources.push(entry);
      }
    }
  }

  const effectiveHotelSales = hotelSales.length
    ? hotelSales
    : hotelSale
      ? [hotelSale]
      : [];
  const effectiveHotelTallies = hotelTallyDataList.length
    ? hotelTallyDataList
    : hotelTallyData
      ? [hotelTallyData]
      : [];

  const hotelEntries =
    paymentMode === "split"
      ? effectiveHotelSales.flatMap((sale) => {
          const saleId = String(sale?._id || "");
          const matchingTallies = effectiveHotelTallies.filter(
            (tally) => String(tally?.billId || "") === saleId,
          );
          const roomSplits = (Array.isArray(sale?.paymentSplittingData)
            ? sale.paymentSplittingData
            : []
          ).filter((split) => split?.underCategory === "room");

          return roomSplits
            .map((split, index) => {
              if (isCreditSource(split)) return null;

              const pairedTally =
                matchingTallies[index] ||
                matchingTallies.find(
                  (tally) =>
                    String(tally?.party_id || "") ===
                    String(customerPartyData?._id || ""),
                ) ||
                matchingTallies[0] ||
                null;

              const remaining = Number(split?.amount || 0);

              if (!pairedTally || remaining <= 0) return null;

              return {
                sale,
                tally: pairedTally,
                remaining: Number(remaining.toFixed(2)),
              };
            })
            .filter(Boolean);
        })
      : effectiveHotelSales
          .map((sale) => {
            const saleId = String(sale?._id || "");
            const matchingTallies = effectiveHotelTallies.filter(
              (tally) => String(tally?.billId || "") === saleId,
            );
            const customerTallies = matchingTallies.filter(
              (tally) =>
                String(tally?.party_id || "") ===
                String(customerPartyData?._id || ""),
            );

            const preferredTally =
              customerTallies.find(
                (tally) => Number(tally?.bill_pending_amt || 0) > 0,
              ) ||
              customerTallies[0] ||
              matchingTallies.find(
                (tally) => Number(tally?.bill_pending_amt || 0) > 0,
              ) ||
              matchingTallies[0] ||
              (effectiveHotelSales.length === 1 &&
              effectiveHotelTallies.length === 1
                ? effectiveHotelTallies[0]
                : null);

            if (!preferredTally) return null;

            const tallyPending = Number(preferredTally?.bill_pending_amt || 0);
            const salePending = Number(sale?.finalAmount || 0);
            const remaining = tallyPending > 0 ? tallyPending : salePending;

            if (remaining <= 0) return null;

            return {
              sale,
              tally: preferredTally,
              remaining: Number(remaining.toFixed(2)),
            };
          })
          .filter(Boolean);

  // ------------------------------------------------------------
  // HOTEL RECEIPTS
  // ------------------------------------------------------------
  if (hotelEntries.length > 0) {
    let hotelEntryIndex = 0;

    for (const source of roomSources) {
      if (isCreditSource(source) || source?.isCreditType) continue;

      let remainingSourceAmount = Number(source.amount || 0);
      if (remainingSourceAmount <= 0) continue;

      const sourceParty = await Party.findOne({ _id: source.sourceId }).session(
        session,
      );
      if (!sourceParty) {
        throw new Error(`Hotel source party not found: ${source.sourceId}`);
      }

      while (
        remainingSourceAmount > 0 &&
        hotelEntryIndex < hotelEntries.length
      ) {
        const currentEntry = hotelEntries[hotelEntryIndex];

        if (!currentEntry || Number(currentEntry.remaining || 0) <= 0) {
          hotelEntryIndex += 1;
          continue;
        }

        const currentPending = Number(currentEntry.remaining || 0);
        const payAmount = Math.min(remainingSourceAmount, currentPending);

        if (payAmount <= 0) break;

        const nextPending = Number(
          Math.max(0, currentPending - payAmount).toFixed(2),
        );

        const receiptNum = await generateVoucherNumber(
          cmp_id,
          "receipt",
          specificVoucherSeries._id.toString(),
          session,
        );

        const receiptPayload = {
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
              _id: currentEntry.tally._id,
              bill_no: currentEntry.sale.salesNumber,
              billId: currentEntry.sale._id,
              bill_date: currentEntry.tally.bill_date,
              bill_pending_amt: currentPending,
              source: "sales",
              settledAmount: payAmount,
              remainingAmount: nextPending,
            },
          ],
          totalBillAmount: currentPending,
          enteredAmount: payAmount,
          advanceAmount: 0,
          remainingAmount: nextPending,
          paymentMethod: mapSourceTypeToReceiptMethod(source.sourceType),
          paymentDetails: buildPaymentDetails(source, sourceParty),
          note: "",
          isCancelled: false,
        };

        if (paymentMode === "split") {
          receiptPayload.paymentSplittingData = [
            {
              source: source.sourceId,
              sourceId: source.sourceId,
              sourceType: source.sourceType,
              subsource: source.subsource,
              amount: payAmount,
            },
          ];
        }

        const [hotelReceipt] = await receiptModel.create(
          [receiptPayload],
          { session },
        );

        allHotelReceipts.push(hotelReceipt);

        await TallyData.updateOne(
          { _id: currentEntry.tally._id },
          {
            $set: {
              bill_pending_amt: nextPending,
            },
          },
          { session },
        );

        currentEntry.remaining = nextPending;
        remainingSourceAmount = Number(
          Math.max(0, remainingSourceAmount - payAmount).toFixed(2),
        );

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

        if (currentEntry.remaining <= 0) {
          hotelEntryIndex += 1;
        }
      }
    }
  }

  // ------------------------------------------------------------
  // RESTAURANT RECEIPTS
  // One source per receipt
  // Example:
  // sale 90 + sale 438
  // food payment cash 500 + upi 28
  // => receipts: 90 cash, 410 cash, 28 upi
  // ------------------------------------------------------------
  if (restaurantBaseSaleData.length > 0) {
    const restaurantSaleIds = restaurantBaseSaleData.map((s) => s._id || s.id);

    const refreshedRestaurantSales = await salesModel
      .find({
        _id: { $in: restaurantSaleIds },
        isCancelled: false,
      })
      .sort({ createdAt: 1, _id: 1 })
      .session(session);

    const restaurantTallies = await TallyData.find({
      billId: { $in: restaurantSaleIds },
      isCancelled: false,
    }).session(session);

    const tallyByBillId = new Map(
      restaurantTallies.map((t) => [String(t.billId), t]),
    );

    for (const sale of refreshedRestaurantSales) {
      const saleId = String(sale._id);
      const tally = tallyByBillId.get(saleId);

      if (!tally) {
        console.log(`[Restaurant] No tally found for ${sale.salesNumber}`);
        continue;
      }

      const savedSaleSplits = Array.isArray(sale.paymentSplittingData)
        ? sale.paymentSplittingData
        : [];

      const allocations = savedSaleSplits.length
        ? savedSaleSplits
            .map((split) => ({
              sourceId:
                split.sourceId || split.source || split.ref_id || split.refid || null,
              sourceType: normalizeSourceType(
                split.type || split.sourceType || split.subsource,
              ),
              subsource: split.subsource || split.sourceType || "",
              amount: Number(split.amount || 0),
            }))
            .filter(
              (split) =>
                split.sourceId &&
                split.amount > 0 &&
                !isCreditSource(split),
            )
        : allocateFoodSplitsToSales(refreshedRestaurantSales, foodSources).get(
            saleId,
          ) || [];

      if (!allocations.length) {
        console.log(`[Restaurant] No allocation for ${sale.salesNumber}`);
        continue;
      }

      let remainingForSale = Number(sale.finalAmount || 0);

      for (const alloc of allocations) {
        if (remainingForSale <= 0) break;
        if (isCreditSource(alloc)) continue;

        const payAmount = Math.min(
          Number(alloc.amount || 0),
          remainingForSale,
        );

        if (payAmount <= 0) continue;
        if (!alloc.sourceId) {
          throw new Error(
            `Restaurant allocation missing sourceId for ${sale.salesNumber}`,
          );
        }

        const sourceParty = await Party.findOne({ _id: alloc.sourceId }).session(
          session,
        );
        if (!sourceParty) {
          throw new Error(
            `Restaurant source party not found: ${alloc.sourceId}`,
          );
        }

        const receiptNum = await generateVoucherNumber(
          cmp_id,
          "receipt",
          specificVoucherSeriesRestaurant._id.toString(),
          session,
        );

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
                  bill_pending_amt: remainingForSale,
                  source: "sales",
                  settledAmount: payAmount,
                  remainingAmount: Number(
                    (remainingForSale - payAmount).toFixed(2),
                  ),
                },
              ],
              totalBillAmount: remainingForSale,
              enteredAmount: payAmount,
              advanceAmount: 0,
              remainingAmount: Number(
                (remainingForSale - payAmount).toFixed(2),
              ),
              paymentMethod: mapSourceTypeToReceiptMethod(alloc.sourceType),
              paymentDetails: buildPaymentDetails(
                {
                  sourceType: alloc.sourceType,
                  subsource: alloc.subsource,
                },
                sourceParty,
              ),
              paymentSplittingData: [
                {
                  source: alloc.sourceId,
                  sourceId: alloc.sourceId,
                  sourceType: alloc.sourceType,
                  subsource: alloc.subsource,
                  amount: payAmount,
                },
              ],
              note: "",
              isCancelled: false,
            },
          ],
          { session },
        );

        allRestaurantReceipts.push(restReceipt);

        const rs = await createSettlementForReceipt({
          receipt: restReceipt,
          partyDoc: guestPartyData,
          sourceParty,
          source: {
            sourceId: alloc.sourceId,
            sourceType: alloc.sourceType,
            subsource: alloc.subsource,
            amount: payAmount,
          },
          payAmount,
          cmp_id,
          req,
          session,
        });

        allSettlements.push(rs);

        remainingForSale = Number((remainingForSale - payAmount).toFixed(2));

        await TallyData.updateOne(
          { _id: tally._id },
          {
            $set: {
              bill_pending_amt: remainingForSale,
            },
          },
          { session },
        );
      }

      console.log(
        `[Restaurant] ${sale.salesNumber} fully processed, pending=${remainingForSale}`,
      );
    }
  }

  return {
    hotelReceipts: allHotelReceipts,
    restaurantReceipts: allRestaurantReceipts,
    settlements: allSettlements,
  };
};

// ------------------------------------------------------------
// Helper: allocate food splits across sales in order
// Example:
// sales: [90, 438]
// splits: [cash 500, upi 28]
// result:
//  sale1 => cash 90
//  sale2 => cash 410, upi 28
// ------------------------------------------------------------
function allocateFoodSplitsToSales(sales, foodSplits) {
  const normalizedSplits = (foodSplits || [])
    .map((s) => ({
      sourceId: s.sourceId || s.source || s.ref_id || s.refid || null,
      sourceType: normalizeSourceType(s.sourceType || s.type || s.subsource),
      subsource: s.subsource || s.sourceType || "",
      amount: Number(s.amount || 0),
    }))
    .filter(
      (s) =>
        s.sourceId &&
        s.amount > 0 &&
        !isCreditSource(s) &&
        ["cash", "bank", "upi", "card", "credit", "cheque"].includes(
          s.sourceType,
        ),
    );

  const workingSplits = normalizedSplits.map((s) => ({ ...s }));
  const allocationsBySaleId = new Map();

  for (const sale of sales) {
    const saleId = String(sale._id);
    let remainingForSale = Number(sale.finalAmount || 0);
    const allocations = [];

    for (const split of workingSplits) {
      if (remainingForSale <= 0) break;
      if (split.amount <= 0) continue;

      const take = Math.min(split.amount, remainingForSale);

      allocations.push({
        sourceId: split.sourceId,
        sourceType: split.sourceType,
        subsource: split.subsource,
        amount: Number(take.toFixed(2)),
      });

      split.amount = Number((split.amount - take).toFixed(2));
      remainingForSale = Number((remainingForSale - take).toFixed(2));
    }

    allocationsBySaleId.set(saleId, allocations);
  }

  return allocationsBySaleId;
}

async function createSettlementForReceipt({
  receipt,
  partyDoc,
  sourceParty,
  source,
  payAmount,
  cmp_id,
  req,
  session,
}) {
  const existingSettlement = await Settlement.findOne({
    voucherId: receipt._id,
    voucherModel: "Receipt",
    voucherType: "receipt",
  }).session(session);

  if (existingSettlement) {
    return existingSettlement;
  }

  const settlementSourceType =
    normalizeSourceType(source.sourceType) === "cash" ? "cash" : "bank";

  const [settlement] = await Settlement.create(
    [
      {
        voucherNumber: receipt.receiptNumber,
        voucherId: receipt._id,
        voucherModel: "Receipt",
        voucherType: "receipt",
        amount: payAmount,
        payment_mode: normalizeSourceType(source.sourceType),
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
}

function isCreditSource(source) {
  const sourceType = normalizeSourceType(
    source?.type || source?.sourceType || source?.subsource || source,
  );

  return sourceType === "credit";
}

function normalizeSourceType(value) {
  const v = String(value || "").trim().toLowerCase();

  if (!v) return "";
  if (["cash", "cash1", "cash2"].includes(v)) return "cash";
  if (["bank", "online", "sbi", "federal", "canara", "hdfc", "icici"].includes(v))
    return "bank";
  if (["upi", "phonepe", "phonepay", "gpay", "googlepay", "paytm"].includes(v))
    return "upi";
  if (["card", "creditcard", "debitcard"].includes(v)) return "card";
  if (["credit"].includes(v)) return "credit";
  if (["cheque", "check"].includes(v)) return "cheque";

  return "";
}

function mapSourceTypeToReceiptMethod(sourceType) {
  switch (normalizeSourceType(sourceType)) {
    case "cash":
      return "Cash";
    case "cheque":
      return "Cheque";
    case "bank":
      return "bank";
    case "upi":
      return "upi";
    case "card":
      return "card";
    case "credit":
      return "credit";
    default:
      return "bank";
  }
}

function buildPartyEmbedded(partyDoc) {
  return {
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
  };
}

function buildPaymentDetails(source, sourceParty) {
  const normalizedType = normalizeSourceType(source.sourceType);
  const isCash = normalizedType === "cash";

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
}
