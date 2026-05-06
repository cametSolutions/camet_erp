export const calculateDiscountValues = ({
  total,
  inputValue,
  inputType,
  taxPercentage = 0,
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