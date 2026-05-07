import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api";
import { useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN");
};

const fmt = (n) =>
  n !== undefined && n !== null && n !== "" ? Number(n).toFixed(2) : "";

const NUMERIC_KEYS = [
  "totalAmount", "perDayRevenue", "planTotal", "planTaxable",
  "roomRent", "roomRentTaxable", "roomRentTotal", "roomRentCGST",
  "roomRentSGST", "planSalesCGST", "planSalesSGST", "revenue",
  "revenueCGST", "revenueSGST", "differenceAmt", "grossAmount",
  "grossCGST", "grossSGST", "totalTax", "discount", "roundOff",
  "netTotal", "cash", "upi", "bank", "card", "credit",
];

const COLUMNS = [
  { key: "billNo",            label: "Bill No",       width: "120px" },
  { key: "date",              label: "Date",           width: "90px",  render: formatDate },
  { key: "agentName",         label: "Agent Name",     width: "160px" },
  { key: "plan",              label: "Plan",           width: "50px" },
  { key: "rooms",             label: "Rooms",          width: "80px" },
  { key: "noRooms",           label: "No.Rms",         width: "60px" },
  { key: "days",              label: "Days",           width: "50px" },
  { key: "totalAmount",       label: "Total Amt",      width: "90px",  render: fmt },
  { key: "perDayRevenue",     label: "Per Day",        width: "80px",  render: fmt },
  { key: "noPax",             label: "Pax",            width: "50px" },
  { key: "planRate",             label: "planRate",            width: "50px" },
  { key: "planTotal",         label: "Plan Total",     width: "90px",  render: fmt },
  { key: "planTaxable",       label: "Plan Taxable",   width: "100px", render: fmt },
  { key: "roomRent",          label: "Room Rent",      width: "90px",  render: fmt },
  { key: "roomRentTaxable",   label: "Rm Taxable",     width: "100px", render: fmt },
  { key: "roomRentTotal",     label: "Rm Total",       width: "90px",  render: fmt },
  { key: "roomRentCGST",      label: "CGST",           width: "70px",  render: fmt },
  { key: "roomRentSGST",      label: "SGST",           width: "70px",  render: fmt },
  { key: "planSales",    label: "Plan Sales",   width: "100px", render: fmt },
  { key: "planSalesCGST",     label: "Pl.CGST",        width: "70px",  render: fmt },
  { key: "planSalesSGST",     label: "Pl.SGST",        width: "70px",  render: fmt },
  { key: "revenue",           label: "Revenue",        width: "90px",  render: fmt },
  { key: "revenueCGST",       label: "Rev CGST",       width: "80px",  render: fmt },
  { key: "revenueSGST",       label: "Rev SGST",       width: "80px",  render: fmt },
  { key: "differenceAmt",     label: "Difference",     width: "90px",  render: fmt },
  { key: "grossAmount",       label: "Gross Amt",      width: "90px",  render: fmt },
  { key: "grossCGST",         label: "Gr.CGST",        width: "70px",  render: fmt },
  { key: "grossSGST",         label: "Gr.SGST",        width: "70px",  render: fmt },
  { key: "totalTax",          label: "Total Tax",      width: "80px",  render: fmt },
  { key: "discount",          label: "Discount",       width: "70px",  render: fmt },
  { key: "roundOff",          label: "Round Off",      width: "70px",  render: fmt },
  { key: "netTotal",          label: "Net Total",      width: "90px",  render: fmt },
  { key: "cash",              label: "Cash",           width: "80px",  render: fmt },
  { key: "upi",               label: "UPI",            width: "80px",  render: fmt },
  { key: "bank",              label: "Bank",           width: "80px",  render: fmt },
  { key: "card",              label: "Card",           width: "70px",  render: fmt },
  { key: "paymentMode",       label: "Mode",           width: "100px" },
  { key: "credit",            label: "Credit",         width: "80px",  render: fmt },
  { key: "creditDescription", label: "Credit Desc",    width: "140px" },
];

export default function ViewReport() {
  const [filters, setFilters] = useState({ fromDate: "", toDate: "" });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Same pattern as OccupancyCheckoutReport
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const printMeta = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
    };
  }, []);

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
        err?.response?.data?.message || err?.message || "Failed to fetch report"
      );
    } finally {
      setLoading(false);
    }
  };

  console.log(rows);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => window.print();

  const total = (key) =>
    rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);

  const handleExportExcel = () => {
    const headers = COLUMNS.map((c) => c.label);
    const dataRows = rows.map((r) =>
      COLUMNS.map((col) =>
        col.render && NUMERIC_KEYS.includes(col.key)
          ? Number(r[col.key]) || 0
          : r[col.key] ?? ""
      )
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
   
      [],
      ["Sales Report"],
      [],
      [
        "From:", filters.fromDate,
        "", "", "", "", "", "", "", "",
        "Print Date & Time:",
        `${printMeta.date} ${printMeta.time}`,
      ],
      [],
      headers,
      ...dataRows,
    ]);

    ws["!cols"] = COLUMNS.map(() => ({ wch: 14 }));
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/octet-stream" }),
      `Sales_Report_${filters.fromDate}_to_${filters.toDate}.xlsx`
    );
  };

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
                   The View Report
                </h1>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Room-wise sales with tax breakup, payment mode and agent details
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
                    onClick={handlePrint}
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
           
          

            <div className="mt-4 flex flex-col gap-1 text-xs md:flex-row md:justify-between">
              <div>
                <span className="font-medium">Period :- </span>
                <span>
                  {filters.fromDate || "—"} to {filters.toDate || "—"}
                </span>
              </div>
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
                    <th className="border border-slate-400 px-2 py-2 text-center">#</th>
                    {COLUMNS.map((col) => (
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
                        colSpan={COLUMNS.length + 1}
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
                          {COLUMNS.map((col) => (
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
                        {COLUMNS.slice(1).map((col) => (
                          <td
                            key={col.key}
                            className="border border-slate-300 px-2 py-1.5 text-right"
                          >
                            {NUMERIC_KEYS.includes(col.key)
                              ? fmt(total(col.key))
                              : ""}
                          </td>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td
                        colSpan={COLUMNS.length + 1}
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