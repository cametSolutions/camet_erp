import React, { useState ,useEffect } from "react";
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
import api from "../../../api/api";
import { useSelector } from "react-redux";

Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  border: {
    border: "1px solid black",
    padding: 15,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
  },
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
  col1: { width: "66%", paddingLeft: 5 },
  col2: { width: "17%", textAlign: "right", paddingRight: 5 },
  col3: { width: "17%", textAlign: "right", paddingRight: 5 },
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

const formatNumber = (v, isPercent = false) => {
  const n = Number(v || 0);
  if (isPercent) return `${n.toFixed(2)}%`;
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const Row = ({ label, d, m, isPercent }) => (
  <View style={pdfStyles.tableRow}>
    <Text style={pdfStyles.col1}>{label}</Text>
    <Text style={pdfStyles.col2}>{formatNumber(d, isPercent)}</Text>
    <Text style={pdfStyles.col3}>{formatNumber(m, isPercent)}</Text>
  </View>
);

const TotalRow = ({ label, d, m }) => (
  <View style={pdfStyles.totalRow}>
    <Text style={pdfStyles.col1}>{label}</Text>
    <Text style={pdfStyles.col2}>{formatNumber(d)}</Text>
    <Text style={pdfStyles.col3}>{formatNumber(m)}</Text>
  </View>
);

const FlashReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.border}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.title}>{data?.companyName}</Text>
          <Text style={pdfStyles.subtitle}>Hotel Flash Report</Text>
        </View>

        <View style={pdfStyles.dateRow}>
          <Text>
            Report From {formatDate(data?.fromDate)} To {formatDate(data?.toDate)}
          </Text>
        </View>

        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.col1}>Particulars</Text>
          <Text style={pdfStyles.col2}>{data?.dayLabel}</Text>
          <Text style={pdfStyles.col3}>{data?.monthLabel}</Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>ROOM STATISTICS:-</Text>
        <Row label="(A) Total Rooms" d={data?.totalRooms} m={data?.totalRooms} />
        <Row label="(B) Blocked Rooms" d={data?.blockedRooms} m={data?.blockedRooms} />
        <Row label="(C) Total Saleable (A-B)" d={data?.saleableRooms} m={data?.saleableRooms} />
        <Row label="(D) Occupied Rooms (Paid)" d={data?.occupiedPaid} m={data?.occupiedPaid} />
        <Row label="(E) Occupied Rooms (Comp/House Use)" d={data?.occupiedComp} m={data?.occupiedComp} />
        <Row label="(F) Total Occupied Rooms (D+E)" d={data?.totalOccupied} m={data?.totalOccupied} />
        <Row label="(G) No of Pax - Domestic" d={data?.paxDomestic} m={data?.paxDomestic} />
        <Row label="(H) No of Pax - Foreigners" d={data?.paxForeign} m={data?.paxForeign} />
        <Row label="(I) Total Pax (G+H)" d={data?.totalPax} m={data?.totalPax} />
        <Row label="(J) No of Adults" d={data?.adults} m={data?.adults} />
        <Row label="(K) No of Children" d={data?.children} m={data?.children} />
        <Row label="(L) No of Males" d={data?.males} m={data?.males} />
        <Row label="(M) No of Females" d={data?.females} m={data?.females} />
        <Row label="(N) No Shows" d={data?.noShows} m={data?.noShows} />
        <Row label="(O) % of Occupancy (D/A)%" d={data?.occPercent} m={data?.occPercent} isPercent />
        <Row label="(P) ARR (Total Rooms)" d={data?.arrTotalRooms} m={data?.arrTotalRooms} />
        <Row label="(Q) ARR (Saleable Rooms)" d={data?.arrSaleableRooms} m={data?.arrSaleableRooms} />
        <Row label="(R) ARR (Occupied Rooms)" d={data?.arrOccupiedRooms} m={data?.arrOccupiedRooms} />

        <Text style={pdfStyles.sectionTitle}>ROOM REVENUE</Text>
        <Row label="Apartment Charges (Accrued)" d={data?.roomApartment} m={data?.roomApartment} />
        <Row label="Extra Bed Charges (Accrued)" d={data?.roomExtraBed} m={data?.roomExtraBed} />
        <TotalRow label="Total : ROOM REVENUE" d={data?.roomTotal} m={data?.roomTotal} />

        <Text style={pdfStyles.sectionTitle}>F&B REVENUE</Text>
        <Row label="Plan Rate (Accrued)" d={data?.fbPlanRate} m={data?.fbPlanRate} />
        <Row label="Rustic Room Service" d={data?.fbRoomService} m={data?.fbRoomService} />
        <Row label="Rustic Barn Restaurant" d={data?.fbRestaurant} m={data?.fbRestaurant} />
        <TotalRow label="Total : F&B REVENUE" d={data?.fbTotal} m={data?.fbTotal} />

        <Text style={pdfStyles.sectionTitle}>OTHER REVENUES</Text>
        <Row label="MOD REVENUES" d={data?.modRevenues} m={data?.modRevenues} />
        <TotalRow label="Grand Total" d={data?.grandTotal} m={data?.grandTotal} />
      </View>
    </Page>
  </Document>
);

