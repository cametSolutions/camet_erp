const round2 = (n) => Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;

const normalizeUTCDate = (d) => {
  const nd = new Date(d);
  return new Date(Date.UTC(nd.getUTCFullYear(), nd.getUTCMonth(), nd.getUTCDate()));
};

const getApplicableTaxSlab = (row, totalAmount) => {
  try {
    const greaterThan = parseFloat(row?.greaterThan);
    const uptoValue = row?.upto;

    if (Number.isNaN(greaterThan)) return null;

    if (uptoValue === "" || uptoValue === null || uptoValue === undefined) {
      return totalAmount > greaterThan ? row : null;
    }

    const upto = parseFloat(uptoValue);
    if (Number.isNaN(upto)) return null;

    return totalAmount > greaterThan && totalAmount <= upto ? row : null;
  } catch (error) {
    return null;
  }
};

const getEffectiveStartDate = (doc, room) => {
  if (room?.swappingDateFrom && !room?.isSwapped) {
    return normalizeUTCDate(room.swappingDateFrom);
  }

  return normalizeUTCDate(doc?.arrivalDate);
};

const getDefaultNightlyRate = (room) => {
  const existingStayDays = Math.max(Number(room?.stayDays || 0), 1);

  return (
    Number(room?.priceLevelRate || 0) ||
    Number(room?.baseAmount || 0) / existingStayDays ||
    Number(room?.totalAmount || 0) / existingStayDays ||
    0
  );
};

const getNightlyRateForDate = (room, date) => {
  const dateTariffs = room?.dateTariffs || {};
  const isoDate = date.toISOString().split("T")[0];

  if (dateTariffs[isoDate] !== undefined) {
    return Number(dateTariffs[isoDate] || 0);
  }

  const tariffDates = Object.keys(dateTariffs).sort();
  for (let i = tariffDates.length - 1; i >= 0; i -= 1) {
    if (tariffDates[i] <= isoDate) {
      return Number(dateTariffs[tariffDates[i]] || 0);
    }
  }

  return getDefaultNightlyRate(room);
};

const calculateBaseAmountFromTariff = (doc, room) => {
  const stayDays = Number(room?.stayDays || 0);
  if (stayDays <= 0) return 0;

  const startDate = getEffectiveStartDate(doc, room);
  let total = 0;

  for (let i = 0; i < stayDays; i += 1) {
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(startDate.getUTCDate() + i);
    total += getNightlyRateForDate(room, currentDate);
  }

  return round2(total);
};

const sumPerNightRows = (rows = [], roomId) =>
  rows.reduce((acc, item) => {
    return item?.roomId?.toString?.() === roomId?.toString?.()
      ? acc + Number(item?.rate || 0)
      : acc;
  }, 0);

