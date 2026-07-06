import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api";
import { Card } from "@/components/ui/card";

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB");
};

const toNumber = (value) => Number(value || 0);

const theme = {
  colors: {
    bg: "#f1f5f9",
    card: "#ffffff",
    border: "#dbe3ea",
    text: "#0f172a",
    muted: "#64748b",
    heading: "#0f172a",
    primary: "#0f766e",
    secondary: "#334155",
    success: "#166534",
    white: "#ffffff",
    rowAlt: "#f8fafc",
    totalBg: "#ecfdf5",
    headerBg: "#f8fafc",
  },
  radius: {
    md: 10,
    lg: 14,
  },
  shadow: {
    card: "0 1px 2px rgba(16,24,40,0.05), 0 8px 24px rgba(16,24,40,0.06)",
  },
  font: {
    family: `"Inter", "Segoe UI", sans-serif`,
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
  },
};

const inputStyle = (width = 170) => ({
  width,
  height: 36,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: 8,
  padding: "0 10px",
  background: "#fff",
  outline: "none",
  fontSize: theme.font.sm,
  color: theme.colors.text,
});

const buttonStyle = (variant = "primary") => {
  const variants = {
    primary: {
      background: theme.colors.primary,
      color: theme.colors.white,
      border: `1px solid ${theme.colors.primary}`,
    },
    secondary: {
      background: theme.colors.card,
      color: theme.colors.secondary,
      border: `1px solid ${theme.colors.border}`,
    },
    success: {
      background: theme.colors.card,
      color: theme.colors.success,
      border: `1px solid ${theme.colors.border}`,
    },
  };

  return {
    height: 36,
    minWidth: 92,
    padding: "0 12px",
    borderRadius: 8,
    fontSize: theme.font.sm,
    fontWeight: 600,
    cursor: "pointer",
    ...variants[variant],
  };
};

