import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const today = new Date().toISOString().split("T")[0];

const getFiscalYearDays = (selectedYear) => {
  const year = parseInt(selectedYear, 10);
  const fiscalStart = new Date(year, 3, 1);
  const fiscalEnd = new Date(year + 1, 2, 31);
  const todayDate = new Date();

  if (todayDate < fiscalStart) return 1;

  if (todayDate >= fiscalEnd) {
    const diffMs = fiscalEnd - fiscalStart;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  const diffMs = todayDate - fiscalStart;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
};

const getFiscalYearLabel = (selectedYear) => {
  const year = parseInt(selectedYear, 10);
  const fiscalStart = new Date(year, 3, 1);
  const fiscalEnd = new Date(year + 1, 2, 31);
  const todayDate = new Date();
  const days = getFiscalYearDays(selectedYear);

  const fmtDate = (d) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const endLabel = todayDate < fiscalEnd ? fmtDate(todayDate) : fmtDate(fiscalEnd);
  return `FY ${year} (${fmtDate(fiscalStart)} – ${endLabel} · ${days} days)`;
};

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
      position: "sticky",
      top: 0,
      zIndex: 1,
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
      style={{
        padding: "9px 10px",
        fontWeight: 700,
        fontSize: 12,
        color: "#1a3a5c",
      }}
    >
      {title}
    </td>
  </tr>
);

