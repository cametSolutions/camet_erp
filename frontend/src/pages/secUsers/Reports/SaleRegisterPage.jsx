// pages/SalesRegister.jsx
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "@/api/api";
import * as XLSX from "xlsx";
import TitleDiv from "@/components/common/TitleDiv";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  RotateCcw,
  Search,
  TrendingUp,
  Receipt,
  Tag,
  CreditCard,
  LayoutGrid,
  X,
} from "lucide-react";

const STATUS_OPTIONS = [
  { label: "All Types", value: "" },
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

const PAYMENT_STYLES = {
  "CASH/UPI": { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  CASH: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  UPI: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  CREDIT: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  COMPLEMENTORY: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  SPONSOR: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const PaymentBadge = ({ type }) => {
  const s = PAYMENT_STYLES[String(type || "").toUpperCase()] || {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {type || "-"}
    </span>
  );
};

const printPaymentClass = (type = "") => {
  const v = String(type || "").toUpperCase();
  if (v === "CASH/UPI") return "pay-cashupi";
  if (v === "CASH") return "pay-cash";
  if (v === "UPI") return "pay-upi";
  if (v === "CREDIT") return "pay-credit";
  if (v === "COMPLEMENTORY") return "pay-complementory";
  if (v === "SPONSOR") return "pay-sponsor";
  return "pay-default";
};

const SummaryCard = ({ icon: Icon, title, children, accent = "slate" }) => {
  const accents = {
    slate: "border-slate-200 bg-white",
    blue: "border-blue-100 bg-blue-50/40",
    green: "border-emerald-100 bg-emerald-50/40",
    amber: "border-amber-100 bg-amber-50/40",
    purple: "border-violet-100 bg-violet-50/40",
  };
  return (
    <div className={`rounded-lg border ${accents[accent]} overflow-hidden`}>
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <Icon size={13} className="text-slate-500" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{title}</span>
      </div>
      <table className="w-full text-xs">{children}</table>
    </div>
  );
};

export default function SaleRegisterPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCancelled,setShowCancelled ] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const navigate = useNavigate();

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

  const toggleRow = (key) =>
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleEdit = (e, row) => {
    e.stopPropagation();
    navigate(`/sUsers/editSale/${row.saleId}`, { state: { saleData: row } });
  };

  const fetchRegister = async (customFilters = filters) => {
    try {
      setLoading(true);
      if (!cmp_id) { setRows([]); return; }
      const cleanedParams = Object.fromEntries(
        Object.entries({ cmp_id,includeCancelled:showCancelled, ...customFilters }).filter(([_, v]) => v !== "")
      );
      const { data } = await api.get("/api/sUsers/sales-register", { params: cleanedParams });
      setRows(data?.data || []);
      setExpandedRows({});
    } catch (error) {
      console.error("Failed to fetch Sales register", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegister(); }, [showCancelled]);

  const handleReset = () => {
    const r = { from: getToday(), to: getToday(), status: "", search: "" };
    setFilters(r);
    fetchRegister(r);
  };

  const normalizeFoodPlan = (v) =>
    typeof v === "string" && v.trim() ? v.trim() : "DIRECT";

  const getItemsFromRow = (row) => {
    if (Array.isArray(row?.itemDetails) && row.itemDetails.length) {
      return row.itemDetails.map((item) => ({
        name: item?.name || "-",
        qty: Number(item?.qty || 0),
        rate: Number(item?.rate || 0),
        amount: Number(item?.amount || 0),
        taxAmount: Number(item?.taxAmount || 0),
      }));
    }
    return [{
      name: row?.itemName || "-",
      qty: Number(row?.qty || 0),
      rate: Number(row?.rate || 0),
      amount: Number(row?.amount || 0),
      taxAmount: Number(row?.taxAmount || 0),
    }];
  };

  const topItems = useMemo(() => {
    const map = {};
    rows.forEach((row) => {
      getItemsFromRow(row).forEach((item) => {
        const name = String(item?.name || "").trim();
        if (!name) return;
        map[name] = (map[name] || 0) + Number(item?.qty || 0);
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [rows]);

  const planSummary = useMemo(
    () => rows.reduce((acc, row) => {
      const k = normalizeFoodPlan(row?.foodPlan);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}), [rows]
  );

  const paymentSummary = useMemo(
    () => rows.reduce((acc, row) => {
      const k = row?.paymentType?.trim() || "-";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}), [rows]
  );

  const billTypeSummary = useMemo(
    () => rows.reduce((acc, row) => {
      const k = row?.billType?.trim() || "-";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}), [rows]
  );

  const cancelledCount = useMemo(
    () => rows.filter((r) => r?.isCancelled === "CANCELLED").length, [rows]
  );


  const cancelledAmount = useMemo(
  () =>
    rows.reduce(
      (s, r) =>
        r?.isCancelled === "CANCELLED"
          ? s + Number(r?.billAmount || 0)
          : s,
      0
    ),
  [rows]
);
  console.log("cancelledCount", cancelledAmount,cancelledCount);
  const totalQty = useMemo(
    () => rows.reduce((sum, row) =>
      sum + getItemsFromRow(row).reduce((s, i) => s + Number(i?.qty || 0), 0), 0), [rows]
  );

  const totalAmount = useMemo(() => rows.reduce((s, r) => s + Number(r?.amount || 0), 0), [rows]);
  const totalTax = useMemo(() => rows.reduce((s, r) => s + Number(r?.taxAmount || 0), 0), [rows]);
  const totalDisc = useMemo(() => rows.reduce((s, r) => s + Number(r?.discAmount || 0), 0), [rows]);
  const totalBill = useMemo(() => rows.reduce((s, r) => s + Number(r?.billAmount || 0), 0), [rows]);

  const getFlattenedRows = () => {
    const out = [];
    rows.forEach((row) => {
      getItemsFromRow(row).forEach((item, idx) => {
        out.push({
          date: row.date, billNo: row.billNo, customer: row.customer,
          billType: row.billType, roomNo: row.roomNo,
          foodPlan: normalizeFoodPlan(row.foodPlan),
          paymentType: row.paymentType, isCancelled: row.isCancelled,
          sponsorName: row.sponsorName, remarks: row.remarks, saleId: row.saleId,
          itemName: item.name || "-", qty: item.qty ?? 0,
          rate: item.rate ?? 0, amount: item.amount ?? 0, taxAmount: item.taxAmount ?? 0,
          discAmount: idx === 0 ? row.discAmount ?? 0 : 0,
          billAmount: idx === 0 ? row.billAmount ?? 0 : 0,
        });
      });
    });
    return out;
  };

  const handleExportExcel = () => {
    const flatRows = getFlattenedRows();
    if (!flatRows.length) return;
    const exportData = flatRows.map((row) => ({
      Date: row.date || "-", "Bill No": row.billNo || "-", Customer: row.customer || "-",
      "Item Details": row.itemName || "-", Qty: row.qty ?? 0, Rate: row.rate ?? 0,
      Amount: row.amount ?? 0, "Tax Amount": row.taxAmount ?? 0,
      "Disc Amount": row.discAmount ?? 0, "Bill Amount": row.billAmount ?? 0,
      "Bill Type": row.billType || "-", "Room No": row.roomNo || "-",
      "Food Plan": row.foodPlan || "DIRECT", "Payment Type": row.paymentType || "-",
      "Is Cancelled": row.isCancelled || "-", Sponsor: row.sponsorName || "-",
      Remarks: row.remarks || "-",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [12,10,20,35,6,10,12,12,12,14,12,10,12,14,12,16,24].map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, "Sales Register");
    XLSX.writeFile(wb, "Sales-Register.xlsx");
  };

  const handlePrint = () => {
    const flatRows = getFlattenedRows();
    if (!flatRows.length) return;
    const tableRows = flatRows.map((row) => `
      <tr>
        <td>${row.date||"-"}</td><td>${row.billNo||"-"}</td><td>${row.customer||"-"}</td>
        <td>${row.itemName||"-"}</td><td style="text-align:center">${row.qty??0}</td>
        <td style="text-align:right">${Number(row.rate??0).toFixed(2)}</td>
        <td style="text-align:right">${fmt(row.amount)}</td>
        <td style="text-align:right">${fmt(row.taxAmount)}</td>
        <td style="text-align:right">${fmt(row.discAmount)}</td>
        <td style="text-align:right">${fmt(row.billAmount)}</td>
        <td>${row.billType||"-"}</td><td>${row.roomNo||"-"}</td>
        <td>${row.foodPlan||"DIRECT"}</td>
        <td><span class="badge ${printPaymentClass(row.paymentType)}">${row.paymentType||"-"}</span></td>
        <td>${row.isCancelled||"-"}</td><td>${row.sponsorName||"-"}</td><td>${row.remarks||"-"}</td>
      </tr>`).join("");

    const win = window.open("", "", "height=900,width=1400");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Sales Register</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:18px;font-size:11px;color:#111827}
h2{text-align:center;margin-bottom:12px}table{width:100%;border-collapse:collapse;margin-bottom:18px}
th,td{border:1px solid #9ca3af;padding:4px 6px}th{background:#0b1d34;color:#fff;text-align:left}
.badge{display:inline-block;padding:1px 5px;border-radius:4px;font-size:9px;font-weight:700}
.pay-cashupi{background:#e0e7ff;color:#4338ca}.pay-cash{background:#e0f2fe;color:#0369a1}
.pay-upi{background:#f3e8ff;color:#7c3aed}.pay-credit{background:#ffe4e6;color:#be123c}
.pay-complementory{background:#f3e8ff;color:#7e22ce}.pay-sponsor{background:#fef3c7;color:#b45309}
.pay-default{background:#f1f5f9;color:#475569}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.box-title{background:#0b1d34;color:#fff;padding:5px 8px;font-weight:700;font-size:11px}
@media print{@page{size:A4 landscape;margin:8mm}body{padding:0}}</style></head><body>
<h2>RESTAURANT SALES REGISTER</h2>
<table><thead><tr>
<th>DATE</th><th>BILL NO</th><th>CUSTOMER</th><th>ITEM NAME</th><th>QTY</th><th>RATE</th>
<th>AMOUNT</th><th>TAX AMT</th><th>DIS. AMT</th><th>BILL AMOUNT</th><th>BILL TYPE</th>
<th>ROOM NO</th><th>FOOD PLAN</th><th>PAYMENT TYPE</th><th>CANCELLED</th><th>SPONSOR</th><th>REMARKS</th>
</tr></thead><tbody>${tableRows}
<tr><td colspan="4" style="font-weight:700">TOTAL</td>
<td style="text-align:right;font-weight:700">${totalQty}</td><td></td>
<td style="text-align:right;font-weight:700">${fmt(totalAmount)}</td>
<td style="text-align:right;font-weight:700">${fmt(totalTax)}</td>
<td style="text-align:right;font-weight:700">${fmt(totalDisc)}</td>
<td style="text-align:right;font-weight:700">${fmt(totalBill)}</td>
<td colspan="7"></td></tr></tbody></table>
<div class="grid">
<div><div class="box-title">TOP 5 SALE ITEMS</div><table><tbody>${
  topItems.map(([k,v])=>`<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`).join("")||`<tr><td colspan="2">No data</td></tr>`
}</tbody></table></div>
<div><div class="box-title">SALES SUMMARY</div><table><tbody>
<tr><td>Amount</td><td style="text-align:right">${fmt(totalAmount)}</td></tr>
<tr><td>Discount</td><td style="text-align:right">${fmt(totalDisc)}</td></tr>
<tr><td>Tax</td><td style="text-align:right">${fmt(totalTax)}</td></tr>
<tr><td>Total</td><td style="text-align:right">${fmt(totalBill)}</td></tr>
<tr><td>Cancelled</td><td style="text-align:right">${cancelledCount}</td></tr>
</tbody></table></div>
<div><div class="box-title">BILL TYPE SUMMARY</div><table><tbody>${
  Object.entries(billTypeSummary).map(([k,v])=>`<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`).join("")||`<tr><td colspan="2">No data</td></tr>`
}</tbody></table></div>
<div><div class="box-title">PLAN SUMMARY</div><table><tbody>${
  Object.entries(planSummary).map(([k,v])=>`<tr><td>${k||"DIRECT"}</td><td style="text-align:right">${v}</td></tr>`).join("")||`<tr><td colspan="2">No data</td></tr>`
}</tbody></table></div>
<div><div class="box-title">PAYMENT SUMMARY</div><table><tbody>${
  Object.entries(paymentSummary).map(([k,v])=>`<tr><td>${k}</td><td style="text-align:right">${v}</td></tr>`).join("")||`<tr><td colspan="2">No data</td></tr>`
}</tbody></table></div>
</div></body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const TABLE_HEADS = [
    "DATE", "BILL NO", "CUSTOMER", "ITEM NAME", "QTY", "RATE",
    "AMOUNT", "TAX", "DISC", "BILL AMT", "BILL TYPE",
    "ROOM", "PLAN", "PAYMENT", "STATUS", "SPONSOR", "REMARKS", "EDIT",
  ];

  return (
    <>
      <TitleDiv title="SALE REGISTER" />

      <div className="min-h-screen bg-[#f0f2f7] p-3 md:p-5">
        <div className="mx-auto max-w-[1600px] space-y-3">

          {/* ── FILTER BAR ── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#0b1d34] px-4 py-2.5">
              <span className="text-sm font-bold tracking-widest text-white uppercase">Sales Register</span>
              <div className="flex items-center gap-2">
                {rows.length > 0 && (
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {rows.length} bills
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-2.5 p-3">
              {/* From */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">From</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleChangeFilter("from", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0b1d34] focus:bg-white transition"
                />
              </div>

              {/* To */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">To</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleChangeFilter("to", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0b1d34] focus:bg-white transition"
                />
              </div>

              {/* Payment Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Payment</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleChangeFilter("status", e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0b1d34] focus:bg-white transition"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              {/* <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Search</label>
                <div className="relative">
                  <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Bill no / customer / item"
                    value={filters.search}
                    onChange={(e) => handleChangeFilter("search", e.target.value)}
                    className="w-52 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-2.5 text-xs text-slate-800 outline-none focus:border-[#0b1d34] focus:bg-white transition"
                  />
                  {filters.search && (
                    <button onClick={() => handleChangeFilter("search", "")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div> */}

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-4">
                <button
                  onClick={() => fetchRegister(filters)}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0b1d34] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#162d50] transition"
                >
                  <Search size={11} /> View
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  <RotateCcw size={11} /> Reset
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={!rows.length}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 transition"
                >
                  <Download size={11} /> Excel
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!rows.length}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40 transition"
                >
                  <Printer size={11} /> Print
                </button>



              <div className="flex items-center rounded-lg border border-slate-300 overflow-hidden w-fit">
  <button
    onClick={() => setShowCancelled(false)}
    className={`px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 ${
      !showCancelled
        ? "bg-emerald-600 text-white"
        : "bg-white text-slate-700 hover:bg-slate-100"
    }`}
  >
    Active
  </button>

  <button
    onClick={() => setShowCancelled(true)}
    disabled={!rows.length}
    className={`px-4 py-2 text-xs font-semibold transition flex items-center gap-1.5 border-l border-slate-300 ${
      showCancelled
        ? "bg-red-600 text-white"
        : "bg-white text-slate-700 hover:bg-slate-100"
    } disabled:opacity-40`}
  >
    Cancelled
  </button>
</div>
              </div>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1400px] border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#0b1d34] text-white">
                    {TABLE_HEADS.map((h) => (
                      <th
                        key={h}
                        className="border-b border-slate-600 px-2.5 py-2 text-left text-[10px] font-semibold tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={18} className="px-4 py-10 text-center">
                        <div className="inline-flex flex-col items-center gap-2 text-slate-400">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[#0b1d34]" />
                          <span className="text-xs">Loading records…</span>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={18} className="px-4 py-12 text-center text-xs text-slate-400">
                        No sales data found for the selected filters
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => {
                      const rowKey = row.saleId || row.billNo || index;
                      const isExpanded = !!expandedRows[rowKey];
                      const items = getItemsFromRow(row);
                      const firstItem = items[0]?.name || row.itemName || "-";
                      const extraCount = Math.max(items.length - 1, 0);
                      const rowQty = items.reduce((s, i) => s + Number(i.qty || 0), 0);
                      const isCancelled = row.isCancelled === "CANCELLED";

                      return (
                        <Fragment key={rowKey}>
                          <tr
                            className={`group cursor-pointer transition-colors hover:bg-blue-50/40 ${isCancelled ? "bg-red-50/30" : ""}`}
                            onClick={() => toggleRow(rowKey)}
                          >
                            <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-500">{row.date || "-"}</td>
                            <td className="px-2.5 py-1.5 whitespace-nowrap font-semibold text-[#0b1d34]">{row.billNo || "-"}</td>
                            <td className="px-2.5 py-1.5 max-w-[110px] truncate text-slate-700">{row.customer || "-"}</td>

                            {/* Item cell */}
                            <td className="px-2.5 py-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="min-w-0">
                                  <div className="truncate max-w-[140px] font-medium text-slate-800">{firstItem}</div>
                                  {extraCount > 0 && (
                                    <div className="text-[10px] text-sky-600 font-medium">+{extraCount} more</div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); toggleRow(rowKey); }}
                                  className="ml-auto shrink-0 rounded border border-slate-200 p-0.5 text-slate-500 hover:bg-slate-100"
                                >
                                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                </button>
                              </div>
                            </td>

                            <td className="px-2.5 py-1.5 text-center font-semibold">{rowQty}</td>
                            <td className="px-2.5 py-1.5 text-right text-slate-400">—</td>
                            <td className="px-2.5 py-1.5 text-right">{fmt(row.amount)}</td>
                            <td className="px-2.5 py-1.5 text-right text-slate-500">{fmt(row.taxAmount)}</td>
                            <td className="px-2.5 py-1.5 text-right text-rose-600">{fmt(row.discAmount)}</td>
                            <td className="px-2.5 py-1.5 text-right font-bold text-[#0b1d34]">{fmt(row.billAmount)}</td>
                            <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-600">{row.billType || "-"}</td>
                            <td className="px-2.5 py-1.5 text-center">{row.roomNo || "-"}</td>
                            <td className="px-2.5 py-1.5 whitespace-nowrap text-slate-600">{normalizeFoodPlan(row.foodPlan)}</td>
                            <td className="px-2.5 py-1.5"><PaymentBadge type={row.paymentType} /></td>
                            <td className="px-2.5 py-1.5">
                              {isCancelled ? (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                  <X size={8} className="mr-0.5" /> CANCELLED
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-2.5 py-1.5 max-w-[90px] truncate text-slate-600">{row.sponsorName || "-"}</td>
                            <td className="px-2.5 py-1.5 max-w-[90px] truncate text-slate-500">{row.remarks || "-"}</td>
                            <td className="px-2.5 py-1.5 text-center">
                              <button
                                onClick={(e) => handleEdit(e, row)}
                                className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-amber-600 transition"
                              >
                                <Pencil size={9} /> Edit
                              </button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="bg-slate-50">
                              <td colSpan={18} className="px-6 py-3">
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                  <table className="min-w-full text-[11px]">
                                    <thead>
                                      <tr className="bg-slate-100 text-slate-600">
                                        {["#", "Item Name", "Qty", "Rate", "Amount", "Tax"].map((h) => (
                                          <th key={h} className="border-b border-slate-200 px-3 py-1.5 text-left font-semibold">{h}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                      {items.map((item, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30">
                                          <td className="px-3 py-1.5 text-slate-400">{i + 1}</td>
                                          <td className="px-3 py-1.5 font-medium text-slate-800">{item.name || "-"}</td>
                                          <td className="px-3 py-1.5 text-center">{item.qty ?? 0}</td>
                                          <td className="px-3 py-1.5 text-right">{Number(item.rate ?? 0).toFixed(2)}</td>
                                          <td className="px-3 py-1.5 text-right">{fmt(item.amount)}</td>
                                          <td className="px-3 py-1.5 text-right text-slate-500">{fmt(item.taxAmount)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>

                {rows.length > 0 && !loading && (
                  <tfoot>
                    <tr className="border-t-2 border-[#0b1d34] bg-[#0b1d34]/5">
                      <td colSpan={4} className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-widest text-[#0b1d34]">
                        Grand Total
                      </td>
                      <td className="px-2.5 py-2 text-center text-xs font-bold text-[#0b1d34]">{totalQty}</td>
                      <td />
                      <td className="px-2.5 py-2 text-right text-xs font-bold">{fmt(totalAmount)}</td>
                      <td className="px-2.5 py-2 text-right text-xs font-bold text-slate-500">{fmt(totalTax)}</td>
                      <td className="px-2.5 py-2 text-right text-xs font-bold text-rose-600">{fmt(totalDisc)}</td>
                      <td className="px-2.5 py-2 text-right text-xs font-bold text-[#0b1d34]">{fmt(totalBill)}</td>
                      {cancelledAmount > 0 && (
                        <>
                             <td className="px-2.5 py-2 text-right text-xs font-bold text-[#0b1d34]">Cancelled:{fmt(cancelledAmount)}</td>
                      <td className="px-2.5 py-2 text-right text-xs font-bold text-[#0b1d34]">Total {fmt(totalBill -cancelledAmount)}</td>
                        </>
                      )}
                 
                       
                      <td colSpan={8} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* ── SUMMARY CARDS ── */}
          {rows.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

              <SummaryCard icon={TrendingUp} title="Top 5 Sale Items" accent="blue">
                <tbody>
                  {topItems.length === 0 ? (
                    <tr><td colSpan={2} className="px-3 py-2 text-slate-400">No data</td></tr>
                  ) : topItems.map(([item, qty], i) => (
                    <tr key={item} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 text-slate-700">
                        <span className="mr-1.5 inline-block w-4 text-center text-[10px] font-bold text-slate-400">{i + 1}</span>
                        {item}
                      </td>
                      <td className="px-3 py-1.5 text-right font-semibold text-[#0b1d34]">{qty}</td>
                    </tr>
                  ))}
                </tbody>
              </SummaryCard>

              <SummaryCard icon={Receipt} title="Sales Summary" accent="green">
                <tbody>
                  {[
                    ["Amount", fmt(totalAmount)],
                    ["Discount", fmt(totalDisc), "text-rose-600"],
                    ["Tax", fmt(totalTax), "text-amber-600"],
                 
                    ["Cancelled Count", fmt(cancelledCount), "text-rose-600"],
                     ["Cancelled", fmt(cancelledAmount), "text-rose-600"],
                        ["Total Sales", fmt(totalBill -cancelledAmount), "font-bold text-[#0b1d34]"],
                  ].map(([label, val, cls]) => (
                    <tr key={label} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 text-slate-600">{label}</td>
                      <td className={`px-3 py-1.5 text-right ${cls || "text-slate-800"}`}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </SummaryCard>

              <SummaryCard icon={Tag} title="Bill Type Summary" accent="amber">
                <tbody>
                  {Object.keys(billTypeSummary).length === 0 ? (
                    <tr><td colSpan={2} className="px-3 py-2 text-slate-400">No data</td></tr>
                  ) : Object.entries(billTypeSummary).map(([k, v]) => (
                    <tr key={k} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 text-slate-700">{k}</td>
                      <td className="px-3 py-1.5 text-right font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </SummaryCard>

              <SummaryCard icon={LayoutGrid} title="Plan Summary" accent="purple">
                <tbody>
                  {Object.keys(planSummary).length === 0 ? (
                    <tr><td colSpan={2} className="px-3 py-2 text-slate-400">No data</td></tr>
                  ) : Object.entries(planSummary).map(([k, v]) => (
                    <tr key={k} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 text-slate-700">{k || "DIRECT"}</td>
                      <td className="px-3 py-1.5 text-right font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </SummaryCard>

              <SummaryCard icon={CreditCard} title="Payment Summary" accent="slate">
                <tbody>
                  {Object.keys(paymentSummary).length === 0 ? (
                    <tr><td colSpan={2} className="px-3 py-2 text-slate-400">No data</td></tr>
                  ) : Object.entries(paymentSummary).map(([k, v]) => (
                    <tr key={k} className="border-t border-slate-100">
                      <td className="px-3 py-1.5"><PaymentBadge type={k} /></td>
                      <td className="px-3 py-1.5 text-right font-semibold">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </SummaryCard>

            </div>
          )}
        </div>
      </div>
    </>
  );
}