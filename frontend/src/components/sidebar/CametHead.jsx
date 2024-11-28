import React from "react";
import { IoReorderThreeSharp } from "react-icons/io5";

function CametHead({ handleSidebarItemClick }) {
  return (
    <div className="w-full relative  flex flex-col justify-between pt-4 pb-2">
      <div className="flex gap-3 px-4 items-center">
        <img
          className="h-9"
          src="https://cdn-icons-png.flaticon.com/128/3097/3097023.png"
          alt=""
        />

        <div className="flex flex-col">
          <h1 className="text-white text-lg font-bold">CAMET ERP</h1>
          <p className="text-[8px] text-gray-300"> Camet IT Solutions</p>
        </div>
      </div>

      {/* <div
            onClick={handleSidebarItemClick}
            className="text-white text-3xl  md:hidden cursor-pointer"
          >
            <IoReorderThreeSharp />
          </div> */}

      <div />
      <hr className=" border border-gray-700 mx-4 my-1 mt-5" />
    </div>
  );
}

export default CametHead;
