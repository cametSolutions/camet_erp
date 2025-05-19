/* eslint-disable react/prop-types */
import { PiWarehouseFill } from "react-icons/pi";


export default function VoucherDetailsToGodown({ data }) {
  const {
    stockTransferToGodown: { godown },
  } = data;

  return (
    <div className="bg-white rounded-lg shadow-sm mt-2 overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b">
        <h2 className=" text-xs sm:text-xs text-gray-800 font-bold">
          DESTINATION GODOWN DETAILS
        </h2>
      </div>

      <div className="p-3">
        <div className="flex flex-col justify-start">
          <div className="flex items-center gap-2">
            <div className="mt-1 bg-gray-100 rounded-full p-1">
              <PiWarehouseFill size={12} className="text-gray-500" />
            </div>
            <p className="font-semibold text-sm">{godown || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