export default function FOSalesSummaryReport() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id,
  );

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const fetchReport = async () => {
    try {
      if (!cmp_id) return;
      if (fromDate > toDate) {
        alert("From date cannot be greater than To date");
        return;
      }

      setLoading(true);
      const res = await api.get("/api/sUsers/fo-sales-summary", {
        params: { cmp_id, fromDate, toDate },
      });
      setReportData(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cmp_id) fetchReport();
  }, [cmp_id]);

  const filteredData = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    if (!searchText) return reportData;

    return reportData.filter((row) => {
      return (
        row.guestName?.toLowerCase().includes(searchText) ||
        row.agentName?.toLowerCase().includes(searchText) ||
        row.billNo?.toLowerCase().includes(searchText) ||
        String(row.grcNo || "")
          .toLowerCase()
          .includes(searchText) ||
        row.room?.toLowerCase().includes(searchText)
      );
    });
  }, [reportData, search]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, row) => {
        acc.roomSaleAmount += toNumber(row.roomSaleAmount);
        acc.planSaleAmount += toNumber(row.planSaleAmount);
        acc.cgst += toNumber(row.cgst);
        acc.sgst += toNumber(row.sgst);
        acc.restaurantSale += toNumber(row.restaurantSale);
        acc.modSale += toNumber(row.modSale);
        acc.billTotal += toNumber(row.billTotal);
        acc.advance += toNumber(row.advance);
        acc.bank += toNumber(row.bank);
        acc.upi += toNumber(row.upi);
        acc.card += toNumber(row.card);
        acc.cash += toNumber(row.cash);
        acc.credit += toNumber(row.credit);
        return acc;
      },
      {
        roomSaleAmount: 0,
        planSaleAmount: 0,
        cgst: 0,
        sgst: 0,
        restaurantSale: 0,
        modSale: 0,
        billTotal: 0,
        advance: 0,
        bank: 0,
        upi: 0,
        card: 0,
        cash: 0,
        credit: 0,
      },
    );
  }, [filteredData]);

  const exportExcel = () => {
    const rows = filteredData.map((row) => ({
      Date: formatDate(row.date),
      "Bill No": row.billNo || "",
      "GRC No": row.grcNo || "",
      "Agent Name": row.agentName || "",
      "Guest Name": row.guestName || "",
      Room: row.room || "",
      TotalRoom: toNumber(row.totalRoom),
      Days: toNumber(row.days),
      "Extra Person": toNumber(row.extraPerson),
      Plan: row.plan || "",
      "Room Sale":toNumber(row.roomSaleAmount),
      "Plan Sale": toNumber(row.planSaleAmount),
      CGST: toNumber(row.cgst),
      SGST: toNumber(row.sgst),
      "RT Bill No": row.rtBillNo || "",
      "Rest. Sale": toNumber(row.restaurantSale),
      "MOD Sale": toNumber(row.modSale),
      "Bill Total": Math.round(row.billTotal),
      Advance: toNumber(row.advance),
      Bank: toNumber(row.bank),
      Upi: toNumber(row.upi),
      Card: toNumber(row.card),
      Cash: toNumber(row.cash),
      Credit: toNumber(row.credit),
    }));

    rows.push({
      Date: "",
      "Bill No": "",
      "GRC No": "",
      "Agent Name": "",
      "Guest Name": "GRAND TOTAL",
      Room: "",
      TotalRoom: "",
      Days: "",
      "Extra Person": "",
      Plan: "",
      "Room Sale": totals.roomSaleAmount,
      "Plan Sale": totals.planSaleAmount,
      CGST: totals.cgst,
      SGST: totals.sgst,
      "RT Bill No": "",
      "Rest. Sale": totals.restaurantSale,
      "MOD Sale": totals.modSale,
      "Bill Total": Math.round(totals.billTotal),
      Advance: totals.advance,
      Bank: totals.bank,
      Upi: totals.upi,
      Card: totals.card,
      Cash: totals.cash,
      Credit: totals.credit,
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wpx: 78 },
      { wpx: 80 },
      { wpx: 70 },
      { wpx: 135 },
      { wpx: 140 },
      { wpx: 68 },
      { wpx: 48 },
      { wpx: 75 },
      { wpx: 68 },
      { wpx: 95 },
      { wpx: 95 },
      { wpx: 68 },
      { wpx: 68 },
      { wpx: 90 },
      { wpx: 95 },
      { wpx: 80 },
      { wpx: 95 },
      { wpx: 80 },
      { wpx: 80 },
      { wpx: 80 },
      { wpx: 80 },
    ];

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = 1; R <= range.e.r; R++) {
      const numericCols = [6, 7, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20];
      numericCols.forEach((C) => {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (
          worksheet[cellAddress] &&
          typeof worksheet[cellAddress].v === "number"
        ) {
          worksheet[cellAddress].z = "#,##0.00";
        }
      });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FO Sales Summary");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `FO_Sales_Summary_${fromDate}_to_${toDate}.xlsx`,
    );
  };

  const printReport = () => window.print();

  const TH = ({ children, right }) => (
    <th
      style={{
        padding: "8px 6px",
        textAlign: right ? "right" : "left",
        background: theme.colors.headerBg,
        color: theme.colors.heading,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        borderBottom: `1px solid ${theme.colors.border}`,
        position: "sticky",
        top: 0,
        zIndex: 2,
      }}
    >
      {children}
    </th>
  );

  const TD = ({ children, right, bold, muted }) => (
    <td
      style={{
        padding: "8px 6px",
        textAlign: right ? "right" : "left",
        fontWeight: bold ? 600 : 400,
        color: muted ? theme.colors.muted : theme.colors.text,
        whiteSpace: "nowrap",
        fontSize: 11,
        borderBottom: `1px solid ${theme.colors.border}`,
        fontVariantNumeric: right ? "tabular-nums" : "normal",
      }}
    >
      {children}
    </td>
  );

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: #fff !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden;
          }

          .print-root, .print-root * {
            visibility: visible;
          }

          nav,
          aside,
          .sidebar,
          .app-sidebar,
          .layout-sidebar,
          .no-print {
            display: none !important;
          }

          .print-root {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            min-width: 100vw !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
          }

          .print-shell {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm 5mm !important;
            background: #fff !important;
          }

          .print-card {
            width: 100% !important;
            max-width: 100% !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          .print-report-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            gap: 8px !important;
            padding: 0 0 4px 0 !important;
            margin: 0 0 4px 0 !important;
            border-bottom: 1px solid #cbd5e1 !important;
          }

          .print-title {
            font-size: 11px !important;
            font-weight: 700 !important;
            line-height: 1.1 !important;
            margin: 0 !important;
            color: #000 !important;
          }

          .print-meta {
            font-size: 8px !important;
            color: #334155 !important;
            line-height: 1.1 !important;
            margin-top: 2px !important;
          }

          .print-summary {
            font-size: 8px !important;
            font-weight: 600 !important;
            color: #000 !important;
            white-space: nowrap !important;
          }

          .print-table-wrap {
            width: 100% !important;
            overflow: visible !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
          }

          thead {
            display: table-header-group !important;
          }

          tfoot {
            display: table-footer-group !important;
          }

          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 2px 3px !important;
            font-size: 7px !important;
            line-height: 1.05 !important;
            white-space: nowrap !important;
          }

          th {
            position: static !important;
            background: #f8fafc !important;
            color: #000 !important;
            font-weight: 700 !important;
          }

          td {
            color: #000 !important;
          }

          tfoot td {
            position: static !important;
            background: #ecfdf5 !important;
            font-weight: 700 !important;
          }
        }
      `}</style>

      <div
        className="print-root"
        style={{
          padding: 16,
          background: theme.colors.bg,
          minHeight: "100vh",
          fontFamily: theme.font.family,
          color: theme.colors.text,
        }}
      >
        <div className="no-print">
          <div
            style={{
              background: theme.colors.card,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radius.lg,
              marginBottom: 14,
              boxShadow: theme.shadow.card,
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${theme.colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: theme.font.xl,
                    fontWeight: 700,
                    color: theme.colors.heading,
                  }}
                >
                  FO Bill Summary Report
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: theme.colors.muted,
                    marginTop: 2,
                  }}
                >
                  Compact summary with print-friendly layout
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: theme.colors.muted,
                  fontWeight: 600,
                }}
              >
                Records: {filteredData.length}
              </div>
            </div>

            <div
              style={{
                padding: 12,
                display: "flex",
                alignItems: "end",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: theme.colors.muted,
                    marginBottom: 5,
                  }}
                >
                  FROM DATE
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={inputStyle(160)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: theme.colors.muted,
                    marginBottom: 5,
                  }}
                >
                  TO DATE
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={inputStyle(160)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 10,
                    fontWeight: 600,
                    color: theme.colors.muted,
                    marginBottom: 5,
                  }}
                >
                  SEARCH
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Guest / Bill / Room"
                  style={inputStyle(220)}
                />
              </div>

              <button onClick={fetchReport} style={buttonStyle("primary")}>
                Fetch
              </button>
              <button onClick={exportExcel} style={buttonStyle("success")}>
                Export Excel
              </button>
              <button onClick={printReport} style={buttonStyle("secondary")}>
                Print
              </button>
            </div>
          </div>
        </div>

        <div className="print-shell">
          <div
            className="print-card"
            style={{
              background: theme.colors.card,
              borderRadius: theme.radius.lg,
              border: `1px solid ${theme.colors.border}`,
              overflow: "hidden",
              boxShadow: theme.shadow.card,
            }}
          >
            <div
              className="print-report-header"
              style={{
                padding: "8px 12px",
                borderBottom: `1px solid ${theme.colors.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              

           
            </div>

            {loading ? (
              <div
                style={{
                  padding: 28,
                  textAlign: "center",
                  color: theme.colors.muted,
                }}
              >
                Loading...
              </div>
            ) : (
              <div
                className="print-table-wrap"
                style={{
                  overflowX: "auto",
                  maxHeight: "74vh",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                  }}
                >
                  <thead>
                    <tr>
                      <TH>Date</TH>
                      <TH>Bill</TH>
                      <TH>GRC</TH>
                      <TH>Agent</TH>
                      <TH>Guest</TH>
                      <TH>Room</TH>
                      <TH right >TotalRoom</TH>
                      <TH right>Days</TH>
                      <TH right>Extra</TH>
                      <TH>Plan</TH>
                      <TH right>Room Sale</TH>
                      <TH right>Plan Sale</TH>
                      <TH right>CGST</TH>
                      <TH right>SGST</TH>
                      <TH>RT Bill</TH>
                      <TH right>Rest.</TH>
                      <TH right>MOD</TH>
                      <TH right>Total</TH>
                      <TH right>Adv.</TH>
                      <TH right>Bank</TH>
                      <TH right>Upi</TH>
                      <TH right>Card</TH>
                      <TH right>Cash</TH>
                      <TH right>Credit</TH>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row, index) => (
                        <tr
                          key={index}
                          style={{
                            background:
                              index % 2 === 0 ? "#fff" : theme.colors.rowAlt,
                          }}
                        >
                          <TD>{formatDate(row.date)}</TD>
                          <TD>{row.billNo}</TD>
                          <TD>{row.grcNo}</TD>
                          <TD>{row.agentName}</TD>
                          <TD bold>{row.guestName}</TD>
                          <TD>{row.room}</TD>
                          <TD right>{row.totalRoom}</TD>
                          <TD right>{row.days}</TD>
                          <TD right>{row.extraPerson}</TD>
                          <TD>{row.plan}</TD>
                          <TD right>{formatNumber(row.roomSaleAmount)}</TD>
                          <TD right>{formatNumber(row.planSaleAmount)}</TD>
                          <TD right>{formatNumber(row.cgst)}</TD>
                          <TD right>{formatNumber(row.sgst)}</TD>
                          <TD >{row.rtBillNo}</TD>
                          <TD right>{formatNumber(row.restaurantSale)}</TD>
                          <TD right>{formatNumber(row.modSale)}</TD>
                          <TD right bold>
                            {Math.round(Number(row.billTotal))}
                          </TD>
                          <TD right>{formatNumber(row.advance)}</TD>
                          <TD right>{formatNumber(row.bank)}</TD>
                          <TD right>{formatNumber(row.upi)}</TD>
                          <TD right>{formatNumber(row.card)}</TD>
                          <TD right>{formatNumber(row.cash)}</TD>
                          <TD right>{formatNumber(row.credit)}</TD>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={21}
                          style={{
                            padding: 24,
                            textAlign: "center",
                            color: theme.colors.muted,
                            fontSize: 12,
                          }}
                        >
                          No data found
                        </td>
                      </tr>
                    )}
                  </tbody>

                  <tfoot>
                    <tr style={{ background: theme.colors.totalBg }}>
                      <td
                        colSpan={10}
                        style={{
                          padding: 8,
                          fontWeight: 700,
                          color: theme.colors.heading,
                          borderTop: `1px solid ${theme.colors.border}`,
                          position: "sticky",
                          bottom: 0,
                          background: theme.colors.totalBg,
                        }}
                      >
                        GRAND TOTAL
                      </td>

                      {[
                        totals.roomSaleAmount,
                        totals.planSaleAmount,
                        totals.cgst,
                        totals.sgst,
                        null,
                        totals.restaurantSale,
                        totals.modSale,
                        totals.billTotal,
                        totals.advance,
                        totals.bank,
                        totals.upi,
                        totals.card,
                        totals.cash,
                        totals.credit,
                      ].map((value, i) => (
                        <td
                          key={i}
                          style={{
                            padding: 8,
                            textAlign: "right",
                            fontWeight: 700,
                            color: theme.colors.heading,
                            borderTop: `1px solid ${theme.colors.border}`,
                            position: "sticky",
                            bottom: 0,
                            background: theme.colors.totalBg,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {value === null ? "" : formatNumber(value)}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
