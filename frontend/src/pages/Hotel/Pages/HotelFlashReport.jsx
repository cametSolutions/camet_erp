import React, { useState } from "react";
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

  const [fromDate, setFromDate] = useState(today);
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 p-4 md:p-6">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hotel Flash Report
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Select from date and to date, then load the report.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={fetchReport}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load Report"}
              </button>

              <button
                onClick={handlePrint}
                disabled={!reportData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Print
              </button>

              <button
                onClick={handleExportExcel}
                disabled={!reportData}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {error}
            </div>
          )}

          {!reportData && !loading && !error && (
            <div className="py-16 text-center text-gray-500">
              Select the date range and click Load Report
            </div>
          )}

          {reportData && (
            <div className="max-w-5xl mx-auto bg-white border border-gray-300 shadow-sm">
              <div className="px-6 pt-6 text-center">
                <h2 className="text-3xl font-bold uppercase text-gray-900">
                  {reportData.companyName}
                </h2>
                <p className="text-base font-semibold text-gray-800 underline">
                  Hotel Flash Report
                </p>
              </div>

              <div className="px-6 pt-4 pb-2 text-sm text-gray-700">
                Report From {formatDate(reportData.fromDate)} To{" "}
                {formatDate(reportData.toDate)}
              </div>

              <div className="px-6 pb-6 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-t border-b-2 border-gray-400">
                      <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                        Particulars
                      </th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                        {reportData.dayLabel}
                      </th>
                      <th className="px-3 py-2 text-right text-sm font-semibold text-gray-900">
                        {reportData.monthLabel}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td colSpan="3" className="px-3 py-3 text-sm font-bold text-gray-900">
                        ROOM STATISTICS:-
                      </td>
                    </tr>
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

                    <tr>
                      <td colSpan="3" className="px-3 py-3 text-sm font-bold text-gray-900">
                        ROOM REVENUE
                      </td>
                    </tr>
                    <DataRow label="Apartment Charges (Accrued)" d={reportData.roomApartment} m={reportData.roomApartment} />
                    <DataRow label="Extra Bed Charges (Accrued)" d={reportData.roomExtraBed} m={reportData.roomExtraBed} />
                    <DataRow label="Total : ROOM REVENUE" d={reportData.roomTotal} m={reportData.roomTotal} bold />

                    <tr>
                      <td colSpan="3" className="px-3 py-3 text-sm font-bold text-gray-900">
                        F&B REVENUE
                      </td>
                    </tr>
                    <DataRow label="Plan Rate (Accrued)" d={reportData.fbPlanRate} m={reportData.fbPlanRate} />
                    <DataRow label="Rustic Room Service" d={reportData.fbRoomService} m={reportData.fbRoomService} />
                    <DataRow label="Rustic Barn Restaurant" d={reportData.fbRestaurant} m={reportData.fbRestaurant} />
                    <DataRow label="Total : F&B REVENUE" d={reportData.fbTotal} m={reportData.fbTotal} bold />

                    <tr>
                      <td colSpan="3" className="px-3 py-3 text-sm font-bold text-gray-900">
                        OTHER REVENUES
                      </td>
                    </tr>
                    <DataRow label="MOD REVENUES" d={reportData.modRevenues} m={reportData.modRevenues} />
                    <DataRow label="Grand Total" d={reportData.grandTotal} m={reportData.grandTotal} bold />
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelFlashReportPage;