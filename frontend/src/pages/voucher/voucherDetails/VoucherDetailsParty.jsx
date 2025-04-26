/* eslint-disable react/prop-types */
import { FaUser } from "react-icons/fa";
import { MdPhone } from "react-icons/md";

export default function VoucherDetailsParty({ data }) {
  const partyName = data?.party?.partyName || "N/A";
  const mobileNumber =
    data?.party?.mobileNumber !== "null" ? data?.party?.mobileNumber : "";

  return (
    <div className="bg-white rounded-lg shadow-sm mt-2 overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b">
        <h2 className=" text-xs sm:text-sm text-gray-800 font-bold">PARTY DETAILS</h2>
      </div>

      <div className="p-3">
          <div className="flex flex-col justify-start">
            <div className="flex items-center gap-2">
              <div className="mt-1 bg-gray-100 rounded-full p-1">
                <FaUser size={12} className="text-gray-500" />
              </div>
              <p className="font-semibold text-sm">{partyName}</p>
            </div>

            {mobileNumber && (
              <div className="flex items-center gap-2 mt-1 text-gray-500">
                <div className="mt-1 bg-gray-100 rounded-full p-1">
                  <MdPhone size={12} className="text-gray-500" />
                </div>
                <p className="text-xs">{mobileNumber}</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
