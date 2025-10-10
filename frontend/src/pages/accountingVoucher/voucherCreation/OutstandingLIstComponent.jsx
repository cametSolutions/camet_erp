/* eslint-disable react/prop-types */
import dayjs from "dayjs";
import { MdPeopleAlt } from "react-icons/md";
import { FaChevronDown } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Custom components
import CallIcon from "../../../components/common/CallIcon";
import TitleDiv from "@/components/common/TitleDiv";

// Utils
import { camelToNormalCase } from "../../../../utils/camelCaseToNormalCase";
import { addSettlementData } from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";

/**
 * Outstanding List Component
 * Handles bill selection and settlement calculation for payment processing
 *
 * @param {boolean} loading - Loading state indicator
 * @param {Array} data - Array of outstanding bills
 * @param {number} total - Total outstanding amount
 * @param {Object} party - Party information (name, mobile number)
 */
function OutstandingLIstComponent({
  loading,
  data,
  total,
  party,
  showAmountChangeAlert,
  mode,
}) {
  // ============================================================================
  // REDUX STATE MANAGEMENT
  // ============================================================================

  /**
   * Extract saved data from Redux store
   * - enteredAmount: Previously entered payment amount
   * - billData: Previously selected bills with settlement amounts
   * - advanceAmount: Previously calculated advance amount
   */
  const {
    enteredAmount: enteredAmountFromRedux,
    billData: billDataFromRedux,
    advanceAmount: advanceAmountFromRedux,
    isInitialRender: isInitialRenderFromRedux,
  } = useSelector((state) => state.commonAccountingVoucherSlice);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ============================================================================
  // COMPONENT STATE INITIALIZATION
  // ============================================================================

  /**
   * Selected bills tracking
   * Uses Set for O(1) lookup performance
   */
  const [selectedBills, setSelectedBills] = useState(new Set());

  /**
   * Control flags for component behavior
   */
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasUserTyped, setHasUserTyped] = useState(false);

  /**
   * Bill settlement amounts mapping
   * Maps bill ID to settled amount for each selected bill
   */
  const [billSettlements, setBillSettlements] = useState(() => {
    if (billDataFromRedux?.length > 0) {
      return new Map(
        billDataFromRedux.map((bill) => [bill._id, bill.settledAmount])
      );
    }
    return new Map();
  });

  /**
   * Selection order tracking for FIFO settlement logic
   * Maintains the order in which bills were selected
   */
  const [selectionOrder, setSelectionOrder] = useState(() => {
    if (billDataFromRedux?.length > 0) {
      return billDataFromRedux.map((bill) => bill._id);
    }
    return [];
  });

  /**
   * Amount states
   */
  const [enteredAmount, setEnteredAmount] = useState(
    enteredAmountFromRedux || 0
  );
  const [advanceAmount, setAdvanceAmount] = useState(
    advanceAmountFromRedux || 0
  );

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Format amount with Indian number formatting
   * @param {number} amount - Amount to format
   * @returns {string} Formatted amount string
   */
  function formatAmount(amount) {
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  /**
   * Calculate settlement amounts based on FIFO logic
   * Distributes entered amount across selected bills in order of selection
   *
   * @param {Set} selectedBillsSet - Set of selected bill IDs
   * @param {Array} billOrder - Array of bill IDs in selection order
   * @param {number} amount - Total amount to distribute
   * @returns {Object} Object containing settlements Map and advance amount
   */
  const calculateSettlements = (selectedBillsSet, billOrder, amount) => {
    const settlements = new Map();
    let remainingAmount = amount;

    // Process bills in selection order (FIFO)
    billOrder.forEach((billId) => {
      if (selectedBillsSet.has(billId)) {
        const bill = data.find((b) => b?._id === billId);
        const billAmount = parseFloat(bill?.bill_pending_amt);

        if (remainingAmount > 0) {
          // Settle minimum of bill amount or remaining amount
          const settlementAmount = Math.min(billAmount, remainingAmount);
          settlements.set(billId, settlementAmount);
          remainingAmount -= settlementAmount;
        } else {
          // No remaining amount to settle
          settlements.set(billId, 0);
        }
      }
    });

    // Calculate advance amount (excess amount after settling all bills)
    const totalSettled = Array.from(settlements.values()).reduce(
      (total, amount) => total + amount,
      0
    );
    const advanceAmount = Math.abs(enteredAmount - totalSettled);

    return { settlements, advanceAmount };
  };

  /**
   * Check if entered amount is fully allocated to settlements
   * @returns {boolean} True if amount is fully settled
   */
  const isAmountFullySettled = () => {
    const totalSettled = Array.from(billSettlements.values()).reduce(
      (sum, amount) => sum + amount,
      0
    );
    return Math.abs(totalSettled - enteredAmount) < 0.01; // Account for floating point precision
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Main effect for handling bill selection and settlement calculation
   * Handles three scenarios:
   * 1. Initial load with saved Redux data
   * 2. Fresh FIFO calculation after user input
   * 3. Clearing data when amount is invalid
   */
  useEffect(() => {
    if (data && data.length > 0) {
      // SCENARIO 1: Initial load with saved Redux data
      if (isInitialLoad && billDataFromRedux?.length > 0) {
        // Restore previously saved state
        const newSelectedBills = new Set(
          billDataFromRedux.map((bill) => bill._id)
        );
        const newSelectionOrder = billDataFromRedux.map((bill) => bill._id);
        const savedSettlements = new Map(
          billDataFromRedux.map((bill) => [bill._id, bill.settledAmount])
        );

        setSelectedBills(newSelectedBills);
        setSelectionOrder(newSelectionOrder);
        setBillSettlements(savedSettlements);
        setEnteredAmount(enteredAmountFromRedux || 0);
        setAdvanceAmount(advanceAmountFromRedux || 0);
        setIsInitialLoad(false);
      }

      // SCENARIO 2: Fresh FIFO calculation after user input
      else if (hasUserTyped && enteredAmount > 0) {
        const newSelectedBills = new Set();
        const newSelectionOrder = [];
        let remainingAmount = enteredAmount;

        // Auto-select bills using FIFO until amount is exhausted
        for (const bill of data) {
          const billAmount = parseFloat(bill.bill_pending_amt);
          if (remainingAmount > 0) {
            newSelectedBills.add(bill._id);
            newSelectionOrder.push(bill._id);
            remainingAmount -= billAmount;
          }
        }

        setSelectedBills(newSelectedBills);
        setSelectionOrder(newSelectionOrder);

        // Calculate settlements for auto-selected bills
        const { settlements, advanceAmount: newAdvanceAmount } =
          calculateSettlements(
            newSelectedBills,
            newSelectionOrder,
            enteredAmount
          );

        setBillSettlements(settlements);
        setAdvanceAmount(newAdvanceAmount);
      }

      // SCENARIO 3: Clear everything when amount is invalid
      else if (enteredAmount <= 0) {
        setSelectedBills(new Set());
        setSelectionOrder([]);
        setBillSettlements(new Map());
        setAdvanceAmount(0);
      }
    } else {
      // No bills available - treat entire amount as advance
      setAdvanceAmount(enteredAmount);
    }
  }, [enteredAmount, data, isInitialLoad, hasUserTyped, billDataFromRedux]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle amount input change
   * Sets user typing flag and updates entered amount
   * @param {Event} event - Input change event
   */

  const handleAmountChange = (event) => {
    if (mode === "edit" && isInitialRenderFromRedux) {
      showAmountChangeAlert().then((userConfirmed) => {
        if (userConfirmed) {
          setHasUserTyped(true);
          const amount = 0;
          setEnteredAmount(amount);
        }
      });
    } else {
      setHasUserTyped(true);
      const amount = parseFloat(event.target.value) || 0;
      setEnteredAmount(amount);
    }
  };

  /**
   * Handle individual bill selection/deselection
   * Manages bill selection state and recalculates settlements
   *
   * @param {string} billId - ID of the bill to toggle
   */
  const handleBillSelection = (billId) => {
    if (mode === "edit" && isInitialRenderFromRedux) {
      showAmountChangeAlert().then((userConfirmed) => {
        if (userConfirmed) {
          setHasUserTyped(true);
          const amount = 0;
          setEnteredAmount(amount);
        }
      });
    } else {
      const newSelectedBills = new Set(selectedBills);
      const newSelectionOrder = [...selectionOrder];

      if (newSelectedBills.has(billId)) {
        // DESELECTION: Always allow deselection
        newSelectedBills.delete(billId);
        const index = newSelectionOrder.indexOf(billId);
        if (index > -1) {
          newSelectionOrder.splice(index, 1);
        }
      } else {
        // SELECTION: Check if amount is already fully settled
        if (isAmountFullySettled()) {
          return; // Prevent selection if amount is already fully allocated
        }

        // Add to selection
        newSelectedBills.add(billId);
        if (!newSelectionOrder.includes(billId)) {
          newSelectionOrder.push(billId);
        }
      }
      // Update state
      setSelectedBills(newSelectedBills);
      setSelectionOrder(newSelectionOrder);

      // Recalculate settlements based on new selection
      const { settlements, advanceAmount: newAdvanceAmount } =
        calculateSettlements(
          newSelectedBills,
          newSelectionOrder,
          enteredAmount
        );
      setBillSettlements(settlements);
      setAdvanceAmount(newAdvanceAmount);
    }
  };

  /**
   * Handle next button click
   * Validates input and navigates to next step with settlement data
   */
  const handleNextClick = () => {
    // Validation
    if (enteredAmount <= 0) {
      toast?.warning("Please enter a valid amount");
      return;
    }

    // Format selected bills data for next step
    const formattedData = formatSelectedBillsData();

    // Calculate summary amounts
    const settledAmount = formattedData.reduce(
      (total, bill) => total + bill.settledAmount,
      0
    );
    const remainingAmount = total - settledAmount;

    // Prepare settlement data for Redux
    const settlementData = {
      totalBillAmount: parseFloat(total),
      enteredAmount: enteredAmount,
      billData: formattedData,
      advanceAmount: advanceAmount || 0,
      remainingAmount: remainingAmount || 0,
    };

    // Save to Redux and navigate back
    dispatch(addSettlementData(settlementData));
    navigate(-1, { replace: true });
  };

  // ============================================================================
  // DATA FORMATTING
  // ============================================================================

  /**
   * Format selected bills data for next step processing
   * Creates standardized bill objects with settlement information
   *
   * @returns {Array} Array of formatted bill objects
   */
  const formatSelectedBillsData = () => {
    return Array.from(selectedBills)?.map((billId) => {
      const bill = data?.find((b) => b?._id === billId);
      const settledAmount = billSettlements?.get(billId) || 0;
      const billAmount = parseFloat(bill.bill_pending_amt);

      return {
        _id: bill?._id,
        bill_no: bill?.bill_no,
        billId: bill?.billId,
        bill_date: bill?.bill_date,
        bill_pending_amt: Number(billAmount?.toFixed(2)),
        source: bill?.source,
        settledAmount: Number(settledAmount?.toFixed(2)),
        remainingAmount: Number((billAmount - settledAmount)?.toFixed(2)),
      };
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      {/* HEADER SECTION - Sticky header with party info and amount input */}
      <div className=" w-full shadow-lg flex flex-col rounded-[3px] gap-1">
        <div className=" sticky top-0 z-10  flex flex-col rounded-[3px] bg-white">
          <TitleDiv loading={loading} title="Outstanding List" />

          <div className={`${loading ?"opacity-80 cursor-pointer-events-none":"opacity-100"} `}>
            {/* Party information section */}
            <div className="px-4 py-2 flex justify-between">
              <div className="flex-col">
                <div className="flex items-center gap-2">
                  <MdPeopleAlt />
                  <p className="font-bold">{party?.partyName}</p>
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
                  phoneNumber={party?.mobileNumber}
                  size={18}
                  color="green"
                />
                <p className="text-sm font-bold text-gray-500">
                  {party?.mobileNumber}
                </p>
              </div>
            </div>

            <hr className="h-px my-0 bg-gray-200 border-0" />

            {/* Amount input section */}
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

            {/* Selection summary section */}
            <div className="bg-white px-4 py-2 pb-3 rounded-md flex gap-2 justify-between flex-wrap shadow-lg">
              <div className="flex gap-2 items-center">
                <p className="text-[11px] font-bold">
                  # Selected Bills ({selectedBills.size}/{data.length})
                </p>
                <FaChevronDown />
              </div>
              {/* Show advance amount if applicable */}
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
        

        {/* BILLS LIST SECTION - Scrollable list of outstanding bills */}
        <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2 overflow-x-hidden pb-5">
          {data?.map((bill, index) => {
            const billAmount = parseFloat(bill.bill_pending_amt) || 0;
            const isSelected = selectedBills.has(bill._id);
            const settledAmount = isSelected
              ? billSettlements.get(bill._id) || 0
              : 0;
            const remainingBillAmount = Math.max(0, billAmount - settledAmount);

            return (
              <div
                key={index}
                className={`h-[110px] rounded-md shadow-xl border border-gray-300 flex justify-between px-4 transition-all duration-150 transform hover:translate-x-1 ease-in-out overflow-y-auto`}
              >
                {/* Bill information section */}
                <div className="h-full px-2 py-8 lg:p-6 w-[200px] md:w-[180px] lg:w-[300px] relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      onChange={() => handleBillSelection(bill._id)}
                      checked={isSelected}
                      className="w-7 h-7 cursor-pointer"
                    />
                    <div className="flex flex-col items-start gap-1 ml-2">
                      <p className="font-bold text-gray-700 text-[12px]">
                        #{bill.bill_no}
                      </p>
                      <p className="text-xs font-semibold text-violet-600">
                        {dayjs(bill.bill_date).format("DD/MM/YYYY")}
                      </p>
                      <p className="text-xs font-semibold text-gray-500">
                        #{camelToNormalCase(bill?.source)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bill amount section */}
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

          {/* Mobile next button - Fixed at bottom on mobile devices */}
          <div
            onClick={handleNextClick}
            className="md:hidden fixed bottom-0 p-4 left-0 w-full flex justify-center bg-white"
          >
            <div className="bg-violet-500 p-4 rounded-lg w-full text-white font-bold">
              Next
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OutstandingLIstComponent;
