// pages/KotRegisterPage.jsx
import { useEffect, useMemo, useState } from "react";
import api from "@/api/api";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Pending", value: "pending" },
];

const getStatusBadgeClass = (status = "") => {
  const value = status.toUpperCase();
  if (value === "CANCELLED") return "bg-red-100 text-red-700";
  if (value === "COMPLETED") return "bg-green-100 text-green-700";
  if (value === "PENDING") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
};

const printStatusClass = (status = "") => {
  const v = status.toUpperCase();
  if (v === "COMPLETED") return "status-completed";
  if (v === "CANCELLED") return "status-cancelled";
  if (v === "PENDING") return "status-pending";
  return "status-default";
};

export default function KotRegisterPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
    search: "",
  });


    const cmp_id = useSelector(
         (state) => state.secSelectedOrganization.secSelectedOrg._id
       );


  const handleChangeFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const fetchRegister = async (customFilters = filters) => {
    try {
      setLoading(true);
      const cleanedParams = Object.fromEntries(
        Object.entries(customFilters).filter(([_, v]) => v !== "")
      );

      const { data } = await api.get("/api/sUsers/register", {
      params: { ...cleanedParams, cmp_id },  // ⬅️ send company id
    });

      setRows(data?.data || []);
    } catch (error) {
      console.error("Failed to fetch KOT register", error);
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

  const typeSummary = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const key = row.kotType?.trim() || "-";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );
const handleExportExcel = () => {
  if (!rows.length) return;

  const exportData = rows.map((row) => ({
    Date: row.date || "-",
    "KOT No": row.kotNo || "-",
    "Item Name": row.itemName || "-",
    Qty: row.qty ?? 0,
    "KOT Type": row.kotType || "-",
    "Room No": row.roomNo || "-",
    "Food Plan": row.foodPlan || "-",
    Status: row.status || "-",
    Remarks: row.remarks || "-",
  }));

  const planRows = Object.entries(planSummary).map(([plan, count]) => ({
    "Food Plan": plan,
    Count: count,
  }));

  const typeRows = Object.entries(typeSummary).map(([type, count]) => ({
    "KOT Type": type,
    Count: count,
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);

  ws["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // KOT No
    { wch: 24 }, // Item Name
    { wch: 8 },  // Qty
    { wch: 14 }, // KOT Type
    { wch: 10 }, // Room No
    { wch: 14 }, // Food Plan
    { wch: 12 }, // Status
    { wch: 24 }, // Remarks
  ];

  const mainTableRows = exportData.length + 1; // +1 for header row
  const summaryStartRow = mainTableRows + 3;

  // PLAN SUMMARY title
  XLSX.utils.sheet_add_aoa(ws, [["PLAN SUMMARY"]], {
    origin: `A${summaryStartRow}`,
  });

  // PLAN SUMMARY table
  XLSX.utils.sheet_add_json(ws, planRows, {
    origin: `A${summaryStartRow + 1}`,
    skipHeader: false,
  });

  // KOT TYPE SUMMARY title
  XLSX.utils.sheet_add_aoa(ws, [["KOT TYPE SUMMARY"]], {
    origin: `E${summaryStartRow}`,
  });

  // KOT TYPE SUMMARY table
  XLSX.utils.sheet_add_json(ws, typeRows, {
    origin: `E${summaryStartRow + 1}`,
    skipHeader: false,
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "KOT Register");
  XLSX.writeFile(wb, "KOT-Register.xlsx");
};


  const handlePrint = () => {
    if (!rows.length) return;

    const tableRows = rows
      .map(
        (row) => `
        <tr>
          <td>${row.date || "-"}</td>
          <td>${row.kotNo || "-"}</td>
          <td>${row.itemName || "-"}</td>
          <td style="text-align:center">${row.qty ?? 0}</td>
          <td>${row.kotType || "-"}</td>
          <td>${row.roomNo || "-"}</td>
          <td>${row.foodPlan || "-"}</td>
          <td><span class="badge ${printStatusClass(row.status)}">${
          row.status || "-"
        }</span></td>
          <td>${row.remarks || "-"}</td>
        </tr>`
      )
      .join("");

    const planRows =
      Object.entries(planSummary)
        .map(
          ([k, v]) =>
            `<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`
        )
        .join("") || `<tr><td colspan="2">No data</td></tr>`;

    const typeRows =
      Object.entries(typeSummary)
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
  <title>KOT Register</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; padding: 20px; font-size: 12px; color: #1e293b; }
    .header {
      background: #0b1d34;
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
      background: #0b1d34;
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
    .status-completed { background: #dcfce7; color: #15803d; }
    .status-cancelled { background: #fee2e2; color: #b91c1c; }
    .status-pending   { background: #fef3c7; color: #b45309; }
    .status-default   { background: #f1f5f9; color: #475569; }
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
      border-bottom: 2px solid #0b1d34;
    }
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
    }
  </style>
</head>
<body>
  <div class="header">KOT REGISTER</div>
  <div class="meta">
    <span><strong>From:</strong> ${filters.from || "All"}</span>
    <span><strong>To:</strong> ${filters.to || "All"}</span>
    <span><strong>Status:</strong> ${filters.status || "All"}</span>
    <span><strong>Total Records:</strong> ${rows.length}</span>
    <span><strong>Printed:</strong> ${new Date().toLocaleString()}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>DATE</th>
        <th>KOT NO</th>
        <th>ITEM NAME</th>
        <th>QTY</th>
        <th>KOT TYPE</th>
        <th>ROOM NO</th>
        <th>FOOD PLAN</th>
        <th>STATUS</th>
        <th>REMARKS</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="summaries">
    <div>
      <div class="summary-label">PLAN SUMMARY</div>
      <table><tbody>${planRows}</tbody></table>
    </div>
    <div>
      <div class="summary-label">KOT TYPE SUMMARY</div>
      <table><tbody>${typeRows}</tbody></table>
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
            KOT REGISTER
          </div>

          <div className="border-b border-slate-300 bg-white p-4">
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-6">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  From
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleChangeFilter("from", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  To
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleChangeFilter("to", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleChangeFilter("status", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-emerald-500"
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 xl:col-span-3 xl:self-end xl:pt-0">
                <button
                  onClick={handleFilterSubmit}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  View
                </button>

                <button
                  onClick={handleReset}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Reset
                </button>

                <button
                  onClick={handleExportExcel}
                  disabled={!rows.length}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Export Excel
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!rows.length}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Print
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-[#0b1d34] text-white">
                <tr>
                  {[
                    "DATE",
                    "KOT NO",
                    "ITEM NAME",
                    "QTY",
                    "KOT TYPE",
                    "ROOM NO",
                    "FOOD PLAN",
                    "STATUS",
                    "REMARKS",
                    "EDIT / PRINT",
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
                      colSpan={10}
                      className="border border-slate-300 px-4 py-6 text-center"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="border border-slate-300 px-4 py-6 text-center text-slate-500"
                    >
                      No KOT register data found
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr
                      key={`${row.kotNo}-${row.batchNo}-${row.itemId}-${index}`}
                      className="hover:bg-slate-50"
                    >
                      <td className="border border-slate-300 px-3 py-2">
                        {row.date || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.kotNo || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.itemName || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-center">
                        {row.qty ?? 0}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.kotType || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.roomNo || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.foodPlan || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        <span
                          className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            row.status
                          )}`}
                        >
                          {row.status || "-"}
                        </span>
                      </td>
                      <td className="border border-slate-300 px-3 py-2">
                        {row.remarks || "-"}
                      </td>
                      <td className="border border-slate-300 px-3 py-2"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
                  KOT TYPE SUMMARY
                </div>
                <table className="w-full">
                  <tbody>
                    {Object.keys(typeSummary).length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="border border-slate-300 px-3 py-2 text-slate-500"
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      Object.entries(typeSummary).map(([type, count]) => (
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