const FlashReportPDF = ({
  dateData,
  monthData,
  yearData,
  selectedYear,
  fiscalYearDays,
}) => {
  const s = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
    border: { border: "1px solid black", padding: 15 },
    header: { textAlign: "center", marginBottom: 10 },
    title: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
    subtitle: { fontSize: 12, fontWeight: "bold", textDecoration: "underline" },
    dateRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 9,
      marginBottom: 10,
      paddingBottom: 5,
      borderBottom: "1px solid #ccc",
    },
    tableHeader: {
      flexDirection: "row",
      borderBottom: "1px solid black",
      paddingBottom: 5,
      marginBottom: 5,
      fontWeight: "bold",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 2,
      borderBottom: "0.5px solid #ddd",
    },
    col1: { width: "40%", paddingLeft: 5 },
    col2: { width: "20%", textAlign: "right", paddingRight: 5 },
    col3: { width: "20%", textAlign: "right", paddingRight: 5 },
    col4: { width: "20%", textAlign: "right", paddingRight: 5 },
    sectionTitle: {
      fontWeight: "bold",
      marginTop: 8,
      marginBottom: 4,
      paddingLeft: 5,
    },
    totalRow: {
      flexDirection: "row",
      paddingVertical: 3,
      borderTop: "1px solid #ccc",
      marginTop: 2,
      fontWeight: "bold",
    },
  });

  const fmtN = (v, isPercent = false) => {
    const n = Number(v || 0);
    return isPercent
      ? `${n.toFixed(2)}%`
      : n.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

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
              {monthData?.selectedYear} | FY {selectedYear} ({fiscalYearDays} days)
            </Text>
          </View>

          <View style={s.tableHeader}>
            <Text style={s.col1}>Particulars</Text>
            <Text style={s.col2}>Date</Text>
            <Text style={s.col3}>Month</Text>
            <Text style={s.col4}>Year</Text>
          </View>

          <Text style={s.sectionTitle}>ROOM STATISTICS</Text>
          <R label="(A) Total Rooms" d={dateData?.totalRooms} m={monthData?.totalRooms} y={yearData?.totalRooms} />
          <R label="(B) Blocked Rooms" d={dateData?.blockedRooms} m={monthData?.blockedRooms} y={yearData?.blockedRooms} />
          <R label="(C) Saleable Rooms (A-B)" d={dateData?.saleableRooms} m={monthData?.saleableRooms} y={yearData?.saleableRooms} />
          <R label="(D) Occupied Rooms (Paid)" d={dateData?.occupiedPaid} m={monthData?.occupiedPaid} y={yearData?.occupiedPaid} />
          <R label="(E) Occupied Rooms (Comp/House Use)" d={dateData?.occupiedComp} m={monthData?.occupiedComp} y={yearData?.occupiedComp} />
          <R label="(F) Total Occupied Rooms (D+E)" d={dateData?.totalOccupied} m={monthData?.totalOccupied} y={yearData?.totalOccupied} />
          <R label="(N) No Shows" d={dateData?.noShows} m={monthData?.noShows} y={yearData?.noShows} />
          <R label="(O) % of Occupancy (D/A)%" d={dateData?.occPercent} m={monthData?.occPercent} y={yearData?.occPercent} isPercent />
          <R label="(P) ARR (Total Rooms)" d={dateData?.arrTotalRooms} m={monthData?.arrTotalRooms} y={yearData?.arrTotalRooms} />
          <R label="(Q) ARR (Saleable Rooms)" d={dateData?.arrSaleableRooms} m={monthData?.arrSaleableRooms} y={yearData?.arrSaleableRooms} />
          <R label="(R) ARR (Occupied Rooms)" d={dateData?.arrOccupiedRooms} m={monthData?.arrOccupiedRooms} y={yearData?.arrOccupiedRooms} />

          <Text style={s.sectionTitle}>GUEST PROFILE</Text>
          <R label="(G) No of Pax - Domestic" d={dateData?.paxDomestic} m={monthData?.paxDomestic} y={yearData?.paxDomestic} />
          <R label="(H) No of Pax - Foreigners" d={dateData?.paxForeign} m={monthData?.paxForeign} y={yearData?.paxForeign} />
          <R label="(I) Total Pax (G+H)" d={dateData?.totalPax} m={monthData?.totalPax} y={yearData?.totalPax} />
          <R label="(J) No of Adults" d={dateData?.adults} m={monthData?.adults} y={yearData?.adults} />
          <R label="(K) No of Children" d={dateData?.children} m={monthData?.children} y={yearData?.children} />
          <R label="(L) No of Males" d={dateData?.males} m={monthData?.males} y={yearData?.males} />
          <R label="(M) No of Females" d={dateData?.females} m={monthData?.females} y={yearData?.females} />

          <Text style={s.sectionTitle}>ROOM REVENUE</Text>
          <R label="Apartment Charges (Accrued)" d={dateData?.roomApartment} m={monthData?.roomApartment} y={yearData?.roomApartment} />
          <R label="Extra Bed Charges (Accrued)" d={dateData?.roomExtraBed} m={monthData?.roomExtraBed} y={yearData?.roomExtraBed} />
          <TR label="Total : ROOM REVENUE" d={dateData?.roomTotal} m={monthData?.roomTotal} y={yearData?.roomTotal} />

          <Text style={s.sectionTitle}>F&B REVENUE</Text>
          <R label="Plan Rate (Accrued)" d={dateData?.fbPlanRate} m={monthData?.fbPlanRate} y={yearData?.fbPlanRate} />
          <R label="Rustic Room Service" d={dateData?.fbRoomService} m={monthData?.fbRoomService} y={yearData?.fbRoomService} />
          <R label="Rustic Barn Restaurant" d={dateData?.fbRestaurant} m={monthData?.fbRestaurant} y={yearData?.fbRestaurant} />
          <TR label="Total : F&B REVENUE" d={dateData?.fbTotal} m={monthData?.fbTotal} y={yearData?.fbTotal} />

          <Text style={s.sectionTitle}>OTHER REVENUES</Text>
          <R label="MOD REVENUES" d={dateData?.modRevenues} m={monthData?.modRevenues} y={yearData?.modRevenues} />
          <TR label="Grand Total" d={dateData?.grandTotal} m={monthData?.grandTotal} y={yearData?.grandTotal} />
        </View>
      </Page>
    </Document>
  );
};

