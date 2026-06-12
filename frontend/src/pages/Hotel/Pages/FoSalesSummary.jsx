import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api";

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB");
};

export default function FOSalesSummaryReport() {
 const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );


  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [search, setSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const fetchReport = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        "/api/sUsers/fo-sales-summary",
        {
          params: {
            cmp_id,
            fromDate,
            toDate,
          },
        }
      );

      setReportData(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cmp_id) {
      fetchReport();
    }
  }, [cmp_id]);

  const filteredData = useMemo(() => {
    return reportData.filter((row) => {
      const searchText = search.toLowerCase();

      return (
        row.guestName?.toLowerCase().includes(searchText) ||
        row.agentName?.toLowerCase().includes(searchText) ||
        row.billNo?.toLowerCase().includes(searchText) ||
        row.grcNo?.toString().includes(searchText) ||
        row.room?.toLowerCase().includes(searchText)
      );
    });
  }, [reportData, search]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, row) => {
        acc.roomSaleAmount += Number(row.roomSaleAmount || 0);
        acc.planSaleAmount += Number(row.planSaleAmount || 0);
        acc.cgst += Number(row.cgst || 0);
        acc.sgst += Number(row.sgst || 0);
        acc.restaurantSale += Number(row.restaurantSale || 0);
        acc.modSale += Number(row.modSale || 0);
        acc.billTotal += Number(row.billTotal || 0);
        acc.advance += Number(row.advance || 0);
        acc.bank += Number(row.bank || 0);
        acc.cash += Number(row.cash || 0);
        acc.credit += Number(row.credit || 0);

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
        cash: 0,
        credit: 0,
      }
    );
  }, [filteredData]);

  const exportExcel = () => {
    const excelData = filteredData.map((row) => ({
      Date: formatDate(row.date),
      "Bill No": row.billNo,
      "GRC No": row.grcNo,
      "Agent Name": row.agentName,
      "Guest Name": row.guestName,
      Room: row.room,
      Days: row.days,
      "Extra Person": row.extraPerson,
      Plan: row.plan,
      "Room Sale Amount": row.roomSaleAmount,
      "Plan Sale Amount": row.planSaleAmount,
      CGST: row.cgst,
      SGST: row.sgst,
      "RT Bill No": row.rtBillNo,
      "Restaurant Sale": row.restaurantSale,
      "MOD Sale": row.modSale,
      "Bill Total": row.billTotal,
      Advance: row.advance,
      Bank: row.bank,
      Cash: row.cash,
      Credit: row.credit,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "FO Sales Summary"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, "FO_Sales_Summary.xlsx");
  };

  const printReport = () => {
    window.print();
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
return (
   <div
    style={{
      padding: 20,
      background: "#f5f6fa",
      minHeight: "100vh",
      fontFamily: "Segoe UI, sans-serif",
    }}
  >

    {/* FILTER BAR */}
    <div
      style={{
        background: "#fff",
        padding: "15px 20px",
        borderRadius: "10px",
        marginBottom: "20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* From Date */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "4px",
            }}
          >
            FROM DATE
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-control"
            style={{ width: 160 }}
          />
        </div>

        {/* To Date */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "4px",
            }}
          >
            TO DATE
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control"
            style={{ width: 160 }}
          />
        </div>

        {/* Search */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "4px",
            }}
          >
            SEARCH
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guest / Bill / Room"
            className="form-control"
            style={{ width: 250 }}
          />
        </div>

      <button
  onClick={fetchReport}
  style={{
    height: "38px",
    minWidth: "90px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#0f766e", // Teal
    color: "#fff",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  }}
>
  Fetch
</button>

<button
  onClick={exportExcel}
  style={{
    height: "38px",
    minWidth: "90px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#16a34a", // Green
    color: "#fff",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  }}
>
  Excel
</button>

<button
  onClick={printReport}
  style={{
    height: "38px",
    minWidth: "90px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#1e293b", // Dark Blue/Black
    color: "#fff",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  }}
>
  Print
</button>
      </div>
    </div>

    {/* REPORT */}

   <div
      style={{
        background: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          background: "#1a3a5c",
          color: "#fff",
          padding: "14px 18px",
          fontWeight: 700,
          fontSize: 15,
        }}
      >
        FO SALES SUMMARY REPORT
      </div>

      {loading ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
          }}
        >
          Loading...
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <TH>Date</TH>
                <TH>Bill No</TH>
                <TH>GRC No</TH>
                <TH>Agent Name</TH>
                <TH>Guest Name</TH>
                <TH>Room</TH>
                <TH right>Days</TH>
                <TH right>Extra Person</TH>
                <TH>Plan</TH>
                <TH right>Room Sale</TH>
                <TH right>Plan Sale</TH>
                <TH right>CGST</TH>
                <TH right>SGST</TH>
                <TH>RT Bill No</TH>
                <TH right>Restaurant Sale</TH>
                <TH right>MOD Sale</TH>
                <TH right>Bill Total</TH>
                <TH right>Advance</TH>
                <TH right>Bank</TH>
                <TH right>Cash</TH>
                <TH right>Credit</TH>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={index}
                  style={{
                    background:
                      index % 2 === 0
                        ? "#fff"
                        : "#f9fafb",
                    borderBottom:
                      "1px solid #edf2f7",
                  }}
                >
                  <TD>{formatDate(row.date)}</TD>
                  <TD>{row.billNo}</TD>
                  <TD>{row.grcNo}</TD>
                  <TD>{row.agentName}</TD>
                  <TD bold>{row.guestName}</TD>
                  <TD>{row.room}</TD>

                  <TD right>{row.days}</TD>

                  <TD right>
                    {row.extraPerson}
                  </TD>

                  <TD>{row.plan}</TD>

                  <TD right>
                    {formatNumber(
                      row.roomSaleAmount
                    )}
                  </TD>

                  <TD right>
                    {formatNumber(
                      row.planSaleAmount
                    )}
                  </TD>

                  <TD right>
                    {formatNumber(row.cgst)}
                  </TD>

                  <TD right>
                    {formatNumber(row.sgst)}
                  </TD>

                  <TD>{row.rtBillNo}</TD>

                  <TD right>
                    {formatNumber(
                      row.restaurantSale
                    )}
                  </TD>

                  <TD right>
                    {formatNumber(row.modSale)}
                  </TD>

                  <TD right bold>
                    {formatNumber(
                      row.billTotal
                    )}
                  </TD>

                  <TD right>
                    {formatNumber(row.advance)}
                  </TD>

                  <TD right>
                    {formatNumber(row.bank)}
                  </TD>

                  <TD right>
                    {formatNumber(row.cash)}
                  </TD>

                  <TD right>
                    {formatNumber(row.credit)}
                  </TD>
                </tr>
              ))}
            </tbody>

            {/* GRAND TOTAL */}

            <tfoot>
              <tr
                style={{
                  background: "#1a3a5c",
                  color: "#fff",
                }}
              >
                <td
                  colSpan={9}
                  style={{
                    padding: 12,
                    fontWeight: 700,
                  }}
                >
                  GRAND TOTAL
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.roomSaleAmount
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.planSaleAmount
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(totals.cgst)}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(totals.sgst)}
                </td>

                <td></td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.restaurantSale
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.modSale
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.billTotal
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.advance
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.bank
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.cash
                  )}
                </td>

                <td
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontWeight: 700,
                  }}
                >
                  {formatNumber(
                    totals.credit
                  )}
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      )}
    </div>
  </div>
);
}