/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

const getTitle = (mode) => {
  switch (mode) {
    case "cash":
      return "Cash";
    case "online":
      return "NEFT/Upi";
    case "cheque":
      return "Cheque";
    case "credit":
      return "Credit";
    default:
      return "Cash";
  }
};
function PaymentSplittingDetails({ data }) {
  return (
    <div className="mt-2 bg-white shadow-lg  p-4">
      <h1 className="text-sm font-bold">Payment Mode</h1>
      <hr className="my-4 border " />
      {data?.splittingData.length > 0 &&
        data?.splittingData.map((el, index) => (
          <section key={index} className="flex justify-between mt-2 ">
            <div className="font-bold text-sm text-gray-600">
              {getTitle(el?.mode)}
            </div>
            <div className="font-bold text-sm  text-black">₹ {el?.amount}</div>
          </section>
        ))}
    </div>
  );
}

export default PaymentSplittingDetails;
