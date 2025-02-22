/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { IoIosArrowRoundBack } from "react-icons/io";
import { BarLoader } from "react-spinners";
import { MdPeopleAlt } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import CallIcon from "../../common/CallIcon";
import { camelToNormalCase } from "../../../../utils/camelCaseToNormalCase";

function OutstandingList({
  loading,
  data,
  navigate,
  total,
  formatAmount,
  tab,
}) {
  const { enteredAmount: enteredAmountRedux } = useSelector(
    (state) => state.receipt
  );

  const [selectedBills, setSelectedBills] = useState(new Set());
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [enteredAmount, setEnteredAmount] = useState(() => {
    const storedAmount = enteredAmountRedux || 0;
    const parsedAmount = parseFloat(storedAmount);
    return !isNaN(parsedAmount) ? parsedAmount : 0;
  });

  // Calculate total amount of currently selected bills
  const calculateSelectedTotal = (bills) => {
    return data
      .filter((bill) => bills.has(bill.bill_no))
      .reduce((sum, bill) => sum + parseFloat(bill.bill_pending_amt), 0);
  };

  // Automatically select bills based on entered amount
  useEffect(() => {
    if (data && data.length > 0 && enteredAmount > 0) {
      const newSelectedBills = new Set();
      let remainingAmount = enteredAmount;

      // Go through bills from top to bottom
      for (const bill of data) {
        const billAmount = parseFloat(bill.bill_pending_amt) || 0;

        // If we can fully or partially settle this bill, select it
        if (remainingAmount > 0) {
          newSelectedBills.add(bill.bill_no);
          remainingAmount -= billAmount;
        }
      }

      setSelectedBills(newSelectedBills);

      // Calculate advance amount if any remains after selecting all possible bills
      if (remainingAmount > 0) {
        setAdvanceAmount(remainingAmount);
      } else {
        setAdvanceAmount(0);
      }
    } else {
      setSelectedBills(new Set());
      setAdvanceAmount(0);
    }
  }, [enteredAmount, data]);

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    setEnteredAmount(amount);
  };

  const handleBillSelection = (billNo) => {
    const newSelectedBills = new Set(selectedBills);

    if (newSelectedBills.has(billNo)) {
      // Always allow deselecting
      newSelectedBills.delete(billNo);
    } else {
      const wouldExceedAmount = advanceAmount === 0;

      if (wouldExceedAmount) {
        return;
      }

      newSelectedBills.add(billNo);
    }

    setSelectedBills(newSelectedBills);

    // Recalculate advance amount
    const selectedTotal = calculateSelectedTotal(newSelectedBills);
    if (enteredAmount > selectedTotal) {
      setAdvanceAmount(enteredAmount - selectedTotal);
    } else {
      setAdvanceAmount(0);
    }
  };

  // Calculate remaining amount distribution among selected bills
  let remainingAmount = enteredAmount;

  return (
    <>
      <div className="sticky top-0 z-10 w-full shadow-lg flex flex-col rounded-[3px] gap-1">
        <div className="flex flex-col rounded-[3px] bg-white">
          <div className="bg-[#012a4a] shadow-lg px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={() => navigate(-1)}
                className="text-3xl text-white cursor-pointer"
              />
              <p className="text-md text-white font-bold">
                Outstanding Details
              </p>
            </div>
            <p className="text-[12px] text-white mt-1 font-bold">
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

          <div className="px-4 py-2 flex justify-between">
            <div className="flex-col">
              <div className="flex items-center gap-2">
                <MdPeopleAlt />
                <p className="font-bold">{data[0]?.party_name}</p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <p className="text-gray-500 test-sm mdd: text-md font-bold">
                  Total
                </p>
                <p className="text-green-600 font-bold">
                  ₹{formatAmount(calculateSelectedTotal(selectedBills))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CallIcon
                phoneNumber={data[0]?.mobile_no}
                size={18}
                color="green"
              />
              <p className="text-sm font-bold text-gray-500">
                {data[0]?.mobile_no === "null" ? "Nil" : data[0]?.mobile_no}
              </p>
            </div>
          </div>
          <hr className="h-px my-0 bg-gray-200 border-0" />

          <div className="flex p-2 justify-between gap-3 items-center rounded-md">
            <div className="flex items-center w-full md:w-3/4">
              <label className="uppercase text-blueGray-600 text-sm font-bold px-3">
                Amount
              </label>
              <input
                onChange={handleAmountChange}
                type="text"
                value={enteredAmount}
                placeholder="₹12,500"
                className="px-3 py-4 placeholder-blueGray-300 bg-white rounded text-sm shadow-lg w-full ease-linear transition-all duration-150"
              />
            </div>
            <div className="flex-1">
              <button className="w-full hidden md:block text-white p-4 bg-violet-500 text-md rounded-lg">
                Next
              </button>
            </div>
          </div>
          <hr className="h-[1px] my-0 bg-gray-300 border-0" />

          <div className="bg-white px-4 py-2 pb-3 rounded-md flex gap-2 justify-between flex-wrap">
            <div className="flex gap-2 items-center">
              <p className="text-[11px] font-bold">
                # Selected Bills ({selectedBills.size}/{data.length})
              </p>
              <FaChevronDown />
            </div>
            {advanceAmount > 0 && (
              <p className="text-[11px] text-gray-600 font-bold">
                # Advance Amount:{" "}
                <span className="text-violet-500">
                  ₹ {Number(advanceAmount.toFixed(2))}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2 overflow-x-hidden">
        {data?.map((el, index) => {
          const billAmount = parseFloat(el.bill_pending_amt) || 0;
          const isSelected = selectedBills.has(el.bill_no);
          const settledAmount = isSelected
            ? Math.min(billAmount, remainingAmount)
            : 0;
          const remainingBillAmount = Math.max(0, billAmount - settledAmount);

          if (isSelected) {
            remainingAmount -= settledAmount;
          }

          return (
            <div
              key={index}
              className="h-[110px] rounded-md shadow-xl border border-gray-300 flex justify-between px-4 transition-all duration-150 transform hover:translate-x-1 ease-in-out overflow-y-auto"
            >
              <div className="h-full px-2 py-8 lg:p-6 w-[200px] md:w-[180px] lg:w-[300px] relative">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={() => handleBillSelection(el.bill_no, billAmount)}
                    checked={isSelected}
                    className="w-7 h-7"
                  />
                  <div className="flex flex-col items-start gap-1 ml-2">
                    <p className="font-bold text-gray-700 text-[12px]">
                      #{el.bill_no}
                    </p>
                    <p className="text-xs font-semibold text-violet-600">
                      {dayjs(el.bill_date).format("DD/MM/YYYY")}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      #{camelToNormalCase(el?.source)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="font-semibold h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end relative flex-col">
                <div className="flex-col justify-center text-end">
                  <p className="text-sm font-bold text-gray-600">
                    ₹{formatAmount(el.bill_pending_amt)}
                  </p>
                  <p className="text-[12px] text-green-500">
                    ₹{formatAmount(settledAmount)} Settled
                  </p>
                  <p className="text-[12px] text-red-500">
                    ₹{formatAmount(remainingBillAmount)} Remaining
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="md:hidden fixed bottom-0 p-4 left-0 w-full flex justify-center bg-white">
          <div className="bg-violet-500 p-4 rounded-lg w-full text-white font-bold">
            Next
          </div>
        </div>
      </div>
    </>
  );
}

export default OutstandingList;
