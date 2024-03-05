import { useState } from "react";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { useSelector } from "react-redux";
import { MdOutlineClose } from "react-icons/md";
import { removeParty } from "../../../slices/invoice";
import { useDispatch } from "react-redux";

function Invoice() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [modal, setModal] = useState(false)
  const dispatch = useDispatch();
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  const party = useSelector((state) => state.invoice.party);
  console.log(party);

  return (
    <div className="flex">
      <div>
        <Sidebar TAB={"invoice"} showBar={showSidebar} />
      </div>

      <div className="flex-1 bg-slate-100 relative h-screen">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2  ">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          />
          <p className="text-white text-lg   font-bold ">
            Create Bill / Invoice
          </p>
        </div>

        {/* invoiec date */}

        <div className="flex justify-between mt-3 p-4 bg-white drop-shadow-lg items-center ">
          <div className=" flex flex-col gap-1 justify-center">
            <p className="text-md font-semibold text-violet-400">Invoice</p>
            <p className="text-sm font-semibold   text-gray-500">
              {new Date().toDateString()}
            </p>
          </div>
          <div className=" ">
            <p className="text-violet-500 text-xs  p-1 px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer">
              Edit
            </p>
          </div>
        </div>

        {/* adding party */}

        <div className="bg-white p-4 pb-6 drop-shadow-lg mt-4">
          <div className="flex justify-between">
            <div className="flex gap-2 ">
              <p className="font-bold uppercase text-sm">Party name</p>
              <span className="text-red-500 mt-[-4px] font-bold">*</span>
            </div>
            {Object.keys(party).length !== 0 && (
              <div>
                <Link to={"/pUsers/searchParty"}>
                  <p className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer">
                    Change
                  </p>
                </Link>
              </div>
            )}
          </div>

          {Object.keys(party).length === 0 ? (
            <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500">
              <Link to={"/pUsers/searchParty"}>
                <div className="flex justify-center gap-2 hover_scale ">
                  <IoMdAdd className="text-2xl" />
                  <p>Add Party Name</p>
                </div>
              </Link>
            </div>
          ) : (
            <div className="mt-3 p-3 border  border-gray-300 h-10 rounded-md   cursor-pointer items-center font-medium flex justify-between gap-4">
              <div className="flex justify-center items-center gap-3">
                <IoPerson className="ml-4 text-gray-500" />
                <span>{party?.partyName}</span>
              </div>
              <div className="">
                <MdOutlineClose
                  onClick={() => {
                    dispatch(removeParty());
                  }}
                  className="mr-2 text-pink-500 hover_scale hover:text-pink-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* adding items */}

        <div className="bg-white p-4 pb-6  drop-shadow-lg mt-4">
          <div className="flex gap-2 ">
            <p className="font-bold uppercase text-sm">Items</p>
            <span className="text-red-500 mt-[-4px] font-bold">*</span>
          </div>

          <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500">
            <Link to={"/pUsers/addItem"}>
              <div className="flex justify-center gap-2 hover_scale ">
                <IoMdAdd className="text-2xl" />
                <p>Add Item</p>
              </div>
            </Link>
          </div>
        </div>

        <div  id="popup-modal" className=" hidden absolute top-0 right-0 bottom-0 left-0 z-50 flex justify-center items-center">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative  rounded-lg shadow bg-gray-700">
              <button
                type="button"
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent   rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                data-modal-hide="popup-modal"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg
                  className="mx-auto mb-4 text-gray-200 w-12 h-12 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-200 ">
                  You haven't selected any default price level. Please select
                  one:
                </h3>
                <div className="">
                  <select className="border border-gray-300 rounded-lg py-2 px-4 mb-5 w-full  ">
                    <option value="">Select a default price level</option>
                    <option value="level1">Level 1</option>
                    <option value="level2">Level 2</option>
                    <option value="level3">Level 3</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-500  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-3"
                  onClick={() => {
                    // Add logic to handle selection here
                    // For example, you can close the modal and apply the selected price level
                    console.log("Selected price level");
                  }}
                >
                  Apply
                </button>
                <button
                  data-modal-hide="popup-modal"
                  type="button"
                  className=" bg-red-500 text-white hover:bg-red-700 focus:outline-none   rounded-lg font-medium text-sm inline-flex items-center px-5 py-2.5 text-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
