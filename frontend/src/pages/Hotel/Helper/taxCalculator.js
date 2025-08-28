

export const taxCalculator = (
  data,
  inclusive = false,
  formData = null,
  taxCalculationRoomId = null
) => {
  console.log(formData);
  console.log(inclusive);
  try {
    if (!data || typeof data !== "object") {
      console.error("Invalid data provided to taxCalculator");
      return null;
    }

    const { hsnDetails } = data;

    // Calculate additional pax amount for specific room
    const reducedAdditionalPaxAmount = taxCalculationRoomId
      ? formData?.additionalPaxDetails?.reduce(
          (acc, item) =>
            item.roomId === taxCalculationRoomId
              ? acc + (Number(item.rate) || 0)
              : acc,
          0
        ) || 0
      : 0;

    // Calculate food plan amount for specific room
    const reducedFoodPlanAmount = taxCalculationRoomId
      ? formData?.foodPlan?.reduce(
          (acc, item) =>
            item.roomId === taxCalculationRoomId
              ? acc + (Number(item.rate) || 0)
              : acc,
          0
        ) || 0
      : 0;

    const baseAmount = Number(data?.totalAmount || 0);
    let totalAmount = baseAmount + reducedAdditionalPaxAmount;

    if (formData?.bookingType !== "offline") {
      totalAmount += reducedFoodPlanAmount;
    }

    // Tax slab logic
    let taxRate = 0;
    let applicableSlab = null;

    if (Array.isArray(hsnDetails?.rows)) {
      for (const row of hsnDetails.rows) {
        const slab = getApplicableTaxSlab(row, totalAmount);
        if (slab) {
          applicableSlab = slab;
          taxRate = Number(slab.igstRate || 0);
          break;
        }
      }
    }

    if (!applicableSlab && hsnDetails?.igstRate !== undefined) {
      taxRate = Number(hsnDetails.igstRate);
    }
  
    const taxAmount = (totalAmount * taxRate) / 100;
    let amountWithTax = inclusive
      ? totalAmount 
      : totalAmount + taxAmount;
    console.log(amountWithTax);
    // Handle per-component tax for display or tracking
    let foodPlanTaxRate = formData?.bookingType == "offline" ? 5 : taxRate;

    let additionalPaxAmountWithTax = inclusive
      ? reducedAdditionalPaxAmount 
      : reducedAdditionalPaxAmount +
        (reducedAdditionalPaxAmount * taxRate) / 100;

    let foodPlanAmountWithTax = inclusive
      ? reducedFoodPlanAmount
      : reducedFoodPlanAmount + (reducedFoodPlanAmount * foodPlanTaxRate) / 100;

console.log(amountWithTax);
console.log(foodPlanAmountWithTax)
    // For UI clarity, always return food plan in amountWithTax if booking is not offline
    if (formData?.bookingType == "offline") {
      amountWithTax = Number(amountWithTax) + Number(foodPlanAmountWithTax);
    }

    console.log(amountWithTax);

    return {
      amountWithTax: Number(amountWithTax.toFixed(2)),
      amountWithOutTax:
        Number(baseAmount.toFixed(2)) +
        Number(reducedAdditionalPaxAmount) +
        Number(reducedFoodPlanAmount),
      taxRate: Number(taxRate.toFixed(2)),
      foodPlanTaxRate:
        formData?.bookingType !== "offline" ? 5 : Number(taxRate.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      additionalPaxAmountWithTax: Number(additionalPaxAmountWithTax.toFixed(2)),
      additionalPaxAmountWithOutTax: Number(reducedAdditionalPaxAmount),
      foodPlanAmountWithTax: Number(foodPlanAmountWithTax.toFixed(2)),
      foodPlanAmountWithOutTax: Number(reducedFoodPlanAmount), // ✅ Fixed typo from "foodPlaAmountWithOutTax"
      baseAmount: Number(baseAmount.toFixed(2)),
      baseAmountWithTax:
        Number(baseAmount.toFixed(2)) + Number(taxAmount.toFixed(2)),
    };
  } catch (error) {
    console.error("Error in taxCalculator:", error);
    return {
      amountWithTax: Number(data?.totalAmount || 0),
      taxRate: 0,
      taxAmount: 0,
      additionalPaxAmount: 0,
      foodPlanAmount: 0,
      baseAmount: Number(data?.totalAmount || 0),
      totalBeforeTax: Number(data?.totalAmount || 0),
    };
  }
};

const getApplicableTaxSlab = (row, totalAmount) => {
  try {
    const greaterThan = parseFloat(row.greaterThan);
    const uptoValue = row.upto;

    if (isNaN(greaterThan)) return null;

    let isApplicable = false;

    if (uptoValue === "" || uptoValue === null || uptoValue === undefined) {
      isApplicable = totalAmount > greaterThan;
    } else {
      const upto = parseFloat(uptoValue);
      if (isNaN(upto)) return null;
      isApplicable = totalAmount > greaterThan && totalAmount <= upto;
    }

    return isApplicable ? row : null;
  } catch (error) {
    console.error("Error in getApplicableTaxSlab:", error);
    return null;
  }
};


export const taxCalculatorForRestaurant = (tableData = [], inclusive = false) => {
  return tableData.map((item) => {
    // Map through GodownList for each product
    const updatedGodownList = item.GodownList.map((godown) => {
      const price = Number(item.price) || 0;
      const igst = Number(item.igst) || 0;
      const cgst = Number(item.cgst) || 0;
      const sgst = Number(item.sgst) || 0;

      let basePrice;

      if (inclusive) {
        // Price includes tax → remove tax from it
        basePrice = price / (1 + igst / 100);
      } else {
        // Price excludes tax → keep price as base
        basePrice = price;
      }

      const igstAmount = (basePrice * igst) / 100;
      const cgstAmount = (basePrice * cgst) / 100;
      const sgstAmount = (basePrice * sgst) / 100;

      return {
        ...godown,
        basePrice,
        discountAmount: 0,
        discountPercentage: 0,
        discountType: "none",
        taxableAmount: basePrice,
        cgstValue: cgst,
        sgstValue: sgst,
        igstValue: igst,
        cessValue: item?.cess || 0,
        addlCessValue: item?.addl_cess || 0,
        igstAmount,
        cgstAmount,
        sgstAmount,
        individualTotal: inclusive
          ? price
          : basePrice + igstAmount + cgstAmount + sgstAmount,
        isTaxIncluded: inclusive,
        cessAmount: 0,
        additionalCessAmount: 0,
      };
    });

    // Sum up totals from GodownList
    const total = updatedGodownList.reduce((sum, g) => sum + g.individualTotal, 0);
    const totalCgstAmt = updatedGodownList.reduce((sum, g) => sum + g.cgstAmount, 0);
    const totalSgstAmt = updatedGodownList.reduce((sum, g) => sum + g.sgstAmount, 0);
    const totalIgstAmt = updatedGodownList.reduce((sum, g) => sum + g.igstAmount, 0);
    const totalCessAmt = updatedGodownList.reduce((sum, g) => sum + g.cessAmount, 0);
    const totalAddlCessAmt = updatedGodownList.reduce(
      (sum, g) => sum + g.additionalCessAmount,
      0
    );

    // Return product with updated GodownList & totals
    return {
      ...item,
      GodownList: updatedGodownList,
      total,
      totalCgstAmt,
      totalSgstAmt,
      totalIgstAmt,
      totalCessAmt,
      totalAddlCessAmt,
      added: true,
      taxInclusive: inclusive,
    };
  });
};




