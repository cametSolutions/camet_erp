export const taxCalculator = (
  data,
  inclusive = false,
  formData = null,
  taxCalculationRoomId
) => {
  const { hsnDetails } = data;

  const reducedAdditionalPaxAmount =  formData?.additionalPaxDetails?.reduce((acc, item) => {
      return item.roomId === taxCalculationRoomId ? acc + Number(item.rate) : acc;
    }, 0) || 0;

  const reducedFoodPlanAmount =
    formData?.foodPlan?.reduce((acc, item) => {
      return item.roomId === taxCalculationRoomId ? acc + Number(item.rate) : acc;
    }, 0) || 0;
console.log(data?.hsnDetails?.rows)

  const totalAmount =
    Number(data?.totalAmount || 0) +
    reducedAdditionalPaxAmount +
    reducedFoodPlanAmount;
console.log(totalAmount)
  for (const item of hsnDetails?.rows || []) {
    const taxSlab = getApplicableTaxSlab(item, totalAmount);
    if (taxSlab) {
      const taxRate = taxSlab.igstRate;
      const taxAmount = (totalAmount * taxRate) / 100;
      const amountWithTax = inclusive
        ? totalAmount + taxAmount
        : totalAmount - taxAmount;

      return {
        amountWithTax,
        taxRate,
        additionalPaxAmount: reducedAdditionalPaxAmount,
        foodPlanAmount: reducedFoodPlanAmount,
      };
    }
  }

  // No slab matched — use default rate
  const defaultTaxRate = hsnDetails?.igstRate ?? 0;
  const defaultTaxAmount = (totalAmount * defaultTaxRate) / 100;
  const amountWithTax = inclusive
    ? totalAmount + defaultTaxAmount
    : totalAmount - defaultTaxAmount;

  return {
    amountWithTax,
    taxRate: defaultTaxRate,
    additionalPaxAmount: reducedAdditionalPaxAmount,
    foodPlanAmount: reducedFoodPlanAmount,
  };
};

const getApplicableTaxSlab = (row, totalAmount) => {
  const greaterThan = parseFloat(row.greaterThan);
  const upto = parseFloat(row.upto);

  return totalAmount > greaterThan && totalAmount <= upto ? row : null;
};
