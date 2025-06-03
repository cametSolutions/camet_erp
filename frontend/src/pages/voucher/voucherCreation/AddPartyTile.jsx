/* eslint-disable react/prop-types */
import { IoMdAdd } from "react-icons/io";
import { IoPerson } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import { PiAddressBookFill } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function AddPartyTile({
  party,
  dispatch,
  removeParty,
  link,
  linkBillTo,
  convertedFrom = [],
}) {
  const location = useLocation();


  return (
    <div>
      <div className="bg-white  py-3 px-4 pb-3 drop-shadow-lg mt-2 md:mt-3 text-xs md:text-base ">
        <div className="flex justify-between">
          <div className="flex gap-2 ">
            <p className="font-bold uppercase text-xs">Party name</p>
            <span className="text-red-500 mt-[-4px] font-bold">*</span>
          </div>

          {party !== null && Object.keys(party)?.length !== 0 && (
            <div className="flex  items-center">
              <div
                className={`${
                  convertedFrom?.length > 0 && "opacity-50 pointer-events-none"
                }`}
              >
                <Link to={link}>
                  <p className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer">
                    Change
                  </p>
                </Link>
              </div>

              {linkBillTo && (
                <div>
                  <Link to={`${linkBillTo}/${party?._id}`}>
                    <p className="text-violet-500 p-1 px-3  text-2xl  border-gray-300 rounded-2xl cursor-pointer">
                      <PiAddressBookFill />
                    </p>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {party == null || Object?.keys(party)?.length === 0 ? (
          <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500">
            <Link to={link} state={{ parentPath: location?.pathname }}>
              <div className="flex justify-center gap-2 hover_scale text-base ">
                <IoMdAdd className="text-2xl" />
                <p>Add Party Name</p>
              </div>
            </Link>
          </div>
        ) : (
          <div className="mt-3 p-3 py-2 border  border-gray-300  rounded-md   cursor-pointer items-center font-medium flex justify-between gap-4">
            <div className="flex justify-center items-center gap-3">
              <IoPerson className="ml-4 text-gray-500" />
              <span>{party?.partyName}</span>
            </div>
            <div
              className={`${
                convertedFrom?.length > 0 && "opacity-50 pointer-events-none"
              }`}
            >
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
    </div>
  );
}

export default AddPartyTile;
