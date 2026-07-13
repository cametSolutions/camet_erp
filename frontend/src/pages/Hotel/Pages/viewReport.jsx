import React, { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api";
import { useSelector, useDispatch } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { setRoomSummaryReportDate } from "../../../../slices/dateSlice";
const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN");
};

const fmt = (n) =>
  n !== undefined && n !== null && n !== "" ? Number(n).toFixed(2) : "";

const SUMMARY_NUMERIC_KEYS = [
  "dayTariff",
  "cgst",
  "sgst",
  "dayPlanSales",
  "dayPlanCGST",
  "dayPlanSGST",
  "roomSales",
  "planSales",
  "planSalesCGST",
  "planSalesSGST",
  "grossAmount",
];

const SUMMARY_COLUMNS = [
  { key: "date", label: "Date", width: "90px", render: formatDate },
  { key: "billNo", label: "Bill No", width: "120px" },
  { key: "agentName", label: "Agent Name", width: "160px" },
  { key: "guestName", label: "Guest Name", width: "160px" },
  { key: "rooms", label: "Rooms", width: "110px" },
  { key: "days", label: "Days", width: "70px" },
  { key: "extraPerson", label: "Extra Person", width: "100px" },
  { key: "plan", label: "Plan", width: "70px" },
  { key: "perDayRevenue", label: "Day Tariff", width: "100px", render: fmt },
  { key: "roomRentCGST", label: "CGST", width: "80px", render: fmt },
  { key: "roomRentSGST", label: "SGST", width: "80px", render: fmt },
  { key: "dayPlanSales", label: "Day Plan Sales", width: "120px", render: fmt },
  { key: "dayPlanCGST", label: "Day Plan CGST", width: "100px", render: fmt },
  { key: "dayPlanSGST", label: "Day Plan SGST", width: "100px", render: fmt },
  { key: "roomRentTotal", label: "Room Sales", width: "100px", render: fmt },
  { key: "planSales", label: "Plan Sales", width: "100px", render: fmt },
  {
    key: "planSalesCGST",
    label: "Plan Sales CGST",
    width: "100px",
    render: fmt,
  },
  {
    key: "planSalesSGST",
    label: "Plan Sales SGST",
    width: "100px",
    render: fmt,
  },
  { key: "grossAmount", label: "Gross Amount", width: "110px", render: fmt },
];

const DETAIL_COLUMNS = [
  { key: "billNo", label: "Bill No", width: "120px" },
  { key: "date", label: "Date", width: "90px", render: formatDate },
  { key: "agentName", label: "Agent Name", width: "160px" },
  { key: "guestName", label: "Guest Name", width: "160px" },
  { key: "plan", label: "Plan", width: "50px" },
  { key: "rooms", label: "Rooms", width: "80px" },
  { key: "noRooms", label: "No.Rms", width: "60px" },
  { key: "placeOfSupply", label: "placeOfSupply", width: "160px" },
  { key: "gst", label: "GST", width: "160px" },
  { key: "days", label: "Days", width: "50px" },
  { key: "totalAmount", label: "Total Amt", width: "90px", render: fmt },
  { key: "perDayRevenue", label: "Per Day", width: "80px", render: fmt },
  { key: "noPax", label: "Pax", width: "50px" },
  { key: "extraPerson", label: "Extra Person", width: "100px" },
  { key: "planRate", label: "planRate", width: "50px" },
  { key: "planTotal", label: "Plan Total", width: "90px", render: fmt },
  { key: "planTaxable", label: "Plan Taxable", width: "100px", render: fmt },
  { key: "roomRent", label: "Room Rent", width: "90px", render: fmt },
  { key: "roomRentTaxable", label: "Rm Taxable", width: "100px", render: fmt },
  { key: "roomRentTotal", label: "Rm Total", width: "90px", render: fmt },
  { key: "roomRentCGST", label: "CGST", width: "70px", render: fmt },
  { key: "roomRentSGST", label: "SGST", width: "70px", render: fmt },
  { key: "dayPlanSales", label: "Day Plan Sales", width: "120px", render: fmt },
  { key: "dayPlanCGST", label: "Day Plan CGST", width: "100px", render: fmt },
  { key: "dayPlanSGST", label: "Day Plan SGST", width: "100px", render: fmt },
  { key: "planSales", label: "Plan Sales", width: "100px", render: fmt },
  { key: "planSalesCGST", label: "Pl.CGST", width: "70px", render: fmt },
  { key: "planSalesSGST", label: "Pl.SGST", width: "70px", render: fmt },
  { key: "revenue", label: "Revenue", width: "90px", render: fmt },
  { key: "revenueCGST", label: "Rev CGST", width: "80px", render: fmt },
  { key: "revenueSGST", label: "Rev SGST", width: "80px", render: fmt },
  { key: "differenceAmt", label: "Difference", width: "90px", render: fmt },
  { key: "grossAmount", label: "Gross Amt", width: "90px", render: fmt },
  { key: "grossCGST", label: "Gr.CGST", width: "70px", render: fmt },
  { key: "grossSGST", label: "Gr.SGST", width: "70px", render: fmt },
  { key: "totalTax", label: "Total Tax", width: "80px", render: fmt },
  { key: "discount", label: "Discount", width: "70px", render: fmt },
  { key: "roundOff", label: "Round Off", width: "70px", render: fmt },
  { key: "netTotal", label: "Net Total", width: "90px", render: fmt },
  { key: "cash", label: "Cash", width: "80px", render: fmt },
  { key: "upi", label: "UPI", width: "80px", render: fmt },
  { key: "bank", label: "Bank", width: "80px", render: fmt },
  { key: "card", label: "Card", width: "70px", render: fmt },
  { key: "paymentMode", label: "Mode", width: "100px" },
  { key: "credit", label: "Credit", width: "80px", render: fmt },
  { key: "creditDescription", label: "Credit Desc", width: "140px" },
];

