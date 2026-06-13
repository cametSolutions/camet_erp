import React, { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import * as XLSX from "xlsx";
import TitleDiv from "@/components/common/TitleDiv";
import api from "../../../api/api";
import { useSelector } from "react-redux";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const fmt = (n) =>
  (n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const today = new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────
//  FISCAL YEAR HELPERS
//  Financial year = April 1 of selectedYear → March 31 of selectedYear+1
//  If still in progress → April 1 to today
//  If completed       → April 1 to March 31 (full 365/366 days)
// ─────────────────────────────────────────────────────────────────
const getFiscalYearDays = (selectedYear) => {
  const year = parseInt(selectedYear);
  const fiscalStart = new Date(year, 3, 1);        // April 1, selectedYear
  const fiscalEnd   = new Date(year + 1, 2, 31);   // March 31, selectedYear+1
  const todayDate   = new Date();

  if (todayDate < fiscalStart) {
    // Future year — shouldn't normally be selectable, but guard anyway
    return 1;
  }

  if (todayDate >= fiscalEnd) {
    // Completed financial year — count full Apr 1 → Mar 31
    const diffMs = fiscalEnd - fiscalStart;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // 365 or 366
  }

  // Current (in-progress) financial year — count Apr 1 → today (YTD)
  const diffMs = todayDate - fiscalStart;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

// Label shown in the header: "FY 2026 (Apr 1 – Jun 9, 2026 · 70 days)"
const getFiscalYearLabel = (selectedYear) => {
  const year         = parseInt(selectedYear);
  const fiscalStart  = new Date(year, 3, 1);
  const fiscalEnd    = new Date(year + 1, 2, 31);
  const todayDate    = new Date();
  const days         = getFiscalYearDays(selectedYear);

  const fmt = (d) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const endLabel = todayDate < fiscalEnd ? fmt(todayDate) : fmt(fiscalEnd);
  return `FY ${year} (${fmt(fiscalStart)} – ${endLabel} · ${days} days)`;
};

// ─────────────────────────────────────────────────────────────────
//  TABLE CELL HELPERS
// ─────────────────────────────────────────────────────────────────
const TH = ({ children, right }) => (
  <th
    style={{
      padding: "9px 10px",
      textAlign: right ? "right" : "left",
      background: "#1a3a5c",
      color: "#fff",
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
      borderRight: "1px solid #2a4a6c",
    }}
  >
    {children}
  </th>
);

const TD = ({ children, right, bold, muted }) => (
  <td
    style={{
      padding: "7px 10px",
      textAlign: right ? "right" : "left",
      fontWeight: bold ? 700 : 400,
      color: muted ? "#666" : "#111",
      whiteSpace: "nowrap",
      fontSize: 12,
    }}
  >
    {children}
  </td>
);

// Stable alternating row colours (no Math.random on every render)
let _rowIndex = 0;
const TDRow = ({ label, d, m, y, isPercent = false, bold = false }) => {
  _rowIndex++;
  const bg = _rowIndex % 2 === 0 ? "#fff" : "#f9fafb";
  return (
    <tr style={{ background: bg, borderBottom: "1px solid #f0f0f0" }}>
      <TD muted>{label}</TD>
      <TD right bold={bold}>
        {isPercent ? `${Number(d || 0).toFixed(2)}%` : fmt(d)}
      </TD>
      <TD right bold={bold}>
        {isPercent ? `${Number(m || 0).toFixed(2)}%` : fmt(m)}
      </TD>
      <TD right bold={bold}>
        {isPercent ? `${Number(y || 0).toFixed(2)}%` : fmt(y)}
      </TD>
    </tr>
  );
};

const SectionHeader = ({ title }) => (
  <tr style={{ background: "#f0f9ff" }}>
    <td
      colSpan={4}
      style={{ padding: "9px 10px", fontWeight: 700, fontSize: 12, color: "#1a3a5c" }}
    >
      {title}
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────────
//  PDF DOCUMENT
// ─────────────────────────────────────────────────────────────────
const FlashReportPDF = ({ dateData, monthData, yearData, fiscalYearDays, selectedYear }) => {
  const s = StyleSheet.create({
    page:        { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
    border:      { border: "1px solid black", padding: 15 },
    header:      { textAlign: "center", marginBottom: 10 },
    title:       { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    subtitle:    { fontSize: 12, fontWeight: "bold", textDecoration: "underline" },
    dateRow:     { flexDirection: "row", justifyContent: "space-between", fontSize: 9, marginBottom: 10, paddingBottom: 5, borderBottom: "1px solid #ccc" },
    tableHeader: { flexDirection: "row", borderBottom: "1px solid black", paddingBottom: 5, marginBottom: 5, fontWeight: "bold" },
    tableRow:    { flexDirection: "row", paddingVertical: 2, borderBottom: "0.5px solid #ddd" },
    col1:        { width: "40%", paddingLeft: 5 },
    col2:        { width: "20%", textAlign: "right", paddingRight: 5 },
    col3:        { width: "20%", textAlign: "right", paddingRight: 5 },
    col4:        { width: "20%", textAlign: "right", paddingRight: 5 },
    sectionTitle:{ fontWeight: "bold", marginTop: 8, marginBottom: 4, paddingLeft: 5 },
    totalRow:    { flexDirection: "row", paddingVertical: 3, borderTop: "1px solid #ccc", marginTop: 2, fontWeight: "bold" },
  });

  const fmtN = (v, isPercent = false) => {
    const n = Number(v || 0);
    if (isPercent) return `${n.toFixed(2)}%`;
    return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const R = ({ label, d, m, y, isPercent }) => (
    <View style={s.tableRow}>
      <Text style={s.col1}>{label}</Text>
      <Text style={s.col2}>{fmtN(d, isPercent)}</Text>
      <Text style={s.col3}>{fmtN(m, isPercent)}</Text>
      <Text style={s.col4}>{fmtN(y, isPercent)}</Text>
    </View>
  );

  const TR = ({ label, d, m, y }) => (
    <View style={s.totalRow}>
      <Text style={s.col1}>{label}</Text>
      <Text style={s.col2}>{fmtN(d)}</Text>
      <Text style={s.col3}>{fmtN(m)}</Text>
      <Text style={s.col4}>{fmtN(y)}</Text>
    </View>
  );

  const md = monthData?.fullMonthDays || 1;
  const yd = fiscalYearDays;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.border}>
          <View style={s.header}>
            <Text style={s.title}>{dateData?.companyName}</Text>
            <Text style={s.subtitle}>Hotel Flash Report - Comparison</Text>
          </View>
          <View style={s.dateRow}>
            <Text>
              Date: {fmtDate(dateData?.selectedDate)} | Month: {monthData?.monthName}{" "}
              {monthData?.selectedYear} | FY {selectedYear} ({yd} days)
            </Text>
          </View>
          <View style={s.tableHeader}>
            <Text style={s.col1}>Particulars</Text>
            <Text style={s.col2}>Date</Text>
            <Text style={s.col3}>Month</Text>
            <Text style={s.col4}>Year</Text>
          </View>

          <Text style={s.sectionTitle}>ROOM STATISTICS:-</Text>
          <R label="(A) Total Rooms"                     d={dateData?.totalRooms}    m={monthData?.totalRooms    * md} y={yearData?.totalRooms    * yd} />
          <R label="(B) Blocked Rooms"                   d={dateData?.blockedRooms}  m={monthData?.blockedRooms  * md} y={yearData?.blockedRooms  * yd} />
          <R label="(C) Total Saleable (A-B)"            d={dateData?.saleableRooms} m={monthData?.saleableRooms * md} y={yearData?.saleableRooms * yd} />
          <R label="(D) Occupied Rooms (Paid)"           d={dateData?.occupiedPaid}  m={monthData?.occupiedPaid  * md} y={yearData?.occupiedPaid  * yd} />
          <R label="(E) Occupied Rooms (Comp/House Use)" d={dateData?.occupiedComp}  m={monthData?.occupiedComp  * md} y={yearData?.occupiedComp  * yd} />
          <R label="(F) Total Occupied Rooms (D+E)"      d={dateData?.totalOccupied} m={monthData?.totalOccupied * md} y={yearData?.totalOccupied * yd} />
          <R label="(G) No of Pax - Domestic"            d={dateData?.paxDomestic}   m={monthData?.paxDomestic   * md} y={yearData?.paxDomestic   * yd} />
          <R label="(H) No of Pax - Foreigners"          d={dateData?.paxForeign}    m={monthData?.paxForeign    * md} y={yearData?.paxForeign    * yd} />
          <R label="(I) Total Pax (G+H)"                 d={dateData?.totalPax}      m={monthData?.totalPax      * md} y={yearData?.totalPax      * yd} />
          <R label="(J) No of Adults"                    d={dateData?.adults}        m={monthData?.adults        * md} y={yearData?.adults        * yd} />
          <R label="(K) No of Children"                  d={dateData?.children}      m={monthData?.children      * md} y={yearData?.children      * yd} />
          <R label="(L) No of Males"                     d={dateData?.males}         m={monthData?.males         * md} y={yearData?.males         * yd} />
          <R label="(M) No of Females"                   d={dateData?.females}       m={monthData?.females       * md} y={yearData?.females       * yd} />
          <R label="(N) No Shows"                        d={dateData?.noShows}       m={monthData?.noShows       * md} y={yearData?.noShows       * yd} />
          {/* Rates — never multiplied */}
          <R label="(O) % of Occupancy (D/A)%"  d={dateData?.occPercent}       m={monthData?.occPercent}       y={yearData?.occPercent}       isPercent />
          <R label="(P) ARR (Total Rooms)"       d={dateData?.arrTotalRooms}    m={monthData?.arrTotalRooms}    y={yearData?.arrTotalRooms} />
          <R label="(Q) ARR (Saleable Rooms)"    d={dateData?.arrSaleableRooms} m={monthData?.arrSaleableRooms} y={yearData?.arrSaleableRooms} />
          <R label="(R) ARR (Occupied Rooms)"    d={dateData?.arrOccupiedRooms} m={monthData?.arrOccupiedRooms} y={yearData?.arrOccupiedRooms} />

          <Text style={s.sectionTitle}>ROOM REVENUE</Text>
          <R  label="Apartment Charges (Accrued)" d={dateData?.roomApartment} m={monthData?.roomApartment * md} y={yearData?.roomApartment * yd} />
          <R  label="Extra Bed Charges (Accrued)" d={dateData?.roomExtraBed}  m={monthData?.roomExtraBed  * md} y={yearData?.roomExtraBed  * yd} />
          <TR label="Total : ROOM REVENUE"        d={dateData?.roomTotal}     m={monthData?.roomTotal     * md} y={yearData?.roomTotal     * yd} />

          <Text style={s.sectionTitle}>F&amp;B REVENUE</Text>
          <R  label="Plan Rate (Accrued)"     d={dateData?.fbPlanRate}    m={monthData?.fbPlanRate    * md} y={yearData?.fbPlanRate    * yd} />
          <R  label="Rustic Room Service"     d={dateData?.fbRoomService} m={monthData?.fbRoomService * md} y={yearData?.fbRoomService * yd} />
          <R  label="Rustic Barn Restaurant"  d={dateData?.fbRestaurant}  m={monthData?.fbRestaurant  * md} y={yearData?.fbRestaurant  * yd} />
          <TR label="Total : F&B REVENUE"     d={dateData?.fbTotal}       m={monthData?.fbTotal       * md} y={yearData?.fbTotal       * yd} />

          <Text style={s.sectionTitle}>OTHER REVENUES</Text>
          <R  label="MOD REVENUES" d={dateData?.modRevenues} m={monthData?.modRevenues * md} y={yearData?.modRevenues * yd} />
          <TR label="Grand Total"  d={dateData?.grandTotal}  m={monthData?.grandTotal  * md} y={yearData?.grandTotal  * yd} />
        </View>
      </Page>
    </Document>
  );
};

// ─────────────────────────────────────────────────────────────────
//  MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────
export default function HotelFlashReportPage() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id
  );

  const getCurrentYear  = () => new Date().getFullYear();
  const getCurrentMonth = () => new Date().getMonth() + 1;

  // ── State ──────────────────────────────────────────────────────
  const [selectedDate,  setSelectedDate]  = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  // Default: current calendar year (fiscal year that STARTED this year)
  // e.g. today = June 9 2026 → default = 2026 → FY Apr 1 2026 – Jun 9 2026
  const [selectedYear,  setSelectedYear]  = useState(getCurrentYear());

  const [dateData,  setDateData]  = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [yearData,  setYearData]  = useState(null);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Derived: fiscal year days for the selected year
  const fiscalYearDays = getFiscalYearDays(selectedYear);

  // ── API Fetchers ───────────────────────────────────────────────
  const fetchDateReport = async () => {
    if (!cmp_id) return;
    try {
      const res = await api.get("/api/sUsers/flash-report", {
        params: { cmp_id, reportDate: selectedDate },
      });
      if (res.data.success) {
        setDateData({ ...res.data.data, selectedDate });
      }
    } catch (err) {
      console.error("Date report error:", err);
    }
  };

  const fetchMonthReport = async () => {
    if (!cmp_id) return;
    try {
      const monthLastDay  = new Date(selectedYear, selectedMonth, 0).getDate();
      const pad           = (n) => String(n).padStart(2, "0");
      const fromDate      = `${selectedYear}-${pad(selectedMonth)}-01`;
      const toDate        = `${selectedYear}-${pad(selectedMonth)}-${monthLastDay}`;

      const res = await api.get("/api/sUsers/flash-report", {
        params: { cmp_id, reportMonth: selectedMonth, reportYear: selectedYear, fromDate, toDate },
      });
      if (res.data.success) {
        const monthName = new Date(`${selectedYear}-${pad(selectedMonth)}-01`).toLocaleString(
          "en-GB", { month: "long" }
        );
        setMonthData({
          ...res.data.data,
          selectedMonth,
          selectedYear,
          monthName,
          fullMonthDays: monthLastDay,
        });
      }
    } catch (err) {
      console.error("Month report error:", err);
    }
  };

  const fetchYearReport = async () => {
    if (!cmp_id) return;
    try {
      // Fiscal year: April 1, selectedYear → March 31, selectedYear+1
      // But we only need a single "per-day average" from the API;
      // the actual YTD total is computed as: apiValue × fiscalYearDays
      const yearStart = `${selectedYear}-04-01`;
      const yearEnd   = `${selectedYear + 1}-03-31`;

      const res = await api.get("/api/sUsers/flash-report", {
        params: { cmp_id, reportYear: selectedYear, fromDate: yearStart, toDate: yearEnd },
      });
      if (res.data.success) {
        setYearData({
          ...res.data.data,
          selectedYear,
          // NOTE: fullYearDays is intentionally NOT stored here anymore.
          // We use the computed `fiscalYearDays` derived from selectedYear instead.
        });
      }
    } catch (err) {
      console.error("Year report error:", err);
    }
  };

  // ── Effects ────────────────────────────────────────────────────
  useEffect(() => {
    if (cmp_id) {
      fetchDateReport();
      fetchMonthReport();
      fetchYearReport();
    }
  }, [cmp_id]);

  useEffect(() => { fetchDateReport(); },              [selectedDate]);
  useEffect(() => { fetchMonthReport(); },             [selectedMonth, selectedYear]);
  useEffect(() => { fetchYearReport(); },              [selectedYear]);

  // ── Export helpers ─────────────────────────────────────────────
  const exportToPDF = async () => {
    if (!dateData || !monthData || !yearData) return;
    const blob = await pdf(
      <FlashReportPDF
        dateData={dateData}
        monthData={monthData}
        yearData={yearData}
        fiscalYearDays={fiscalYearDays}
        selectedYear={selectedYear}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) win.onload = () => { win.focus(); win.print(); };
  };

  const exportToExcel = () => {
    if (!dateData || !monthData || !yearData) return;
    const md = monthData.fullMonthDays;
    const yd = fiscalYearDays;
    const pad = (n) => String(n).padStart(2, "0");
    const monthName = new Date(`${selectedYear}-${pad(selectedMonth)}-01`)
      .toLocaleString("en-GB", { month: "long" });

    const rows = [
      ["HOTEL FLASH REPORT - COMPARISON"],
      [dateData.companyName],
      [],
      ["Particulars", `Date: ${selectedDate}`, `Month: ${monthName} ${selectedYear}`, getFiscalYearLabel(selectedYear)],
      [],
      ["ROOM STATISTICS:-"],
      ["(A) Total Rooms",                     dateData.totalRooms,    monthData.totalRooms    * md, yearData.totalRooms    * yd],
      ["(B) Blocked Rooms",                   dateData.blockedRooms,  monthData.blockedRooms  * md, yearData.blockedRooms  * yd],
      ["(C) Total Saleable (A-B)",            dateData.saleableRooms, monthData.saleableRooms * md, yearData.saleableRooms * yd],
      ["(D) Occupied Rooms (Paid)",           dateData.occupiedPaid,  monthData.occupiedPaid  * md, yearData.occupiedPaid  * yd],
      ["(E) Occupied Rooms (Comp/House Use)", dateData.occupiedComp,  monthData.occupiedComp  * md, yearData.occupiedComp  * yd],
      ["(F) Total Occupied Rooms (D+E)",      dateData.totalOccupied, monthData.totalOccupied * md, yearData.totalOccupied * yd],
      ["(G) No of Pax - Domestic",            dateData.paxDomestic,   monthData.paxDomestic   * md, yearData.paxDomestic   * yd],
      ["(H) No of Pax - Foreigners",          dateData.paxForeign,    monthData.paxForeign    * md, yearData.paxForeign    * yd],
      ["(I) Total Pax (G+H)",                 dateData.totalPax,      monthData.totalPax      * md, yearData.totalPax      * yd],
      ["(J) No of Adults",                    dateData.adults,        monthData.adults        * md, yearData.adults        * yd],
      ["(K) No of Children",                  dateData.children,      monthData.children      * md, yearData.children      * yd],
      ["(L) No of Males",                     dateData.males,         monthData.males         * md, yearData.males         * yd],
      ["(M) No of Females",                   dateData.females,       monthData.females       * md, yearData.females       * yd],
      ["(N) No Shows",                        dateData.noShows,       monthData.noShows       * md, yearData.noShows       * yd],
      ["(O) % of Occupancy (D/A)%",           dateData.occPercent,    monthData.occPercent,         yearData.occPercent],
      ["(P) ARR (Total Rooms)",               dateData.arrTotalRooms,    monthData.arrTotalRooms,    yearData.arrTotalRooms],
      ["(Q) ARR (Saleable Rooms)",            dateData.arrSaleableRooms, monthData.arrSaleableRooms, yearData.arrSaleableRooms],
      ["(R) ARR (Occupied Rooms)",            dateData.arrOccupiedRooms, monthData.arrOccupiedRooms, yearData.arrOccupiedRooms],
      [],
      ["ROOM REVENUE"],
      ["Apartment Charges (Accrued)", dateData.roomApartment, monthData.roomApartment * md, yearData.roomApartment * yd],
      ["Extra Bed Charges (Accrued)", dateData.roomExtraBed,  monthData.roomExtraBed  * md, yearData.roomExtraBed  * yd],
      ["Total : ROOM REVENUE",        dateData.roomTotal,     monthData.roomTotal     * md, yearData.roomTotal     * yd],
      [],
      ["F&B REVENUE"],
      ["Plan Rate (Accrued)",     dateData.fbPlanRate,    monthData.fbPlanRate    * md, yearData.fbPlanRate    * yd],
      ["Rustic Room Service",     dateData.fbRoomService, monthData.fbRoomService * md, yearData.fbRoomService * yd],
      ["Rustic Barn Restaurant",  dateData.fbRestaurant,  monthData.fbRestaurant  * md, yearData.fbRestaurant  * yd],
      ["Total : F&B REVENUE",     dateData.fbTotal,       monthData.fbTotal       * md, yearData.fbTotal       * yd],
      [],
      ["OTHER REVENUES"],
      ["MOD REVENUES", dateData.modRevenues, monthData.modRevenues * md, yearData.modRevenues * yd],
      ["Grand Total",  dateData.grandTotal,  monthData.grandTotal  * md, yearData.grandTotal  * yd],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [44, 20, 20, 28].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Flash Report");
    XLSX.writeFile(wb, `hotel-flash-report-${today}.xlsx`);
  };

  // ── Formatting ─────────────────────────────────────────────────
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const pad = (n) => String(n).padStart(2, "0");
  const monthName = new Date(`${selectedYear}-${pad(selectedMonth)}-01`)
    .toLocaleString("en-GB", { month: "long" });

  // Year dropdown: current year and 4 previous years
  const yearOptions = Array.from({ length: 5 }, (_, i) => getCurrentYear() - i);

  // Reset row index before each render of the table
  _rowIndex = 0;

  const md = monthData?.fullMonthDays || 1;
  const yd = fiscalYearDays;

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <TitleDiv title="HOTEL FLASH REPORT" />

      <div style={{ padding: 20, fontFamily: "Segoe UI, sans-serif", background: "#f5f6fa", minHeight: "100vh" }}>

        {/* ── FILTER BAR ── */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-sm font-bold uppercase tracking-tight text-slate-800 md:text-base">
              Hotel Flash Report
            </h1>
            <div className="flex flex-wrap items-end gap-2">

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                />
              </div>

              {/* Month */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                >
                  {["January","February","March","April","May","June",
                    "July","August","September","October","November","December"]
                    .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                </select>
              </div>

              {/* Year — simple calendar years e.g. 2026, 2025, 2024 … */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Financial Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="h-9 w-32 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => { fetchDateReport(); fetchMonthReport(); fetchYearReport(); }}
                disabled={loading}
                className="h-9 rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-70"
              >
                {loading ? "Loading…" : "Refresh"}
              </button>
              <button
                onClick={exportToExcel}
                disabled={!dateData || !monthData || !yearData}
                className="h-9 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Excel
              </button>
              <button
                onClick={exportToPDF}
                disabled={!dateData || !monthData || !yearData}
                className="h-9 rounded-lg bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: "#555" }}>Loading all reports…</div>
        )}

        {/* ── COMPARISON TABLE ── */}
        {!loading && !error && dateData && monthData && yearData && (
          <div style={{ marginBottom: 28, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>

            {/* Table header bar */}
            <div style={{ background: "#eef2f7", padding: "10px 14px", borderBottom: "1px solid #dde3ee" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1a3a5c" }}>
                {dateData.companyName}
              </span>
              <span style={{ float: "right", fontSize: 12, color: "#666" }}>
                Date: {formatDate(selectedDate)}
                &nbsp;|&nbsp;Month: {monthName} {selectedYear} ({monthData.fullMonthDays} days)
                &nbsp;|&nbsp;{getFiscalYearLabel(selectedYear)}
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <TH>Particulars</TH>
                    <TH right>Date</TH>
                    <TH right>Month ({monthData.fullMonthDays} days)</TH>
                    <TH right>Year ({yd} days)</TH>
                  </tr>
                </thead>
                <tbody>

                  {/* ── ROOM STATISTICS ── */}
                  <SectionHeader title="ROOM STATISTICS:-" />
                  {/* Count fields → multiply by day factors */}
                  <TDRow label="(A) Total Rooms"                     d={dateData.totalRooms}    m={monthData.totalRooms    * md} y={yearData.totalRooms    * yd} />
                  <TDRow label="(B) Blocked Rooms"                   d={dateData.blockedRooms}  m={monthData.blockedRooms  * md} y={yearData.blockedRooms  * yd} />
                  <TDRow label="(C) Total Saleable (A-B)"            d={dateData.saleableRooms} m={monthData.saleableRooms * md} y={yearData.saleableRooms * yd} />
                  <TDRow label="(D) Occupied Rooms (Paid)"           d={dateData.occupiedPaid}  m={monthData.occupiedPaid}  y={yearData.occupiedPaid} />
                  <TDRow label="(E) Occupied Rooms (Comp/House Use)" d={dateData.occupiedComp}  m={monthData.occupiedComp} y={yearData.occupiedComp} />
                  <TDRow label="(F) Total Occupied Rooms (D+E)"      d={dateData.totalOccupied} m={monthData.totalOccupied} y={yearData.totalOccupied } />
                  <TDRow label="(G) No of Pax - Domestic"            d={dateData.paxDomestic}   m={monthData.paxDomestic} y={yearData.paxDomestic   } />
                  <TDRow label="(H) No of Pax - Foreigners"          d={dateData.paxForeign}    m={monthData.paxForeign   } y={yearData.paxForeign    } />
                  <TDRow label="(I) Total Pax (G+H)"                 d={dateData.totalPax}      m={monthData.totalPax } y={yearData.totalPax      } />
                  <TDRow label="(J) No of Adults"                    d={dateData.adults}        m={monthData.adults        } y={yearData.adults        } />
                  <TDRow label="(K) No of Children"                  d={dateData.children}      m={monthData.children      } y={yearData.children      } />
                  <TDRow label="(L) No of Males"                     d={dateData.males}         m={monthData.males         } y={yearData.males         } />
                  <TDRow label="(M) No of Females"                   d={dateData.females}       m={monthData.females       } y={yearData.females       } />
                  <TDRow label="(N) No Shows"                        d={dateData.noShows}       m={monthData.noShows       } y={yearData.noShows       } />
                  {/* Rate / average fields → NOT multiplied */}
                  <TDRow label="(O) % of Occupancy (D/A)%"   d={dateData.occPercent}       m={monthData.occPercent}       y={yearData.occPercent}       isPercent />
                  <TDRow label="(P) ARR (Total Rooms)"        d={dateData.arrTotalRooms}    m={monthData.arrTotalRooms}    y={yearData.arrTotalRooms} />
                  <TDRow label="(Q) ARR (Saleable Rooms)"     d={dateData.arrSaleableRooms} m={monthData.arrSaleableRooms} y={yearData.arrSaleableRooms} />
                  <TDRow label="(R) ARR (Occupied Rooms)"     d={dateData.arrOccupiedRooms} m={monthData.arrOccupiedRooms} y={yearData.arrOccupiedRooms} />

                  {/* ── ROOM REVENUE ── */}
                  <SectionHeader title="ROOM REVENUE" />
                  <TDRow label="Apartment Charges (Accrued)" d={dateData.roomApartment} m={monthData.roomApartment } y={yearData.roomApartment } />
                  <TDRow label="Extra Bed Charges (Accrued)" d={dateData.roomExtraBed}  m={monthData.roomExtraBed  } y={yearData.roomExtraBed  } />
                  <TDRow label="Total : ROOM REVENUE"        d={dateData.roomTotal}     m={monthData.roomTotal     } y={yearData.roomTotal     } bold />

                  {/* ── F&B REVENUE ── */}
                  <SectionHeader title="F&B REVENUE" />
                  <TDRow label="Plan Rate (Accrued)"     d={dateData.fbPlanRate}    m={monthData.fbPlanRate    } y={yearData.fbPlanRate  } />
                  <TDRow label="Rustic Room Service"     d={dateData.fbRoomService} m={monthData.fbRoomService } y={yearData.fbRoomService } />
                  <TDRow label="Rustic Barn Restaurant"  d={dateData.fbRestaurant}  m={monthData.fbRestaurant  } y={yearData.fbRestaurant  } />
                  <TDRow label="Total : F&B REVENUE"     d={dateData.fbTotal}       m={monthData.fbTotal       } y={yearData.fbTotal       } bold />

                  {/* ── OTHER REVENUES ── */}
                  <SectionHeader title="OTHER REVENUES" />
                  <TDRow label="MOD REVENUES" d={dateData.modRevenues} m={monthData.modRevenues } y={yearData.modRevenues } />
                  <TDRow label="Grand Total"  d={dateData.grandTotal}  m={monthData.grandTotal  } y={yearData.grandTotal  } bold />

                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Individual loading states */}
        {!loading && !dateData  && <div style={{ padding: 30, textAlign: "center", color: "#888" }}>Loading Date report…</div>}
        {!loading && !monthData && <div style={{ padding: 30, textAlign: "center", color: "#888" }}>Loading Month report…</div>}
        {!loading && !yearData  && <div style={{ padding: 30, textAlign: "center", color: "#888" }}>Loading Year report…</div>}

      </div>
    </>
  );
}