export const calculateStayDays = (doc, room) => {
  const arrival = normalizeUTCDate(doc.arrivalDate);
  const checkout = normalizeUTCDate(doc.checkOutDate);

  if (!room?.swappingDateFrom) {
    const diffDays = Math.floor((checkout - arrival) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : Number(doc?.stayDays || 1);
  }

  const swap = normalizeUTCDate(room.swappingDateFrom);

  let start;
  let end;

  if (room.isSwapped) {
    start = arrival;
    end = swap;
  } else {
    start = swap;
    end = checkout;
  }

  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

const getEffectiveRoomPrice = (room, roomStayDays) => {
  const nightlyRate =
    Number(room?.priceLevelRate || 0) ||
    (Number(room?.baseAmount || 0) / Math.max(Number(room?.stayDays || 1), 1)) ||
    0;

  return round2(nightlyRate * roomStayDays);
};

export const calculateTaxAmount = (
  taxPercentage,
  roomPrice,
  addTaxWithRate,
  foodPlanArray,
  roomId,
  bookingType,
  stayDays,
  additionalPaxDetails,
  doc
) => {
  const nights = Number(stayDays || 0);

  if (nights <= 0) {
    return {
      taxableAmount: 0,
      roomTaxAmount: 0,
      specificFoodPlanTotal: 0,
      taxableSpecificFoodPlan: 0,
      foodPlanTaxAmount: 0,
      foodPlanTaxPercentage: 0,
      additionalPaxWithTax: 0,
      additionalPaxWithoutTax: 0,
      additionalPaxTaxAmount: 0,
    };
  }

  let foodPlanTax = 5;
  if (bookingType === "offline") {
    foodPlanTax = Number(taxPercentage || 0);
  }

  const foodPlanPerNight = (foodPlanArray || []).reduce((acc, item) => {
    return item.roomId?.toString() === roomId?.toString()
      ? acc + Number(item.rate || 0)
      : acc;
  }, 0);

  const specificFoodPlanTotal = round2(foodPlanPerNight * nights);

  const additionalPaxPerNight = (additionalPaxDetails || []).reduce((acc, item) => {
    return item.roomId?.toString() === roomId?.toString()
      ? acc + Number(item.rate || 0)
      : acc;
  }, 0);

  const specificAdditionalPaxDetails = round2(additionalPaxPerNight * nights);

  const taxableSpecificFoodPlan =
    specificFoodPlanTotal > 0
      ? round2(specificFoodPlanTotal / (1 + foodPlanTax / 100))
      : 0;

  const foodPlanTaxAmount = round2(specificFoodPlanTotal - taxableSpecificFoodPlan);

  const amountWithTax = round2(Math.max(0, Number(roomPrice || 0) - specificFoodPlanTotal));

  const taxableAmount =
    amountWithTax > 0
      ? round2(amountWithTax / (1 + Number(taxPercentage || 0) / 100))
      : 0;

  const roomTaxAmount = round2(amountWithTax - taxableAmount);

  const additionalPaxWithoutTax = specificAdditionalPaxDetails;
  const additionalPaxTaxAmount = round2(
    additionalPaxWithoutTax * (Number(taxPercentage || 0) / 100)
  );
  const additionalPaxWithTax = round2(additionalPaxWithoutTax + additionalPaxTaxAmount);

  return {
    taxableAmount,
    roomTaxAmount,
    specificFoodPlanTotal,
    taxableSpecificFoodPlan,
    foodPlanTaxAmount,
    foodPlanTaxPercentage: foodPlanTax,
    additionalPaxWithTax,
    additionalPaxWithoutTax,
    additionalPaxTaxAmount,
  };
};

export const getFullRoomDetails = async (roomData, doc) => {
  const finalData = {
    taxableAmount: 0,
    roomTaxAmount: 0,
    specificFoodPlanTotal: 0,
    taxableSpecificFoodPlan: 0,
    foodPlanTaxAmount: 0,
    additionalPaxWithTax: 0,
    additionalPaxWithoutTax: 0,
    additionalPaxTaxAmount: 0,
  };

  for (const room of roomData || []) {
    const roomStayDays = calculateStayDays(doc, room);
    if (roomStayDays <= 0) continue;

    const effectiveRoomPrice = getEffectiveRoomPrice(room, roomStayDays);

    const taxDetails = calculateTaxAmount(
      room.taxPercentage,
      effectiveRoomPrice,
      doc?.addTaxWithRate,
      doc?.foodPlan,
      room?.roomId,
      doc?.bookingType,
      roomStayDays,
      doc?.additionalPaxDetails,
      doc
    );


    finalData.taxableAmount = round2(finalData.taxableAmount + taxDetails.taxableAmount);
    finalData.roomTaxAmount = round2(finalData.roomTaxAmount + taxDetails.roomTaxAmount);
    finalData.specificFoodPlanTotal = round2(finalData.specificFoodPlanTotal + taxDetails.specificFoodPlanTotal);
    finalData.taxableSpecificFoodPlan = round2(finalData.taxableSpecificFoodPlan + taxDetails.taxableSpecificFoodPlan);
    finalData.foodPlanTaxAmount = round2(finalData.foodPlanTaxAmount + taxDetails.foodPlanTaxAmount);
    finalData.additionalPaxWithTax = round2(finalData.additionalPaxWithTax + taxDetails.additionalPaxWithTax);
    finalData.additionalPaxWithoutTax = round2(finalData.additionalPaxWithoutTax + taxDetails.additionalPaxWithoutTax);
    finalData.additionalPaxTaxAmount = round2(finalData.additionalPaxTaxAmount + taxDetails.additionalPaxTaxAmount);
  }

  return finalData;
};

export const recalculateRoomFinancials = (doc, room) => {
  const stayDays = Math.max(Number(room?.stayDays || 0), 0);
  const roomId = room?.roomId?._id || room?.roomId;
  const baseAmount = calculateBaseAmountFromTariff(doc, room);
  const isOffline = doc?.bookingType === "offline";
  const addTaxWithRate = Boolean(doc?.addTaxWithRate);
  const addFoodPlanWithRate = Boolean(doc?.addFoodPlanWithRate);
  const addPaxWithRate = Boolean(doc?.addPaxWithRate);

  if (stayDays <= 0) {
    return {
      ...room,
      totalAmount: 0,
      amountAfterTax: 0,
      amountWithOutTax: 0,
      additionalPaxAmount: 0,
      foodPlanAmount: 0,
      taxAmount: 0,
      additionalPaxAmountWithTax: 0,
      additionalPaxAmountWithOutTax: 0,
      foodPlanAmountWithTax: 0,
      foodPlanAmountWithOutTax: 0,
      baseAmount: 0,
      baseAmountWithTax: 0,
      totalCgstAmt: 0,
      totalSgstAmt: 0,
      totalIgstAmt: 0,
    };
  }

  const paxPerNight = sumPerNightRows(doc?.additionalPaxDetails, roomId);
  const foodPlanPerNight = sumPerNightRows(doc?.foodPlan, roomId);

  const reducedAdditionalPaxAmount = round2(paxPerNight * stayDays);
  const reducedFoodPlanAmount = round2(foodPlanPerNight * stayDays);

  let slabRate = Number(room?.priceLevelRate || getDefaultNightlyRate(room) || 0);
  if (addPaxWithRate) {
    slabRate -= stayDays > 0 ? reducedAdditionalPaxAmount / stayDays : 0;
  }
  if (addFoodPlanWithRate) {
    slabRate -= stayDays > 0 ? reducedFoodPlanAmount / stayDays : 0;
  }

  let taxRate = Number(room?.taxPercentage || 0);
  if (Array.isArray(room?.hsnDetails?.rows)) {
    for (const row of room.hsnDetails.rows) {
      const slab = getApplicableTaxSlab(row, slabRate);
      if (slab) {
        taxRate = Number(slab?.igstRate || 0);
        break;
      }
    }
  }

  let totalAmountForTax = round2(baseAmount + (addPaxWithRate ? 0 : reducedAdditionalPaxAmount));
  if (!addFoodPlanWithRate && !isOffline) {
    totalAmountForTax = round2(totalAmountForTax + reducedFoodPlanAmount);
  }

  const taxAmount = round2((totalAmountForTax * taxRate) / 100);
  let amountAfterTax = round2(addTaxWithRate ? totalAmountForTax : totalAmountForTax + taxAmount);

  const foodPlanTaxRate = isOffline ? 5 : taxRate;
  const paxInclusiveDivisor = 1 + taxRate / 100;
  const foodInclusiveDivisor = 1 + foodPlanTaxRate / 100;
  const additionalPaxAmountWithTax = round2(
    addTaxWithRate
      ? reducedAdditionalPaxAmount
      : reducedAdditionalPaxAmount + (reducedAdditionalPaxAmount * taxRate) / 100,
  );
  const additionalPaxAmountWithOutTax = round2(
    addTaxWithRate
      ? reducedAdditionalPaxAmount / paxInclusiveDivisor
      : reducedAdditionalPaxAmount,
  );

  let foodPlanAmountWithTax = 0;
  let foodPlanAmountWithOutTax = 0;
  let foodPlanTaxAmount = 0;

  if (addFoodPlanWithRate) {
    foodPlanAmountWithTax = reducedFoodPlanAmount;
    foodPlanAmountWithOutTax = reducedFoodPlanAmount;
  } else {
    foodPlanAmountWithTax = round2(
      addTaxWithRate
        ? reducedFoodPlanAmount
        : reducedFoodPlanAmount + (reducedFoodPlanAmount * foodPlanTaxRate) / 100,
    );
    foodPlanAmountWithOutTax = round2(
      addTaxWithRate
        ? reducedFoodPlanAmount / foodInclusiveDivisor
        : reducedFoodPlanAmount,
    );
    foodPlanTaxAmount = round2(foodPlanAmountWithTax - foodPlanAmountWithOutTax);
  }

  amountAfterTax = round2(
    amountAfterTax +
      Number(room?.otherChargeAmount || 0) -
      Number(room?.discountAmount || 0),
  );

  if (isOffline && !addFoodPlanWithRate) {
    amountAfterTax = round2(amountAfterTax + foodPlanAmountWithTax);
  }

  const amountWithOutTax = round2(
    baseAmount +
      reducedAdditionalPaxAmount +
      (addFoodPlanWithRate ? 0 : reducedFoodPlanAmount) +
      Number(room?.otherChargeWithOutTax || 0) -
      Number(room?.discountAmountWithOutTax || 0),
  );

  const totalTaxForSplit = round2(
    taxAmount + (addFoodPlanWithRate ? 0 : foodPlanTaxAmount),
  );

  return {
    ...room,
    totalAmount: baseAmount,
    amountAfterTax,
    amountWithOutTax,
    taxPercentage: taxRate,
    foodPlanTaxRate,
    additionalPaxAmount: reducedAdditionalPaxAmount,
    foodPlanAmount: reducedFoodPlanAmount,
    taxAmount,
    additionalPaxAmountWithTax,
    additionalPaxAmountWithOutTax,
    foodPlanAmountWithTax,
    foodPlanAmountWithOutTax,
    baseAmount,
    baseAmountWithTax: round2(baseAmount + taxAmount),
    totalCgstAmt: round2(totalTaxForSplit / 2),
    totalSgstAmt: round2(totalTaxForSplit / 2),
    totalIgstAmt: round2(totalTaxForSplit),
  };
};

export const recalculateCheckInFinancials = (doc) => {
  const selectedRooms = Array.isArray(doc?.selectedRooms) ? doc.selectedRooms : [];
  const recalculatedRooms = selectedRooms.map((room) => recalculateRoomFinancials(doc, room));

  const roomTotal = round2(
    recalculatedRooms.reduce(
      (sum, room) => sum + Number(room?.amountAfterTax || room?.totalAmount || 0),
      0,
    ),
  );
  const paxTotal = round2(
    (doc?.additionalPaxDetails || []).reduce(
      (sum, item) => sum + Number(item?.rate || 0),
      0,
    ),
  );
  const foodPlanTotal = round2(
    (doc?.foodPlan || []).reduce((sum, item) => sum + Number(item?.rate || 0), 0),
  );
  const discountAmount = round2(Number(doc?.discountAmount || 0));
  const totalAmount = round2(roomTotal + paxTotal + foodPlanTotal);
  const grandTotal = round2(totalAmount - discountAmount);
  const paidAmount = round2(
    Number(doc?.advanceAmount || 0) +
      Number(doc?.paymenttypeDetails?.cash || 0) +
      Number(doc?.paymenttypeDetails?.bank || 0) +
      Number(doc?.paymenttypeDetails?.upi || 0) +
      Number(doc?.paymenttypeDetails?.credit || 0) +
      Number(doc?.paymenttypeDetails?.card || 0),
  );

  return {
    selectedRooms: recalculatedRooms,
    roomTotal,
    paxTotal,
    foodPlanTotal,
    totalAmount,
    grandTotal,
    balanceToPay: round2(grandTotal - paidAmount),
  };
};
