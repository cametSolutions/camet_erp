/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { PiBankBold } from "react-icons/pi";
import { MdOutlinePayment } from "react-icons/md";
import { PiNote } from "react-icons/pi";
import { BsCalendar2DateFill } from "react-icons/bs";
import VoucherDetailsActionButtons from "../../voucher/voucherDetails/actionButtons/VoucherDetailsActionButtons";
import TitleDiv from "@/components/common/TitleDiv";

function AccVoucherDetailsComponent({ data, title, voucherNumber, loading }) {
  const navigate = useNavigate();

  return (
    <div className="bg-[rgb(244,246,254)] flex-1 h-screen  relative ">
      <TitleDiv title={title || "Voucher Details"} loading={loading} />

      <div className={`${loading && "pointer-events-none opacity-80"}`}>
        <div className="flex items-center justify-between gap-4 bg-white pr-3 p-4  ">
          <div className="">
            <p className="text-sm text-violet-500 font-semibold ">
              ID #{voucherNumber}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1 ">
              {dayjs(data.date).format("DD/MM/YYYY")}
            </p>
          </div>
          <VoucherDetailsActionButtons
            data={data}
            // reFetch={refreshHook}
            // setActionLoading={setActionLoading}
            // actionLoading={actionLoading}
          />
        </div>

        <div className="bg-white mt-2 p-4  ">
          <div className=" text-sm mb-2">
            <h2 className="font-bold  text-gray-500 md:text-md text-sm">
              PARTY NAME
            </h2>
          </div>
          <hr />
          <hr />
          <hr />
          <div className="mt-2">
            <p className="font-semibold md:text-md text-sm ">
              {data?.party?.partyName}
            </p>
            <p className="text-xs mt-1 text-gray-400 font-semibold ">
              {data.mobile_no !== "null" ? data.mobile_no : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 justify-center bg-white mt-2  p-4">
          <div className="flex justify-between">
            <p className="font-bold md:text-md text-sm">Settled Amount</p>
            <p className="font-bold md:text-md text-sm">
              ₹{" "}
              {data?.enteredAmount > data?.totalBillAmount
                ? data?.totalBillAmount
                : data?.enteredAmount}
            </p>
          </div>
          {data.remainingAmount > 0 && (
            <div className="flex justify-between text-gray-500 text-sm mt-2  ">
              <p className="font-semibold">Remaining Amount</p>
              <p className="font-semibold  text-green-500">
                ₹ {parseInt(data.remainingAmount).toFixed(2)}
              </p>
            </div>
          )}
          {data.advanceAmount > 0 && (
            <div className="flex justify-between text-gray-500 text-sm   ">
              <p className="font-semibold">Advance Amount</p>
              <p className="font-semibold text-violet-500 ">
                ₹ {parseInt(data.advanceAmount).toFixed(2)}
              </p>
            </div>
          )}
        </div>
        {/* party Total Mount */}
        {/* payment method */}

        <div className="p-4 bg-white mt-2 flex flex-col gap-2 text-[12px] sm:text-md ">
          <h3 className="font-bold  md:text-md ">PAYMENT DETAILS</h3>

          <hr className="border" />

          <div className="font-semibold  mt-3 text-gray-500 flex justify-between ">
            <h1 className="flex items-center gap-3">
              <MdOutlinePayment /> Payment Method
            </h1>
            <p> {data.paymentMethod}</p>
          </div>

          {(data.paymentMethod == "Cheque" ||
            data.paymentMethod == "Online") && (
            <>
              <div className=" font-semibold mt-1 text-gray-500 flex justify-between gap-3">
                <p className="flex items-center gap-3">
                  <PiBankBold /> Bank
                </p>
                <p> {data.paymentDetails.bank_name}</p>
              </div>

              {data.paymentMethod == "Cheque" && (
                <>
                  <div className=" font-semibold mt-1 text-gray-500 flex justify-between gap-3">
                    <p className="flex items-center gap-3">
                      <PiNote /> Cheque No
                    </p>
                    <p> {data.paymentDetails.chequeNumber}</p>
                  </div>
                  <div className=" font-semibold mt-1 text-gray-500 flex justify-between gap-3">
                    <p className="flex items-center gap-3">
                      <BsCalendar2DateFill /> Cheque Date
                    </p>
                    <p>
                      {" "}
                      {new Date(
                        data.paymentDetails.chequeDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Note */}

        {data?.note && (
          <div className="bg-white mt-2 p-4  ">
            <div className=" text-sm mb-2">
              <h2 className="font-bold  text-gray-500 md:text-md text-sm">
                Note
              </h2>
            </div>
            <hr />
            <hr />
            <hr />
            <div className="mt-2">
              <p className="font-semibold md:text-md text-sm text-gray-500 ">
                {data?.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccVoucherDetailsComponent;
