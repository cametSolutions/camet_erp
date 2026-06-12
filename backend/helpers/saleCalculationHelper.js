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
    console.log("ccccccc",roomStayDays);

    const taxDetails = calculateTaxAmount(
      room.taxPercentage,
      room?.totalAmount,
      doc?.addTaxWithRate,
      doc?.foodPlan,
      room?.roomId,
      doc?.bookingType,
      roomStayDays,
      doc?.additionalPaxDetails,
      doc
    );

    finalData.taxableAmount += Number(taxDetails.taxableAmount || 0);
    finalData.roomTaxAmount += Number(taxDetails.roomTaxAmount || 0);
    finalData.specificFoodPlanTotal += Number(taxDetails.specificFoodPlanTotal || 0);
    finalData.taxableSpecificFoodPlan += Number(taxDetails.taxableSpecificFoodPlan || 0);
    finalData.foodPlanTaxAmount += Number(taxDetails.foodPlanTaxAmount || 0);
    finalData.additionalPaxWithTax += Number(taxDetails.additionalPaxWithTax || 0);
    finalData.additionalPaxWithoutTax += Number(taxDetails.additionalPaxWithoutTax || 0);
    finalData.additionalPaxTaxAmount += Number(taxDetails.additionalPaxTaxAmount || 0);
  }

  return finalData;
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
  let foodPlanTax = 5;

  if (bookingType === "offline") {
    foodPlanTax = taxPercentage;
  }

  // Food plan total including tax
  let specificFoodPlanTotal =
    (foodPlanArray || []).reduce(
      (acc, item) =>
        item.roomId?.toString() === roomId?.toString()
          ? acc + Number(item.rate || 0)
          : acc,
      0,
    ) * Number(stayDays || 1);

    let specificAdditionalPaxDetails = (additionalPaxDetails || []).reduce(
      (acc, item) =>
        item.roomId?.toString() === roomId?.toString()
          ? acc + Number(item.rate || 0)
          : acc,
      0,
    ) * Number(stayDays || 1);

 
  
  // Food plan taxable amount
  let taxableSpecificFoodPlan = specificFoodPlanTotal / (1 + foodPlanTax / 100);

    // additionalPax  taxable amount
  let additionalPaxTaxAmount = (Number(specificAdditionalPaxDetails) * Number(taxPercentage)) / 100;


  // Room amount including tax
  let amountWithTax = Math.max(
    0,
    Number(roomPrice || 0) - Number(specificFoodPlanTotal || 0),
  );

    // Food plan tax amount
  let foodPlanTaxAmount = specificFoodPlanTotal - taxableSpecificFoodPlan;
   // Food plan tax amount
  // Room taxable amount
  let taxableAmount = (amountWithTax / (1 + taxPercentage / 100)) - foodPlanTaxAmount
  // Room tax amount
  let roomTaxAmount = amountWithTax - taxableAmount;




  return {
    taxableAmount,
    roomTaxAmount,
    specificFoodPlanTotal: specificFoodPlanTotal,
    taxableSpecificFoodPlan,
    foodPlanTaxAmount,
    foodPlanTaxPercentage: foodPlanTax,
    additionalPaxWithTax: specificAdditionalPaxDetails + additionalPaxTaxAmount ,
    additionalPaxWithoutTax:  specificAdditionalPaxDetails,
    additionalPaxTaxAmount: additionalPaxTaxAmount,
  };
};

const calculateStayDays = (doc, room) => {
  let fullDaysAre = doc.stayDays;

  const normalizeToDate = (d) => {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
  };

  const swapDate = room?.swappingDateFrom
    ? new Date(room.swappingDateFrom).toISOString().split("T")[0]
    : "";

  if (room.isSwapped && room.swappingDateFrom) {
    const swappingDate = normalizeToDate(room.swappingDateFrom);
    const arrivalDate = normalizeToDate(doc.arrivalDate);

    fullDaysAre = Math.floor(
      (swappingDate - arrivalDate) / (1000 * 60 * 60 * 24)
    );

    if (fullDaysAre <= 0) {
      if (swapDate == doc.arrivalDate) {
        fullDaysAre = 0;
      } else {
        fullDaysAre = 1;
      }
    }
  }

  if (!room.isSwapped && room.swappingDateFrom) {
    const swappingDate = normalizeToDate(room.swappingDateFrom);
    const checkoutDate = normalizeToDate(doc.checkOutDate);

    fullDaysAre = Math.floor(
      (checkoutDate - swappingDate) / (1000 * 60 * 60 * 24)
    );

    if (fullDaysAre <= 0) {
      if (swapDate == doc.arrivalDate) {
        fullDaysAre = 1;
      } else {
        fullDaysAre = 0;
      }
    }
  }

  return fullDaysAre;
};