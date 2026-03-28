import api from "@/api/api";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const fmt = (n) =>
  (n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const today = new Date().toISOString().split("T")[0];

export default function HotelReport() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id
  );

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      if (!cmp_id) {
        setError("Company not selected");
        return;
      }

      setLoading(true);
      setError("");

      const { data } = await api.get("/api/sUsers/restaurant-category-wise-sales", {
        params: {
          cmp_id,
          startDate: fromDate,
          endDate: toDate,
        },
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch report");
      }

      setReportData(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cmp_id) {
      fetchReport();
    }
  }, [cmp_id]);

  const grandTotals = useMemo(() => {
    return reportData.reduce(
      (acc, category) => {
        acc.qty += Number(category.totalQty || 0);
        acc.amount += Number(category.totalAmount || 0);
        return acc;
      },
      { qty: 0, amount: 0 }
    );
  }, [reportData]);

  const buildExportRows = () => {
    const rows = [];

    rows.push(["Category Wise Sales Summary of the Outlet", "Ac Restaurant"]);
    rows.push([`For the Period ${fromDate} To ${toDate}`]);
    rows.push([]);
    rows.push(["Sl No", "Item Name", "Unit", "Qty", "Amount"]);

     let slNoCounter = 1;
    reportData.forEach((category) => {
      rows.push([category.categoryName]);

      category.items.forEach((item) => {
        rows.push([
        slNoCounter++,
          item.product_name || "",
          item.unit || "Nos",
          Number(item.qty || 0),
          Number(item.amount || 0),
        ]);
      });

      rows.push(["", "Sub Total", "", Number(category.totalQty || 0), Number(category.totalAmount || 0)]);
      rows.push([]);
    });

    rows.push(["", "Grand Total", "", grandTotals.qty, grandTotals.amount]);

    return rows;
  };

  const exportToExcel = () => {
    const rows = buildExportRows();

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!cols"] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hotel Report");

    XLSX.writeFile(
      wb,
      `restaurant-category-wise-report-${fromDate}-to-${toDate}.xlsx`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFontSize(13);
    doc.text("Category Wise Sales Summary of the Outlet", 14, 12);
    doc.setFontSize(11);
    doc.text("Ac Restaurant", 150, 12);
    doc.text(`For the Period ${fromDate} To ${toDate}`, 14, 18);

    let body = [];

    reportData.forEach((category) => {
      body.push([
        { content: category.categoryName, colSpan: 5, styles: { fontStyle: "bold", fillColor: [230, 230, 250] } },
      ]);
let slNoCounter = 1;
      category.items.forEach((item) => {
        body.push([
          slNoCounter++,
          item.product_name || "",
          item.unit || "Nos",
          Number(item.qty || 0).toFixed(2),
          fmt(item.amount || 0),
        ]);
      });

      body.push([
        "",
        "Sub Total",
        "",
        Number(category.totalQty || 0).toFixed(2),
        fmt(category.totalAmount || 0),
      ]);
    });

    body.push([
      "",
      "Grand Total",
      "",
      Number(grandTotals.qty || 0).toFixed(2),
      fmt(grandTotals.amount || 0),
    ]);

    autoTable(doc, {
      startY: 24,
      head: [["Sl No", "Item Name", "Unit", "Qty", "Amount"]],
      body,
      styles: {
        fontSize: 9,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [26, 58, 92],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 78 },
        2: { cellWidth: 25 },
        3: { halign: "right", cellWidth: 25 },
        4: { halign: "right", cellWidth: 30 },
      },
      didParseCell: (data) => {
        if (
          data.row.raw &&
          data.row.raw[1] === "Sub Total"
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [245, 247, 251];
        }

        if (
          data.row.raw &&
          data.row.raw[1] === "Grand Total"
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [26, 58, 92];
          data.cell.styles.textColor = 255;
        }
      },
    });

    doc.save(`restaurant-category-wise-report-${fromDate}-to-${toDate}.pdf`);
  };

  return (
    <div style={{ padding: 24, fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ marginBottom: 16 }}>Restaurant Category Wise Sales Report</h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "end",
          flexWrap: "wrap",
          marginBottom: 20,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              minWidth: 160,
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 6,
              minWidth: 160,
            }}
          />
        </div>

        <button
          onClick={fetchReport}
          style={{
            background: "#1a3a5c",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Fetch Report
        </button>

        <button
          onClick={exportToExcel}
          disabled={!reportData.length}
          style={{
            background: "#1d6f42",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export Excel
        </button>

        <button
          onClick={exportToPDF}
          disabled={!reportData.length}
          style={{
            background: "#b52b27",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Export PDF
        </button>
      </div>

      {loading && <div>Loading report...</div>}
      {error && <div style={{ color: "red", marginBottom: 16 }}>Error: {error}</div>}

      {!loading && !error && reportData.length === 0 && (
        <div>No data found for selected date range.</div>
      )}

      {!loading &&
        !error &&
        reportData.map((category) => (
          <div key={category.categoryName} style={{ marginBottom: 24 }}>
            <h3
              style={{
                background: "#eef2f7",
                padding: 10,
                borderRadius: 4,
              }}
            >
              {category.categoryName}
            </h3>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 8,
              }}
            >
              <thead>
                <tr style={{ background: "#1a3a5c", color: "white" }}>
                  <th style={{ padding: 8, textAlign: "left" }}>Sl No</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Item</th>
                  <th style={{ padding: 8, textAlign: "left" }}>Unit</th>
                  <th style={{ padding: 8, textAlign: "right" }}>Qty</th>
                  <th style={{ padding: 8, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {category.items.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 8 }}>{idx+1 || "-"}</td>
                    <td style={{ padding: 8 }}>{row.product_name || "-"}</td>
                    <td style={{ padding: 8 }}>{row.unit || "-"}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{row.qty || 0}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>
                      {fmt(row.amount)}
                    </td>
                  </tr>
                ))}

                <tr style={{ background: "#f5f7fb", fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: 8 }}>
                    Sub Total
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    {category.totalQty || 0}
                  </td>
                  <td style={{ padding: 8, textAlign: "right" }}>
                    {fmt(category.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

      {!loading && !error && reportData.length > 0 && (
        <div
          style={{
            marginTop: 20,
            background: "#1a3a5c",
            color: "#fff",
            padding: 14,
            borderRadius: 6,
            fontWeight: 700,
          }}
        >
          Grand Total Qty: {grandTotals.qty} | Grand Total Amount: ₹
          {fmt(grandTotals.amount)}
        </div>
      )}
    </div>
  );
}