// pages/SalesRegister.jsx
import { useEffect, useMemo, useState } from "react";
import api from "@/api/api";
import * as XLSX from "xlsx";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Cash / UPI", value: "CASH/UPI" },
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Credit", value: "CREDIT" },
  { label: "Complementory", value: "COMPLEMENTORY" },
  { label: "Sponsor", value: "SPONSOR" },
];

const fmt = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getPaymentBadgeClass = (type = "") => {
  const v = type.toUpperCase();
  if (v === "CASH/UPI") return "bg-indigo-100 text-indigo-700";
  if (v === "CASH") return "bg-sky-100 text-sky-700";
  if (v === "UPI") return "bg-violet-100 text-violet-700";
  if (v === "CREDIT") return "bg-rose-100 text-rose-700";
  if (v === "COMPLEMENTORY") return "bg-purple-100 text-purple-700";
  if (v === "SPONSOR") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const getBillTypeBadgeClass = (type = "") => {
  const v = type.toUpperCase();
  if (v === "DINE-IN") return "bg-emerald-100 text-emerald-700";
  if (v === "ROOM SERVICE") return "bg-orange-100 text-orange-700";
  if (v === "TAKEAWAY") return "bg-teal-100 text-teal-700";
  return "bg-slate-100 text-slate-700";
};

const printPaymentClass = (type = "") => {
  const v = type.toUpperCase();
  if (v === "CASH/UPI") return "pay-cashupi";
  if (v === "CASH") return "pay-cash";
  if (v === "UPI") return "pay-upi";
  if (v === "CREDIT") return "pay-credit";
  if (v === "COMPLEMENTORY") return "pay-complementory";
  if (v === "SPONSOR") return "pay-sponsor";
  return "pay-default";
};

export default function SaleRegisterPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
    search: "",
  });

  const handleChangeFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const fetchRegister = async (customFilters = filters) => {
    try{
      setLoading(true);
      const cleanedParams = Object.fromEntries(
        Object.entries(customFilters).filter(([_, v]) => v !== "")
      );

      // IMPORTANT: this is the “like KOT page” style:
      //  - single endpoint
      //  - filters passed as query params
      const { data } = await api.get("/api/sUsers/sales-register", {
        params: cleanedParams,
      });

      // expecting { data: [...rows] } similar to KOT register
      setRows(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch Sales register", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegister();
  }, []);

  const handleFilterSubmit = () => fetchRegister(filters);

  const handleReset = () => {
    const resetFilters = { from: "", to: "", status: "", search: "" };
    setFilters(resetFilters);
    fetchRegister(resetFilters);
  };

  // Plan summary (CP / MAP / AP / -) like KOT planSummary
  const planSummary = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const key =
          typeof row.foodPlan === "string" && row.foodPlan.trim()
            ? row.foodPlan.trim()
            : "-";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  // Payment type summary (CASH / UPI / ...) similar to typeSummary
  const paymentSummary = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const key = row.paymentType?.trim() || "-";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  // Totals
  const totalQty = useMemo(
    () => rows.reduce((sum, r) => sum + (r.qty || 0), 0),
    [rows]
  );
  const totalTaxable = useMemo(
    () => rows.reduce((sum, r) => sum + (r.amount || 0), 0),
    [rows]
  );
  const totalTax = useMemo(
    () => rows.reduce((sum, r) => sum + (r.taxAmount || 0), 0),
    [rows]
  );
  const totalDisc = useMemo(
    () => rows.reduce((sum, r) => sum + (r.discAmount || 0), 0),
    [rows]
  );
  const totalBill = useMemo(
    () => rows.reduce((sum, r) => sum + (r.billAmount || 0), 0),
    [rows]
  );

  const handleExportExcel = () => {
    if (!rows.length) return;

    const exportData = rows.map((row) => ({
      Date: row.date || "-",
      "Bill No": row.billNo || "-",
      Customer: row.customer || "-",
      "Item Name": row.itemName || "-",
      Qty: row.qty ?? 0,
      Rate: row.rate ?? 0,
      "Taxable Amount": row.amount ?? 0,
      "Tax Amount": row.taxAmount ?? 0,
      "Disc Amount": row.discAmount ?? 0,
      "Bill Amount": row.billAmount ?? 0,
      "Bill Type": row.billType || "-",
      "Room No": row.roomNo || "-",
      "Food Plan": row.foodPlan || "-",
      "Payment Type": row.paymentType || "-",
      Sponsor: row.sponsorName || "-",
      Remarks: row.remarks || "-",
    }));

    const planRows = Object.entries(planSummary).map(([plan, count]) => ({
      "Food Plan": plan,
      Count: count,
    }));

    const payRows = Object.entries(paymentSummary).map(([type, count]) => ({
      "Payment Type": type,
      Count: count,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    ws["!cols"] = [
      { wch: 12 }, // Date
      { wch: 10 }, // Bill No
      { wch: 20 }, // Customer
      { wch: 24 }, // Item
      { wch: 6 },  // Qty
      { wch: 8 },  // Rate
      { wch: 12 }, // Taxable
      { wch: 10 }, // Tax
      { wch: 10 }, // Disc
      { wch: 12 }, // Bill Amount
      { wch: 12 }, // Bill Type
      { wch: 10 }, // Room
      { wch: 12 }, // Plan
      { wch: 14 }, // Payment
      { wch: 16 }, // Sponsor
      { wch: 24 }, // Remarks
    ];

    const mainRows = exportData.length + 1;
    const summaryStartRow = mainRows + 3;

    XLSX.utils.sheet_add_aoa(ws, [["PLAN SUMMARY"]], {
      origin: `A${summaryStartRow}`,
    });
    XLSX.utils.sheet_add_json(ws, planRows, {
      origin: `A${summaryStartRow + 1}`,
      skipHeader: false,
    });

    XLSX.utils.sheet_add_aoa(ws, [["PAYMENT TYPE SUMMARY"]], {
      origin: `E${summaryStartRow}`,
    });
    XLSX.utils.sheet_add_json(ws, payRows, {
      origin: `E${summaryStartRow + 1}`,
      skipHeader: false,
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Register");
    XLSX.writeFile(wb, "Sales-Register.xlsx");
  };

  const handlePrint = () => {
    if (!rows.length) return;

    const tableRows = rows
      .map(
        (row) => `
      <tr>
        <td>${row.date || "-"}</td>
        <td>${row.billNo || "-"}</td>
        <td>${row.customer || "-"}</td>
        <td>${row.itemName || "-"}</td>
        <td style="text-align:center">${row.qty ?? 0}</td>
        <td style="text-align:right">${fmt(row.rate)}</td>
        <td style="text-align:right">${fmt(row.amount)}</td>
        <td style="text-align:right">${fmt(row.taxAmount)}</td>
        <td style="text-align:right">${fmt(row.discAmount)}</td>
        <td style="text-align:right">${fmt(row.billAmount)}</td>
        <td><span class="badge ${getBillTypeBadgeClass(
          row.billType
        ).replace("bg-", "bg-").replace("text-", "text-")}">${
          row.billType || "-"
        }</span></td>
        <td>${row.roomNo || "-"}</td>
        <td>${row.foodPlan || "-"}</td>
        <td><span class="badge ${printPaymentClass(
          row.paymentType
        )}">${row.paymentType || "-"}</span></td>
        <td>${row.sponsorName || "-"}</td>
        <td>${row.remarks || "-"}</td>
      </tr>`
      )
      .join("");

    const planRowsHtml =
      Object.entries(planSummary)
        .map(
          ([k, v]) =>
            `<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`
        )
        .join("") || `<tr><td colspan="2">No data</td></tr>`;

    const payRowsHtml =
      Object.entries(paymentSummary)
        .map(
          ([k, v]) =>
            `<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`
        )
        .join("") || `<tr><td colspan="2">No data</td></tr>`;

    const win = window.open("", "", "height=900,width=1300");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Sales Register</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; padding: 20px; font-size: 12px; color: #1e293b; }
    .header {
      background: #7f1d1d;
      color: #fff;
      text-align: center;
      padding: 10px 16px;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: .06em;
      margin-bottom: 10px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding-bottom: 10px;
      font-size: 11px;
      color: #475569;
      border-bottom: 1px solid #cbd5e1;
      margin-bottom: 12px;
    }
    .meta span strong { color: #1e293b; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th {
      background: #7f1d1d;
      color: #fff;
      border: 1px solid #475569;
      padding: 5px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
    }
    td { border: 1px solid #cbd5e1; padding: 4px 8px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }
    .pay-cashupi { background:#e0f2fe; color:#1d4ed8; }
    .pay-cash { background:#e0f2fe; color:#0369a1; }
    .pay-upi { background:#ede9fe; color:#6d28d9; }
    .pay-credit { background:#fee2e2; color:#b91c1c; }
    .pay-complementory { background:#f3e8ff; color:#7e22ce; }
    .pay-sponsor { background:#fef9c3; color:#b45309; }
    .pay-default { background:#f1f5f9; color:#475569; }
    .summaries {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      max-width: 560px;
    }
    .summary-label {
      font-weight: 700;
      font-size: 13px;
      padding: 6px 8px;
      border-bottom: 2px solid #7f1d1d;
    }
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">SALES REGISTER</div>
  <div class="meta">
    <span><strong>From:</strong> ${filters.from || "All"}</span>
    <span><strong>To:</strong> ${filters.to || "All"}</span>
    <span><strong>Payment Filter:</strong> ${filters.status || "All"}</span>
    <span><strong>Total Records:</strong> ${rows.length}</span>
    <span><strong>Printed:</strong> ${new Date().toLocaleString()}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>DATE</th>
        <th>BILL NO</th>
        <th>CUSTOMER</th>
        <th>ITEM</th>
        <th>QTY</th>
        <th>RATE</th>
        <th>TAXABLE</th>
        <th>TAX</th>
        <th>DISC</th>
        <th>BILL AMOUNT</th>
        <th>BILL TYPE</th>
        <th>ROOM NO</th>
        <th>PLAN</th>
        <th>PAYMENT</th>
        <th>SPONSOR</th>
        <th>REMARKS</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="summaries">
    <div>
      <div class="summary-label">PLAN SUMMARY</div>
      <table><tbody>${planRowsHtml}</tbody></table>
    </div>
    <div>
      <div class="summary-label">PAYMENT TYPE SUMMARY</div>
      <table><tbody>${payRowsHtml}</tbody></table>
    </div>
  </div>
</body>
</html>`);

    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
          <div className="bg-[#0b1d34] py-3 text-center text-xl font-bold tracking-wide text-white">
            SALES REGISTER
          </div>

          {/* FILTER BAR */}
          <div className="border-b border-slate-300 bg-white p-4">
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-6">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  From
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    handleChangeFilter("from", e.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  To
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    handleChangeFilter("to", e.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                />
              </div>

              

             

              <div className="flex flex-wrap gap-2 pt-4 xl:col-span-2 xl:self-end xl:pt-0">
                <button
                  onClick={handleFilterSubmit}
                  className="rounded-md bg-[#0b1d34] px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
                >
                  View
                </button>
              
                <button
                  onClick={handleExportExcel}
                  disabled={!rows.length}
                  className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!rows.length}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[#0b1d34] text-white">
                <tr>
                  {[
                    "DATE",
                    "BILL NO",
                    "CUSTOMER",
                    "ITEM",
                    "QTY",
                    "RATE",
                    "TAXABLE",
                    "TAX",
                    "DISC",
                    "BILL AMOUNT",
                    "BILL TYPE",
                    "ROOM NO",
                    "PLAN",
                    "PAYMENT",
                    "SPONSOR",
                    "REMARKS",
                  ].map((head) => (
                    <th
                      key={head}
                      className="border border-slate-500 px-3 py-2 text-left font-semibold"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="border border-slate-300 px-4 py-6 text-center"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="border border-slate-300 px-4 py-6 text-center text-slate-500"
                    >
                      No sales register data found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr
                      key={`${row.billNo}-${row.itemId || index}`}
                      className="hover:bg-slate-50"
                    >
                      <td className="border border-slate-300 px-3 py-2">
                        {row.date || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.billNo || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.customer || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.itemName || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-center">
                        {row.qty ?? 0}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right">
                        {fmt(row.rate)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right">
                        {fmt(row.amount)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right">
                        {fmt(row.taxAmount)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right">
                        {fmt(row.discAmount)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                        {fmt(row.billAmount)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${getBillTypeBadgeClass(
                            row.billType
                          )}`}
                        >
                          {row.billType || "-"}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.roomNo || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.foodPlan || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${getPaymentBadgeClass(
                            row.paymentType
                          )}`}
                        >
                          {row.paymentType || "-"}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.sponsorName || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.remarks || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {rows.length > 0 && !loading && (
                <tfoot>
                  <tr className="border-t-2 border-red-200 bg-red-50">
                    <td
                      colSpan={4}
                      className="px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-red-700"
                    >
                      Total
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold">
                      {totalQty}
                    </td>
                    <td />
                    <td className="px-3 py-2.5 text-right text-sm font-bold">
                      {fmt(totalTaxable)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold">
                      {fmt(totalTax)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold">
                      {fmt(totalDisc)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold">
                      {fmt(totalBill)}
                    </td>
                    <td colSpan={6} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* SUMMARY SECTION */}
          <div className="grid gap-6 p-4 md:grid-cols-2">
            <div className="max-w-sm">
              <div className="border border-slate-500">
                <div className="px-3 py-2 text-lg font-bold">PLAN SUMMARY</div>
                <table className="w-full">
                  <tbody>
                    {Object.keys(planSummary).length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="border border-slate-300 px-3 py-2 text-slate-500"
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      Object.entries(planSummary).map(([plan, count]) => (
                        <tr key={plan}>
                          <td className="border border-slate-300 px-3 py-2">
                            {plan}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                            {count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="max-w-sm">
              <div className="border border-slate-500">
                <div className="px-3 py-2 text-lg font-bold">
                  PAYMENT TYPE SUMMARY
                </div>
                <table className="w-full">
                  <tbody>
                    {Object.keys(paymentSummary).length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="border border-slate-300 px-3 py-2 text-slate-500"
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      Object.entries(paymentSummary).map(([type, count]) => (
                        <tr key={type}>
                          <td className="border border-slate-300 px-3 py-2">
                            {type}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                            {count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
