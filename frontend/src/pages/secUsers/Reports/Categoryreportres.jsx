import api from "@/api/api";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TitleDiv from "@/components/common/TitleDiv";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
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
  const [itemSummary, setItemSummary] = useState([]);
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
      setItemSummary(data.itemSummary || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
      setReportData([]);
      setItemSummary([]);
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

  const topItemTotals = useMemo(() => {
    return itemSummary.reduce(
      (acc, item) => {
        acc.qty += Number(item.totalQty || 0);
        acc.amount += Number(item.totalAmount || 0);
        return acc;
      },
      { qty: 0, amount: 0 }
    );
  }, [itemSummary]);

  const buildExportRows = () => {
    const rows = [];

    rows.push([
      "Category Wise Sales Summary of the Outlet",
      "",
      "",
      "",
      "",
      "",
      "Ac Restaurant",
    ]);
    rows.push([`For the Period ${fromDate} To ${toDate}`]);
    rows.push([]);

    rows.push(["Top Items Sold"]);
    rows.push(["Rank", "Item Name", "Unit", "Total Qty", "Total Amount"]);

    (itemSummary || []).forEach((item, index) => {
      rows.push([
        index + 1,
        item.product_name || "",
        item.unit || "Nos",
        Number(item.totalQty || 0),
        Number(item.totalAmount || 0),
      ]);
    });

    rows.push([
      "",
      "Top Items Total",
      "",
      Number(topItemTotals.qty || 0),
      Number(topItemTotals.amount || 0),
    ]);

    rows.push([]);
    rows.push(["Sl No", "Category", "Subcategory", "Item Name", "Unit", "Qty", "Amount"]);

    let slNoCounter = 1;

    reportData.forEach((category) => {
      rows.push([category.categoryName, "", "", "", "", "", ""]);

      (category.subcategories || []).forEach((sub) => {
        rows.push(["", "", sub.subcategoryName, "", "", "", ""]);

        (sub.items || []).forEach((item) => {
          rows.push([
            slNoCounter++,
            category.categoryName,
            sub.subcategoryName,
            item.product_name || "",
            item.unit || "Nos",
            Number(item.qty || 0),
            Number(item.amount || 0),
          ]);
        });

        rows.push([
          "",
          "",
          `${sub.subcategoryName} Sub Total`,
          "",
          "",
          Number(sub.totalQty || 0),
          Number(sub.totalAmount || 0),
        ]);
        rows.push([]);
      });

      rows.push([
        "",
        `${category.categoryName} Total`,
        "",
        "",
        "",
        Number(category.totalQty || 0),
        Number(category.totalAmount || 0),
      ]);
      rows.push([]);
    });

    rows.push(["", "Grand Total", "", "", "", grandTotals.qty, grandTotals.amount]);

    return rows;
  };

  const exportToExcel = () => {
    const rows = buildExportRows();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws["!cols"] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 22 },
      { wch: 35 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hotel Report");

    XLSX.writeFile(
      wb,
      `restaurant-category-subcategory-report-${fromDate}-to-${toDate}.xlsx`
    );
  };

  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(13);
    doc.text("Category Wise Sales Summary of the Outlet", 14, 12);
    doc.setFontSize(11);
    doc.text("Ac Restaurant", 240, 12);
    doc.text(`For the Period ${fromDate} To ${toDate}`, 14, 18);

    let currentY = 24;

    if (itemSummary.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Rank", "Item Name", "Unit", "Total Qty", "Total Amount"]],
        body: [
          ...itemSummary.map((item, index) => [
            index + 1,
            item.product_name || "",
            item.unit || "Nos",
            Number(item.totalQty || 0).toFixed(2),
            fmt(item.totalAmount || 0),
          ]),
          [
            "",
            "Top Items Total",
            "",
            Number(topItemTotals.qty || 0).toFixed(2),
            fmt(topItemTotals.amount || 0),
          ],
        ],
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [29, 111, 66],
          textColor: 255,
        },
        didParseCell: (hookData) => {
          if (hookData.row.index === itemSummary.length) {
            hookData.cell.styles.fontStyle = "bold";
            hookData.cell.styles.fillColor = [240, 247, 242];
          }
        },
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }

    const body = [];
    let slNoCounter = 1;

    reportData.forEach((category) => {
      body.push([
        {
          content: `Category: ${category.categoryName}`,
          colSpan: 7,
          styles: { fontStyle: "bold", fillColor: [221, 228, 240] },
        },
      ]);

      (category.subcategories || []).forEach((sub) => {
        body.push([
          {
            content: `Subcategory: ${sub.subcategoryName}`,
            colSpan: 7,
            styles: { fontStyle: "bold", fillColor: [238, 242, 247] },
          },
        ]);

        (sub.items || []).forEach((item) => {
          body.push([
            slNoCounter++,
            category.categoryName,
            sub.subcategoryName,
            item.product_name || "",
            item.unit || "Nos",
            Number(item.qty || 0).toFixed(2),
            fmt(item.amount || 0),
          ]);
        });

        body.push([
          "",
          "",
          `${sub.subcategoryName} Sub Total`,
          "",
          "",
          Number(sub.totalQty || 0).toFixed(2),
          fmt(sub.totalAmount || 0),
        ]);
      });

      body.push([
        "",
        `${category.categoryName} Total`,
        "",
        "",
        "",
        Number(category.totalQty || 0).toFixed(2),
        fmt(category.totalAmount || 0),
      ]);
    });

    body.push([
      "",
      "Grand Total",
      "",
      "",
      "",
      Number(grandTotals.qty || 0).toFixed(2),
      fmt(grandTotals.amount || 0),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Sl No", "Category", "Subcategory", "Item Name", "Unit", "Qty", "Amount"]],
      body,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [26, 58, 92],
        textColor: 255,
      },
      columnStyles: {
        0: { cellWidth: 16 },
        1: { cellWidth: 28 },
        2: { cellWidth: 30 },
        3: { cellWidth: 70 },
        4: { cellWidth: 20 },
        5: { halign: "right", cellWidth: 22 },
        6: { halign: "right", cellWidth: 28 },
      },
      didParseCell: (hookData) => {
        if (hookData.row.raw && hookData.row.raw[2]?.includes?.("Sub Total")) {
          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.fillColor = [245, 247, 251];
        }

        if (hookData.row.raw && hookData.row.raw[1]?.includes?.("Total")) {
          hookData.cell.styles.fontStyle = "bold";
        }

        if (hookData.row.raw && hookData.row.raw[1] === "Grand Total") {
          hookData.cell.styles.fontStyle = "bold";
          hookData.cell.styles.fillColor = [26, 58, 92];
          hookData.cell.styles.textColor = 255;
        }
      },
    });

    doc.save(`restaurant-category-subcategory-report-${fromDate}-to-${toDate}.pdf`);
  };

  return (
    <>
      <TitleDiv title={"Category Wise REGISTER"} />

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
              opacity: reportData.length ? 1 : 0.6,
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
              opacity: reportData.length ? 1 : 0.6,
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
                  background: "#dde4f0",
                  padding: 10,
                  borderRadius: 4,
                  marginBottom: 10,
                }}
              >
                {category.categoryName}
              </h3>

              {(category.subcategories || []).map((sub) => (
                <div key={sub.subcategoryName} style={{ marginBottom: 16 }}>
                  <h4
                    style={{
                      background: "#eef2f7",
                      padding: 8,
                      borderRadius: 4,
                      marginBottom: 6,
                    }}
                  >
                    {sub.subcategoryName}
                  </h4>

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
                        <th style={{ padding: 8, textAlign: "left" }}>Sales No</th>
                        <th style={{ padding: 8, textAlign: "left" }}>Date</th>
                        <th style={{ padding: 8, textAlign: "left" }}>Item</th>
                        <th style={{ padding: 8, textAlign: "left" }}>Unit</th>
                        <th style={{ padding: 8, textAlign: "right" }}>Qty</th>
                        <th style={{ padding: 8, textAlign: "right" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sub.items || []).map((row, idx) => (
                        <tr
                          key={`${row.sale_id}-${row.product_id}-${idx}`}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ padding: 8 }}>{idx + 1}</td>
                          <td style={{ padding: 8 }}>{row.salesNumber || "-"}</td>
                          <td style={{ padding: 8 }}>
                            {row.date
                              ? new Date(row.date).toLocaleDateString("en-GB")
                              : "-"}
                          </td>
                          <td style={{ padding: 8 }}>{row.product_name || "-"}</td>
                          <td style={{ padding: 8 }}>{row.unit || "-"}</td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            {Number(row.qty || 0).toFixed(2)}
                          </td>
                          <td style={{ padding: 8, textAlign: "right" }}>
                            {fmt(row.amount)}
                          </td>
                        </tr>
                      ))}

                      <tr style={{ background: "#f5f7fb", fontWeight: 700 }}>
                        <td colSpan={5} style={{ padding: 8 }}>
                          {sub.subcategoryName} Sub Total
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          {Number(sub.totalQty || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: 8, textAlign: "right" }}>
                          {fmt(sub.totalAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}

              <div
                style={{
                  background: "#dfe8f5",
                  padding: 10,
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                {category.categoryName} Total Qty:{" "}
                {Number(category.totalQty || 0).toFixed(2)} | Amount: ₹
                {fmt(category.totalAmount)}
              </div>
            </div>
          ))}

     

      {/* ITEM SUMMARY BOX LIKE PLAN SUMMARY */}
      {!loading && !error && itemSummary.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "1 1 360px",
              border: "1px solid #ccc",
              borderRadius: 4,
              padding: 12,
              background: "#fff",
            }}
          >
            <div
              style={{
                fontWeight: 700,
                paddingBottom: 8,
                marginBottom: 8,
                borderBottom: "1px solid #ddd",
              }}
            >
              ITEM SUMMARY
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <tbody>
                {itemSummary.map((item, idx) => (
                  <tr key={`${item.product_name}-${idx}`}>
                    <td
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {item.product_name || "-"}
                    </td>
                    <td
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "right",
                        width: 80,
                      }}
                    >
                      {Number(item.totalQty || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    
       
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
            Grand Total Qty: {Number(grandTotals.qty || 0).toFixed(2)} | Grand Total
            Amount: ₹{fmt(grandTotals.amount)}
          </div>
        )}
     

      
  
      </div>
    </>
  );
}