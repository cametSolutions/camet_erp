export const calculateDiscountValues = ({
  total,
  inputValue,
  inputType,
  taxPercentage = 0,
  additionalChargeIncludeTax = false,
}) => {
  const baseAmount = Number(total || 0);
  const enteredValue = Number(inputValue || 0);
  const taxRate = Number(taxPercentage || 0);

  let discountAmount = 0;

  if (inputType === "percentage") {
    discountAmount = (baseAmount * Math.min(enteredValue, 100)) / 100;
  } else {
    discountAmount = Math.min(enteredValue, baseAmount);
  }

  discountAmount = Number(discountAmount.toFixed(2));

  let taxAmt = 0;
  let finalValue = 0;

  if (additionalChargeIncludeTax) {
    // amount includes tax
    taxAmt = Number(
      ((discountAmount * taxRate) / (100 + taxRate)).toFixed(2)
    );

    finalValue = discountAmount;
  } else {
    // amount excludes tax
    taxAmt = Number(
      ((discountAmount * taxRate) / 100).toFixed(2)
    );

    finalValue = Number((discountAmount + taxAmt).toFixed(2));
  }

  return {
    value: discountAmount,
    taxAmt,
    finalValue,
  };
};

export const calculateOtherCharges = async ({
  total,
  inputValue,
  inputType,
  taxPercentage = 0,
  discountBasedOnGrossAmount = false,
  formData,
  charge = {}, // 👈 pass selected charge object
  additionalChargeIncludeTax,
}) => {
  const selectedRooms = formData?.selectedRooms || [];
  let value = Number(inputValue || 0);

  if (!value || value <= 0) {
    return {
      rowId: Date.now() + Math.random(),
      _id: charge?._id || "",
      option: charge?.name || "",
      value: 0,
      action: "sub",
      taxPercentage: Number(charge?.taxPercentage || 0),
      taxAmt: 0,
      hsn: charge?.hsn || "",
      finalValue: 0,
      amountType: inputType,
    };
  }

  // ✅ GROSS MODE
  if (discountBasedOnGrossAmount) {
    const baseTotal = Number(total || 0);

    const discountValue =
      inputType === "percentage" ? (baseTotal * value) / 100 : value;

    const taxableValue =
      taxPercentage > 0
        ? (discountValue * 100) / (100 + Number(taxPercentage || 0))
        : discountValue;

    const taxAmt = discountValue - taxableValue;

    return {
      rowId: Date.now() + Math.random(),
      _id: charge?._id || "",
      option: charge?.name || "",
      value,
      action: "sub",
      taxPercentage: Number(charge?.taxPercentage || 0),
      taxAmt: Number(taxAmt.toFixed(2)),
      hsn: charge?.hsn || "",
      finalValue: Number(discountValue.toFixed(2)),
      amountType: inputType,

    };
  }

  // ✅ ITEM-WISE MODE (PROPORTIONAL)
  const items = selectedRooms.map((room) => {
    const taxable = Number(
      room?.amountWithOutTax ??
        room?.baseAmount ??
        (Number(room?.priceLevelRate || 0) * Number(room?.stayDays || 0))
    );

    const taxRate = Number(room?.taxPercentage || 0);
    const originalTax =
      room?.taxAmount ?? (taxable * taxRate) / 100;

    return {
      roomId: room?.roomId,
      roomName: room?.roomName,
      taxable,
      taxRate,
      originalTax,
    };
  });

  const totalTaxable = items.reduce((sum, item) => sum + item.taxable, 0);

  if (totalTaxable <= 0) {
    return {
      rowId: Date.now() + Math.random(),
      _id: charge?._id || "",
      option: charge?.name || "",
      value,
      action: "sub",
      taxPercentage: Number(charge?.taxPercentage || 0),
      taxAmt: 0,
      hsn: charge?.hsn || "",
      finalValue: 0,
      amountType: inputType,
    };
  }

  const totalDiscount =
    inputType === "percentage" ? (totalTaxable * value) / 100 : value;

  let assignedDiscount = 0;

  const itemWiseDiscount = items.map((item, index) => {
    let discountAmount = 0;

    if (index === items.length - 1) {
      discountAmount = totalDiscount - assignedDiscount;
    } else {
      const share = item.taxable / totalTaxable;
      discountAmount = Number((totalDiscount * share).toFixed(2));
      assignedDiscount += discountAmount;
    }

    if (discountAmount > item.taxable) {
      discountAmount = item.taxable;
    }

    const taxableAfterDiscount = item.taxable - discountAmount;
    const newTaxAmt = (taxableAfterDiscount * item.taxRate) / 100;

    const taxReduction = item.originalTax - newTaxAmt;
    const discountImpact = discountAmount + taxReduction;

    return {
      roomId: item.roomId,
      roomName: item.roomName,
      originalTaxable: Number(item.taxable.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxableAfterDiscount: Number(taxableAfterDiscount.toFixed(2)),
      taxRate: item.taxRate,
      originalTaxAmt: Number(item.originalTax.toFixed(2)),
      taxAmt: Number(taxReduction.toFixed(2)),
      finalValue: Number((taxableAfterDiscount + newTaxAmt).toFixed(2)),
      discountImpact: Number(discountImpact.toFixed(2)),
    };
  });

  const totalTaxAmt = itemWiseDiscount.reduce(
    (sum, item) => sum + item.taxAmt,
    0
  );

  const totalDiscountImpact = itemWiseDiscount.reduce(
    (sum, item) => sum + item.discountImpact,
    0
  );

  return {
    rowId: Date.now() + Math.random(),
    _id: charge?._id || "",
    option: charge?.name || "",
    value,
    action: "sub",
    taxPercentage: Number(charge?.taxPercentage || 0),
    taxAmt: Number(totalTaxAmt.toFixed(2)),
    hsn: charge?.hsn || "",
    finalValue: Number(totalDiscountImpact.toFixed(2)),
    amountType: inputType,
  };
};

export const getTaxPercentage = (amount, hsnDetails) => {
  const matchedRow = hsnDetails?.rows?.find((row) => {
    const greaterThan = Number(row.greaterThan || 0);
    const upto = Number(row.upto || Infinity);

    return amount > greaterThan && amount <= upto;
  });

  if (!matchedRow) return null;

  return {
    igst: Number(matchedRow.igstRate || 0),
    cgst: Number(matchedRow.cgstRate || 0),
    sgst: Number(matchedRow.sgstUtgstRate || 0),
    totalTax:
      Number(matchedRow.cgstRate || 0) +
      Number(matchedRow.sgstUtgstRate || 0),
  };
};