const DataRow = ({ label, d, m, isPercent = false, bold = false }) => (
  <tr className="border-b border-gray-200">
    <td className={`px-3 py-2 text-sm text-gray-800 ${bold ? "font-bold" : ""}`}>
      {label}
    </td>
    <td className={`px-3 py-2 text-sm text-right text-gray-800 ${bold ? "font-bold" : ""}`}>
      {formatNumber(d, isPercent)}
    </td>
    <td className={`px-3 py-2 text-sm text-right text-gray-800 ${bold ? "font-bold" : ""}`}>
      {formatNumber(m, isPercent)}
    </td>
  </tr>
);

const HotelFlashReportPage = () => {
  const { _id: cmp_id } =
    useSelector((s) => s.secSelectedOrganization.secSelectedOrg) || {};

 const today = new Date().toISOString().slice(0, 10);

const get29DaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return date.toISOString().slice(0, 10);
};

// Update initial state:
const [fromDate, setFromDate] = useState(get29DaysAgo()); // ✅ was today
const [toDate, setToDate] = useState(today);


  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  
  const fetchReport = async () => {
    if (!cmp_id || !fromDate || !toDate) return;

    if (fromDate > toDate) {
      setError("From Date cannot be greater than To Date");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setReportData(null);

      const res = await api.get("/api/sUsers/flash-report", {
        params: { cmp_id, fromDate, toDate },
      });

      if (res.data.success) {
        setReportData(res.data.data);
      } else {
        setError(res.data.message || "Failed to load flash report");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Error loading flash report"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  fetchReport();
}, []);

  const handlePrint = async () => {
    if (!reportData) return;

    const blob = await pdf(<FlashReportPDF data={reportData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");

    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
      };
    }
  };

  const handleExportExcel = () => {
    if (!reportData) return;

    const d = reportData;

    const rows = [
      [d.companyName || "Hotel"],
      ["Hotel Flash Report"],
      [`Report From ${formatDate(d.fromDate)} To ${formatDate(d.toDate)}`],
      [],
      ["Particulars", d.dayLabel, d.monthLabel],

      ["ROOM STATISTICS:-"],
      ["(A) Total Rooms", d.totalRooms, d.totalRooms],
      ["(B) Blocked Rooms", d.blockedRooms, d.blockedRooms],
      ["(C) Total Saleable(A-B)", d.saleableRooms, d.saleableRooms],
      ["(D) Occupied Rooms(Paid)", d.occupiedPaid, d.occupiedPaid],
      ["(E) Occupied Rooms(Comp/House Use)", d.occupiedComp, d.occupiedComp],
      ["(F) Total Occupied Rooms(D+E)", d.totalOccupied, d.totalOccupied],
      ["(G) No of Pax -Domestic", d.paxDomestic, d.paxDomestic],
      ["(H) No of Pax -Foreigners", d.paxForeign, d.paxForeign],
      ["(I) Total Pax(G+H)", d.totalPax, d.totalPax],
      ["(J) No of Adults", d.adults, d.adults],
      ["(K) No of Children", d.children, d.children],
      ["(L) No of Males", d.males, d.males],
      ["(M) No of Females", d.females, d.females],
      ["(N) No Shows", d.noShows, d.noShows],
      ["(O) % of Occupancy(D/A)%", d.occPercent, d.occPercent],
      ["(P) ARR(Total Rooms)", d.arrTotalRooms, d.arrTotalRooms],
      ["(Q) ARR(Saleable Rooms)", d.arrSaleableRooms, d.arrSaleableRooms],
      ["(R) ARR(Occupied Rooms)", d.arrOccupiedRooms, d.arrOccupiedRooms],

      [],
      ["ROOM REVENUE"],
      ["Apartment Charges (Accrued)", d.roomApartment, d.roomApartment],
      ["Extra Bed Charges (Accrued)", d.roomExtraBed, d.roomExtraBed],
      ["Total : ROOM REVENUE", d.roomTotal, d.roomTotal],

      [],
      ["F&B REVENUE"],
      ["Plan Rate (Accrued)", d.fbPlanRate, d.fbPlanRate],
      ["Rustic Room Service", d.fbRoomService, d.fbRoomService],
      ["Rustic Barn Restaurant", d.fbRestaurant, d.fbRestaurant],
      ["Total : F&B REVENUE", d.fbTotal, d.fbTotal],

      [],
      ["OTHER REVENUES"],
      ["MOD REVENUES", d.modRevenues, d.modRevenues],
      ["Grand Total", d.grandTotal, d.grandTotal],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Flash Report");
    XLSX.writeFile(wb, `Hotel-Flash-Report-${d.fromDate}-to-${d.toDate}.xlsx`);
  };

return (
  <div className="min-h-screen bg-slate-100 p-3 md:p-6 print:bg-white print:p-0">
    <div className="mx-auto max-w-7xl">

      {/* Toolbar */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Hotel Flash Report
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Select date range and load the report
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:w-auto">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-600"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-600"
              />
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <button
                onClick={fetchReport}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Loading..." : "Get Report"}
              </button>

              <button
                onClick={handlePrint}
                disabled={!reportData}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Print
              </button>

              <button
                onClick={handleExportExcel}
                disabled={!reportData}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 print:hidden">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!reportData && !loading && !error && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-slate-500 shadow-sm">
          Select the date range and click Get Report
        </div>
      )}

      {/* Report */}
      {reportData && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-4 print:shadow-none md:p-7">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold uppercase text-slate-900 md:text-3xl">
              {reportData.companyName}
            </h2>
            <p className="text-base font-semibold text-slate-700 underline">
              Hotel Flash Report
            </p>
          </div>

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between text-sm text-slate-700">
            <div>
              Report From {formatDate(reportData.fromDate)} To {formatDate(reportData.toDate)}
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-medium text-slate-500">Print Date & Time</p>
              <p className="text-sm font-semibold text-slate-800">
                {new Date().toLocaleDateString("en-GB")} {new Date().toLocaleTimeString("en-GB")}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y-[3px] border-slate-800">
                  <th className="px-3 py-2 text-left font-bold text-slate-900">Particulars</th>
                  <th className="px-3 py-2 text-right font-bold text-slate-900">{reportData.dayLabel}</th>
                  <th className="px-3 py-2 text-right font-bold text-slate-900">{reportData.monthLabel}</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="3" className="px-3 py-3 text-sm font-bold text-slate-900">ROOM STATISTICS:-</td></tr>
                <DataRow label="(A) Total Rooms" d={reportData.totalRooms} m={reportData.totalRooms} />
                <DataRow label="(B) Blocked Rooms" d={reportData.blockedRooms} m={reportData.blockedRooms} />
                <DataRow label="(C) Total Saleable (A-B)" d={reportData.saleableRooms} m={reportData.saleableRooms} />
                <DataRow label="(D) Occupied Rooms (Paid)" d={reportData.occupiedPaid} m={reportData.occupiedPaid} />
                <DataRow label="(E) Occupied Rooms (Comp/House Use)" d={reportData.occupiedComp} m={reportData.occupiedComp} />
                <DataRow label="(F) Total Occupied Rooms (D+E)" d={reportData.totalOccupied} m={reportData.totalOccupied} />
                <DataRow label="(G) No of Pax - Domestic" d={reportData.paxDomestic} m={reportData.paxDomestic} />
                <DataRow label="(H) No of Pax - Foreigners" d={reportData.paxForeign} m={reportData.paxForeign} />
                <DataRow label="(I) Total Pax (G+H)" d={reportData.totalPax} m={reportData.totalPax} />
                <DataRow label="(J) No of Adults" d={reportData.adults} m={reportData.adults} />
                <DataRow label="(K) No of Children" d={reportData.children} m={reportData.children} />
                <DataRow label="(L) No of Males" d={reportData.males} m={reportData.males} />
                <DataRow label="(M) No of Females" d={reportData.females} m={reportData.females} />
                <DataRow label="(N) No Shows" d={reportData.noShows} m={reportData.noShows} />
                <DataRow label="(O) % of Occupancy (D/A)%" d={reportData.occPercent} m={reportData.occPercent} isPercent />
                <DataRow label="(P) ARR (Total Rooms)" d={reportData.arrTotalRooms} m={reportData.arrTotalRooms} />
                <DataRow label="(Q) ARR (Saleable Rooms)" d={reportData.arrSaleableRooms} m={reportData.arrSaleableRooms} />
                <DataRow label="(R) ARR (Occupied Rooms)" d={reportData.arrOccupiedRooms} m={reportData.arrOccupiedRooms} />

                <tr><td colSpan="3" className="px-3 py-3 text-sm font-bold text-slate-900">ROOM REVENUE</td></tr>
                <DataRow label="Apartment Charges (Accrued)" d={reportData.roomApartment} m={reportData.roomApartment} />
                <DataRow label="Extra Bed Charges (Accrued)" d={reportData.roomExtraBed} m={reportData.roomExtraBed} />
                <DataRow label="Total : ROOM REVENUE" d={reportData.roomTotal} m={reportData.roomTotal} bold />

                <tr><td colSpan="3" className="px-3 py-3 text-sm font-bold text-slate-900">F&B REVENUE</td></tr>
                <DataRow label="Plan Rate (Accrued)" d={reportData.fbPlanRate} m={reportData.fbPlanRate} />
                <DataRow label="Rustic Room Service" d={reportData.fbRoomService} m={reportData.fbRoomService} />
                <DataRow label="Rustic Barn Restaurant" d={reportData.fbRestaurant} m={reportData.fbRestaurant} />
                <DataRow label="Total : F&B REVENUE" d={reportData.fbTotal} m={reportData.fbTotal} bold />

                <tr><td colSpan="3" className="px-3 py-3 text-sm font-bold text-slate-900">OTHER REVENUES</td></tr>
                <DataRow label="MOD REVENUES" d={reportData.modRevenues} m={reportData.modRevenues} />
                <DataRow label="Grand Total" d={reportData.grandTotal} m={reportData.grandTotal} bold />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default HotelFlashReportPage;