export default function ViewReport() {
  const dispatch = useDispatch();
  const roomSummaryReportDate = useSelector(
    (state) => state.selectedDate.roomSummaryReportDate,
  );

  const { start, end, autoFetch } = roomSummaryReportDate;
  const [filters, setFilters] = useState({
    fromDate: start || new Date().toISOString().split("T")[0],
    toDate: end || new Date().toISOString().split("T")[0],
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  // ✅ Same pattern as OccupancyCheckoutReport
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id,
  );
  useEffect(() => {
    if (autoFetch && cmp_id) {
      fetchReport(start, end);

      dispatch(
        setRoomSummaryReportDate({
          autoFetch: true,
          start: start,
          end: end,
        }),
      );
    }
  }, [autoFetch, cmp_id]);
  const printMeta = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
    };
  }, []);
  useEffect(() => {
    fetchReport();
  }, [filters.fromDate, filters.toDate]);

  const fetchReport = async () => {
    if (!filters.fromDate || !filters.toDate) return;
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/sUsers/viewReport", {
        params: {
          startDate: filters.fromDate,
          endDate: filters.toDate,
          cmp_id,
        },
      });

      const result = response?.data;

      console.log(result);

      if (result?.success) {
        setRows(result.data || []);
      } else {
        setError(result?.message || "Failed to fetch report");
      }
    } catch (err) {
      // ✅ Safe: handles both network errors and HTTP errors
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch report",
      );
    } finally {
      setLoading(false);
    }
  };

  console.log(rows);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fromDate") {
      dispatch(
        setRoomSummaryReportDate({
          start: value,
          end: filters.toDate,
          autoFetch: false,
        }),
      );
    } else {
      dispatch(
        setRoomSummaryReportDate({
          start: filters.fromDate,
          end: value,
          autoFetch: false,
        }),
      );
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const exportToPDF = () => {
    const cols = getColumns();
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.setTextColor(30, 58, 95);
    doc.text(
      showDetails ? "Sales Report - Details" : "Sales Report - Summary",
      14,
      14,
    );

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Period: ${filters.fromDate || "-"} to ${filters.toDate || "-"}   |   ${rows.length} rows   |   Printed: ${printMeta.date} ${printMeta.time}`,
      14,
      20,
    );

    const head = [["#", ...cols.map((c) => c.label)]];

    const body = rows.map((row, idx) => [
      idx + 1,
      ...cols.map((col) => {
        const value = row[col.key];
        return col.render ? col.render(value) : (value ?? "");
      }),
    ]);

    body.push([
      "TOTAL",
      ...cols.map((col, index) => {
        if (index === 0) return "";
        return SUMMARY_NUMERIC_KEYS.includes(col.key)
          ? fmt(total(col.key))
          : "";
      }),
    ]);

    autoTable(doc, {
      startY: 25,
      head,
      body,
      styles: {
        fontSize: 6.5,
        cellPadding: 1.8,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      bodyStyles: {
        textColor: 20,
      },
      didParseCell: (hook) => {
        if (hook.section === "body" && hook.row.index === body.length - 1) {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [30, 58, 95];
          hook.cell.styles.textColor = 255;
        }
      },
      margin: { top: 25, right: 8, bottom: 10, left: 8 },
      tableWidth: "auto",
    });

    doc.save(
      `sales-report-${filters.fromDate}-to-${filters.toDate}${showDetails ? "-details" : "-summary"}.pdf`,
    );
  };

  const total = (key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);

  const getColumns = () => (showDetails ? DETAIL_COLUMNS : SUMMARY_COLUMNS);

  const handleExportExcel = () => {
    const cols = getColumns();
    const headers = cols.map((c) => c.label);

    const dataRows = rows.map((r) =>
      cols.map((col) =>
        col.render ? col.render(r[col.key]) : (r[col.key] ?? ""),
      ),
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [],
      ["Sales Report"],
      [],
      [
        "From:",
        filters.fromDate,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Print Date & Time:",
        `${printMeta.date} ${printMeta.time}`,
      ],
      [],
      headers,
      ...dataRows,
    ]);

    ws["!cols"] = cols.map(() => ({ wch: 14 }));
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `Sales_Report_${filters.fromDate}_to_${filters.toDate}${showDetails ? "_details" : ""}.xlsx`,
    );
  };
  const columns = getColumns();

  return (
    <>
      <TitleDiv title="Sales Report" />
      <div className="min-h-screen bg-slate-100 p-2 md:p-3 print:bg-white print:p-0">
        <div className="mx-auto max-w-full">
          {/* Filter Bar */}
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:hidden md:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
                  The Room Summary Report
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Room-wise sales with tax breakup, payment mode and agent
                  details
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid w-full grid-cols-1 gap-2 md:grid-cols-3 lg:w-auto"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    From Date
                  </label>
                  <input
                    type="date"
                    name="fromDate"
                    value={filters.fromDate}
                    onChange={handleChange}
                    className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    To Date
                  </label>
                  <input
                    type="date"
                    name="toDate"
                    value={filters.toDate}
                    onChange={handleChange}
                    className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <button
                    type="submit"
                    disabled={loading || !filters.fromDate || !filters.toDate}
                    className="inline-flex h-8 items-center justify-center rounded-md bg-teal-700 px-3 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    {loading ? "Loading..." : "Get Report"}
                  </button>

                  <button
                    type="button"
                    onClick={exportToPDF}
                    className="inline-flex h-8 items-center justify-center rounded-md bg-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    Print
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={!rows.length}
                    className="inline-flex h-8 items-center justify-center rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Export Excel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 print:hidden">
              {error}
            </div>
          )}

          {/* Report Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:rounded-none print:border-0 print:p-0 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs"></div>

              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                disabled={!rows.length}
                className="inline-flex h-8 items-center justify-center rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 print:hidden"
              >
                {showDetails ? "Hide Details" : "Details"}
              </button>
            </div>

            <div className="mt-2 text-xs md:flex md:justify-between">
              <div>
                <span className="font-medium">Print Date & Time :- </span>
                <span>
                  {printMeta.date} {printMeta.time}
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="border-collapse text-xs min-w-max w-full">
                <thead>
                  <tr className="bg-[#1E3A5F] text-white">
                    <th className="border border-slate-400 px-2 py-2 text-center">
                      #
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="border border-slate-400 px-2 py-2 text-center whitespace-nowrap"
                        style={{ minWidth: col.width }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-2 py-6 text-center text-slate-500"
                      >
                        Loading report...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    <>
                      {rows.map((row, idx) => (
                        <tr
                          key={row.billNo || idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                        >
                          <td className="border border-slate-200 px-2 py-1 text-center text-slate-400">
                            {idx + 1}
                          </td>
                          {columns.map((col) => (
                            <td
                              key={col.key}
                              className="border border-slate-200 px-2 py-1 whitespace-nowrap"
                            >
                              {col.render
                                ? col.render(row[col.key])
                                : (row[col.key] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Totals Row */}
                      <tr className="bg-yellow-50 font-bold">
                        <td
                          className="border border-slate-300 px-2 py-1.5 text-center"
                          colSpan={2}
                        >
                          TOTAL
                        </td>
                        {columns.slice(1).map((col) => (
                          <td
                            key={col.key}
                            className="border border-slate-300 px-2 py-1.5 text-right"
                          >
                            {SUMMARY_NUMERIC_KEYS.includes(col.key)
                              ? fmt(total(col.key))
                              : ""}
                          </td>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="px-2 py-6 text-center text-slate-500"
                      >
                        {filters.fromDate
                          ? "No records found for selected date range"
                          : "Select a date range and click Get Report"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
