/* eslint-disable react/prop-types */
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IoIosArrowDown, IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";

function PaymentSplittingIcon({ totalAmount, party}) {
  const location = useLocation();
  const navigate = useNavigate();

  const paymentSplittingReduxData = useSelector(
    (state) => state?.paymentSplitting?.paymentSplittingData
  ) || {};


  // console.log("paymentSplittingReduxData", paymentSplittingReduxData);

  const getTitle=(mode)=>{
    switch(mode){
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
  }

  const handleClick = () => {
    navigate(location.pathname + "/paymentSplitting", {
      state: { totalAmount, party, from: location.pathname },
    });
  };

  return (
    <div className="">
      {Object.keys(paymentSplittingReduxData).length > 0 ? (
        <div className="flex flex-col bg-white shadow-lg p-3 my-3 ">
          <div className="flex justify-between items-center ">
            <section className="flex items-center gap-1">
              <IoIosArrowDown className="font-bold text-xs sm:text-lg" />
              <p className="font-bold text-[10px] sm:text-xs">
                Payment Details
              </p>
            </section>
           
            <section
              onClick={handleClick}
              className=" flex items-center gap-2 font-bold text-violet-500 cursor-pointer"
            >
              <IoMdAdd className="text-lg sm:text-xl" />
              <p className="text-xs sm:text-base font-semibold">
                Receive Amount
              </p>
            </section>
          </div>

          <hr  className="mt-3 border"/>
          <div className="flex flex-col  gap-3 py-4 pl-4 pr-1 mt-2 ">
            {paymentSplittingReduxData?.splittingData?.map((el) => (
              <section key={el.mode} className="flex justify-between">
                <div className="font-semibold text-xs  text-gray-700">
                {getTitle(el.mode)}
                </div>
                <div className="font-bold text-xs text-black">
                  ₹ {el?.amount}
                </div>
              </section>
            ))}
          </div>
          <hr />

          <div className="flex justify-between  items-center py-3 ">
           <p className="font-bold text-md ">Balance  Amount</p>
           <p className="font-bold text-md "> ₹  {paymentSplittingReduxData?.balanceAmount}</p>
          </div>


        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex items-center gap-1  justify-end px-4  text-violet-500 font-semibold cursor-pointer pt-3   md:pb-7 "
        >
          <IoMdAdd size={22} />
          <p>Receive Amount </p>
        </div>
      )}
    </div>
  );
}

export default PaymentSplittingIcon;
