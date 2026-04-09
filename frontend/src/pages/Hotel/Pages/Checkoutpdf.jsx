import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import TitleDiv from "@/components/common/TitleDiv";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const HotelCheckoutStatement = () => {
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [checkoutData, setCheckoutData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const contentToPrint = useRef(null);

  const { _id: cmp_id, name: organizationName } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  ) || {};

  const num = (v) => Number(v || 0);

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
        const bills = response.data.checkoutBills || [];
        setCheckoutData(bills);
        setSummary(response.data.summary || null);

        if (bills.length === 0) {
          setError(
            `No checkout data found for ${formatDate(fromDate)} to ${formatDate(
              toDate
            )}`
          );
        }
      } else {
        setCheckoutData([]);
        setSummary(null);
        setError("Failed to fetch checkout data");
      }
    } catch (err) {
      console.error("Error fetching checkout data:", err);
      setCheckoutData([]);
      setSummary(null);
      setError(
        `Failed to load checkout data: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(e) {
    const newDate = e.target.value;
    const { name } = e.target;

    if (name === "toDate" && fromDate && newDate < fromDate) {
      toast.error("To date should be greater than or equal to From date");
      return;
    }

    if (name === "fromDate" && toDate && newDate > toDate) {
      toast.error("From date should be less than or equal to To date");
      return;
    }

    if (name === "fromDate") {
      setFromDate(newDate);
    } else {
      setToDate(newDate);
    }
  }

 const handlePrint = useReactToPrint({
  content: () => contentToPrint.current,
  documentTitle: `Checkout-Statement-${fromDate}-to-${toDate}`,
  pageStyle: `
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        margin: 0;
        padding: 0;
      }

      .no-print {
        display: none !important;
      }

      .print-wrap {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      .print-report {
        width: 100% !important;
        max-width: 100% !important;
        border-width: 1px !important;
        padding: 8px !important;
      }

      .print-table {
        width: 100% !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        font-size: 10px !important;
      }

      .print-table thead {
        display: table-header-group;
      }

      .print-table tfoot {
        display: table-footer-group;
      }

      .print-table tr {
        page-break-inside: avoid;
      }

      .print-table th,
      .print-table td {
        padding: 2px 4px !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
    }
  `,
});

  useEffect(() => {
    if (fromDate && toDate && cmp_id) {
      fetchCheckoutData();
    }
  }, [fromDate, toDate, cmp_id]);

  function renderTableHeader() {
    return (
      <tr className="border-b-2 border-black">
        <th className="text-left py-1.5 px-1 text-xs font-semibold">Bill #</th>
        <th className="text-left py-1.5 px-1 text-xs font-semibold">Date</th>
        <th className="text-left py-1.5 px-1 text-xs font-semibold">
          bill Name
        </th>
        <th className="text-left py-1.5 px-1 text-xs font-semibold">
          Guest Name
        </th>
        <th className="text-left py-1.5 px-1 text-xs font-semibold">Room</th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">
          Bill Amount
        </th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">Cash</th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">Bank</th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">Card</th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">
          Credit
        </th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">UPI</th>
        <th className="text-right py-1.5 px-1 text-xs font-semibold">Total</th>
        <th className="text-left py-1.5 px-1 text-xs font-semibold">Mode</th>
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

  return paymentModes.length > 0 ? paymentModes.join("/") : "N/A";
}

  function renderTableRow(item, index) {
    return (
      <tr
        key={item?._id || item?.billNo || index}
        className="border-b border-gray-200 text-xs hover:bg-gray-50"
      >
        <td className="py-1 px-1">{item.billNo || "-"}</td>
        <td className="py-1 px-1">{formatDate(item.date)}</td>
        <td className="py-1 px-1">{item.customerName || "-"}</td>
        <td className="py-1 px-1">{item.guestName || "-"}</td>
        <td className="py-1 px-1">{item.roomName || "-"}</td>
        <td className="py-1 px-1 text-right">
          {item.grandTotal != null ? num(item.grandTotal).toFixed(2) : "-"}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.cash) > 0 ? num(item.cash).toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.bank) > 0 ? num(item.bank).toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.card) > 0 ? num(item.card).toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.credit) > 0 ? num(item.credit).toFixed(2) : ""}
        </td>
        <td className="py-1 px-1 text-right">
          {Number(item?.upi) > 0 ? num(item.upi).toFixed(2) : ""}
        </td>
        <td className="text-right py-1 px-1 font-medium">
          {num(item.advanceAmount).toFixed(2)}
        </td>
        <td className="py-1 px-1">{getPaymentModeDisplay(item)}</td>
      </tr>
    );
  }

  function renderEmptyState() {
    return (
      <tr>
        <td colSpan="12" className="text-center py-6 text-gray-500">
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-300 mb-3"
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
            <p className="text-sm font-medium">No checkout records found</p>
            <p className="text-xs mt-1">
              from {formatDate(fromDate)} to {formatDate(toDate)}
            </p>
          </div>
        </td>
      </tr>
    );
  }

  function renderSummary() {
    if (checkoutData.length === 0 || !summary) return null;

    const totalAmount = num(summary?.totalCheckoutAmount);

    return (
      <tr className="border-t-2 border-black font-semibold bg-gray-100 text-xs">
        <td colSpan="6" className="py-1.5 px-1 text-left">
          Total Amount
        </td>
        <td className="py-1.5 px-1 text-right">
          {num(summary?.advanceTotal).toFixed(2)}
        </td>
        <td className="py-1.5 px-1" />
        <td className="py-1.5 px-1" />
        <td className="py-1.5 px-1" />
        <td className="text-right py-1.5 px-1">{totalAmount.toFixed(2)}</td>
        <td className="py-1.5 px-1" />
      </tr>
    );
  }

  function renderSummarySection() {
    if (checkoutData.length === 0 || !summary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
        <div className="border border-gray-300 rounded-md p-3">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">
            Advance Summary
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Reservation Adv</span>
              <span className="tabular-nums">
                {num(summary?.totalBookingAdvance).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total CheckIn Adv</span>
              <span className="tabular-nums">
                {num(summary?.totalCheckingAdvance).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Before Res Adv</span>
              <span className="tabular-nums">0.00</span>
            </div>
            <div className="border-t border-gray-300 pt-1.5 mt-2 flex justify-between font-semibold">
              <span>Total Advance Amt</span>
              <span className="tabular-nums">
                {num(summary?.totalAdvanceAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="border border-gray-300 rounded-md p-3">
          <h3 className="font-semibold mb-2 text-gray-800 text-sm">
            Payment Summary
          </h3>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex justify-between">
              <span>Total Checkout Amt</span>
              <span className="tabular-nums">
                {num(summary?.checkOutTimePaidAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Credit</span>
              <span className="tabular-nums">
                {num(summary?.creditTotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Total Other Receipts</span>
              <span className="tabular-nums">
                {num(summary?.totalReceiptsAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Card</span>
              <span className="tabular-nums">
                {num(summary?.cardTotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Total Checkout Refund</span>
              <span className="tabular-nums">
                {num(summary?.checkOutTimeRefundAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Bank</span>
              <span className="tabular-nums">
                {num(summary?.bankTotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Total Advance Refund</span>
              <span className="tabular-nums">
                {num(summary?.checkOutTotalAdvanceRefundAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>UPI</span>
              <span className="tabular-nums">
                {num(summary?.upiTotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Total Refund Amt</span>
              <span className="tabular-nums">
                {num(summary?.totalRefundAmount).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cash</span>
              <span className="tabular-nums">
                {num(summary?.cashTotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between col-span-2">
              <span>Total Other Payments Amt</span>
              <span className="tabular-nums">
                {num(summary?.totalotherPayments).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-1.5 mt-2 flex justify-between font-semibold">
            <div className="flex gap-4">
              <span>Net Sale</span>
              <span className="tabular-nums">
                {num(summary?.advanceTotal).toFixed(2)}
              </span>
            </div>
            <div className="flex gap-4">
              <span>Net Cash</span>
              <span className="tabular-nums">
                {num(summary?.transactionTotal).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleDiv loading={loading} title="Checkout Statement" />

     <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white print-wrap">
  <div
    ref={contentToPrint}
    className="border-2 border-black p-4 md:p-6 print-report"
  >
          <div className="text-center mb-4">
            <h1 className="text-xl md:text-2xl font-bold tracking-wide underline">
              {organizationName}
            </h1>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3 pb-2 border-b border-gray-400 gap-3">
            <div className="flex flex-wrap items-center gap-3 no-print">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs md:text-sm">From:</span>
                <div className="flex items-center gap-2 border border-gray-300 px-2 py-1 rounded">
                  <Calendar size={16} />
                  <input
                    type="date"
                    name="fromDate"
                    value={fromDate}
                    onChange={handleDateChange}
                    max={getTodayDate()}
                    className="outline-none cursor-pointer text-xs md:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs md:text-sm">To:</span>
                <div className="flex items-center gap-2 border border-gray-300 px-2 py-1 rounded">
                  <Calendar size={16} />
                  <input
                    type="date"
                    name="toDate"
                    value={toDate}
                    onChange={handleDateChange}
                    max={getTodayDate()}
                    className="outline-none cursor-pointer text-xs md:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs md:text-sm">
              <span className="font-semibold">Print Date &amp; Time:</span>{" "}
              {getCurrentDateTime()}
            </div>
          </div>

          <div className="text-xs md:text-sm mb-3">
            <span className="font-semibold">FO Cash Statement From</span>{" "}
            {formatDate(fromDate)}
            <span className="font-semibold"> To </span>
            {formatDate(toDate)}
          </div>

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-yellow-400"
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
                <div className="ml-2">
                  <p className="text-xs md:text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
         <table className="w-full border-collapse mb-3 print-table">
              <thead>{renderTableHeader()}</thead>
              <tbody>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <td
                    colSpan="12"
                    className="py-1.5 px-1 font-semibold text-xs"
                  >
                    Checkout Bills ({checkoutData.length}{" "}
                    {checkoutData.length === 1 ? "record" : "records"})
                  </td>
                </tr>

                {checkoutData.length > 0
                  ? checkoutData.map((item, index) =>
                      renderTableRow(item, index)
                    )
                  : renderEmptyState()}
              </tbody>
              <tfoot>{renderSummary()}</tfoot>
            </table>
          </div>

          {renderSummarySection()}
        </div>

        <div className="text-center mt-4 no-print">
          <button
            onClick={() => {
              if (!contentToPrint.current) {
                toast.error("There is nothing to print");
                return;
              }
              handlePrint();
            }}
            disabled={checkoutData.length === 0 || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-md text-sm"
          >
            {checkoutData.length === 0 ? "No Data to Print" : "Print Statement"}
          </button>
        </div>

        <style jsx>{`
          @media print {
            .no-print {
              display: none !important;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              margin: 0;
              padding: 0;
            }

            table thead {
              display: table-header-group;
            }

            table tfoot {
              display: table-footer-group;
            }

            table tr {
              page-break-inside: avoid;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default HotelCheckoutStatement;