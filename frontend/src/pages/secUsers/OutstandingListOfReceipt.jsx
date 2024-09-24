import { FaChevronDown } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addSettlementData,
  addOutstandings,
  setTotalBillAmount,
} from "../../../slices/receipt";
import CallIcon from "../../components/common/CallIcon";
import { MdPeopleAlt } from "react-icons/md";
import useFetch from "../../customHook/useFetch";
import { BarLoader } from "react-spinners";

function OutstandingListOfReceipt() {
  ///company Id
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  ///from receipt redux
  const {
    enteredAmount: enteredAmountRedux,
    outstandings,
    totalBillAmount,
  } = useSelector((state) => state.receipt);

  const [data, setData] = useState(outstandings);
  const [total, setTotal] = useState(totalBillAmount);
  // const loading=true;

  const [enteredAmount, setEnteredAmount] = useState(() => {
    const storedAmount = enteredAmountRedux || 0;

    // Convert to a valid number or default to 0
    const parsedAmount = parseFloat(storedAmount);
    const validAmount = !isNaN(parsedAmount) ? parsedAmount : 0;

    return validAmount;
  });

  function formatAmount(amount) {
    // Use toLocaleString to add commas to the number
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { party_id } = useParams();

  const {
    data: receiptData,
    loading,
    error,
    refreshHook,
  } = useFetch(
    `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}?voucher=receipt`
  );

  useEffect(() => {
    if (receiptData) {
      setData(receiptData.outstandings);
      setTotal(receiptData.totalOutstandingAmount);
      dispatch(addOutstandings(receiptData.outstandings));
      dispatch(setTotalBillAmount(receiptData.totalOutstandingAmount));
    }
  }, [receiptData]);

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    if (amount > total) {
      toast.error("You can't enter an amount greater than total amount");
      return;
    }
    setEnteredAmount(amount);
  };
  let remainingAmount = enteredAmount;

  const handleNextClick = () => {
    console.log(enteredAmount);

    if (enteredAmount == null || enteredAmount <= 0) {
      toast.error("Enter an amount");
      return;
    }

    const results = [];
    let remainingAmount = enteredAmount;

    data.forEach((el) => {
      const billAmount = parseFloat(el.bill_pending_amt) || 0;
      const settledAmount = Math.min(billAmount, remainingAmount);

      // Check if settledAmount is greater than zero before including it in results
      if (settledAmount > 0) {
        const remainingBillAmount = Math.max(0, billAmount - settledAmount);

        remainingAmount -= settledAmount;

        const resultObject = {
          billNo: el.bill_no,
          settledAmount,
          remainingAmount: remainingBillAmount,
        };

        results.push(resultObject);
      }
    });

    const settlementData = {
      // party_id: data[0]?.party_id,
      // party_name: data[0]?.party_name,
      totalBillAmount: parseFloat(total),
      enteredAmount: enteredAmount,
      // cmp_id: data[0]?.cmp_id,
      billData: results,
    };

    dispatch(addSettlementData(settlementData));
    navigate("/sUsers/receipt");
  };

  return (
    <>
      <div className="sticky  top-0 z-10 w-full shadow-lg  flex flex-col rounded-[3px] gap-1">
        {/* receive payment */}

        <div className=" flex flex-col rounded-[3px]  bg-white ">
          <div className="bg-[#012a4a] shadow-lg px-4 py-4  flex justify-between items-center   ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={() => {
                  navigate("/sUsers/receipt");
                }}
                className="text-3xl text-white cursor-pointer"
              />
              <p className="text-md text-white font-bold">
                Outstanding Details
              </p>
            </div>
            <p className="text-[12px] text-white mt-1 font-bold  ">
              {dayjs(new Date()).format("DD/MM/YYYY")}
            </p>
          </div>

          {loading && (
            <BarLoader
              height={6}
              color="#3688da"
              width={"100%"}
              speedMultiplier={0}
            />
          )}

          {/* party details */}
          <div className="  px-4 py-2 flex justify-between   ">
            <div className="flex-col">
              <div className="flex items-center gap-2">
                <MdPeopleAlt />
                <p className="font-bold">{data[0]?.party_name}</p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <p className="text-gray-500 test-sm  mdd: text-md font-bold">
                  {" "}
                  Total
                </p>
                <p className="  text-green-600 font-bold">₹{total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CallIcon
                phoneNumber={data[0]?.mobile_no}
                size={18}
                color="green"
              />

              <p className="text-sm font-bold text-gray-500 ">
                {data[0]?.mobile_no === "null" ? "Nil" : data[0]?.mobile_no}
              </p>
            </div>
          </div>
          <hr className="h-px my-0 bg-gray-200 border-0" />

          <div className="flex   p-2 justify-between gap-3  items-center rounded-md  ">
            <div className="flex items-center w-full md:w-3/4 ">
              <label
                className=" uppercase text-blueGray-600 text-sm font-bold px-3  "
                htmlFor="grid-password"
              >
                Amount
              </label>
              <input
                onChange={handleAmountChange}
                type="text"
                value={enteredAmount}
                placeholder="₹12,500"
                className=" px-3 py-4 placeholder-blueGray-300  bg-white rounded text-sm shadow-lg  w-full ease-linear transition-all duration-150"
              />
            </div>
            <div className="flex-1">
              <button
                onClick={handleNextClick}
                className=" w-full hidden md:block text-white p-4 bg-violet-500 text-md rounded-lg "
              >
                Next
              </button>
            </div>
          </div>
          <hr className="h-[1px] my-0 bg-gray-300 border-0" />

          <div
            className="bg-white px-4 py-2 pb-3  rounded-md flex gap-2"
            style={{ boxShadow: "0px -4px 115px rgba(244,246,254 0.1)" }}
          >
            <p className="text-[11px] font-bold">
              # Pending Bills ({data.length})
            </p>
            <FaChevronDown />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2  overflow-x-hidden ">
        {data.map((el, index) => {
          const billAmount = parseFloat(el.bill_pending_amt) || 0;
          const settledAmount = Math.min(billAmount, remainingAmount);
          const remainingBillAmount = Math.max(0, billAmount - settledAmount);

          remainingAmount -= settledAmount;

          return (
            <div
              key={index}
              className=" h-[100px]  rounded-md shadow-xl border border-gray-100  flex justify-between px-4  transition-all duration-150 transform hover:translate-x-1 ease-in-out overflow-y-auto "
            >
              <div className=" h-full px-2 py-8 lg:p-6 w-[200px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col ">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settledAmount > 0 || remainingBillAmount == 0}
                    className="w-7 h-7"
                  />
                  <div className="flex flex-col gap-1 ml-2">
                    <p className="font-bold text-gray-700 text-[12px]">
                      #{el.bill_no}
                    </p>
                    <pc className="text-xs font-semibold text-violet-600">
                      {/* {el.bill_date} */}
                      {dayjs(el.bill_date).format("DD/MM/YYYY")}
                    </pc>
                  </div>
                </div>
              </div>
              <div className=" font-semibold h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end  relative flex-col">
                <div className="flex-col justify-center text-end ">
                  <p className=" text-sm font-bold text-gray-600  ">
                    ₹{formatAmount(el.bill_pending_amt)}
                  </p>
                  <p className=" text-[12px]  text-green-500">
                    ₹ {formatAmount(settledAmount)} Settled
                  </p>

                  <p className=" text-[12px]  text-red-500">
                    ₹ {formatAmount(remainingBillAmount)} Remaining
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className=" block md:hidden fixed bottom-0 p-4 left-0 w-full flex justify-center bg-white ">
          <div
            onClick={handleNextClick}
            className="bg-violet-500 p-4 rounded-lg w-full text-white font-bold"
          >
            Next
          </div>
        </div>
      </div>
    </>
  );
}

export default OutstandingListOfReceipt;
