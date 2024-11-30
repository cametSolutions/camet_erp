/* eslint-disable react/prop-types */
import { IoReorderThreeSharp } from "react-icons/io5";
import controllButoon from "../../assets/images/controll.png";

function CametHead({ handleSidebarItemClick,open ,setOpen }) {
  return (
    <>
      <div className="w-full relative  flex items-center  justify-between  pt-4 ">
        <div className="flex gap-3 px-4 items-center">
          <img
            className="h-9"
            src="https://cdn-icons-png.flaticon.com/128/3097/3097023.png"
            alt=""
          />

          <div className={` ${!open && "scale-0"} duration-500 ease-in-out origin-left flex flex-col`}>
            <h1 className={`  text-white text-lg font-bold`}>CAMET ERP</h1>
            <p className="text-[8px] text-gray-500"> Camet IT Solutions</p>
          </div>
        </div>

        <div
          onClick={handleSidebarItemClick}
          className="text-gray-300 text-3xl sm:hidden  cursor-pointer"
        >
          <IoReorderThreeSharp />
        </div>

      
          <img onClick={() => setOpen(!open)} className={ ` ${!open && "rotate-180" }  duration-500 ease-in-out w-5 h-5 hidden sm:block  absolute cursor-pointer right-3 z-[100]`} src={controllButoon} alt="" />
     

        <div />
      </div>
      <hr className=" border border-gray-700 mx-4 my-4 mb-3" />
    </>
  );
}

export default CametHead;
