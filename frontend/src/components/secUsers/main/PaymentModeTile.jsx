import React from "react";
import { IoMdAdd } from "react-icons/io";
import { IoAddOutline } from "react-icons/io5";

function PaymentModeTile() {
  return (
    <div className="p-4 bg-white mt-3 shadow-lg  ">
      <head className="flex justify-between items-center">
        <div className="flex items-center mb-2 gap-2 ">
          <p className="font-bold uppercase text-xs"> Payment Mode</p>
          <span className="text-red-500 font-bold"> *</span>
        </div>
        <div className="flex items-center gap-3">
          <button className=" font-semibold   text-xs  p-1 px-2 md:px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer">
            Cash
          </button>
          <button className="  font-semibold   text-xs  p-1 px-2 md:px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer">
            Cheque
          </button>
          <button className=" font-semibold  text-xs  p-1 px-2 md:px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer">
            Online
          </button>
        </div>
      </head>
      <div>
        <p className="flex items-center mt-5  text-violet-500 text-xs md:text-md  font-bold">
          {" "}
          <IoAddOutline size={20} /> Add Note/Description
        </p>
      </div>
    </div>
  );
}

export default PaymentModeTile;
