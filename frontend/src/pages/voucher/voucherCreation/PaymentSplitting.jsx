import { useEffect, useState } from "react";
import { ChevronDown, CircleDot } from "lucide-react";
import TitleDiv from "@/components/common/TitleDiv";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";
import { truncateText } from "../../../../../backend/utils/textHelpers";

// API function to fetch bank and cash sources
const fetchBankAndCashSources = async (cmp_id) => {
  const response = await api.get(
    `/api/sUsers/getBankAndCashSources/${cmp_id}`,
    {
      withCredentials: true,
    }
  );
  return response.data.data;
};

function PaymentSplitting() {
  const [paymentModes, setPaymentModes] = useState([
    { id: 1,model:"cash",title:"Cash",mode: "cash", source: "", amount: "" },
    { id: 2,model:"bank",title:"NEFT/UPI", mode: "upi", source: "", amount: "" },
    { id: 3,model:"bank", title:"Cheque",mode: "cheque", source: "", amount: "" },
    { id: 4,model:"party",title:"Credit", mode: "credit", source: "", amount: "" },
  ]);

  console.log(paymentModes);
  

  const navigate = useNavigate();

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const { finalAmount: finalAmountFromRedux, paymentSplittingData } =
    useSelector((state) => state.commonVoucherSlice);

  // Fetch bank and cash sources using TanStack Query
  const {
    data: sourcesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bankAndCashSources", cmp_id],
    queryFn: () => fetchBankAndCashSources(cmp_id),
    enabled: !!cmp_id,
  });

  console.log(paymentSplittingData);

  useEffect(() => {
    if (!finalAmountFromRedux) {
      navigate(-1, { replace: true });
    }
  }, [finalAmountFromRedux, navigate]);

  const totalAmount = paymentModes.reduce((sum, mode) => {
    const amount = parseFloat(mode.amount) || 0;
    return sum + amount;
  }, 0);

  const balanceAmount = finalAmountFromRedux - totalAmount;

  const handleAmountChange = (id, amount) => {
    setPaymentModes((prev) =>
      prev.map((mode) => (mode.id === id ? { ...mode, amount } : mode))
    );
  };

  const handleSourceChange = (id, source) => {
    setPaymentModes((prev) =>
      prev.map((mode) => (mode.id === id ? { ...mode, source } : mode))
    );
  };

  const handleNavigateToPartyList = () => {
    // Navigate to party list component
    navigate("/sUsers/searchPartysales", {
      state: { from: "paymentSplitting" },
    }); // Update this path according to your routing
  };

  // Get source options based on payment mode
  const getSourceOptions = (mode) => {
    if (!sourcesData) return [];

    const { banks = [], cashs = [] } = sourcesData;

    console.log(banks, cashs);

    switch (mode) {
      case "cash":
        return cashs.map((cash) => ({
          value: cash.cash_id,
          label: cash.cash_ledname,
        }));
      case "upi":
      case "credit":
      case "Cheque":
        return banks.map((bank) => ({
          value: bank.bank_id || bank._id,
          label: bank.bank_ledname,
        }));
      default:
        return [
          ...cashs.map((cash) => ({
            value: cash.cash_id,
            label: cash.cash_ledname,
          })),
          ...banks.map((bank) => ({
            value: bank.bank_id || bank._id,
            label: bank.bank_ledname,
          })),
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <TitleDiv title="Payment Splitting" loading={isLoading} />
      <div className={`${isLoading && "opacity-75 animate-pulse"}`}></div>
      <div className="">
        {/* Main Card */}
        <div className="bg-gray-50  shadow-sm border border-gray-500 overflow-hidden">
          <div className="p-8">
            {/* Payment Methods */}
            <div className="space-y-1 mb-8  ">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-6 pb-5 border-b border-gray-300 font-bold   ">
                <div className="col-span-4">
                  <span className="text-xs  text-gray-500 uppercase tracking-wide">
                    Payment Method
                  </span>
                </div>
                <div className="col-span-4">
                  <span className="text-xs  text-gray-500 uppercase tracking-wide">
                    Source
                  </span>
                </div>
                <div className="col-span-4">
                  <span className="text-xs  text-gray-500 uppercase tracking-wide">
                    Amount
                  </span>
                </div>
              </div>

              {/* Payment Rows */}
              {paymentModes.map((mode) => (
                <div
                  key={mode.id}
                  className="grid grid-cols-12 gap-6 py-5 border-b border-gray-50 last:border-b-0 hover:bg-gray-25 transition-colors duration-150"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <CircleDot size={15} className="" />
                    <span className="font-medium text-gray-900">
                      {mode.mode}
                    </span>
                  </div>

                  <div className="col-span-4 flex items-center">
                    {mode?.mode === "Credit" ? (
                      paymentSplittingData !== null ? (
                        <span 
                          onClick={handleNavigateToPartyList}

                        className="text-sm font-medium  w-full p-2 border rounded-md border-gray-300 cursor-pointer">
                          {truncateText(paymentSplittingData?.sourceName, 20)}
                        </span>
                      ) : (
                        <button
                          onClick={handleNavigateToPartyList}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md w-full hover:bg-blue-100 transition-colors duration-200"
                        >
                          Select Party
                        </button>
                      )
                    ) : (
                      <div className="relative w-full">
                        <select
                          value={mode.source}
                          onChange={(e) =>
                            handleSourceChange(mode.id, e.target.value)
                          }
                          className="no-focus-box w-full px-3 py-2 bg-white border rounded-md text-sm appearance-none cursor-pointer transition-all duration-200 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          disabled={isLoading}
                        >
                          <option value="">
                            {isLoading ? "Loading sources..." : "Select source"}
                          </option>
                          {getSourceOptions(mode.mode).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                  </div>

                  <div className="col-span-4 flex items-center">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={mode.amount}
                        onChange={(e) =>
                          handleAmountChange(mode.id, e.target.value)
                        }
                        placeholder="0.00"
                        className="no-focus-box w-full pl-8 pr-3 py-2 border rounded-md text-sm transition-all duration-200 border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Section */}
            <div className="bg-gray-200 rounded px-6 py-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Allocated</p>
                  <p className=" font-bold text-gray-900">
                    ₹{totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-gray-900">
                    ₹{finalAmountFromRedux || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {balanceAmount !== 0 && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  balanceAmount > 0
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm text-center ${
                    balanceAmount > 0 ? "text-orange-700" : "text-red-700"
                  }`}
                >
                  {balanceAmount > 0
                    ? `Add ₹${balanceAmount.toFixed(
                        2
                      )} more to complete the payment`
                    : `Reduce amount by ₹${Math.abs(balanceAmount).toFixed(2)}`}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg mb-6 bg-red-50 border border-red-200">
                <p className="text-sm text-center text-red-700">
                  Error loading sources: {error.message}
                </p>
              </div>
            )}

            {/* Action Button */}
            <div className="w-full">
              <div
                className={`px-8 py-3 rounded-md font-medium transition-all duration-200 text-center cursor-pointer ${
                  balanceAmount !== 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-pink-500 text-white hover:bg-pink-600"
                }`}
                onClick={() => {
                  if (balanceAmount === 0) {
                    // Handle save payment split
                    console.log("Saving payment split...", paymentModes);
                  }
                }}
              >
                Save Payment Split
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSplitting;
