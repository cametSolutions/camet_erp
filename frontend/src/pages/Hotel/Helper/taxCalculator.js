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
    let amountWithTax = inclusive ? totalAmount : totalAmount + taxAmount;
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
    console.log(foodPlanAmountWithTax);
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
      totalCgstAmt: Number(taxAmount.toFixed(2) / 2 || 0),
      totalSgstAmt: Number(taxAmount.toFixed(2) / 2 || 0),
      totalIgstAmt: Number(taxAmount.toFixed(2) || 0),
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

export const taxCalculatorForRestaurant = (
  tableData = [],
  inclusive = false
) => {
  console.log(inclusive);
  return tableData.map((item) => {
    // Map through GodownList for each product
    const updatedGodownList = item.GodownList.map((godown) => {
      const price = Number(item.price) || 0;
      const igst = Number(item.igst) || 0;
      const cgst = Number(item.cgst) || 0;
      const sgst = Number(item.sgst) || 0;
      const count = Number(godown.count) || 1;
      const cess = Number(item?.cess) || 0;
      const addlCess = Number(item?.addl_cess) || 0;

      console.log(godown.count);

      // Determine total tax rate
      const totalTaxRate = igst || cgst + sgst;
      let taxableAmount;
      let igstAmount, cgstAmount, sgstAmount, cessAmount, additionalCessAmount;
      let individualTotal;
      let basePrice = price;

      if (inclusive) {
        // Tax Inclusive: Manager's Formula
        // Total amount paid by customer
        const totalAmount = price * count;
        basePrice = Number((basePrice / (1 + totalTaxRate / 100)).toFixed(2));
        // Calculate taxable amount: Total * 100 / (100 + Tax%)
        taxableAmount = (totalAmount * 100) / (100 + totalTaxRate);
        // Tax = Total - Taxable Amount
        const totalTaxAmount = totalAmount - taxableAmount;

        // Split tax based on IGST or CGST+SGST
        igstAmount = totalTaxAmount;
        cgstAmount = totalTaxAmount / 2;
        sgstAmount = totalTaxAmount / 2;

        // Cess calculation on taxable amount
        cessAmount = (taxableAmount * cess) / 100;
        additionalCessAmount = (taxableAmount * addlCess) / 100;

        // Individual total remains the same (already inclusive)
        individualTotal = totalAmount + cessAmount + additionalCessAmount;
      } else {
        // Tax Exclusive: Manager's Formula
        // Taxable amount
        taxableAmount = price * count;

        // Calculate tax: Taxable * Tax% / 100
        const totalTaxAmount = (taxableAmount * totalTaxRate) / 100;

        // Split tax based on IGST or CGST+SGST
        igstAmount = totalTaxAmount;
        cgstAmount = totalTaxAmount / 2;
        sgstAmount = totalTaxAmount / 2;

        // Cess calculation
        cessAmount = (taxableAmount * cess) / 100;
        additionalCessAmount = (taxableAmount * addlCess) / 100;

        // Individual total = Taxable + All Taxes
        individualTotal =
          taxableAmount + totalTaxAmount + cessAmount + additionalCessAmount;
      }

      return {
        ...godown,
        basePrice: Number(basePrice),
        discountAmount: 0,
        discountPercentage: 0,
        discountType: "none",
        taxableAmount: Number(taxableAmount.toFixed(2)),
        cgstValue: Number(cgst.toFixed(2)),
        sgstValue: Number(sgst.toFixed(2)),
        igstValue: Number(igst.toFixed(2)),
        cessValue: Number(cess.toFixed(2)),
        addlCessValue: Number(addlCess.toFixed(2)),
        igstAmount: Number(igstAmount.toFixed(2)),
        cgstAmount: Number(cgstAmount.toFixed(2)),
        sgstAmount: Number(sgstAmount.toFixed(2)),
        cessAmount: Number(cessAmount.toFixed(2)),
        additionalCessAmount: Number(additionalCessAmount.toFixed(2)),
        individualTotal: Number(individualTotal.toFixed(2)),
        isTaxIncluded: inclusive,
      };
    });

    // Sum up totals from GodownList
    const total = updatedGodownList.reduce(
      (sum, g) => sum + g.individualTotal,
      0
    );
    const totalCgstAmt = updatedGodownList.reduce(
      (sum, g) => sum + g.cgstAmount,
      0
    );
    const totalSgstAmt = updatedGodownList.reduce(
      (sum, g) => sum + g.sgstAmount,
      0
    );
    const totalIgstAmt = updatedGodownList.reduce(
      (sum, g) => sum + g.igstAmount,
      0
    );
    const totalCessAmt = updatedGodownList.reduce(
      (sum, g) => sum + g.cessAmount,
      0
    );
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
