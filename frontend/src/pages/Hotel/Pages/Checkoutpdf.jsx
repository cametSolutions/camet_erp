import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import api from "../../../api/api";
import { useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";
import { toast } from "sonner";
const HotelCheckoutStatement = () => {
  // Get today's date in YYYY-MM-DD format [web:45]
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [fromDate,setFromDate] = useState(getTodayDate())
  const [toDate,setToDate] = useState(getTodayDate())
  const [checkoutData, setCheckoutData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // Fetch data when date or cmp_id changes [web:46][web:49]
  useEffect(() => {
    if (fromDate && toDate && cmp_id) {
      fetchCheckoutData();
    }
  }, [fromDate, toDate, cmp_id]);

  const fetchCheckoutData = async () => {
    setLoading(true);
    setError(null);

    try {
 
      const response = await api.get("/api/sUsers/statement", {
        params: {
          fromDate: fromDate,
          toDate: toDate,
          cmp_id: cmp_id,
        },
      });

      console.log("API Response:", response.data);

      if (response.data.success) {
        setCheckoutData(response.data.checkoutBills);
        setSummary(response.data.summary);

        if (response.data.checkoutBills.length === 0) {
          setError(`No checkout data found for ${formatDate(fromDate)} to ${formatDate(toDate)}`);
        }
      } else {
        setError("Failed to fetch checkout data");
      }
    } catch (err) {
      console.error("Error fetching checkout data:", err);
      setError(
        `Failed to load checkout data: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
      .replace(",", "");
  };
  console.log(summary?.totalotherPayments);
  console.log(summary?.totalreceiptsAmount);
  console.log(summary?.totalbookingAdvance);
  console.log(summary?.totalcheckingAdvance);
  console.log(summary?.totalAdvanceAmount);
  console.log(fromDate)
  const handleDateChange = (e) => {
    const newDate = e.target.value;
  const selectedDate = newDate.split("-").join("-");
  console.log(selectedDate);

if (e.target.name === "toDate" && fromDate && selectedDate < fromDate) {
  toast.error("To date should be greater than or equal to From date");
  return;
}

if (e.target.name === "fromDate" && toDate && selectedDate > toDate) {
  toast.error("From date should be less than or equal to To date");
  return;
}

e.target.name === "fromDate"
  ? setFromDate(newDate)
  : setToDate(newDate);

  };

  const handlePrint = () => {
    window.print();
  };

  const totalAmount = summary?.totalCheckoutAmount || 0;

  return (
    <>
      <TitleDiv loading={loading} title="Checkout Statement" />
      <div className="w-full max-w-5xl mx-auto p-6 bg-white">
        <div className="border-2 border-black p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-wide underline">
              KGEES - HILLTOWN HOTEL
            </h1>
          </div>

          {/* Date Selection and Print Info */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-400">
            <div className="flex items-center gap-4">
              <span className="font-semibold">From:</span>
              <div className="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded">
                <Calendar size={16} />
                <input
                  type="date"
                  name="fromDate"
                  value={fromDate}
                  onChange={handleDateChange}
                  max={getTodayDate()}
                  className="outline-none cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">To:</span>
              <div className="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded">
                <Calendar size={16} />
                <input
                  type="date"
                  name="toDate"
                  value={toDate}
                  onChange={handleDateChange}
                  max={getTodayDate()}
                  className="outline-none cursor-pointer"
                />
              </div>
            </div>
            <div className="text-sm">
              <span className="font-semibold">Print Date & Time:</span>{" "}
              {getCurrentDateTime()}
            </div>
          </div>

          <div className="text-sm mb-4">
            <span className="font-semibold">FO Cash Statement From</span>{" "}
            {formatDate(fromDate)}
            <span className="font-semibold"> To</span>{" "}
            {formatDate(toDate)}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-1 font-semibold">Bill #</th>
                <th className="text-left py-2 px-1 font-semibold">Date</th>
                <th className="text-left py-2 px-1 font-semibold">
                  Description
                </th>
                <th className="text-left py-2 px-1 font-semibold">Room</th>
                  <th className="text-left py-2 px-1 font-semibold">Bill Amount</th>
                <th className="text-left py-2 px-1 font-semibold">Cash</th>
                <th className="text-left py-2 px-1 font-semibold">Bank</th>
                <th className="text-left py-2 px-1 font-semibold">Card</th>
                <th className="text-left py-2 px-1 font-semibold">Credit</th>
                <th className="text-left py-2 px-1 font-semibold">UPI</th>
                <th className="text-right py-2 px-1 font-semibold">Total</th>
                <th className="text-left py-2 px-1 font-semibold">Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-300">
                <td colSpan="11" className="py-2 px-1 font-semibold">
                  Checkout Bills ({checkoutData.length}{" "}
                  {checkoutData.length === 1 ? "record" : "records"})
                </td>
              </tr>
              {checkoutData.length > 0 ? (
                checkoutData.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 text-sm hover:bg-gray-50"
                  >
                    <td className="py-1 px-1">{item.billNo}</td>
                    <td className="py-1 px-1">{formatDate(item.date)}</td>
                    <td className="py-1 px-1">{item.customerName}</td>
                    <td className="py-1 px-1">{item.roomName || "-"}</td>
                     <td className="py-1 px-1">{item.grandTotal || "-"}</td>
                    <td className="py-1 px-1">
                      {Number(item?.cash) > 0 ? item.cash.toFixed(2) : ""}
                    </td>
                    <td className="py-1 px-1">
                      {Number(item?.bank) > 0 ? item.bank.toFixed(2) : ""}
                    </td>
                    <td className="py-1 px-1">
                      {Number(item?.card) > 0 ? item.card.toFixed(2) : ""}
                    </td>
                    <td className="py-1 px-1">
                      {Number(item?.credit) > 0 ? item.credit.toFixed(2) : ""}
                    </td>
                    <td className="py-1 px-1">
                      {Number(item?.upi) > 0 ? item?.upi.toFixed(2) : ""}
                    </td>
                    <td className="text-right py-1 px-1 font-medium">
                      {item.advanceAmount.toFixed(2)}
                    </td>
                    <td className="py-1 px-1">{item.paymentMode || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        No checkout records found
                      </p>
                      <p className="text-sm mt-1">
                        form {formatDate(fromDate)} to {formatDate(toDate)}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {checkoutData.length > 0 && (
                <tr className="border-t-2 border-black font-semibold bg-gray-50">
                  <td colSpan="6" className="py-2 px-1">
                    Total Amount
                  </td>
                  <td className="py-2 px-1">
                    {(summary?.cardTotal || 0).toFixed(2)}
                  </td>
                  <td></td>
                  <td></td>
                  <td className="text-right py-2 px-1">
                    {totalAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Summary Section */}
          {checkoutData.length > 0 && (
            <div className="grid grid-cols-2 gap-8 mt-6 text-sm">
              <div>
                <div className="flex justify-between py-1">
                  <span>Total Reservation Adv :</span>
                  <span>{summary?.totalbookingAdvance}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Checkin Adv :</span>
                  <span>{summary?.totalcheckingAdvance}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Before Res Adv :</span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between py-1 mt-4 font-semibold border-t pt-2">
                  <span>Total Advance Amtddd :</span>
                  <span>{(summary?.totalAdvanceAmount || 0).toFixed(2)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between py-1">
                  <span>Total Checkout Amt :</span>
                  <span>{totalAmount.toFixed(2)}</span>
                  <span className="ml-4 text-gray-600">Credit</span>
                  <span>{(summary?.creditTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Other Receipts :</span>
                  <span>{summary?.totalreceiptsAmount}</span>
                  <span className="ml-4 text-gray-600">Credit Card</span>
                  <span>{(summary?.cardTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Checkout Refund :</span>
                  <span>0.00</span>
                  <span className="ml-4 text-gray-600">Bank</span>
                  <span>{(summary?.bankTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Advance Refund :</span>
                  <span>0.00</span>
                  <span className="ml-4 text-gray-600">UPI</span>
                  <span>{(summary?.upiTotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Refund Amt :</span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Total Other Payments Amt :</span>
                  <span>{summary?.totalotherPayments}</span>
                </div>
                <div className="flex justify-between py-1 mt-4 font-semibold border-t pt-2">
                  <span>Net Sale :</span>
                  <span>{totalAmount.toFixed(2)}</span>
                  <span className="ml-4">Net Cash</span>
                  <span>{(summary?.cashTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Print Button */}
        <div className="mt-4 text-center no-print">
          <button
            onClick={handlePrint}
            disabled={checkoutData.length === 0}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            {checkoutData.length === 0 ? "No Data to Print" : "Print Statement"}
          </button>
        </div>

        {/* Print Styles */}
        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default HotelCheckoutStatement;