export default function HotelFlashReportPage() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id
  );

  const getCurrentYear = () => new Date().getFullYear();
  const getCurrentMonth = () => new Date().getMonth() + 1;

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const [dateData, setDateData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [yearData, setYearData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const didFirstLoadRef = useRef(false);

  const fiscalYearDays = getFiscalYearDays(selectedYear);

  const loadReports = useCallback(async () => {
    if (!cmp_id) return;

    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const [dateRes, monthRes, yearRes] = await Promise.all([
        api.get("/api/sUsers/flash-report", {
          params: { cmp_id, reportDate: selectedDate },
        }),
        api.get("/api/sUsers/flash-report", {
          params: {
            cmp_id,
            reportMonth: selectedMonth,
            reportYear: selectedYear,
          },
        }),
        api.get("/api/sUsers/flash-report", {
          params: {
            cmp_id,
            reportYear: selectedYear,
          },
        }),
      ]);

      if (currentRequestId !== requestIdRef.current) return;

      if (dateRes?.data?.success) {
        setDateData({ ...dateRes.data.data, selectedDate });
      }

      if (monthRes?.data?.success) {
        const monthName = new Date(
          `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
        ).toLocaleString("en-GB", { month: "long" });

        const monthLastDay = new Date(selectedYear, selectedMonth, 0).getDate();

        setMonthData({
          ...monthRes.data.data,
          selectedMonth,
          selectedYear,
          monthName,
          fullMonthDays: monthLastDay,
        });
      }

      if (yearRes?.data?.success) {
        setYearData({
          ...yearRes.data.data,
          selectedYear,
        });
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      console.error("Flash report load error:", err);
      setError("Failed to load flash report.");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [cmp_id, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!cmp_id) return;

    if (!didFirstLoadRef.current) {
      didFirstLoadRef.current = true;
    }

    loadReports();
  }, [cmp_id, selectedDate, selectedMonth, selectedYear, loadReports]);

  const refreshAllReports = async () => {
    await loadReports();
  };

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
    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  };

  const exportToExcel = () => {
    if (!dateData || !monthData || !yearData) return;

    const rows = [
      ["HOTEL FLASH REPORT - COMPARISON"],
      [dateData.companyName],
      [],
      [
        "Particulars",
        `Date: ${selectedDate}`,
        `Month: ${monthData.monthName} ${selectedYear}`,
        getFiscalYearLabel(selectedYear),
      ],
      [],
      ["ROOM STATISTICS"],
      ["(A) Total Rooms", dateData.totalRooms, monthData.totalRooms, yearData.totalRooms],
      ["(B) Blocked Rooms", dateData.blockedRooms, monthData.blockedRooms, yearData.blockedRooms],
      ["(C) Saleable Rooms (A-B)", dateData.saleableRooms, monthData.saleableRooms, yearData.saleableRooms],
      ["(D) Occupied Rooms (Paid)", dateData.occupiedPaid, monthData.occupiedPaid, yearData.occupiedPaid],
      ["(E) Occupied Rooms (Comp/House Use)", dateData.occupiedComp, monthData.occupiedComp, yearData.occupiedComp],
      ["(F) Total Occupied Rooms (D+E)", dateData.totalOccupied, monthData.totalOccupied, yearData.totalOccupied],
      ["(N) No Shows", dateData.noShows, monthData.noShows, yearData.noShows],
      ["(O) % of Occupancy (D/A)%", dateData.occPercent, monthData.occPercent, yearData.occPercent],
      ["(P) ARR (Total Rooms)", dateData.arrTotalRooms, monthData.arrTotalRooms, yearData.arrTotalRooms],
      ["(Q) ARR (Saleable Rooms)", dateData.arrSaleableRooms, monthData.arrSaleableRooms, yearData.arrSaleableRooms],
      ["(R) ARR (Occupied Rooms)", dateData.arrOccupiedRooms, monthData.arrOccupiedRooms, yearData.arrOccupiedRooms],
      [],
      ["GUEST PROFILE"],
      ["(G) No of Pax - Domestic", dateData.paxDomestic, monthData.paxDomestic, yearData.paxDomestic],
      ["(H) No of Pax - Foreigners", dateData.paxForeign, monthData.paxForeign, yearData.paxForeign],
      ["(I) Total Pax (G+H)", dateData.totalPax, monthData.totalPax, yearData.totalPax],
      ["(J) No of Adults", dateData.adults, monthData.adults, yearData.adults],
      ["(K) No of Children", dateData.children, monthData.children, yearData.children],
      ["(L) No of Males", dateData.males, monthData.males, yearData.males],
      ["(M) No of Females", dateData.females, monthData.females, yearData.females],
      [],
      ["ROOM REVENUE"],
      ["Apartment Charges (Accrued)", dateData.roomApartment, monthData.roomApartment, yearData.roomApartment],
      ["Extra Bed Charges (Accrued)", dateData.roomExtraBed, monthData.roomExtraBed, yearData.roomExtraBed],
      ["Total : ROOM REVENUE", dateData.roomTotal, monthData.roomTotal, yearData.roomTotal],
      [],
      ["F&B REVENUE"],
      ["Plan Rate (Accrued)", dateData.fbPlanRate, monthData.fbPlanRate, yearData.fbPlanRate],
      ["Rustic Room Service", dateData.fbRoomService, monthData.fbRoomService, yearData.fbRoomService],
      ["Rustic Barn Restaurant", dateData.fbRestaurant, monthData.fbRestaurant, yearData.fbRestaurant],
      ["Total : F&B REVENUE", dateData.fbTotal, monthData.fbTotal, yearData.fbTotal],
      [],
      ["OTHER REVENUES"],
      ["MOD REVENUES", dateData.modRevenues, monthData.modRevenues, yearData.modRevenues],
      ["Grand Total", dateData.grandTotal, monthData.grandTotal, yearData.grandTotal],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [44, 20, 20, 28].map((w) => ({ wch: w }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Flash Report");
    XLSX.writeFile(wb, `hotel-flash-report-${today}.xlsx`);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const pad = (n) => String(n).padStart(2, "0");
  const monthName = new Date(
    `${selectedYear}-${pad(selectedMonth)}-01`
  ).toLocaleString("en-GB", { month: "long" });

  const yearOptions = Array.from({ length: 5 }, (_, i) => getCurrentYear() - i);

  _rowIndex = 0;

  return (
    <>
      <TitleDiv title="HOTEL FLASH REPORT" />

      <div
        style={{
          padding: 20,
          fontFamily: "Segoe UI, sans-serif",
          background: "#f5f6fa",
          minHeight: "100vh",
        }}
      >
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-sm font-bold uppercase tracking-tight text-slate-800 md:text-base">
              Hotel Flash Report
            </h1>

            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(e) => {
                    setError("");
                    setSelectedDate(e.target.value);
                  }}
                  className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setError("");
                    setSelectedMonth(Number(e.target.value));
                  }}
                  className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                >
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Financial Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setError("");
                    setSelectedYear(Number(e.target.value));
                  }}
                  className="h-9 w-32 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={refreshAllReports}
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

        {error && (
          <div
            style={{
              padding: 12,
              background: "#fee2e2",
              color: "#b91c1c",
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {loading && !dateData && !monthData && !yearData && (
          <div style={{ padding: 30, textAlign: "center", color: "#555" }}>
            Loading flash report…
          </div>
        )}

        {!error && dateData && monthData && yearData && (
          <div
            style={{
              marginBottom: 28,
              background: "#fff",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{
                background: "#eef2f7",
                padding: "10px 14px",
                borderBottom: "1px solid #dde3ee",
              }}
            >
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
                    <TH right>Year ({fiscalYearDays} days)</TH>
                  </tr>
                </thead>

                <tbody>
                  <SectionHeader title="ROOM STATISTICS" />
                  <TDRow label="(A) Total Rooms" d={dateData.totalRooms} m={monthData.totalRooms} y={yearData.totalRooms} />
                  <TDRow label="(B) Blocked Rooms" d={dateData.blockedRooms} m={monthData.blockedRooms} y={yearData.blockedRooms} />
                  <TDRow label="(C) Saleable Rooms (A-B)" d={dateData.saleableRooms} m={monthData.saleableRooms} y={yearData.saleableRooms} />
                  <TDRow label="(D) Occupied Rooms (Paid)" d={dateData.occupiedPaid} m={monthData.occupiedPaid} y={yearData.occupiedPaid} />
                  <TDRow label="(E) Occupied Rooms (Comp/House Use)" d={dateData.occupiedComp} m={monthData.occupiedComp} y={yearData.occupiedComp} />
                  <TDRow label="(F) Total Occupied Rooms (D+E)" d={dateData.totalOccupied} m={monthData.totalOccupied} y={yearData.totalOccupied} bold />
                  <TDRow label="(N) No Shows" d={dateData.noShows} m={monthData.noShows} y={yearData.noShows} />
                  <TDRow label="(O) % of Occupancy (D/A)%" d={dateData.occPercent} m={monthData.occPercent} y={yearData.occPercent} isPercent bold />
                  <TDRow label="(P) ARR (Total Rooms)" d={dateData.arrTotalRooms} m={monthData.arrTotalRooms} y={yearData.arrTotalRooms} />
                  <TDRow label="(Q) ARR (Saleable Rooms)" d={dateData.arrSaleableRooms} m={monthData.arrSaleableRooms} y={yearData.arrSaleableRooms} />
                  <TDRow label="(R) ARR (Occupied Rooms)" d={dateData.arrOccupiedRooms} m={monthData.arrOccupiedRooms} y={yearData.arrOccupiedRooms} bold />

                  <SectionHeader title="GUEST PROFILE" />
                  <TDRow label="(G) No of Pax - Domestic" d={dateData.paxDomestic} m={monthData.paxDomestic} y={yearData.paxDomestic} />
                  <TDRow label="(H) No of Pax - Foreigners" d={dateData.paxForeign} m={monthData.paxForeign} y={yearData.paxForeign} />
                  <TDRow label="(I) Total Pax (G+H)" d={dateData.totalPax} m={monthData.totalPax} y={yearData.totalPax} bold />
                  <TDRow label="(J) No of Adults" d={dateData.adults} m={monthData.adults} y={yearData.adults} />
                  <TDRow label="(K) No of Children" d={dateData.children} m={monthData.children} y={yearData.children} />
                  <TDRow label="(L) No of Males" d={dateData.males} m={monthData.males} y={yearData.males} />
                  <TDRow label="(M) No of Females" d={dateData.females} m={monthData.females} y={yearData.females} />

                  <SectionHeader title="ROOM REVENUE" />
                  <TDRow label="Apartment Charges (Accrued)" d={dateData.roomApartment} m={monthData.roomApartment} y={yearData.roomApartment} />
                  <TDRow label="Extra Bed Charges (Accrued)" d={dateData.roomExtraBed} m={monthData.roomExtraBed} y={yearData.roomExtraBed} />
                  <TDRow label="Total : ROOM REVENUE" d={dateData.roomTotal} m={monthData.roomTotal} y={yearData.roomTotal} bold />

                  <SectionHeader title="F&B REVENUE" />
                  <TDRow label="Plan Rate (Accrued)" d={dateData.fbPlanRate} m={monthData.fbPlanRate} y={yearData.fbPlanRate} />
                  <TDRow label="Rustic Room Service" d={dateData.fbRoomService} m={monthData.fbRoomService} y={yearData.fbRoomService} />
                  <TDRow label="Rustic Barn Restaurant" d={dateData.fbRestaurant} m={monthData.fbRestaurant} y={yearData.fbRestaurant} />
                  <TDRow label="Total : F&B REVENUE" d={dateData.fbTotal} m={monthData.fbTotal} y={yearData.fbTotal} bold />

                  <SectionHeader title="OTHER REVENUES" />
                  <TDRow label="MOD REVENUES" d={dateData.modRevenues} m={monthData.modRevenues} y={yearData.modRevenues} />
                  <TDRow label="Grand Total" d={dateData.grandTotal} m={monthData.grandTotal} y={yearData.grandTotal} bold />
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}