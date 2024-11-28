import React from "react";
import { IoReorderThreeSharp } from "react-icons/io5";

function CametHead({ handleSidebarItemClick }) {
  return (
    <div>
      <div className="w-full relative  flex items-center justify-center py-5 bg-[#0b1d34]  ">
        <div className="flex gap-3 px-4 items-center justify-center">
          <img
            className="h-[21px]"
            src="https://cdn-icons-png.flaticon.com/128/3097/3097023.png"
            alt=""
          />

          <div className="flex flex-col">
            <h1 className="text-white text-[18px] font-bold">CAMET ERP</h1>
            {/* <p className="text-[8px] text-gray-300"> Camet IT Solutions</p> */}
          </div>
        </div>

        {/* 
        <div
          onClick={handleSidebarItemClick}
          className="text-white text-3xl  md:hidden cursor-pointer"
        >
          <IoReorderThreeSharp />
        </div> */}
      </div>
      <hr className=" border border-gray-600 mx-4" />

    </div>
  );
}

export default CametHead;
