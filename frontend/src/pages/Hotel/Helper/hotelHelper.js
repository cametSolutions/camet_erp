export const calculateDiscountValues = ({
  total,
  inputValue,
  inputType,
  taxPercentage = 0,
  discountBasedOnGrossAmount = false,
  formData
}) => {
  const baseAmount = Number(total || 0);
  const enteredValue = Number(inputValue || 0);

  let discountAmount = 0;

  if (inputType === "percentage") {
    discountAmount = (baseAmount * Math.min(enteredValue, 100)) / 100;
  } else {
    discountAmount = Math.min(enteredValue, baseAmount);
  }


  discountAmount = Number(discountAmount.toFixed(2));
  console.log(discountAmount);
  const taxAmt = Number(
    ((discountAmount * Number(taxPercentage || 0)) / 100).toFixed(2)
  );

  const finalValue = Number((discountAmount + taxAmt).toFixed(2));

  console.log(finalValue);

  return {
    value: discountAmount,
    taxAmt,
    finalValue,
  };
};

export const calculateOtherCharges = ({
  total,
  inputValue,
  inputType,
  taxPercentage = 0,
  discountBasedOnGrossAmount = false,
  formData
}) => {
  const baseAmount = Number(total || 0);
  const enteredValue = Number(inputValue || 0);

  console.log(baseAmount);
  console.log(enteredValue);
  console.log(inputType);
  console.log(taxPercentage);
  console.log(discountBasedOnGrossAmount);
  console.log(formData);

  let discountAmount = 0;

  if (inputType === "percentage") {
    if (discountBasedOnGrossAmount) {
      discountAmount = (baseAmount * Math.min(enteredValue, 100)) / 100;
    } else {
      discountAmount = (baseAmount * Math.min(enteredValue, 100)) / 100;
    }
  } else {
    discountAmount = Math.min(enteredValue, baseAmount);
  }


  discountAmount = Number(discountAmount.toFixed(2));
  console.log(discountAmount);
  const taxAmt = Number(
    ((discountAmount * Number(taxPercentage || 0)) / 100).toFixed(2)
  );
  console.log(taxAmt);

  const finalValue = Number((discountAmount + taxAmt).toFixed(2));

  console.log(finalValue);

  return {
    taxAmt,
    finalValue : finalValue,
  };
};
