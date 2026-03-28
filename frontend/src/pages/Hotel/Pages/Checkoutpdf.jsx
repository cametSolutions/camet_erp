import React, { useState, useEffect,useRef } from "react";
import { Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import TitleDiv from "@/components/common/TitleDiv";
import { toast } from "sonner";
import {useReactToPrint} from "react-to-print";


const HotelCheckoutStatement = () => {
  // ============ STATE MANAGEMENT ============
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [checkoutData, setCheckoutData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const contentToPrint = useRef(null);

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // ============ UTILITY FUNCTIONS ============
  function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  function getCurrentDateTime() {
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
  }

  // ============ API FUNCTIONS ============
  async function fetchCheckoutData() {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/sUsers/statement", {
        params: {
          fromDate,
          toDate,
          cmp_id,
        },
      });

      if (response.data.success) {
        setCheckoutData(response.data.checkoutBills);
        setSummary(response.data.summary);

        if (response.data.checkoutBills.length === 0) {
          setError(
            `No checkout data found for ${formatDate(fromDate)} to ${formatDate(toDate)}`
          );
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
  }

  // ============ EVENT HANDLERS ============
  function handleDateChange(e) {
    const newDate = e.target.value;

    if (e.target.name === "toDate" && fromDate && newDate < fromDate) {
      toast.error("To date should be greater than or equal to From date");
      return;
    }

    if (e.target.name === "fromDate" && toDate && newDate > toDate) {
      toast.error("From date should be less than or equal to To date");
      return;
    }

    if (e.target.name === "fromDate") {
      setFromDate(newDate);
    } else {
      setToDate(newDate);
    }
  }

   const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm 10mm 15mm 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });


  // ============ EFFECTS ============
  useEffect(() => {
    if (fromDate && toDate && cmp_id) {
      fetchCheckoutData();
    }
  }, [fromDate, toDate, cmp_id]);

  // ============ RENDER HELPERS ============
  function renderTableHeader() {
    return (
      <tr className="border-b-2 border-black">
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Bill #</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Date</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Description</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Room</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Bill Amount</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Cash</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Bank</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Card</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Credit</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">UPI</th>
        <th className="text-right py-2 px-1 font-semibold border-b-2 border-black">Total</th>
        <th className="text-left py-2 px-1 font-semibold border-b-2 border-black">Mode</th>
      </tr>
    );
  }

  function getPaymentModeDisplay(item) {
    const paymentModes = [];

    if (Number(item?.cash) > 0) paymentModes.push("Cash");
    if (Number(item?.bank) > 0) paymentModes.push("Bank");
    if (Number(item?.card) > 0) paymentModes.push("Card");
    if (Number(item?.credit) > 0) paymentModes.push("Credit");
    if (Number(item?.upi) > 0) paymentModes.push("UPI");

    return paymentModes.length > 0 ? paymentModes.join(", ") : "N/A";
  }

  function renderTableRow(item, index) {
    return (
      <tr
        key={index}
        className="border-b border-gray-200 text-sm hover:bg-gray-50"
      >
        <td className="py-1 px-1">{item.billNo}</td>
        <td className="py-1 px-1">{formatDate(item.date)}</td>
        <td className="py-1 px-1">{item.customerName}</td>
        <td className="py-1 px-1">{item.roomName || "-"}</td>
        <td className="py-1 px-1 text-right">    {Number(item.grandTotal || 0).toFixed(2)}</td>
        <td className="py-1 px-1 text-right">
          {Number(item?.cash) > 0 ? item.cash.toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.bank) > 0 ? item.bank.toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.card) > 0 ? item.card.toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.credit) > 0 ? item.credit.toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.upi) > 0 ? item?.upi.toFixed(2) : ""}
        </td>
        <td className="text-right py-1 px-1 font-medium">
          {item.advanceAmount.toFixed(2)}
        </td>
        <td className="py-1 px-1">{getPaymentModeDisplay(item)}</td>
      </tr>
    );
  }

  function renderEmptyState() {
    return (
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
            <p className="text-lg font-medium">No checkout records found</p>
            <p className="text-sm mt-1">
              from {formatDate(fromDate)} to {formatDate(toDate)}
            </p>
          </div>
        </td>
      </tr>
    );
  }

  function renderSummary() {
    if (checkoutData.length === 0) return null;

    const totalAmount = Number(summary?.totalCheckoutAmount) || 0;

    return (
      <>
        <tr className="border-t-2 border-black font-semibold bg-gray-50">
          <td colSpan="6" className="py-2 px-1">
            Total Amount
          </td>
          <td className="py-2 px-1">
            {(summary?.advanceTotal || 0).toFixed(2)}
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td className="text-right py-2 px-1">
            {totalAmount?.toFixed(2)}
          </td>
          <td></td>
        </tr>
      </>
    );
  }

  function renderSummarySection() {
    if (checkoutData.length === 0) return null;

    return (
          <div className="grid grid-cols-2 gap-6 mt-4 text-xs border-t border-black pt-2">
        {/* Left Column */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Total Reservation Adv :</span>
            <span>{Number(summary?.totalBookingAdvance || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total CheckIn Adv :</span>
            <span>{Number(summary?.totalCheckingAdvance || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Before Res Adv :</span>
            <span>0.00</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-300 pt-1 mt-1">
            <span>Total Advance Amt :</span>
            <span>{Number(summary?.totalAdvanceAmount || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Right Column */}
       <div className="space-y-1">
          <div className="flex justify-between">
            <span>Total Checkout Amt :</span>
            <span>{Number(summary?.checkOutTimePaidAmount || 0).toFixed(2)}</span>
            <span className="ml-4 text-gray-600">Credit</span>
            <span>{Number(summary?.creditTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Other Receipts :</span>
            <span>{Number(summary?.totalReceiptsAmount || 0).toFixed(2)}</span>
            <span className="ml-4 text-gray-600">Card</span>
            <span>{Number(summary?.cardTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Checkout Refund :</span>
            <span>{Number(summary?.checkOutTimeRefundAmount || 0).toFixed(2)}</span>
            <span className="ml-4 text-gray-600">Bank</span>
            <span>{Number(summary?.bankTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Advance Refund :</span>
            <span>
              {Number(summary?.checkOutTotalAdvanceRefundAmount || 0).toFixed(2)}
            </span>
            <span className="ml-4 text-gray-600">UPI</span>
            <span>{Number(summary?.upiTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Refund Amt :</span>
            <span>{Number(summary?.totalRefundAmount || 0).toFixed(2)}</span>
            <span className="ml-4 text-gray-600">Cash</span>
            <span>{Number(summary?.cashTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Other Payments Amt :</span>
            <span>{Number(summary?.totalotherPayments || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-300 pt-1 mt-1">
            <span>Net Sale :</span>
            <span>{Number(summary?.advanceTotal || 0).toFixed(2)}</span>
            <span className="ml-4">Net Cash</span>
            <span>{Number(summary?.transactionTotal || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
    );
  }
  // ============ MAIN RENDER ============
  return (
 <>
      <TitleDiv loading={loading} title="Checkout Statement" />

      {/* Screen Date Picker Controls - Hidden on Print */}
      <div className="w-full max-w-7xl mx-auto p-6 bg-white no-print">
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

        {/* Print Button */}
        <div className="text-center">
          <button
            onClick={handlePrint}
            disabled={checkoutData.length === 0}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg"
          >
            {checkoutData.length === 0 ? "No Data to Print" : "Print Statement"}
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div ref={contentToPrint} className="print-content">
        <div className="border-2 border-black px-4 py-3 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold tracking-wide">
                KGEES - HILLTOWN HOTEL
              </h1>
              <p className="text-sm font-semibold mt-1">FO CASH STATEMENT</p>
            </div>
            <div className="text-right text-[10px]">
              <p>
                <span className="font-semibold">Print Date & Time:</span>{" "}
                {getCurrentDateTime()}
              </p>
            </div>
          </div>

          {/* Period Info */}
          <div className="text-xs mb-2 border-b border-gray-400 pb-1">
            <span className="font-semibold">From:</span> {formatDate(fromDate)}
            {"  "}
            <span className="font-semibold ml-2">To:</span> {formatDate(toDate)}
          </div>

          {/* Checkout Bills Section Title */}
          <div className="text-sm font-semibold mb-1">
            Checkout Bills ({checkoutData.length}{" "}
            {checkoutData.length === 1 ? "record" : "records"})
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-[11px] print-table">
            <thead>
              {renderTableHeader()}
            </thead>
            <tbody>
              {checkoutData.length > 0
                ? checkoutData.map((item, index) => renderTableRow(item, index))
                : renderEmptyState()}
            </tbody>
            <tfoot>
              {renderSummary()}
            </tfoot>
          </table>

          {/* Summary Section */}
          {renderSummarySection()}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }

          .print-content {
            width: 100%;
            margin: 0;
            padding: 0;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          /* Table head repeats on every page */
          .print-table thead {
            display: table-header-group;
          }

          .print-table tfoot {
            display: table-footer-group;
          }

          /* Prevent page breaks inside rows */
          .print-table tr {
            page-break-inside: avoid;
          }

          /* Keep table layout compact */
          .print-table {
            page-break-inside: auto;
          }
        }

        @media screen {
          .print-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default HotelCheckoutStatement;