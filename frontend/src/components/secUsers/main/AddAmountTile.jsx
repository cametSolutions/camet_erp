/* eslint-disable react/no-unknown-property */
/* eslint-disable no-unreachable */
/* eslint-disable react/prop-types */
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function AddAmountTile({ process = "add" }) {
  const navigate = useNavigate();

  const { voucherType, enteredAmount, remainingAmount, party } = useSelector(
    (state) => state.commonAccountingVoucherSlice
  );

  const handleNavigate = () => {
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    } else if (process == "add") {
      navigate(`/sUsers/${voucherType}/addAmount/${party.party_master_id}`);
    } else if (process == "edit") {
      navigate(
        `/sUsers/${voucherType}/editAmount/${party.party_master_id}`
      );
    }
  };

  return (
    <div className="p-4 bg-white mt-3 shadow-lg ">
      {enteredAmount <= 0 ? (
        <>
          <div className="flex items-center mb-2 gap-2 ">
            <p className="font-bold uppercase text-xs"> Amount</p>
            <span className="text-red-500 font-bold"> *</span>
          </div>
          <div
            onClick={handleNavigate}
            className=" py-6 border  bg-white h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500 "
          >
            <div className="flex justify-center gap-2   hover_scale items-center  ">
              <IoMdAdd className="text-2xl" />
              <p className="text-md font-semibold">Add Amount</p>
            </div>
          </div>
        </>
      ) : (
        <div className="px-1">
          <div className="flex items-center justify-between w-full ">
            <label
              className=" uppercase text-blueGray-600 text-sm font-bold w-2/3  "
              htmlFor="grid-password"
            >
              Amount
            </label>
            <div class="relative flex  items-center">
              <span class="absolute left-3 text-gray-600 text-sm">₹</span>
              <input
                readOnly
                type="text"
                value={enteredAmount}
                placeholder="12,500"
                className="py-3 pl-8 border-gray-300 shadow-lg pointer-events-none   placeholder-blueGray-300 bg-white rounded text-sm  w-full ease-linear transition-all duration-150"
              />
            </div>
          </div>
          <section className="flex justify-between mt-3 ">
            <p
              onClick={handleNavigate}
              className="text-violet-500  cursor-pointer text-xs md:text-md font-bold flex items-center gap-1"
            >
              <IoMdAdd className="text-xl" />
              Add More Bills
            </p>
            <p className="text-xs md:text-md font-semibold mr-1">
              Remaining Amount
              <span className="text-red-500"> ₹ {remainingAmount?.toFixed(2) || 0}</span>
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default AddAmountTile;
