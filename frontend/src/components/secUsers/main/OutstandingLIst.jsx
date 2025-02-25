/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdPeopleAlt } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import CallIcon from "../../common/CallIcon";
import { camelToNormalCase } from "../../../../utils/camelCaseToNormalCase";
import { addSettlementData as addSettlementDataReceipt } from "../../../../slices/receipt";
import { addSettlementData as addSettlementDataPayment } from "../../../../slices/payment";
import { useNavigate } from "react-router-dom";
import CustomBarLoader from "@/components/common/CustomBarLoader";

function OutstandingList({ loading, data, total, tab, process = "add" }) {
  const {
    enteredAmount: enteredAmountReduxOfReceipt,
    billData: receiptBillData,
  } = useSelector((state) => state.receipt);
  const {
    enteredAmount: enteredAmountReduxOfPayment,
    billData: paymentBillData,
  } = useSelector((state) => state.payment);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get the appropriate billData based on tab
  const savedBillData = tab === "receipt" ? receiptBillData : paymentBillData;

  // Initialize states with saved data if available
  const [selectedBills, setSelectedBills] = useState(new Set());

  const [billSettlements, setBillSettlements] = useState(() => {
    if (savedBillData?.length > 0) {
      return new Map(
        savedBillData.map((bill) => [bill.billNo, bill.settledAmount])
      );
    }
    return new Map();
  });

  const [selectionOrder, setSelectionOrder] = useState(() => {
    if (savedBillData?.length > 0) {
      return savedBillData.map((bill) => bill.billNo);
    }
    return [];
  });

  const [enteredAmount, setEnteredAmount] = useState(() => {
    const storedAmount =
      tab === "receipt"
        ? enteredAmountReduxOfReceipt || 0
        : enteredAmountReduxOfPayment || 0;
    const parsedAmount = parseFloat(storedAmount);
    return !isNaN(parsedAmount) ? parsedAmount : 0;
  });
  const [advanceAmount, setAdvanceAmount] = useState(0);

  function formatAmount(amount) {
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  // Calculate settlements based on selection order
  const calculateSettlements = (selectedBillsSet, billOrder, amount) => {
    const settlements = new Map();
    let remainingAmount = amount;

    billOrder.forEach((billNo) => {
      if (selectedBillsSet.has(billNo)) {
        const bill = data.find((b) => b?.bill_no === billNo);
        const billAmount = parseFloat(bill?.bill_pending_amt);
        if (remainingAmount > 0) {
          const settlementAmount = Math.min(billAmount, remainingAmount);
          settlements.set(billNo, settlementAmount);
          remainingAmount -= settlementAmount;
        } else {
          settlements.set(billNo, 0);
        }
      }
    });

    return { settlements, advanceAmount: Math.max(0, remainingAmount) };
  };

  // Check if the entered amount is fully settled
  const isAmountFullySettled = () => {
    const totalSettled = Array.from(billSettlements.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );
    return Math.abs(totalSettled - enteredAmount) < 0.01;
  };

  // Use effect for initial setup and amount changes
  useEffect(() => {
    if (data && data.length > 0 && enteredAmount > 0) {
      // If we have saved bill data, use that instead of FIFO
      if (savedBillData?.length > 0) {
        const newSelectedBills = new Set(
          savedBillData.map((bill) => bill.billNo)
        );

        const newSelectionOrder = savedBillData.map((bill) => bill.billNo);

        setSelectedBills(newSelectedBills);
        setSelectionOrder(newSelectionOrder);
        // const newBill new Map(savedBillData.map((bill) => [bill?.billNo, bill?.settledAmount]));
        const { settlements, advanceAmount: newAdvanceAmount } =
          calculateSettlements(
            newSelectedBills,
            newSelectionOrder,
            enteredAmount
          );

        setBillSettlements(settlements);
        setAdvanceAmount(newAdvanceAmount);
      } else {
        // FIFO selection only if no saved data
        const newSelectedBills = new Set();
        const newSelectionOrder = [];
        let remainingAmount = enteredAmount;

        for (const bill of data) {
          const billAmount = parseFloat(bill.bill_pending_amt);
          if (remainingAmount > 0) {
            newSelectedBills.add(bill.bill_no);
            newSelectionOrder.push(bill.bill_no);
            remainingAmount -= billAmount;
          }
        }

        setSelectedBills(newSelectedBills);
        setSelectionOrder(newSelectionOrder);

        const { settlements, advanceAmount: newAdvanceAmount } =
          calculateSettlements(
            newSelectedBills,
            newSelectionOrder,
            enteredAmount
          );
        setBillSettlements(settlements);
        setAdvanceAmount(newAdvanceAmount);
      }
    } else {
      setSelectedBills(new Set());
      setSelectionOrder([]);
      setBillSettlements(new Map());
      setAdvanceAmount(0);
    }
  }, [enteredAmount, data, savedBillData]);
  

  const handleAmountChange = (event) => {
    const amount = parseFloat(event.target.value) || 0;
    setEnteredAmount(amount);
  };

  // Updated bill selection handler with validation
  const handleBillSelection = (billNo) => {
    const newSelectedBills = new Set(selectedBills);
    const newSelectionOrder = [...selectionOrder];

    if (newSelectedBills.has(billNo)) {
      // Always allow deselection
      newSelectedBills.delete(billNo);
      const index = newSelectionOrder.indexOf(billNo);
      if (index > -1) {
        newSelectionOrder.splice(index, 1);
      }
    } else {
      // Check if amount is already fully settled before allowing new selection
      if (isAmountFullySettled()) {
        return;
      }
      // Manual selection
      newSelectedBills.add(billNo);
      if (!newSelectionOrder.includes(billNo)) {
        newSelectionOrder.push(billNo);
      }
    }

    setSelectedBills(newSelectedBills);
    setSelectionOrder(newSelectionOrder);

    const { settlements, advanceAmount: newAdvanceAmount } =
      calculateSettlements(newSelectedBills, newSelectionOrder, enteredAmount);
    setBillSettlements(settlements);
    setAdvanceAmount(newAdvanceAmount);
  };

  // Format selected bills data for next step
  const formatSelectedBillsData = () => {
    return Array.from(selectedBills)?.map((billNo) => {
      const bill = data?.find((b) => b?.bill_no === billNo);
      const settledAmount = billSettlements?.get(billNo) || 0;
      const billAmount = parseFloat(bill.bill_pending_amt);

      return {
        billNo: bill?.bill_no,
        billId: bill?.billId,
        settledAmount: Number(settledAmount?.toFixed(2)),
        remainingAmount: Number((billAmount - settledAmount)?.toFixed(2)),
      };
    });
  };

  // Handle next button click
  const handleNextClick = () => {
    if (enteredAmount <= 0) {
      toast?.warning("Please enter a valid amount");
      return;
    }

    const formattedData = formatSelectedBillsData();

    const settledAmount = formattedData.reduce(
      (total, bill) => total + bill.settledAmount,
      0
    );
    const remainingAmount = total - settledAmount;

    const settlementData = {
      totalBillAmount: parseFloat(total),
      enteredAmount: enteredAmount,
      billData: formattedData,
      advanceAmount: advanceAmount || 0,
      remainingAmount: remainingAmount || 0,
    };

    if (tab === "receipt") {
      dispatch(addSettlementDataReceipt(settlementData));
    } else if (tab === "payment") {
      dispatch(addSettlementDataPayment(settlementData));
    }

    if (tab === "receipt") {
      if (process === "add") {
        navigate(`/sUsers/receipt`);
      } else if (process === "edit") {
        navigate(-1, { replace: true });
      }
    } else {
      if (process === "add") {
        navigate(`/sUsers/paymentPurchase`);
      } else if (process === "edit") {
        navigate(-1, { replace: true });
      }
    }
  };

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

          {loading && <CustomBarLoader />}

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
                <p className="text-green-600 font-bold">₹{total}</p>
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
          <hr className="h-px my-0 bg, ray-200 border-0" />

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
                className="px-3 py-4 placeholder-blueGray-300 bg-white rounded text-sm shadow-lg w-full ease-linear transition-all duration-150 no-focus-box outline-none border border-gray-200 focus:border-violet-500"
              />
            </div>
            <div className="flex-1">
              <button
                onClick={handleNextClick}
                className="w-full hidden md:block text-white p-4 bg-violet-500 text-md rounded-lg"
              >
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

      <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2 overflow-x-hidden pb-5">
        {data?.map((el, index) => {
          const billAmount = parseFloat(el.bill_pending_amt) || 0;
          const isSelected = selectedBills.has(el.bill_no);
          const settledAmount = isSelected
            ? billSettlements.get(el.bill_no) || 0
            : 0;
          const remainingBillAmount = Math.max(0, billAmount - settledAmount);
          // const isDisabled = !isSelected && isAmountFullySettled();

          return (
            <div
              key={index}
              className={`h-[110px] rounded-md shadow-xl border border-gray-300 flex justify-between px-4 transition-all duration-150 transform hover:translate-x-1 ease-in-out overflow-y-auto `}
            >
              <div className="h-full px-2 py-8 lg:p-6 w-[200px] md:w-[180px] lg:w-[300px] relative">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={() => handleBillSelection(el.bill_no)}
                    checked={isSelected}
                    // disabled={isDisabled}
                    className="w-7 h-7 cursor-pointer"
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
                    ₹{formatAmount(billAmount)}
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
