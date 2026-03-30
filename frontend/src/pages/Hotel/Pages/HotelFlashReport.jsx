// HotelFlashReportWithPreview.jsx
import React, { useEffect, useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  pdf,
} from "@react-pdf/renderer";
import * as XLSX from "xlsx";
import api from "../../../api/api"; // adjust path
import { useSelector } from "react-redux";

// Optional font
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

// ====== PDF styles ======
const styles = StyleSheet.create({
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

// ====== helpers ======
const formatNumber = (v) =>
  typeof v === "number"
    ? v.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// table rows
const Row = ({ label, d, m, isPercent }) => (
  <View style={styles.tableRow}>
    <Text style={styles.col1}>{label}</Text>
    <Text style={styles.col2}>
      {formatNumber(d)}
      {isPercent && d !== undefined ? "%" : ""}
    </Text>
    <Text style={styles.col3}>
      {formatNumber(m)}
      {isPercent && m !== undefined ? "%" : ""}
    </Text>
  </View>
);

const TotalRow = ({ label, d, m }) => (
  <View style={styles.totalRow}>
    <Text style={styles.col1}>{label}</Text>
    <Text style={styles.col2}>{formatNumber(d)}</Text>
    <Text style={styles.col3}>{formatNumber(m)}</Text>
  </View>
);

// ====== PDF document ======
const FlashReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.border}>
        <View style={styles.header}>
          <Text style={styles.title}>{data?.companyName}</Text>
          <Text style={styles.subtitle}>Hotel Flash Report</Text>
        </View>

        <View style={styles.dateRow}>
          <Text>
            Report From {formatDate(data?.fromDate)} To {formatDate(data?.toDate)}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Particulars</Text>
          <Text style={styles.col2}>{data?.dayLabel}</Text>
          <Text style={styles.col3}>{data?.monthLabel}</Text>
        </View>

        {/* ROOM STATISTICS */}
        <Text style={styles.sectionTitle}>ROOM STATISTICS:-</Text>
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
        <Row
          label="(O) % of Occupancy (D/A)%"
          d={data?.occPercent}
          m={data?.occPercent}
          isPercent
        />
        <Row label="(P) ARR (Total Rooms)" d={data?.arrTotalRooms} m={data?.arrTotalRooms} />
        <Row label="(Q) ARR (Saleable Rooms)" d={data?.arrSaleableRooms} m={data?.arrSaleableRooms} />
        <Row label="(R) ARR (Occupied Rooms)" d={data?.arrOccupiedRooms} m={data?.arrOccupiedRooms} />

        {/* ROOM REVENUE */}
        <Text style={styles.sectionTitle}>ROOM REVENUE</Text>
        <Row
          label="Apartment Charges (Accrued)"
          d={data?.roomApartment}
          m={data?.roomApartment}
        />
        <Row
          label="Extra Bed Charges (Accrued)"
          d={data?.roomExtraBed}
          m={data?.roomExtraBed}
        />
        <TotalRow label="Total : ROOM REVENUE" d={data?.roomTotal} m={data?.roomTotal} />

        {/* F&B REVENUE */}
        <Text style={styles.sectionTitle}>F&B REVENUE</Text>
        <Row label="Plan Rate (Accrued)" d={data?.fbPlanRate} m={data?.fbPlanRate} />
        <Row label="Rustic Room Service" d={data?.fbRoomService} m={data?.fbRoomService} />
        <Row label="Rustic Barn Restaurant" d={data?.fbRestaurant} m={data?.fbRestaurant} />
        <TotalRow label="Total : F&B REVENUE" d={data?.fbTotal} m={data?.fbTotal} />

        {/* OTHER REVENUES */}
        <Text style={styles.sectionTitle}>OTHER REVENUES</Text>
        <Row label="MOD REVENUES" d={data?.modRevenues} m={data?.modRevenues} />
        <TotalRow label="Grand Total" d={data?.grandTotal} m={data?.grandTotal} />
      </View>
    </Page>
  </Document>
);

// ====== MAIN COMPONENT: CALL API + SHOW PREVIEW MODAL ======
const HotelFlashReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { _id: cmp_id } =
    useSelector((s) => s.secSelectedOrganization.secSelectedOrg) || {};

  // put your date selector or just use today
  const today = new Date().toISOString().slice(0, 10);

  // call backend API inside this component
  useEffect(() => {
    if (!cmp_id) return;
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/sUsers/flash-report", {
          params: { cmp_id, date: today },
        });
        if (res.data.success) {
          setReportData(res.data.data);
          setShowPreview(true); // open preview automatically
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
    fetchReport();
  }, [cmp_id, today]);

  // print current PDF
  const handlePrint = async () => {
    if (!reportData) return;
    const blob = await pdf(<FlashReportPDF data={reportData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
      };
    }
  };

  // export current data to Excel (same structure as your sheet)
  const handleExportExcel = () => {
    if (!reportData) return;
    const d = reportData;
    const rows = [
      [d.companyName || "Hotel"], // title
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
    XLSX.writeFile(wb, `Hotel-Flash-Report-${d.fromDate}.xlsx`);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading flash report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        {error}
      </div>
    );
  }

  if (!reportData || !showPreview) return null;

  // only preview modal, no extra "open" button
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* header */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Hotel Flash Report Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Print
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-amber-500 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Export to Excel
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        {/* PDF preview */}
        <div className="flex-1 overflow-hidden">
          <PDFViewer width="100%" height="100%" showToolbar={true}>
            <FlashReportPDF data={reportData} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
};

export default HotelFlashReport;
