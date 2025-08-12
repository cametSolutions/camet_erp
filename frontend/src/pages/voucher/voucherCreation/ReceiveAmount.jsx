import { IoMdAdd } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function ReceiveAmount() {
  const navigate = useNavigate();
  const handleReceiveAmount = () => {

    navigate("/sUsers/sales/paymentSplitting");

  };
  return (
    <div className="bg-white">
      <div className=" flex justify-end items-center  font-semibold gap-1 text-violet-500 cursor-pointer pr-4">

        <div
            onClick={handleReceiveAmount}
          className="flex items-center"
        >
          <IoMdAdd className="text-lg sm:text-xl" />
          <p className="text-xs ml-1 sm:text-base">Receive Amount</p>
        </div>
      </div>
    </div>
  );
}

export default ReceiveAmount;
