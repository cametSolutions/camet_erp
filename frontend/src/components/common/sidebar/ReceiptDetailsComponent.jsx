/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { FcCancel } from "react-icons/fc";
import { IoMdShareAlt } from "react-icons/io";
import { MdOutlineArrowBack, MdTextsms } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { PiBankBold } from "react-icons/pi";
import { MdOutlinePayment } from "react-icons/md";
import { PiNote } from "react-icons/pi";
import { BsCalendar2DateFill } from "react-icons/bs";

function ReceiptDetailsComponent({
  backHandler,
  data,
  handleCancel,
  title,
  voucherNumber,
  to,
  isPrimary = false,
}) {
  const navigate = useNavigate();

  console.log("to", to);

  return (
    <div className="flex ">
      <div className="bg-[rgb(244,246,254)] flex-1 h-screen  relative ">
        {/* headinh section  */}
        <div className="flex items-center gap-3  text-white text-md p-4  bg-[#012a4a] sticky top-0 z-10">
          <MdOutlineArrowBack
            onClick={backHandler}
            className="text-2xl cursor-pointer"
          />

          <h3 className="font-bold">{title}</h3>
        </div>
        {/* headinh section  */}

        {/* payment details */}
        <div className="md:grid md:grid-cols-2 gap-4 bg-white    ">
          <div className=" mt-3 p-4">
            <p className="text-sm text-violet-500 font-semibold ">
              ID #{voucherNumber}
            </p>
            <p className="text-xs font-medium text-gray-500 mt-1 ">
              {dayjs(data.createdAt).format("DD/MM/YYYY")}
            </p>
          </div>
          <div className="w-full flex justify-center bottom-0 absolute md:flex md:justify-end p-4 md:relative  gap-14 md:text-md text-violet-500 md:mr-14 bg-white ">
            {!isPrimary && (
              <div
                onClick={() => handleCancel(data._id)}
                disabled={data.isCancelled}
                className={`flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110 cursor-pointer ${
                  data.isCancelled ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <FcCancel className="text-violet-500" />
                <p className="text-black font-bold text-sm">
                  {data.isCancelled ? "Cancelled" : "Cancel"}
                </p>
              </div>
            )}
            <div
              className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer
          "
              onClick={() => {
                navigate(to, {
                  state: {
                    receiptData: data,
                  },
                });
              }}
            >
              <IoMdShareAlt />

              <p className="text-black font-bold text-sm">Share</p>
            </div>
            <div className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer">
              <MdTextsms className="text-green-500" />
              <p className="text-black font-bold text-sm">Sms</p>
            </div>
          </div>
        </div>
        {/* payment details */}

        {/* party details */}

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
        {/* party details */}
        {/* party Total Mount */}

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

export default ReceiptDetailsComponent;
