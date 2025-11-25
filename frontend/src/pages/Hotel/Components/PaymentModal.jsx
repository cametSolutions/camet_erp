import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import useFetch from "@/customHook/useFetch";
import { Check, CreditCard, X, Banknote } from "lucide-react";
import { MdVisibility } from "react-icons/md";

function PaymentModal({
  selected,
  totalAmount,
  saveLoader = false,
  onClose,
  onPaymentSave,
  cmp_id,
}) {
  const [paymentMode, setPaymentMode] = useState("single");
  const [cashAmount, setCashAmount] = useState("");
  const [onlineAmount, setOnlineAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [selectedCash, setSelectedCash] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashOrBank, setCashOrBank] = useState({});

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  );

  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData?.data;

      setCashOrBank(paymentTypeData?.data);
      if (bankDetails && bankDetails.length > 0) {
        setSelectedBank(bankDetails[0]._id);
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
      const cashAmountNum = parseFloat(cashAmount) || 0;
      const onlineAmountNum = parseFloat(onlineAmount) || 0;
      const totalEntered = cashAmountNum + onlineAmountNum;

      if (totalEntered === 0) {
        setPaymentError("Please enter payment amounts");
        return false;
      }

      if (totalEntered > totalAmount) {
        setPaymentError("Total payment amount cannot exceed order total");
        return false;
      }

      if (cashAmountNum > 0 && !selectedCash) {
        setPaymentError("Please select a cash account for cash payment");
        return false;
      }

      if (onlineAmountNum > 0 && !selectedBank) {
        setPaymentError("Please select a bank for online payment");
        return false;
      }

      if (totalEntered < totalAmount) {
        setPaymentError(
          `Remaining amount: ₹${(totalAmount - totalEntered).toFixed(2)}`
        );
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
      setPaymentError(
        "Sum of cash and online amount cannot exceed order total"
      );
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
        amount: totalAmount,
        accountId: paymentMethod === "cash" ? selectedCash : selectedBank,
        accountName:
          paymentMethod === "cash"
            ? cashOrBank?.cashDetails?.find((c) => c._id === selectedCash)
                ?.partyName
            : cashOrBank?.bankDetails?.find((b) => b._id === selectedBank)
                ?.partyName,
      });
    } else {
      if (parseFloat(cashAmount) > 0) {
        paymentData.payments.push({
          method: "cash",
          amount: parseFloat(cashAmount),
          accountId: selectedCash,
          accountName: cashOrBank?.cashDetails?.find(
            (c) => c._id === selectedCash
          )?.partyName,
        });
      }
      if (parseFloat(onlineAmount) > 0) {
        paymentData.payments.push({
          method: "online",
          amount: parseFloat(onlineAmount),
          accountId: selectedBank,
          accountName: cashOrBank?.bankDetails?.find(
            (b) => b._id === selectedBank
          )?.partyName,
        });
      }
    }
console.log("newpayment")
    onPaymentSave?.(paymentData);
  };

  const handleClose = () => {
    setPaymentMode("single");
    setPaymentMethod("cash");
    onClose?.();
  };

  const isFormValid = () => {
    if (paymentMode === "single") {
      return paymentMethod === "cash" ? selectedCash : selectedBank;
    } else {
      const cashAmountNum = parseFloat(cashAmount) || 0;
      const onlineAmountNum = parseFloat(onlineAmount) || 0;
      const totalEntered = cashAmountNum + onlineAmountNum;

      return (
        totalEntered === totalAmount &&
        (cashAmountNum === 0 || selectedCash) &&
        (onlineAmountNum === 0 || selectedBank)
      );
    }
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
          <h2 className="text-lg font-bold text-gray-800">
            Payment Processing
          </h2>
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
            <span className="text-sm font-medium">
              Checkout Items: {selected}
            </span>
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
                  }}
                >
                  <option value="">Select Payment Method</option>
                  {cashOrBank?.bankDetails?.map((cashier) => (
                    <option key={cashier._id} value={cashier._id}>
                      {cashier.partyName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Split Payment Amount Inputs */}
        {paymentMode === "split" && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Payment Amounts
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <Banknote className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium">Cash:</span>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={cashAmount}
                      onChange={(e) =>
                        handleAmountChange("cash", e.target.value)
                      }
                      className="w-full pl-6 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                      min="0"
                      max={totalAmount}
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Cash Payment Dropdown - Show when cash amount > 0 */}
              {parseFloat(cashAmount) > 0 && (
                <div className="ml-20">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Cash Account
                  </label>
                  <select
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
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

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-16">
                  <CreditCard className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium">Online:</span>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={onlineAmount}
                      onChange={(e) =>
                        handleAmountChange("online", e.target.value)
                      }
                      className="w-full pl-6 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                      min="0"
                      max={totalAmount}
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

              {/* Online Payment Dropdown - Show when online amount > 0 */}
              {parseFloat(onlineAmount) > 0 && (
                <div className="ml-20">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Select Bank
                  </label>
                  <select
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                    value={selectedBank}
                    onChange={(e) => {
                      setSelectedBank(e.target.value);
                      setPaymentError("");
                    }}
                  >
                    <option value="">Select Bank</option>
                    {cashOrBank?.bankDetails?.map((cashier) => (
                      <option key={cashier._id} value={cashier._id}>
                        {cashier.partyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Summary for Split */}
              <div className="bg-gray-50 p-2 rounded-lg border">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Total Entered:</span>
                  <span>
                    ₹
                    {(
                      (parseFloat(cashAmount) || 0) +
                      (parseFloat(onlineAmount) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span>Order Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                {(parseFloat(cashAmount) || 0) +
                  (parseFloat(onlineAmount) || 0) !==
                  totalAmount && (
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>Remaining:</span>
                    <span>
                      ₹
                      {(
                        totalAmount -
                        ((parseFloat(cashAmount) || 0) +
                          (parseFloat(onlineAmount) || 0))
                      ).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
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
