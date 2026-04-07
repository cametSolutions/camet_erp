import React, { useEffect, useMemo, useState } from "react";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api";
import { useSelector } from "react-redux";

const getToday = () => new Date().toISOString().slice(0, 10);

const formatDisplayDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const FoodPlanReportPage = () => {
  const [filters, setFilters] = useState({
  fromDate: getToday(),
  toDate: getToday(),
});


 const cmp_id = useSelector(
         (state) => state.secSelectedOrganization.secSelectedOrg._id
       );
  const [data, setData] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const printMeta = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
    };
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/sUsers/foodplan-report", {
        params: {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          cmp_id: cmp_id,
        },
      });

      if (res.data?.success) {
        setData(res.data.foodPlans || []);
        setGrandTotal(res.data.grandTotal || 0);
      } else {
        setData([]);
        setGrandTotal(0);
        setError(res.data?.message || "Failed to load report");
      }
    } catch (err) {
      setData([]);
      setGrandTotal(0);
      setError(err?.response?.data?.message || err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

 const handleExportExcel = () => {
  if (!data.length) return;

  const sheetRows = [];

  // Row 1–2: hotel name + place
  sheetRows.push(["", "THE FEEL MUNNAR"]);
  sheetRows.push(["", "MUNNAR"]);
  sheetRows.push([]);
  // Period line
  sheetRows.push([
    "",
    `For the Period ${formatDisplayDate(filters.fromDate)} To ${formatDisplayDate(
      filters.toDate
    )}`,
  ]);
  sheetRows.push([]);
  // Blank line before report title
  sheetRows.push([]);
  // Report title row (col B)
  sheetRows.push(["", "Outlet wise Complimentary Sale Report"]);
  sheetRows.push([]);
  // Column headers – start from B to look like the sample
  sheetRows.push([
    "",
    "Bill No",
    "Bill Date",
    "Item Name",
    "Qty",
    "Rate",
    "Amt",
    "Remarks",
  ]);

  // For each foodPlan section
  data.forEach((fp) => {
    // Blank row between sections
    sheetRows.push([]);

    // Section caption (e.g. COMPLIMENTARY, MD) in column B
    sheetRows.push(["", fp.foodPlan]);

    // Detail rows: flatten docs
    const flatRows = fp.rows.flat(); // each has billNo, billDate, itemName, qty, rate, amount, remarks

    flatRows.forEach((row) => {
      sheetRows.push([
        "",                              // col A empty, everything starts at B
        row.billNo || "",
        row.billDate ? formatDisplayDate(row.billDate) : "",
        row.itemName || "",
        Number(row.qty || 0),
        Number(row.rate || 0),
        Number(row.amount || 0),
        row.remarks || "",
      ]);
    });

    // Subtotal row – amount only under Amt column
    sheetRows.push([
      "",
      "",
      "",
      "", // Item Name col
      "",
      "",
      Number(fp.subTotal || 0),
      "",
    ]);
  });

  // Blank row then GRAND TOTAL
  sheetRows.push([]);
  sheetRows.push([
    "",
    "",
    "",
    "",
    "",
    "GRAND TOTAL",
    Number(grandTotal || 0),
    "",
  ]);

  // Build sheet
  const ws = XLSX.utils.aoa_to_sheet(sheetRows);

  // Optional: column widths similar to your sample
  ws["!cols"] = [
    { wch: 2 },  // A
    { wch: 10 }, // B Bill No / captions
    { wch: 12 }, // C Bill Date
    { wch: 40 }, // D Item Name
    { wch: 8 },  // E Qty
    { wch: 10 }, // F Rate
    { wch: 14 }, // G Amt
    { wch: 20 }, // H Remarks
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FoodPlan Report");

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(
    blob,
    `foodplan-report-${filters.fromDate}-to-${filters.toDate}.xlsx`
  );
};
console.log(data)
  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        {/* Toolbar */}
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden md:p-6">
            <h1 className="text-xl font-bold">OUTLET WISE COMPLIMENTARY SALE REPORT</h1>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-1">
          

            <form
              onSubmit={handleSubmit}
              className="grid w-full grid-cols-3 gap-3 md:grid-cols-3 lg:w-auto"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Get Report"}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  Print
                </button>

                <button
                  type="button"
                  disabled={!data.length}
                  onClick={handleExportExcel}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Export Excel
                </button>
              </div>
            </form>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 print:hidden">
            {error}
          </div>
        ) : null}

        {/* Printable report */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-4 print:shadow-none md:p-7">
        

          <div className="mt-4 flex flex-col justify-between gap-3 text-sm md:flex-row">
            <div>
              <div>
                For the Period {formatDisplayDate(filters.fromDate)} To{" "}
                {formatDisplayDate(filters.toDate)}
              </div>
             
            </div>

            <div className="text-left text-sm md:text-right">
              <div className="text-xs font-medium text-slate-500">
                Print Date &amp; Time
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {printMeta.date} {printMeta.time}
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-y-[3px] border-slate-800">
                  <th className="px-2 py-2 text-left font-bold">Bill No</th>
                  <th className="px-2 py-2 text-left font-bold">Bill Date</th>
                  <th className="px-2 py-2 text-left font-bold">Item Name</th>
                  <th className="px-2 py-2 text-right font-bold">Qty</th>
                  <th className="px-2 py-2 text-right font-bold">Rate</th>
                  <th className="px-2 py-2 text-right font-bold">Amt</th>
                  <th className="px-2 py-2 text-left font-bold">Remarks</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-2 py-8 text-center text-slate-500"
                    >
                      Loading report...
                    </td>
                  </tr>
                ) : !data.length ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-2 py-8 text-center text-slate-500"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  data.map((fp, fpIdx) => (
                    <React.Fragment key={fpIdx}>
                      {/* Section header like COMPLIMENTARY / MAP / MD */}
                      <tr>
                        <td
                          colSpan={7}
                          className="pt-4 pb-1 text-left text-xs font-extrabold uppercase tracking-wide text-slate-800"
                        >
                          {fp.foodPlan}
                        </td>
                      </tr>

                  {fp.rows.flat().map((row, idx) => (
  <tr
    key={`${fp.foodPlan}-${idx}`}
    className="border-b border-dashed border-slate-300"
  >
    <td className="px-2 py-1">{row.billNo}</td>
    <td className="px-2 py-1">{row.billDate}</td>
    <td className="px-2 py-1 text-slate-800">{row.itemName}</td>
    <td className="px-2 py-1 text-right">{row.qty}</td>
    <td className="px-2 py-1 text-right">
      {Number(row.rate || 0).toFixed(2)}
    </td>
    <td className="px-2 py-1 text-right">
      {Number(row.amount || 0).toFixed(2)}
    </td>
    <td className="px-2 py-1">{row.remarks}</td>
  </tr>
))}
                      {/* Sub total row */}
                      <tr>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2 font-semibold text-slate-800">
                          {fp.foodPlan} TOTAL
                        </td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2"></td>
                        <td className="px-2 py-2 text-right font-semibold text-slate-900">
                          {fp.subTotal.toFixed(2)}
                        </td>
                        <td className="px-2 py-2"></td>
                      </tr>
                    </React.Fragment>
                  ))
                )}
              </tbody>

              {!loading && data.length ? (
                <tfoot>
                  <tr className="border-t-2 border-slate-900">
                    <td className="px-2 py-3"></td>
                    <td className="px-2 py-3"></td>
                    <td className="px-2 py-3 text-sm font-bold text-slate-900">
                      GRAND TOTAL
                    </td>
                    <td className="px-2 py-3"></td>
                    <td className="px-2 py-3"></td>
                    <td className="px-2 py-3 text-right text-sm font-bold text-slate-900">
                      {grandTotal.toFixed(2)}
                    </td>
                    <td className="px-2 py-3"></td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodPlanReportPage;