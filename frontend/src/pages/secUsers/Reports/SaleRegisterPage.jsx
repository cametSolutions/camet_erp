// pages/SalesRegister.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
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

   const cmp_id = useSelector(
       (state) => state.secSelectedOrganization.secSelectedOrg._id
     );
  const getToday = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const [filters, setFilters] = useState({
    from: getToday(),
    to: getToday(),
    status: "",
    search: "",
  });

  const handleChangeFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const fetchRegister = async (customFilters = filters) => {
    try {
      setLoading(true);

        if (!cmp_id) {
        console.error("cmp_id is undefined, cannot fetch sales register");
        setRows([]);
        return;
      }

      const cleanedParams = Object.fromEntries(
        Object.entries({
          cmp_id,         // <-- include company id
          ...customFilters,
        }).filter(([_, v]) => v !== "")
      );

      const { data } = await api.get("/api/sUsers/sales-register", {
        params: cleanedParams,
      });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterSubmit = () => fetchRegister(filters);

  const handleReset = () => {
    const resetFilters = {
      from: getToday(),
      to: getToday(),
      status: "",
      search: "",
    };
    setFilters(resetFilters);
    fetchRegister(resetFilters);
  };

  // ---- SUMMARIES ----

  const topItems = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      (row?.itemName || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((name) => {
          map[name] = (map[name] || 0) + 1;
        });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [rows]);

  const planSummary = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const key =
          typeof row?.foodPlan === "string" && row?.foodPlan.trim()
            ? row?.foodPlan.trim()
            : "-";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  const paymentSummary = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const key = row?.paymentType?.trim() || "-";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  const billTypeSummary = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const key = row?.billType?.trim() || "-";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
    [rows]
  );

  const cancelledCount = useMemo(
    () => rows.filter((r) => r?.isCancelled === "CANCELLED").length,
    [rows]
  );

  const totalQty = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r?.qty || 0), 0),
    [rows]
  );

  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r?.amount || 0), 0),
    [rows]
  );

  const totalTax = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r?.taxAmount || 0), 0),
    [rows]
  );

  const totalDisc = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r?.discAmount || 0), 0),
    [rows]
  );

  const totalBill = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r?.billAmount || 0), 0),
    [rows]
  );




  // convert each bill (row) with itemDetails[] into multiple lines
