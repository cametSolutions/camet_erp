/* eslint-disable react/prop-types */
import { IoMdArrowDropright } from "react-icons/io";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function PaymentSplittingIcon({ totalAmount }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(location.pathname + "/paymentSplitting", {
      state: { totalAmount,from:location.pathname },
    });
  };


  //jkhhjgjhg


  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-end px-4 mt-4 text-violet-500 font-semibold cursor-pointer"
    >
      <IoMdArrowDropright size={25} />
      <p>Receive Amount</p>
    </div>
  );
}

export default PaymentSplittingIcon;
