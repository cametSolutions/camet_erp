// Updated PaymentModal.jsx with SplitPayment Component Integration

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useFetch from "@/customHook/useFetch";
import { Check, CreditCard, X, Banknote } from "lucide-react";
import { MdVisibility } from "react-icons/md";
import SplitPayment from "../Pages/SplitPayment.jsx"; // Import the component

function PaymentModal({
  selected,
  totalAmount,
  saveLoader = false,
  onClose,
  onPaymentSave,
  cmp_id,
  customers = [], // NEW: Add customers prop
}) {
  const [paymentMode, setPaymentMode] = useState("single");
  const [paymentype,setpaymentType]=useState(null)
  const [selectedonlinepartyName,setselectedOnlinepartyName]=useState(null)
  const [selectedonlinetype,setselectedonlinetype]=useState(null)
  const [cashAmount, setCashAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [selectedCash, setSelectedCash] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashOrBank, setCashOrBank] = useState({});
  const [splitPaymentData, setSplitPaymentData] = useState(null); // NEW: For split payment

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  );

  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData?.data;
      setCashOrBank(paymentTypeData?.data);
      
      if (bankDetails && bankDetails.length > 0) {
        console.log(bankDetails)
        setSelectedBank(bankDetails[0]._id);
        setselectedOnlinepartyName(bankDetails[0].partyName)
        setselectedonlinetype(bankDetails[0].partyType)
      }
      if (cashDetails && cashDetails.length > 0) {
        setSelectedCash(cashDetails[0]._id);
      }
    }
  }, [paymentTypeData]);

  // Validation function
  const validatePayment = () => {
    if (paymentMode === "single") {
      if (paymentMethod === "cash" && !selectedCash) {
        setPaymentError("Please select a cash account");
        return false;
      }
      if (paymentMethod === "card" && !selectedBank) {
        setPaymentError("Please select a bank/payment method");
        return false;
      }
    } else if (paymentMode === "split") {
      if (!splitPaymentData || !splitPaymentData.isValid) {
        setPaymentError(splitPaymentData?.error || "Please complete all split payment details.");
        return false;
      }
    }

    setPaymentError("");
    return true;
  };

  const handleAmountChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    const otherAmount =
      type === "cash"
        ? parseFloat(onlineAmount) || 0
        : parseFloat(cashAmount) || 0;

    if (numValue + otherAmount > totalAmount) {
      setPaymentError("Sum of cash and online amount cannot exceed order total");
      return;
    }

    setPaymentError("");
    if (type === "cash") {
      setCashAmount(value);
    } else {
      setOnlineAmount(value);
    }
  };

  const handleSavePayment = () => {
    if (!validatePayment()) return;

    const paymentData = {
      mode: paymentMode,
      totalAmount,
      payments: [],
    };

    if (paymentMode === "single") {
      paymentData.payments.push({
        method: paymentMethod,
        paymentType:(selectedonlinepartyName==="paytm"||selectedonlinepartyName==="gpay")?"upi":selectedonlinepartyName==="card"?"card":paymentMethod==="cash"?"cash":(selectedonlinepartyName!=="paytm"&&selectedonlinepartyName!=="gpay"&&selectedonlinepartyName !=="card")&&selectedonlinetype==="bank"?"bank":"credit",
        amount: totalAmount,
        accountId: paymentMethod === "cash" ? selectedCash : selectedBank,
        accountName:
          paymentMethod === "cash"
            ? cashOrBank?.cashDetails?.find((c) => c._id === selectedCash)?.partyName
            : cashOrBank?.bankDetails?.find((b) => b._id === selectedBank)?.partyName,
      });
    } else if (paymentMode === "split") {
      // Use the split payment data (no need for splitDetails as payments already has everything)
      // paymentData.splitDetails
      console.log(splitPaymentData.payments)
      paymentData.payments = splitPaymentData.payments.map((payment) => ({
        ...payment,
       paymentType:(payment.accountName==="paytm"||payment.accountName==="gpay")?"upi": payment.accountName==="card"? "card" :payment.method==="bank"?"bank":"cash",
      }))
    }
    onPaymentSave?.(paymentData);
  };

  const handleClose = () => {
    setPaymentMode("single");
    setPaymentMethod("cash");
    setCashAmount("");
    setOnlineAmount("");
    setPaymentError("");
    setSplitPaymentData(null);
    onClose?.();
  };

  const isFormValid = () => {
    if (paymentMode === "single") {
      return paymentMethod === "cash" ? selectedCash : selectedBank;
    } else if (paymentMode === "split") {
      return splitPaymentData && splitPaymentData.isValid;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-4 max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800">Payment Processing</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Checkout Items Section */}
        <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-700">
            <Check className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Checkout Items: {selected}</span>
          </div>
        </div>

        {/* Payment Mode Selection */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Mode
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => {
                setPaymentMode("single");
                setPaymentError("");
                setSplitPaymentData(null);
              }}
              className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                paymentMode === "single"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              Single Payment
            </button>
            <button
              onClick={() => {
                setPaymentMode("split");
                setPaymentError("");
                setCashAmount("");
                setOnlineAmount("");
              }}
              className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                paymentMode === "split"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              Split Payment
            </button>
          </div>
        </div>

        {/* Single Payment Method Selection */}
        {paymentMode === "single" && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setPaymentMethod("cash");
                  setSelectedBank("");
                  setPaymentError("");
                }}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === "cash"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Banknote className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Cash</span>
              </button>
              <button
                onClick={() => {
                  setPaymentMethod("card");
                  setSelectedCash("");
                  setPaymentError("");
                }}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Online Payment</span>
              </button>
            </div>

            {/* Cash Payment Dropdown */}
            {paymentMethod === "cash" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Cash Account
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={selectedCash}
                  onChange={(e) => {
                    setSelectedCash(e.target.value);
                    setPaymentError("");
                  }}
                >
                  <option value="">Select Cash Account</option>
                  {cashOrBank?.cashDetails?.map((cashier) => (
                    <option key={cashier._id} value={cashier._id}>
                      {cashier.partyName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Online Payment Dropdown */}
            {paymentMethod === "card" && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank/Payment Method
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={selectedBank}
                  onChange={(e) => {
                    setSelectedBank(e.target.value);
                    setPaymentError("");
                    const selectedOption=e.target.selectedOptions[0]
                    const selectedName=selectedOption?.getAttribute('data-partyname')||""

                    const selectedPartytype=selectedOption?.getAttribute('data-partyType')||""
                    setselectedonlinetype(selectedPartytype)
                    setselectedOnlinepartyName(selectedName)
                  }}
                >
                  <option value=""
                  >Select Payment Method</option>
                  {cashOrBank?.bankDetails?.map((cashier) => (
                    <option key={cashier._id} value={cashier._id}
                    data-partyname={cashier.partyName}
                    data-partyType={cashier.partyType}>
                      {cashier.partyName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* NEW: Split Payment Component */}
        {paymentMode === "split" && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Payment Details
            </label>
            <SplitPayment
              customers={customers}
              cashOrBank={cashOrBank}
              totalAmount={totalAmount}
              onChange={(data) => {
                setSplitPaymentData(data);
                if (data.error && data.totalSplitAmount !== totalAmount) {
                  setPaymentError(data.error);
                } else {
                  setPaymentError("");
                }
              }}
            />
          </div>
        )}

        {/* Error Message */}
        {paymentError && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs">{paymentError}</p>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
            <span className="text-sm">Total Amount</span>
            <span className="text-base text-blue-600">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSavePayment}
              disabled={saveLoader || !isFormValid()}
              className={`flex-1 group px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${
                saveLoader || !isFormValid()
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:scale-105"
              }`}
            >
              {saveLoader ? (
                <>
                  <div className="w-3 h-3 border border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <MdVisibility className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                  Process Payment
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PaymentModal;

