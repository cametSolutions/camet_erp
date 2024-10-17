/* eslint-disable react/prop-types */
import { IoIosAddCircle } from "react-icons/io";

function ReceiptButton({ submitHandler, text }) {
  return (
    <div className=" sm:hidden  fixed bottom-0 left-0 w-full bg-white shadow-lg z-50">
      <button
        onClick={submitHandler}
        className="text-white bg-violet-700 w-full py-4 flex items-center justify-center gap-2 hover:bg-violet-800 cursor-pointer"
      >
        <IoIosAddCircle className="text-2xl" />
        {text}
      </button>
    </div>
  );
}

export default ReceiptButton;
