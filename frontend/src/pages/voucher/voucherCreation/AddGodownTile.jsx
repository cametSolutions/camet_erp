/* eslint-disable react/prop-types */
import { IoMdAdd } from "react-icons/io";
import { IoPerson } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeStockTransferToGodown } from "../../../../slices/voucherSlices/commonVoucherSlice";

function AddGodownTile() {
  const selectedstockTransferToGodown = useSelector(
    (state) => state.commonVoucherSlice?.stockTransferToGodown?.godown || ""
  );

  const dispatch = useDispatch();

  return (
    <div>
      <div className="bg-white  py-3 px-4 pb-3 drop-shadow-lg mt-2 md:mt-3 text-xs md:text-base ">
        <div className="flex justify-between">
          <div className="flex flex-col ">
            <div className="flex gap-2 ">
              <p className="font-bold uppercase text-xs"> Godown / Van</p>
              <span className="text-red-500 mt-[-4px] font-bold">*</span>
            </div>
            <p className="text-gray-500 text-[10px] mt-[-5px]">[Destination]</p>
          </div>

          {selectedstockTransferToGodown && (
            <div className="flex  items-center">
              <div>
                <Link to={"/sUsers/searchGodown"}>
                  <p className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer">
                    Change
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>

        {!selectedstockTransferToGodown ? (
          <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500">
            <Link to={"/sUsers/searchGodown"}>
              <div className="flex justify-center gap-2 hover_scale text-base ">
                <IoMdAdd className="text-2xl" />
                <p>Add Godown / Van</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="mt-3 p-3 py-2 border  border-gray-300  rounded-md   cursor-pointer items-center font-medium flex justify-between gap-4">
            <div className="flex justify-center items-center gap-3">
              <IoPerson className="ml-4 text-gray-500" />
              <span>{selectedstockTransferToGodown}</span>
            </div>
            <div>
              {/* <Link to={link}> */}
              <p
                onClick={() => {
                  dispatch(removeStockTransferToGodown());
                }}
                className="text-red-500 p-1 px-3  text-md    rounded-2xl cursor-pointer"
              >
                <MdOutlineClose />
              </p>
              {/* </Link> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddGodownTile;