const getFlattenedRows = () => {
  const flattened = [];

  rows.forEach((row) => {
    const items = row?.itemDetails && Array.isArray(row?.itemDetails)
      ? row?.itemDetails
      : [];

    // if no itemDetails, keep single line as now
    if (!items.length) {
      flattened.push(row);
      return;
    }

    items.forEach((item, idx) => {
      flattened.push({
        // bill-level fields (repeat)
        date: row.date,
        billNo: row.billNo,
        customer: row.customer,
        billType: row.billType,
        roomNo: row.roomNo,
        foodPlan: row.foodPlan,
        paymentType: row.paymentType,
        isCancelled: row.isCancelled,
        sponsorName: row.sponsorName,
        remarks: row.remarks,
        saleId: row.saleId,

        // item-level fields (change per line)
        itemName: item.name || "-",
        qty: item.qty ?? 0,
        rate: item.rate ?? 0,
        amount: item.amount ?? 0,
        taxAmount: item.taxAmount ?? 0,
        discAmount: idx === 0 ? row.discAmount ?? 0 : 0,
        billAmount: idx === 0 ? row.billAmount ?? 0 : 0,
      });
    });
  });

  return flattened;
};
  // ---- EXPORT ----

  const flatRows = getFlattenedRows();

  const handleExportExcel = () => {
  const flatRows = getFlattenedRows();
  if (!flatRows.length) return;

  const exportData = flatRows.map((row) => ({
    Date: row.date || "-",
    "Bill No": row.billNo || "-",
    Customer: row.customer || "-",
    "Item Details": row.itemName || "-",
    Qty: row.qty ?? 0,
    Rate: row.rate ?? 0,
    Amount: row.amount ?? 0,
    "Tax Amount": row.taxAmount ?? 0,
    "Disc Amount": row.discAmount ?? 0,
    "Bill Amount": row.billAmount ?? 0,
    "Bill Type": row.billType || "-",
    "Room No": row.roomNo || "-",
    "Food Plan": row.foodPlan || "-",
    "Payment Type": row.paymentType || "-",
    "Is Cancelled": row.isCancelled || "-",
    Sponsor: row.sponsorName || "-",
    Remarks: row.remarks || "-",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  ws["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Bill No
    { wch: 20 }, // Customer
    { wch: 35 }, // Item Details
    { wch: 6 },  // Qty
    { wch: 10 }, // Rate
    { wch: 12 }, // Amount
    { wch: 12 }, // Tax
    { wch: 12 }, // Disc
    { wch: 14 }, // Bill
    { wch: 12 }, // Bill type
    { wch: 10 }, // Room
    { wch: 10 }, // Plan
    { wch: 14 }, // Payment
    { wch: 12 }, // IsCancelled
    { wch: 16 }, // Sponsor
    { wch: 24 }, // Remarks
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Sales Register");
  XLSX.writeFile(wb, "Sales-Register.xlsx");
};

  // ---- PRINT ----

  const handlePrint = () => {
  const flatRows = getFlattenedRows();
  if (!flatRows.length) return;

  const tableRows = flatRows
    .map(
      (row) => `
      <tr>
        <td>${row.date || "-"}</td>
        <td>${row.billNo || "-"}</td>
        <td>${row.customer || "-"}</td>
        <td>${row.itemName || "-"}</td>
        <td style="text-align:center">${row.qty ?? 0}</td>
        <td>${row.rate ?? 0}</td>
        <td style="text-align:right">${fmt(row.amount)}</td>
        <td style="text-align:right">${fmt(row.taxAmount)}</td>
        <td style="text-align:right">${fmt(row.discAmount)}</td>
        <td style="text-align:right">${fmt(row.billAmount)}</td>
        <td>${row.billType || "-"}</td>
        <td>${row.roomNo || "-"}</td>
        <td>${row.foodPlan || "-"}</td>
        <td><span class="badge ${printPaymentClass(
          row.paymentType
        )}">${row.paymentType || "-"}</span></td>
        <td>${row.isCancelled || "-"}</td>
        <td>${row.sponsorName || "-"}</td>
        <td>${row.remarks || "-"}</td>
      </tr>`
    )
    .join("");

    const billTypeRowsHtml =
      Object.entries(billTypeSummary)
        .map(
          ([k, v]) =>
            `<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`
        )
        .join("") || `<tr><td colspan="2">No data</td></tr>`;

    const topRowsHtml =
      topItems
        .map(
          ([item, qty]) =>
            `<tr><td>${item}</td><td style="text-align:right">${qty}</td></tr>`
        )
        .join("") || `<tr><td colspan="2">No data</td></tr>`;

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

    const salesSummaryHtml = `
      <tr><td>Amount</td><td style="text-align:right">${fmt(
        totalAmount
      )}</td></tr>
      <tr><td>Discount Amount</td><td style="text-align:right">${fmt(
        totalDisc
      )}</td></tr>
      <tr><td>Tax Amount</td><td style="text-align:right">${fmt(
        totalTax
      )}</td></tr>
      <tr><td>Total Sales Amount</td><td style="text-align:right">${fmt(
        totalBill
      )}</td></tr>
      <tr><td>Cancelled Bills</td><td style="text-align:right">${cancelledCount}</td></tr>
    `;

    const win = window.open("", "", "height=900,width=1400");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Sales Register</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;padding:18px;font-size:12px;color:#111827}
    h2{text-align:center;margin-bottom:12px}
    table{width:100%;border-collapse:collapse;margin-bottom:18px}
    th,td{border:1px solid #9ca3af;padding:6px}
    th{background:#e7b6b6;text-align:left}
    .badge{display:inline-block;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:700}
    .pay-cashupi{background:#e0e7ff;color:#4338ca}
    .pay-cash{background:#e0f2fe;color:#0369a1}
    .pay-upi{background:#f3e8ff;color:#7c3aed}
    .pay-credit{background:#ffe4e6;color:#be123c}
    .pay-complementory{background:#f3e8ff;color:#7e22ce}
    .pay-sponsor{background:#fef3c7;color:#b45309}
    .pay-default{background:#f1f5f9;color:#475569}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    .box-title{background:#e7b6b6;border:1px solid #9ca3af;border-bottom:none;padding:6px;font-weight:700}
    @media print{@page{size:A4 landscape;margin:8mm}body{padding:0}}
  </style>
</head>
<body>
  <h2>RESTAURANT SALES REGISTER</h2>
  <table>
    <thead>
      <tr>
        <th>DATE</th>
        <th>BILL NO</th>
        <th>CUSTOMER</th>
        <th>ITEM NAME</th>
        <th>QTY</th>
        <th>RATE</th>
        <th>AMOUNT</th>
        <th>TAX AMT</th>
        <th>DIS. AMT</th>
        <th>BILL AMOUNT</th>
        <th>BILL TYPE</th>
        <th>ROOM NO</th>
        <th>FOOD PLAN</th>
        <th>PAYMENT TYPE</th>
        <th>ISCANCELLED</th>
        <th>SPONSOR NAME</th>
        <th>REMARKS</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr>
        <td colspan="4" style="font-weight:700">TOTAL</td>
        <td style="text-align:right;font-weight:700">${totalQty}</td>
        <td></td>
        <td style="text-align:right;font-weight:700">${fmt(totalAmount)}</td>
        <td style="text-align:right;font-weight:700">${fmt(totalTax)}</td>
        <td style="text-align:right;font-weight:700">${fmt(totalDisc)}</td>
        <td style="text-align:right;font-weight:700">${fmt(totalBill)}</td>
        <td colspan="7"></td>
      </tr>
    </tbody>
  </table>

  <div class="grid">
    <div>
      <div class="box-title">FIVE TOP SALE ITEM QTY</div>
      <table><tbody>${topRowsHtml}</tbody></table>
    </div>
    <div>
      <div class="box-title">SALES SUMMARY</div>
      <table><tbody>${salesSummaryHtml}</tbody></table>
    </div>
    <div>
      <div class="box-title">BILL TYPE SUMMARY</div>
      <table><tbody>${billTypeRowsHtml}</tbody></table>
    </div>
    <div>
      <div class="box-title">PLAN SUMMARY</div>
      <table><tbody>${planRowsHtml}</tbody></table>
    </div>
    <div>
      <div class="box-title">PAYMENT TYPE SUMMARY</div>
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
    }, 500);
  };

  // ---- RENDER ----

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
                  onChange={(e) => handleChangeFilter("from", e.target.value)}
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
                  onChange={(e) => handleChangeFilter("to", e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Payment Type
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    handleChangeFilter("status", e.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-red-500"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Bill no / customer / item"
                  value={filters.search}
                  onChange={(e) =>
                    handleChangeFilter("search", e.target.value)
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
                  onClick={handleReset}
                  className="rounded-md bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
                >
                  Reset
                </button>

                <button
                  onClick={handleExportExcel}
                  disabled={!rows.length}
                  className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-40"
                >
                  Export Excel
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!rows.length}
                  className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                >
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-[1450px] border-collapse text-sm">
    <thead className="sticky top-0 z-10 bg-[#0b1d34] text-white">
  <tr>
    {[
      "DATE",
      "BILL NO",
      "CUSTOMER",
      "ITEM NAME",
      "QTY",
      "RATE",
      "AMOUNT",
      "TAX AMT",
      "DIS. AMT",
      "BILL AMOUNT",
      "BILL TYPE",
      "ROOM NO",
      "Food Plan",
      "PAYMENT TYPE",
      "ISCANCELLED",
      "SPONSOR NAME",
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
    rows.map((row, index) => {
      const items =
        Array.isArray(row.itemDetails) && row.itemDetails.length
          ? row.itemDetails
          : [
              {
                name: row.itemName || "-",
                qty: row.qty ?? 0,
                rate: row.rate ?? 0,
                amount: row.amount ?? 0,
                taxAmount: row.taxAmount ?? 0,
              },
            ];

      return items.map((item, itemIndex) => (
        <tr
          key={`${row.billNo}-${row.saleId || index}-${itemIndex}`}
          className="hover:bg-slate-50"
        >
          {/* DATE, BILL NO, CUSTOMER – one time per bill */}
          {itemIndex === 0 && (
            <>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.date || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.billNo || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.customer || "-"}
              </td>
            </>
          )}

          {/* ITEM columns – per item */}
          <td className="border border-slate-300 px-3 py-2">
            {item.name || "-"}
          </td>
          <td className="border border-slate-300 px-3 py-2 text-center">
            {item.qty ?? 0}
          </td>
          <td className="border border-slate-300 px-3 py-2 text-right">
            {item.rate ?? 0}
          </td>
          <td className="border border-slate-300 px-3 py-2 text-right">
            {fmt(item.amount)}
          </td>

          {/* TAX / DISC / BILL / BILL TYPE / ROOM / PLAN / PAYMENT / SPONSOR / REMARKS – one time per bill */}
          {itemIndex === 0 && (
            <>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 text-right align-top"
              >
                {fmt(row.taxAmount)}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 text-right align-top"
              >
                {fmt(row.discAmount)}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 text-right font-semibold align-top"
              >
                {fmt(row.billAmount)}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.billType || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.roomNo || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.foodPlan || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.paymentType || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.sponsorName || "-"}
              </td>
              <td
                rowSpan={items.length}
                className="border border-slate-300 px-3 py-2 align-top"
              >
                {row.remarks || "-"}
              </td>
            </>
          )}
        </tr>
      ));
    })
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
                      {fmt(totalAmount)}
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
                    <td colSpan={7} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* SUMMARY SECTION */}
          <div className="grid gap-6 p-4 md:grid-cols-2 lg:grid-cols-4">
            {/* TOP 5 ITEMS */}
            <div className="max-w-sm">
              <div className="border border-slate-500">
                <div className="px-3 py-2 text-lg font-bold">
                  FIVE TOP SALE ITEM QTY
                </div>
                <table className="w-full">
                  <tbody>
                    {topItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="border border-slate-300 px-3 py-2 text-slate-500"
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      topItems.map(([item, qty]) => (
                        <tr key={item}>
                          <td className="border border-slate-300 px-3 py-2">
                            {item}
                          </td>
                          <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                            {qty}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SALES SUMMARY */}
            <div className="max-w-sm">
              <div className="border border-slate-500">
                <div className="px-3 py-2 text-lg font-bold">
                  SALES SUMMARY
                </div>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">
                        Amount
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                        {fmt(totalAmount)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">
                        Discount Amount
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                        {fmt(totalDisc)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">
                        Tax Amount
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                        {fmt(totalTax)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">
                        Total Sales Amount
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                        {fmt(totalBill)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-2">
                        Cancelled Bills
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-medium">
                        {cancelledCount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* BILL TYPE SUMMARY */}
            <div className="max-w-sm">
              <div className="border border-slate-500">
                <div className="px-3 py-2 text-lg font-bold">
                  BILL TYPE SUMMARY
                </div>
                <table className="w-full">
                  <tbody>
                    {Object.keys(billTypeSummary).length === 0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          className="border border-slate-300 px-3 py-2 text-slate-500"
                        >
                          No data
                        </td>
                      </tr>
                    ) : (
                      Object.entries(billTypeSummary).map(([type, count]) => (
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

            {/* PLAN SUMMARY */}
            <div className="max-w-sm">
              <div className="border border-slate-500">
                <div className="px-3 py-2 text-lg font-bold">
                  PLAN SUMMARY
                </div>
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

            {/* PAYMENT TYPE SUMMARY */}
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
          {/* END SUMMARY */}
        </div>
      </div>
    </div>
  );
}