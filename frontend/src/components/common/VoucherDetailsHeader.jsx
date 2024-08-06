/* eslint-disable react/prop-types */
import { MdTextsms } from "react-icons/md";
import SwallFireForPdf from "./SwallFireForPdf";
import { FaEdit } from "react-icons/fa";
import CancelButton from "./CancelButton";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function VoucherDetailsHeader({
  data,
  reFetchParent,
  editLink,
  user,
  number,
  tab,
}) {
  const [refresh, setRefresh] = useState(false);


  const navigate = useNavigate();

  const reFetch = () => {
    reFetchParent(!refresh);
  };
  return (
    <div>
      <div className="bg-white p-4 mt-3 flex justify-between items-center">
        <div className=" ">
          <p className="text-sm text-violet-500 font-semibold ">
            ID #{number || ""}
          </p>
          <p className="text-xs font-medium text-gray-500 mt-1 ">
            {dayjs(data.createdAt).format("DD/MM/YYYY")}
          </p>
        </div>

        <div className="hidden md:block">
          <div className="  flex justify-center p-4 gap-12 text-lg text-violet-500 mr-4">
            <CancelButton
              id={data._id}
              tab={tab}
              isCancelled={data?.isCancelled}
              reFetch={reFetch}
            />
            <div
              onClick={() => navigate(editLink)}
              className={` ${
                data?.isCancelled && "pointer-events-none opacity-60"
              } flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer`}
            >
              <FaEdit className="text-blue-500" />
              <p className="text-black font-bold text-sm">Edit</p>
            </div>

            {tab !== "stockTransfer" && (
              <SwallFireForPdf data={data} tab={tab} user={user} />
            )}

            <div
              className={` ${
                data?.isCancelled && "pointer-events-none opacity-60"
              } flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer`}
            >
              <MdTextsms className="text-green-500" />
              <p className="text-black font-bold text-sm">Sms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoucherDetailsHeader;
