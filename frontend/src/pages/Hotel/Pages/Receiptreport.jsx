import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => Number(n || 0).toLocaleString("en-IN");
const today = new Date().toISOString().split("T")[0];
const get29DaysAgo = () => {
  const d = new Date(); d.setDate(d.getDate() - 29);
  return d.toISOString().split("T")[0];
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

/* ─── CONSTANTS ──────────────────────────────────────────────────────────── */
const MODE_COLOR = {
  CASH:   { bg: "#dcfce7", text: "#15803d", dot: "#22c55e", border: "#86efac" },
  UPI:    { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6", border: "#93c5fd" },
  CARD:   { bg: "#f3e8ff", text: "#7e22ce", dot: "#a855f7", border: "#d8b4fe" },
  CREDIT: { bg: "#ffedd5", text: "#c2410c", dot: "#f97316", border: "#fdba74" },
  BANK:   { bg: "#ccfbf1", text: "#0f766e", dot: "#14b8a6", border: "#5eead4" },
};

const SOURCE_CONFIG = {
  checkout:   { label: "🛎 Checkout",   bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
  booking:    { label: "📋 Booking",    bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  advance:    { label: "💰 Advance",    bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  restaurant: { label: "🍽 Restaurant", bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  direct:     { label: "📄 Direct",     bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
};

/* ─── PAYBADGE ───────────────────────────────────────────────────────────── */
function PayBadge({ m }) {
  const c = MODE_COLOR[m] || { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 4, padding: "2px 7px",
      fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, marginRight: 2 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {m}
    </span>
  );
}

/* ─── SOURCE BADGE ───────────────────────────────────────────────────────── */
function SourceBadge({ source }) {
  const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG.direct;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {cfg.label}
    </span>
  );
}

/* ─── TYPE BADGE ─────────────────────────────────────────────────────────── */
function TypeBadge({ type }) {
  return type === "hotel" ? (
    <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
      borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      🏨 Hotel
    </span>
  ) : (
    <span style={{ background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a",
      borderRadius: 5, padding: "3px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      🍽 Restaurant
    </span>
  );
}

/* ─── PAYMENT SUMMARY SECTION ────────────────────────────────────────────── */
function PaymentSummarySection({ S, filter, fromDate, toDate }) {
  const paymentCards = [
    { key: "cash",   label: "Cash",          icon: "💵", amount: S.cash,   color: "#15803d", bg: "#f0fdf4", border: "#86efac", textAccent: "#166534" },
    { key: "upi",    label: "UPI / GPay",    icon: "📱", amount: S.upi,    color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd", textAccent: "#1e40af" },
    { key: "card",   label: "Card",          icon: "💳", amount: S.card,   color: "#7e22ce", bg: "#faf5ff", border: "#d8b4fe", textAccent: "#6b21a8" },
    { key: "credit", label: "Credit",        icon: "📒", amount: S.credit, color: "#c2410c", bg: "#fff7ed", border: "#fdba74", textAccent: "#9a3412" },
    { key: "bank",   label: "Bank Transfer", icon: "🏦", amount: S.bank,   color: "#0f766e", bg: "#f0fdfa", border: "#5eead4", textAccent: "#115e59" },
  ];

  const grandTotal = S.total;
  const dateLabel = fromDate === toDate
    ? fmtDate(fromDate)
    : `${fmtDate(fromDate)} – ${fmtDate(toDate)}`;

  return (
    <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,.07)", marginBottom: 16, overflow: "hidden" }}>

      {/* ── Dark navy header — matches your screenshot ── */}
      <div style={{ background: "#1a3a5c", padding: "2px 20px", display: "flex",
        justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: 0.3 }}>
            Financial Summary
          </div>
          <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 3 }}>
            {dateLabel} &nbsp;·&nbsp;
            {filter === "all" ? "All Receipts" : filter === "hotel" ? "🏨 Hotel Only" : "🍽 Restaurant Only"}
            &nbsp;·&nbsp; {fmtInt(S.count)} receipts
          </div>
        </div>
       
      </div>

      {/* ── Two-column layout like your screenshot ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

        {/* LEFT — Financial Summary (label + value rows) */}
        <div style={{ padding: "16px 20px", borderRight: "1px solid #f1f5f9" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a5c", marginBottom: 12,
            textTransform: "uppercase", letterSpacing: 0.5 }}>
            Payment Breakdown
          </div>

          {/* Payment rows */}
          {paymentCards.map((p) => (
            <div key={p.key} style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 14 }}>{p.icon}</span>
                <span style={{ fontSize: 13, color: "#334155" }}>{p.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: p.textAccent,
                fontFamily: "monospace" }}>
                {p.amount > 0 ? `₹${fmt(p.amount)}` : <span style={{ color: "#cbd5e1" }}>—</span>}
              </span>
            </div>
          ))}

          {/* Net Sale total row — bold bottom row like screenshot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 0 2px", marginTop: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a3a5c" }}>Net Total</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#1a3a5c", fontFamily: "monospace" }}>
              ₹{fmt(grandTotal)}
            </span>
          </div>
        </div>

        {/* RIGHT — Business Type Breakdown (like your screenshot right box) */}
        <div style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3a5c", marginBottom: 12,
            textTransform: "uppercase", letterSpacing: 0.5 }}>
            Business Type Breakdown
          </div>

          {/* Hotel */}
          <div style={{ display: "flex", justifyContent: "space-between",
            padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 13, color: "#334155" }}>🏨 Hotel Receipts</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>
              {fmtInt(S.hCount)}
            </span>
          </div>

          {/* Restaurant */}
          <div style={{ display: "flex", justifyContent: "space-between",
            padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 13, color: "#334155" }}>🍽 Restaurant Receipts</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309", fontFamily: "monospace" }}>
              {fmtInt(S.rCount)}
            </span>
          </div>

          {/* Total Transactions */}
          <div style={{ display: "flex", justifyContent: "space-between",
            padding: "9px 0 2px", marginTop: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#1a3a5c" }}>Total Receipts</span>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#1a3a5c", fontFamily: "monospace" }}>
              {fmtInt(S.count)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />

          {/* Hotel amount */}
          <div style={{ display: "flex", justifyContent: "space-between",
            padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 13, color: "#334155" }}>Hotel Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>
              ₹{fmt(S.hTotal)}
            </span>
          </div>

          {/* Restaurant amount */}
          <div style={{ display: "flex", justifyContent: "space-between",
            padding: "7px 0", borderBottom: "1px solid #f8fafc" }}>
            <span style={{ fontSize: 13, color: "#334155" }}>Restaurant Total</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#b45309", fontFamily: "monospace" }}>
              ₹{fmt(S.rTotal)}
            </span>
          </div>

          {/* Note — matches the footer note in your screenshot */}
          <div style={{ marginTop: 16, fontSize: 10, color: "#94a3b8", lineHeight: 1.6 }}>
            * This report shows only receipt transactions.<br />
            * Cancelled receipts are excluded.
          </div>
        </div>
      </div>

      {/* ── Bottom totals bar — thin footer strip ── */}
      <div style={{ borderTop: "2px solid #f1f5f9", display: "flex", flexWrap: "wrap",
        padding: "8px 20px", background: "#f8fafc", alignItems: "center" }}>
        {paymentCards.filter((p) => p.amount > 0).map((p) => (
          <div key={p.key} style={{ padding: "3px 16px", borderRight: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: p.textAccent, fontFamily: "monospace" }}>
              ₹{fmt(p.amount)}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 0.5 }}>
              {p.label}
            </div>
          </div>
        ))}
        <div style={{ padding: "3px 16px", marginLeft: "auto" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#1a3a5c", fontFamily: "monospace" }}>
            ₹{fmt(S.total)}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 0.5 }}>
            Total
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED ROW DETAIL ─────────────────────────────────────────────────── */
const secTitle = {
  fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase",
  letterSpacing: 0.8, marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid #e2e8f0",
};
const eRow = { display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 5 };
const eL   = { color: "#64748b", fontSize: 12 };
const eV   = { color: "#1e293b", fontWeight: 600, fontSize: 12 };

function ExpandedDetail({ r }) {
  return (
    <div style={{ display: "flex", gap: 24, padding: "16px 24px", flexWrap: "wrap",
      background: "#f0f9ff", borderBottom: "2px solid #bae6fd" }}>

      {/* Payment */}
      <div style={{ flex: 1, minWidth: 140 }}>
        <div style={secTitle}>Payment Breakdown</div>
        {[["Cash", r.cash], ["UPI", r.upi], ["Card", r.card], ["Credit", r.credit], ["Bank", r.bank]]
          .filter(([, v]) => Number(v) > 0)
          .map(([l, v]) => (
            <div key={l} style={eRow}><span style={eL}>{l}</span><span style={eV}>₹{fmt(v)}</span></div>
          ))}
      </div>

      {/* Receipt info */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={secTitle}>Receipt Info</div>
        <div style={eRow}><span style={eL}>Party</span><span style={eV}>{r.partyName || "—"}</span></div>
        <div style={eRow}><span style={eL}>Total Bill Amt</span><span style={eV}>₹{fmt(r.totalBillAmount)}</span></div>
        <div style={eRow}>
          <span style={eL}>Amount Received</span>
          <span style={{ ...eV, color: "#15803d" }}>₹{fmt(r.finalAmount)}</span>
        </div>
        {r.advanceAmount > 0 && (
          <div style={eRow}><span style={eL}>Advance</span><span style={eV}>₹{fmt(r.advanceAmount)}</span></div>
        )}
        {r.remainingAmount > 0 && (
          <div style={eRow}>
            <span style={eL}>Remaining</span>
            <span style={{ ...eV, color: "#dc2626" }}>₹{fmt(r.remainingAmount)}</span>
          </div>
        )}
      </div>

      {/* Bills settled */}
      {(r.billDataList || []).length > 0 && (
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={secTitle}>Bills Settled ({r.billDataList.length})</div>
          {r.billDataList.map((b, idx) => (
            <div key={idx} style={{ marginBottom: 8, padding: "6px 8px", background: "#f8fafc",
              borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={eRow}>
                <span style={eL}>Bill No</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e293b", fontSize: 12 }}>
                  {b.billNo || "—"}
                </span>
              </div>
              <div style={eRow}><span style={eL}>Bill Date</span><span style={eV}>{fmtDate(b.billDate)}</span></div>
              <div style={eRow}>
                <span style={eL}>Source</span>
                <span style={eV}>{b.source === "hotel" ? "🏨 Hotel" : b.source === "restaurant" ? "🍽 Restaurant" : b.source || "—"}</span>
              </div>
              <div style={eRow}>
                <span style={eL}>Settled</span>
                <span style={{ ...eV, color: "#15803d" }}>₹{fmt(b.settledAmount)}</span>
              </div>
              {b.remainingAmount > 0 && (
                <div style={eRow}>
                  <span style={eL}>Remaining</span>
                  <span style={{ ...eV, color: "#dc2626" }}>₹{fmt(b.remainingAmount)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Restaurant info */}
      {r.billType === "restaurant" && (
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={secTitle}>Restaurant Info</div>
          <div style={eRow}><span style={eL}>Table</span><span style={eV}>{r.tableNumber || "—"}</span></div>
          <div style={eRow}><span style={eL}>Waiter</span><span style={eV}>{r.waiterName || "—"}</span></div>
          <div style={eRow}><span style={eL}>KOT No</span><span style={eV}>{r.kotNumber || "—"}</span></div>
          <div style={eRow}><span style={eL}>KOT Type</span><span style={eV}>{r.kotType || "—"}</span></div>
        </div>
      )}
    </div>
  );
}

/* ─── TABLE STYLES ───────────────────────────────────────────────────────── */
const tdBase = { padding: "10px 12px", verticalAlign: "middle", borderBottom: "1px solid #f1f5f9" };
const thBase = {
  padding: "11px 12px", fontWeight: 700, color: "#ffffff", fontSize: 11,
  textTransform: "uppercase", letterSpacing: 0.5, background: "#1a3a5c",
  textAlign: "left", whiteSpace: "nowrap",
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ReceiptReport() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id
  );

  const [filter,      setFilter]      = useState("all");
  const [fromDate,    setFromDate]    = useState(get29DaysAgo());
  const [toDate,      setToDate]      = useState(today);
  const [search,      setSearch]      = useState("");
  const [allReceipts, setAllReceipts] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [expanded,    setExpanded]    = useState(null);




  
  /* ── Fetch always with under="all", filter client-side ───────────────── */
  const fetchReport = useCallback(async () => {
    if (!cmp_id) { setError("Company not selected"); return; }
    setLoading(true); setError("");
    try {
      const { data } = await api.get(`/api/sUsers/receiptReport/${cmp_id}`, {
        params: { under: "all", startDate: fromDate, endDate: toDate },
        withCredentials: true,
      });
      if (!data.success) throw new Error(data.message || "Failed to fetch");
      setAllReceipts(data.data?.receipts || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      setAllReceipts([]);
    } finally {
      setLoading(false);
    }
  }, [cmp_id, fromDate, toDate]);

  useEffect(() => {
    if (cmp_id) fetchReport();
  }, [cmp_id, fromDate, toDate]);

  /* ── rows: client-side filter + search ──────────────────────────────── */
  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allReceipts.filter((r) => {
      if (filter === "hotel"      && r.billType !== "hotel")      return false;
      if (filter === "restaurant" && r.billType !== "restaurant") return false;
      if (!q) return true;
      return (
        r.billNo?.toLowerCase().includes(q) ||
        r.partyName?.toLowerCase().includes(q) ||
        r.guestName?.toLowerCase().includes(q) ||
        r.roomNumber?.toLowerCase().includes(q) ||
        r.tableNumber?.toLowerCase().includes(q)
      );
    });
  }, [allReceipts, filter, search]);

  /* ── S: summary derived from rows — auto updates on any filter/date/search change ── */
  const S = useMemo(
    () =>
      rows.reduce(
        (a, r) => {
          a.count++;
          a.total  += r.finalAmount || 0;
          a.cash   += r.cash   || 0;
          a.upi    += r.upi    || 0;
          a.card   += r.card   || 0;
          a.credit += r.credit || 0;
          a.bank   += r.bank   || 0;
          if (r.billType === "hotel")      { a.hCount++; a.hTotal += r.finalAmount || 0; }
          if (r.billType === "restaurant") { a.rCount++; a.rTotal += r.finalAmount || 0; }
          return a;
        },
        { count:0, total:0, cash:0, upi:0, card:0, credit:0, bank:0, hCount:0, hTotal:0, rCount:0, rTotal:0 }
      ),
    [rows]
  );

  const showType = filter === "all";

  /* ── Export Excel ────────────────────────────────────────────────────── */
  const exportToExcel = () => {
    const headers = [
      "#", "Date", "Receipt No",
      ...(showType ? ["Type"] : []),
      "Party", "Source", "Bill No(s)", "Bill Date(s)",
      "Amount (₹)", "Cash", "UPI", "Card", "Credit", "Bank", "Payment Mode",
    ];
    const dataRows = rows.map((r, i) => [
      i + 1, fmtDate(r.date), r.billNo || "",
      ...(showType ? [r.billType || ""] : []),
      r.partyName || "",
      SOURCE_CONFIG[r.receiptSource]?.label?.replace(/^\S+\s/, "") || r.receiptSource || "",
      (r.billDataList || []).map((b) => b.billNo).join(", ") || "",
      (r.billDataList || []).map((b) => fmtDate(b.billDate)).join(", ") || "",
      Number(r.finalAmount || 0), Number(r.cash || 0), Number(r.upi || 0),
      Number(r.card || 0), Number(r.credit || 0), Number(r.bank || 0),
      (r.paymentModes || []).join(", "),
    ]);
    const totalRow = [
      "", "", ...(showType ? [""] : []), "TOTAL", "", "", "",
      S.total, S.cash, S.upi, S.card, S.credit, S.bank, "",
    ];
    const ws = XLSX.utils.aoa_to_sheet([
      ["Receipt Report"],
      [`Period: ${fromDate} to ${toDate}  |  Filter: ${filter}`],
      [], headers, ...dataRows, [], totalRow,
    ]);
    ws["!cols"] = [
      { wch: 5 }, { wch: 14 }, { wch: 16 },
      ...(showType ? [{ wch: 14 }] : []),
      { wch: 26 }, { wch: 16 }, { wch: 22 }, { wch: 18 },
      { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt Report");
    XLSX.writeFile(wb, `receipt-report-${fromDate}-to-${toDate}.xlsx`);
  };

  /* ── Export PDF ──────────────────────────────────────────────────────── */
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(14); doc.setTextColor(26, 58, 92);
    doc.text("Receipt Report", 14, 14);
    doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text(`Period: ${fromDate} to ${toDate}   |   Filter: ${filter}   |   ${rows.length} receipts`, 14, 20);
    const head = [[
      "#", "Date", "Receipt No",
      ...(showType ? ["Type"] : []),
      "Party", "Source", "Bill No(s)", "Amount (₹)", "Cash", "UPI", "Card", "Credit", "Payment Mode",
    ]];
    const body = rows.map((r, i) => [
      i + 1, fmtDate(r.date), r.billNo || "",
      ...(showType ? [r.billType || ""] : []),
      r.partyName || "",
      SOURCE_CONFIG[r.receiptSource]?.label?.replace(/^\S+\s/, "") || "—",
      (r.billDataList || []).map((b) => b.billNo).join(", ") || "—",
      fmt(r.finalAmount), fmt(r.cash), fmt(r.upi), fmt(r.card), fmt(r.credit),
      (r.paymentModes || []).join(", "),
    ]);
    body.push([
      "", "", ...(showType ? [""] : []),
      "TOTAL", "", "", fmt(S.total), fmt(S.cash), fmt(S.upi), fmt(S.card), fmt(S.credit), "",
    ]);
    autoTable(doc, {
      startY: 25, head, body,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [26, 58, 92], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (hook) => {
        if (hook.row.index === body.length - 1 && hook.section === "body") {
          hook.cell.styles.fontStyle = "bold";
          hook.cell.styles.fillColor = [26, 58, 92];
          hook.cell.styles.textColor = 255;
        }
      },
    });
    doc.save(`receipt-report-${fromDate}-to-${toDate}.pdf`);
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <>
      <TitleDiv title="RECEIPT REPORT" />

      <div style={{ padding: "20px 24px", fontFamily: "Segoe UI, Inter, sans-serif",
        background: "#f1f5f9", minHeight: "100vh" }}>

        {/* ── CONTROL BAR ─────────────────────────────────────────────── */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-3 md:p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 md:text-lg uppercase">
                  Receipt Report
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  {fmtDate(fromDate)} — {fmtDate(toDate)}&nbsp;·&nbsp;
                  <span className="font-semibold text-slate-600">{rows.length}</span> receipts
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={exportToExcel} disabled={!rows.length}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  ⬇ Excel
                </button>
                <button onClick={exportToPDF} disabled={!rows.length}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  ⬇ PDF
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-2">
              {/* Filter */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Filter By</label>
                <select value={filter}
                  onChange={(e) => { setFilter(e.target.value); setExpanded(null); setSearch(""); }}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600">
                  <option value="all">🏨 + 🍽 All</option>
                  <option value="hotel">🏨 Hotel Only</option>
                  <option value="restaurant">🍽 Restaurant Only</option>
                </select>
              </div>
              {/* From */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">From</label>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-36 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600" />
              </div>
              {/* To */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">To</label>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-36 rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600" />
              </div>
              {/* Search */}
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Search</label>
                <input type="text" placeholder="Bill No, Party, Room, Table…" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-800 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600" />
              </div>
              {/* Fetch */}
              <button onClick={fetchReport} disabled={loading}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-700 px-5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-60 transition">
                {loading ? "Loading…" : "↻ Fetch"}
              </button>
            </div>
          </div>

          {/* Loading bar */}
          {loading && (
            <div style={{ height: 3, background: "#e2e8f0", overflow: "hidden" }}>
              <style>{`@keyframes slideBar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}`}</style>
              <div style={{ height: "100%", width: "40%", background: "#0d9488",
                animation: "slideBar 1.2s ease-in-out infinite" }} />
            </div>
          )}
        </div>

        {/* ── ERROR ───────────────────────────────────────────────────── */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠ {error}
          </div>
        )}

        {/* ── FILTER TABS ─────────────────────────────────────────────── */}
        <div className="mb-3 flex gap-2 flex-wrap">
          {[
            { val: "all",        label: "🏨 + 🍽 All",   count: allReceipts.length },
            { val: "hotel",      label: "🏨 Hotel",       count: allReceipts.filter(r => r.billType === "hotel").length },
            { val: "restaurant", label: "🍽 Restaurant",  count: allReceipts.filter(r => r.billType === "restaurant").length },
          ].map((t) => (
            <button key={t.val}
              onClick={() => { setFilter(t.val); setExpanded(null); setSearch(""); }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-semibold transition
                ${filter === t.val
                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"}`}>
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                ${filter === t.val ? "bg-teal-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── PAYMENT SUMMARY — updates on date / filter / search ─────── */}
        

        {/* ── EMPTY STATE ─────────────────────────────────────────────── */}
        {!loading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400">
            <div className="mb-3 text-5xl">🧾</div>
            <div className="text-sm font-semibold text-slate-500">No receipts found</div>
            <div className="mt-1 text-xs text-slate-400">
              {allReceipts.length > 0
                ? `${allReceipts.length} total receipts — none match the current filter`
                : "Select a date range and click Fetch"}
            </div>
          </div>
        )}

        {/* ── TABLE ───────────────────────────────────────────────────── */}
        {!loading && rows.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,.07)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={thBase}>#</th>
                  <th style={thBase}>Date</th>
                  <th style={thBase}>Receipt No</th>
                  {showType && <th style={thBase}>Type</th>}
                  <th style={thBase}>Party</th>
                  <th style={thBase}>Source</th>
                  <th style={thBase}>Bill No(s)</th>
                  <th style={thBase}>Bill Date(s)</th>
                  <th style={{ ...thBase, textAlign: "right" }}>Amount (₹)</th>
                  <th style={thBase}>Payment</th>
                  <th style={thBase} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const rowKey     = r.billNo || `row-${i}`;
                  const isExpanded = expanded === rowKey;
                  return (
                    <>
                      <tr key={rowKey}
                        onClick={() => setExpanded(isExpanded ? null : rowKey)}
                        style={{
                          cursor: "pointer",
                          background: isExpanded ? "#f0f9ff" : i % 2 === 0 ? "#fff" : "#fafafa",
                        }}
                        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            isExpanded ? "#f0f9ff" : i % 2 === 0 ? "#fff" : "#fafafa";
                        }}>
                        <td style={tdBase}><span style={{ color: "#94a3b8", fontSize: 12 }}>{i + 1}</span></td>
                        <td style={tdBase}><span style={{ color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(r.date)}</span></td>
                        <td style={tdBase}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e293b", fontSize: 13 }}>
                            {r.billNo || "—"}
                          </span>
                        </td>
                        {showType && <td style={tdBase}><TypeBadge type={r.billType} /></td>}
                        <td style={tdBase}><span style={{ fontWeight: 600, color: "#1e293b" }}>{r.partyName || "—"}</span></td>
                        <td style={tdBase}><SourceBadge source={r.receiptSource} /></td>
                        <td style={tdBase}>
                          {(r.billDataList || []).length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {r.billDataList.map((b, idx) => (
                                <span key={idx} style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e293b", fontSize: 12 }}>
                                  {b.billNo || "—"}
                                </span>
                              ))}
                            </div>
                          ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td style={{ ...tdBase, color: "#64748b", fontSize: 12 }}>
                          {(r.billDataList || []).length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              {r.billDataList.map((b, idx) => (
                                <span key={idx} style={{ whiteSpace: "nowrap" }}>{fmtDate(b.billDate)}</span>
                              ))}
                            </div>
                          ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td style={{ ...tdBase, textAlign: "right" }}>
                          <strong style={{ color: "#0f172a", fontSize: 14 }}>₹{fmt(r.finalAmount)}</strong>
                        </td>
                        <td style={tdBase}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                            {(r.paymentModes || []).map((m) => <PayBadge key={m} m={m} />)}
                          </div>
                        </td>
                        <td style={tdBase}>
                          <span style={{ fontSize: 10, color: "#94a3b8", display: "inline-block",
                            transition: "transform .2s",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${rowKey}-exp`}>
                          <td colSpan={20} style={{ padding: 0 }}>
                            <ExpandedDetail r={r} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#1a3a5c" }}>
                  <td colSpan={showType ? 8 : 7}
                    style={{ padding: "11px 12px", textAlign: "right", fontWeight: 700,
                      color: "#fff", fontSize: 12, borderTop: "2px solid #0f2744" }}>
                    TOTAL — {rows.length} receipts
                  </td>
                  <td style={{ padding: "11px 12px", textAlign: "right", fontWeight: 800,
                    color: "#7dd3fc", fontSize: 15, borderTop: "2px solid #0f2744" }}>
                    ₹{fmt(S.total)}
                  </td>
                  <td colSpan={2} style={{ borderTop: "2px solid #0f2744" }} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <PaymentSummarySection S={S} filter={filter} fromDate={fromDate} toDate={toDate} />
        )}
      </div>
    </>
  );
}