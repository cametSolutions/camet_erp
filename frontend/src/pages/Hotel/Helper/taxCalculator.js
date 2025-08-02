// import { number } from "framer-motion";

// export const taxCalculator = (
//   data,
//   inclusive = false,
//   formData = null,
//   taxCalculationRoomId = null
// ) => {
//   console.log(formData);
//   try {
//     // Input validation
//     if (!data || typeof data !== "object") {
//       console.error("Invalid data provided to taxCalculator");
//       return null;
//     }

//     const { hsnDetails } = data;

//     // Validate hsnDetails
//     if (!hsnDetails) {
//       console.warn("No HSN details found, using default calculation");
//     }

//     // Calculate additional amounts for specific room
//     const reducedAdditionalPaxAmount = taxCalculationRoomId
//       ? formData?.additionalPaxDetails?.reduce((acc, item) => {
//           return item.roomId === taxCalculationRoomId
//             ? acc + (Number(item.rate) || 0)
//             : acc;
//         }, 0) || 0
//       : 0;

//     const reducedFoodPlanAmount = taxCalculationRoomId
//       ? formData?.foodPlan?.reduce((acc, item) => {
//           return item.roomId === taxCalculationRoomId
//             ? acc + (Number(item.rate) || 0)
//             : acc;
//         }, 0) || 0
//       : 0;

//     // Base amount calculation
//     const baseAmount = Number(data?.totalAmount || 0);

//     let totalAmount = 0;
//     if (formData?.bookingType !== "offline") {
//       totalAmount =
//         baseAmount + reducedAdditionalPaxAmount + reducedFoodPlanAmount;
//     } else {
//       totalAmount = baseAmount + reducedAdditionalPaxAmount;
//     }
//     // Total amount including additional charges

//     // Tax calculation logic
//     let taxRate = 0;
//     let applicableSlab = null;

//     // Check if HSN details exist and have tax slabs
//     if (
//       hsnDetails?.rows &&
//       Array.isArray(hsnDetails.rows) &&
//       hsnDetails.rows.length > 0
//     ) {
//       // Find applicable tax slab
//       for (const row of hsnDetails.rows) {
//         const slab = getApplicableTaxSlab(row, totalAmount);
//         if (slab) {
//           applicableSlab = slab;
//           taxRate = Number(slab.igstRate || 0);
//           break;
//         }
//       }

//       console.log("Found tax slab:", applicableSlab);
//     }

//     // If no slab found, use default rate from hsnDetails
//     if (!applicableSlab && hsnDetails?.igstRate !== undefined) {
//       taxRate = Number(hsnDetails.igstRate);
//       console.log("Using default tax rate:", taxRate);
//     }
//     // Calculate tax amount
//     const taxAmount = (totalAmount * taxRate) / 100;

//     // Calculate final amount based on inclusive/exclusive
//     let amountWithTax = inclusive ? totalAmount + taxAmount : totalAmount-taxAmount;

//     let foodPlanTax;
//     if (formData?.bookingType !== "offline") {
//       foodPlanTax = 5;
//     } else {
//       foodPlanTax = taxRate;
//     }

//     let additionalPaxAmountWithTax = 0;
//     let foodPlanAmountWithTax = 0;
//     if (formData) {
//       additionalPaxAmountWithTax = inclusive
//         ? reducedAdditionalPaxAmount +
//           (reducedAdditionalPaxAmount * taxRate) / 100
//         : reducedAdditionalPaxAmount -
//           (reducedAdditionalPaxAmount * taxRate) / 100;

//       foodPlanAmountWithTax = inclusive
//         ? reducedFoodPlanAmount + (reducedFoodPlanAmount * foodPlanTax) / 100
//         : reducedFoodPlanAmount - (reducedFoodPlanAmount * foodPlanTax) / 100;
//     }
//     if (formData?.bookingType !== "offline") {
//       amountWithTax = Number(amountWithTax) + Number(reducedFoodPlanAmount);
//     }

//     return {
//       amountWithTax: Number(amountWithTax.toFixed(2)),
//       taxRate: Number(taxRate.toFixed(2)),
//       taxAmount: Number(taxAmount.toFixed(2)),
//       additionalPaxAmount: Number(reducedAdditionalPaxAmount.toFixed(2)),
//       foodPlanAmount: Number(reducedFoodPlanAmount.toFixed(2)),
//       additionalPaxAmountWithTax: Number(additionalPaxAmountWithTax.toFixed(2)),
//       foodPlanAmountWithTax: Number(foodPlanAmountWithTax.toFixed(2)),
//       baseAmount: Number(baseAmount.toFixed(2)),
//       totalBeforeTax: Number(totalAmount.toFixed(2)),
//     };
//   } catch (error) {
//     console.error("Error in taxCalculator:", error);

//     // Return safe default values
//     return {
//       amountWithTax: Number(data?.totalAmount || 0),
//       taxRate: 0,
//       taxAmount: 0,
//       additionalPaxAmount: 0,
//       foodPlanAmount: 0,
//       baseAmount: Number(data?.totalAmount || 0),
//       totalBeforeTax: Number(data?.totalAmount || 0),
//     };
//   }
// };

// const getApplicableTaxSlab = (row, totalAmount) => {
//   try {
//     // Validate row object
//     if (!row || typeof row !== "object") {
//       return null;
//     }

//     const greaterThan = parseFloat(row.greaterThan);

//     // Validate greaterThan value
//     if (isNaN(greaterThan)) {
//       console.warn("Invalid greaterThan value:", row.greaterThan);
//       return null;
//     }

//     // Handle empty upto value (means no upper limit)
//     const uptoValue = row.upto;
//     let isApplicable = false;

//     if (uptoValue === "" || uptoValue === null || uptoValue === undefined) {
//       // No upper limit - check if amount is greater than greaterThan
//       isApplicable = totalAmount > greaterThan;
//       console.log("Tax slab check (no upper limit):", {
//         totalAmount,
//         greaterThan,
//         upto: "No limit",
//         isApplicable,
//       });
//     } else {
//       // Has upper limit - check range
//       const upto = parseFloat(uptoValue);

//       if (isNaN(upto)) {
//         console.warn("Invalid upto value:", uptoValue);
//         return null;
//       }

//       isApplicable = totalAmount > greaterThan && totalAmount <= upto;
//     }

//     return isApplicable ? row : null;
//   } catch (error) {
//     console.error("Error in getApplicableTaxSlab:", error);
//     return null;
//   }
//  };
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
