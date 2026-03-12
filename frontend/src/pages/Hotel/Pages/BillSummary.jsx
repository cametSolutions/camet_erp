import React, { useState, useEffect } from "react";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import TitleDiv from "@/components/common/TitleDiv";

/* ===================== Helpers ===================== */

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const computeKotBreakdown = (salesData) => {
  return salesData.reduce((acc, item) => {
    const kotType = item.kotType || "Unknown";
    if (!acc[kotType]) acc[kotType] = { amount: 0, count: 0 };
    acc[kotType].amount += item.totalWithTax || 0;
    acc[kotType].count += 1;
    return acc;
  }, {});
};

const round2 = (value) => Math.round((value || 0)); // integer rounding

/* ===================== PDF Export ===================== */

export const generatePDF = (
  salesData,
  summary,
  owner,
  reportPeriod,
  businessType,
  totals,
  kotTypeFilter,
  mealPeriodFilter
) => {
  if (!salesData || salesData.length === 0) return;

  const filterInfo = () => {
    const filters = [];
    if (kotTypeFilter !== "all") filters.push(`KOT Type: ${kotTypeFilter}`);
    if (mealPeriodFilter !== "all")
      filters.push(`Meal Period: ${mealPeriodFilter}`);
    if (filters.length === 0) return "";
    return `<div style="margin-top:4px;font-size:10px;">Filters: ${filters.join(
      " | "
    )}</div>`;
  };

  const printWindow = window.open(
    "",
    "_blank",
    "width=1000,height=800,scrollbars=yes"
  );

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Sales Report - ${reportPeriod}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        font-size: 12px;
        color: #000;
        background: #ffffff !important;
      }
      @media print {
        body { margin: 0; }
        .no-print { display: none !important; }
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 15px;
      }
      .company-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .company-address {
        font-size: 10px;
        color: #555;
        margin-bottom: 5px;
      }
      .report-title {
        font-size: 13px;
        font-weight: bold;
        margin-top: 4px;
      }
      .report-info {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        font-size: 10px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
        margin-bottom: 10px;
      }
      th, td {
        border: 1px solid #000;
        padding: 4px 3px;
        text-align: center;
      }
      th {
        background-color: #f3f4f6;
        font-weight: bold;
      }
      .text-left { text-align: left !important; }
      .text-right { text-align: right !important; }
      .totals-row {
        background-color: #e5e7eb;
        font-weight: bold;
      }
      .summary-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 10px;
      }
      .summary-title {
        font-weight: bold;
        margin-bottom: 6px;
        font-size: 12px;
      }
      .summary-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      .summary-table td {
        padding: 2px 3px;
        border: none;
      }
      .summary-table tr.total-row td {
        border-top: 1px solid #000;
        font-weight: bold;
      }
      .notes {
        font-size: 10px;
        font-style: italic;
        color: #555;
        margin-top: 10px;
        border-top: 1px solid #ccc;
        padding-top: 6px;
      }
      .print-buttons {
        text-align: center;
        margin: 10px 0;
      }
      .print-btn {
        background: #dc2626;
        color: #fff;
        border: none;
        padding: 6px 14px;
        margin: 0 4px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
      }
      .print-btn:hover { background: #b91c1c; }
      .close-btn { background:#4b5563; }
      .close-btn:hover { background:#374151; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="company-name">${owner?.companyName || owner?.name || ""}</div>
      <div class="company-address">
        ${owner?.address || ""} ${owner?.road || ""}
      </div>
      <div class="report-title">
        SALES REGISTER OF THE OUTLET - ${
          businessType === "all" ? "ALL" : (businessType || "").toUpperCase()
        }
      </div>
      <div class="report-info">
        <div>For the Period: <strong>${reportPeriod}</strong>${filterInfo()}</div>
        <div>Print Date &amp; Time: <strong>${new Date().toLocaleString()}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Bill No</th>
          <th>Date</th>
          <th>Agent Name</th>
          <th>Gross Amount</th>
          <th>CGST</th>
          <th>SGST</th>
          <th>Total Tax</th>
          <th>Disc</th>
          <th>Round off</th>
          <th>Net Total</th>
          <th>Cash</th>
          <th>UPI</th>
          <th>Bank</th>
          <th>Card</th>
          <th>Mode</th>
          ${businessType !== "hotel" ? "<th>Meal Period</th><th>Kot Type</th>" : ""}
          <th>Credit</th>
          <th>Credit Desc</th>
        </tr>
      </thead>
      <tbody>
        ${salesData
          .map((row) => {
            const isCreditSale =
              row.partyAccount === "Sundry Debtors" ||
              row.mode === "Credit" ||
              (row.credit || 0) > 0;
            const grossAmount = (row.amount || 0) - (row.igst || 0);
            const totalTax =
              (row.cgst || 0) + (row.sgst || 0) + (row.igst || 0);

            return `
              <tr>
                <td class="text-left">${row.billNo || "-"}</td>
                <td>${row.date ? new Date(row.date).toLocaleDateString() : "-"}</td>
                <td class="text-left">${row.partyName || "-"}</td>
                <td class="text-right">${Math.round(grossAmount)}</td>
                <td>${Math.round(row.cgst || 0)}</td>
                <td>${Math.round(row.sgst || 0)}</td>
                <td>${Math.round(totalTax)}</td>
                <td>${Math.round(row.disc || 0)}</td>
                <td>${Math.round(row.roundOff || 0)}</td>
                <td>${Math.round(row.totalWithTax || 0)}</td>
                <td class="text-right">${Math.round(Number(row.cash || 0))}</td>
                <td class="text-right">${Math.round(Number(row.upi || 0))}</td>
                <td class="text-right">${Math.round(Number(row.bank || 0))}</td>
                <td class="text-right">${Math.round(Number(row.card || 0))}</td>
                <td>${row.mode || "-"}</td>
                ${
                  businessType !== "hotel"
                    ? `<td>${row.mealPeriod || "-"}</td><td>${row.kotType || "-"}</td>`
                    : ""
                }
                <td class="text-right">${
                  isCreditSale ? Math.round(row.totalWithTax || 0) : "-"
                }</td>
                <td class="text-left">${
                  isCreditSale
                    ? row.creditDescription || row.partyName || "-"
                    : "-"
                }</td>
              </tr>
            `;
          })
          .join("")}
        <tr class="totals-row">
          <td class="text-left" colspan="3">Total</td>
          <td class="text-right">${Math.round(totals.amount)}</td>
          <td>${Math.round(totals.cgst)}</td>
          <td>${Math.round(totals.sgst)}</td>
          <td>${Math.round(totals.cgst + totals.sgst + totals.igst)}</td>
          <td>${Math.round(totals.disc)}</td>
          <td>${Math.round(totals.roundOff)}</td>
          <td>${Math.round(totals.totalWithTax)}</td>
          <td class="text-right">${Math.round(totals.cash)}</td>
          <td class="text-right">${Math.round(totals.upi)}</td>
          <td class="text-right">${Math.round(totals.bank || 0)}</td>
          <td class="text-right">${Math.round(totals.card || 0)}</td>
          <td>-</td>
          ${businessType !== "hotel" ? "<td>-</td><td>-</td>" : ""}
          <td class="text-right">${Math.round(totals.credit)}</td>
          <td>-</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-section">
      <div>
        <div class="summary-title">Financial Summary</div>
        <table class="summary-table">
          <tr><td><strong>Gross Amount</strong></td><td class="text-right">${Math.round(
            totals.amount
          )}</td></tr>
          <tr><td><strong>Discount</strong></td><td class="text-right">${Math.round(
            totals.disc
          )}</td></tr>
          <tr><td><strong>CGST</strong></td><td class="text-right">${Math.round(
            totals.cgst
          )}</td></tr>
          <tr><td><strong>SGST</strong></td><td class="text-right">${Math.round(
            totals.sgst
          )}</td></tr>
          <tr><td><strong>Total Tax</strong></td><td class="text-right">${Math.round(
            totals.cgst + totals.sgst + totals.igst
          )}</td></tr>
          <tr><td><strong>Cash</strong></td><td class="text-right">${Math.round(
            totals.cash
          )}</td></tr>
          <tr><td><strong>UPI</strong></td><td class="text-right">${Math.round(
            totals.upi
          )}</td></tr>
          <tr><td><strong>Bank</strong></td><td class="text-right">${Math.round(
            totals.bank || 0
          )}</td></tr>
          <tr><td><strong>Card</strong></td><td class="text-right">${Math.round(
            totals.card || 0
          )}</td></tr>
          <tr><td><strong>Credit Amount</strong></td><td class="text-right">${Math.round(
            totals.credit
          )}</td></tr>
          <tr class="total-row">
            <td><strong>Net Sales</strong></td>
            <td class="text-right"><strong>${Math.round(
              totals.totalWithTax
            )}</strong></td>
          </tr>
        </table>
      </div>

      <div>
        <div class="summary-title">Business Type Breakdown</div>
        <table class="summary-table">
          ${
            businessType !== "restaurant" && summary?.hotelSales
              ? `
            <tr style="background:#dbeafe;">
              <td><strong>Hotel Sales</strong></td>
              <td class="text-right">${
                Math.round(summary.agentCount || 0) +
                Math.round(summary.countWithOutAgent || 0)
              }</td>
            </tr>
            <tr>
              <td>- Transactions With Agent</td>
              <td class="text-right">${Math.round(summary.agentCount || 0)}</td>
            </tr>
            <tr>
              <td>- Transactions With Out Agent</td>
              <td class="text-right">${Math.round(
                summary.countWithOutAgent || 0
              )}</td>
            </tr>
          `
              : ""
          }
          ${
            businessType !== "hotel" && summary?.restaurantSales
              ? `
            <tr style="background:#dcfce7;">
              <td><strong>Restaurant Sales</strong></td>
              <td class="text-right">${Math.round(
                summary.restaurantCount || 0
              )}</td>
            </tr>
            <tr>
              <td>- Room Service</td>
              <td class="text-right">${Math.round(
                summary.IsRoomService || 0
              )}</td>
            </tr>
            <tr>
              <td>- Take Away</td>
              <td class="text-right">${Math.round(
                summary.IsTakeaway || 0
              )}</td>
            </tr>
            <tr>
              <td>- Delivery</td>
              <td class="text-right">${Math.round(
                summary.IsDelivery || 0
              )}</td>
            </tr>
            <tr>
              <td>- Dine In</td>
              <td class="text-right">${
                Math.round(summary.restaurantCount || 0) -
                (Math.round(summary.IsRoomService || 0) +
                  Math.round(summary.IsTakeaway || 0) +
                  Math.round(summary.IsDelivery || 0))
              }</td>
            </tr>
            <tr>
              <td>- Others</td>
              <td class="text-right">${Math.round(
                summary.restaurantSales.otherCount || 0
              )}</td>
            </tr>
          `
              : ""
          }
          <tr class="total-row">
            <td>Total Transactions</td>
            <td class="text-right"><strong>${salesData.length}</strong></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="notes">
      <div>This report shows ${
        businessType === "all"
          ? "all sales transactions"
          : businessType + " sales transactions"
      } only.</div>
      <div>Complimentary and cancelled sales are not included in totals.</div>
    </div>

    <div class="print-buttons no-print">
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
      <button class="print-btn close-btn" onclick="window.close()">Close</button>
    </div>
  </body>
  </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

/* ===================== Excel Export ===================== */

const exportToExcel = (
  salesData,
  summary,
  owner,
  reportPeriod,
  businessType,
  totals,
  kotTypeFilter,
  mealPeriodFilter,
) => {
  const filterInfo = [];
  if (kotTypeFilter !== "all") filterInfo.push(`KOT Type: ${kotTypeFilter}`);
  if (mealPeriodFilter !== "all")
    filterInfo.push(`Meal Period: ${mealPeriodFilter}`);

  const kotBreakdown = computeKotBreakdown(salesData);

  const csvContent = [
    [owner?.companyName || owner?.name || "Sales Report"],
    [owner?.address || owner?.road || ""],
    [`Report Period: ${reportPeriod}`],
    [
      `Business Type: ${
        businessType === "all"
          ? "All Sales"
          : businessType.charAt(0).toUpperCase() + businessType.slice(1)
      }`,
    ],
    ...(filterInfo.length > 0 ? [[`Filters: ${filterInfo.join(", ")}`]] : []),
    [`Generated: ${new Date().toLocaleString()}`],
    [],
    [
      "Bill No",
      "Date",
      "Agent Name",
      "Gross Amount",
      "CGST",
      "SGST",
      "Total Tax",
      "Discount",
      "Round Off",
      "Net Total",
      "Cash",
      "UPI",
      "Bank",
      "Card",
      "Payment Mode",
      ...(businessType !== "hotel" ? ["Meal Period", "KOT Type"] : []),
      "Credit",
      "Credit Description",
    ],
    ...salesData.map((row) => {
      const isCreditSale =
        row.partyAccount === "Sundry Debtors" ||
        row.mode === "Credit" ||
        (row.credit || 0) > 0;
      const grossAmount = (row.amount || 0) - (row.igst || 0);
      const totalTax =
        (row.cgst || 0) + (row.sgst || 0) + (row.igst || 0);

      const baseRow = [
        row.billNo || "",
        row.date ? new Date(row.date).toLocaleDateString() : "",
        row.partyName || "",
        Math.round(grossAmount),
        Math.round(row.cgst || 0),
        Math.round(row.sgst || 0),
        Math.round(totalTax),
        Math.round(row.disc || 0),
        Math.round(row.roundOff || 0),
        Math.round(row.totalWithTax || 0),
        Math.round(row.cash || 0),
        Math.round(row.upi || 0),
        Math.round(row.bank || 0),
        Math.round(row.card || 0),
        row.mode || "",
      ];

      if (businessType !== "hotel") {
        baseRow.push(row.mealPeriod || "");
        baseRow.push(row.kotType || "");
      }

      baseRow.push(
        isCreditSale ? Math.round(row.totalWithTax || 0) : "",
        isCreditSale ? row.creditDescription || row.partyName || "" : ""
      );

      return baseRow;
    }),
    [
      "TOTAL",
      "",
      "",
      Math.round(totals.amount),
      Math.round(totals.cgst),
      Math.round(totals.sgst),
      Math.round(totals.cgst + totals.sgst + totals.igst),
      Math.round(totals.disc),
      Math.round(totals.roundOff),
      Math.round(totals.totalWithTax),
      Math.round(totals.cash),
      Math.round(totals.upi),
      Math.round(totals.bank || 0),
      Math.round(totals.card || 0),
      "",
      ...(businessType !== "hotel" ? ["", ""] : []),
      Math.round(totals.credit),
      "",
    ],
    [],
    ["FINANCIAL SUMMARY"],
    ["Gross Amount", Math.round(totals.amount)],
    ["Discount", Math.round(totals.disc)],
    ["CGST", Math.round(totals.cgst)],
    ["SGST", Math.round(totals.sgst)],
    ["Total Tax", Math.round(totals.cgst + totals.sgst + totals.igst)],
    ["Cash", Math.round(totals.cash)],
    ["UPI", Math.round(totals.upi)],
    ["Bank", Math.round(totals.bank || 0)],
    ["Card", Math.round(totals.card || 0)],
    ["Credit Amount", Math.round(totals.credit)],
    ["Net Sale", Math.round(totals.totalWithTax)],
    [],
    ["BUSINESS TYPE BREAKDOWN"],
    ...(businessType !== "restaurant" && summary.hotelSales
      ? [
          [
            "Hotel Sales",
            Math.round(summary.agentCount || 0) +
              Math.round(summary.countWithOutAgent || 0),
          ],
          ["Transactions With Agent", Math.round(summary.agentCount || 0)],
          [
            "Transactions With Out Agent",
            Math.round(summary.countWithOutAgent || 0),
          ],
        ]
      : []),
    ...(businessType !== "hotel" && summary.restaurantSales
      ? [
          ["Restaurant Sales", Math.round(summary.restaurantCount || 0)],
          ["Room Service", Math.round(summary.IsRoomService || 0)],
          ["Take Away", Math.round(summary.IsTakeaway || 0)],
          ["Delivery", Math.round(summary.IsDelivery || 0)],
          [
            "Dine In",
            Math.round(summary.restaurantCount || 0) -
              (Math.round(summary.IsRoomService || 0) +
                Math.round(summary.IsTakeaway || 0) +
                Math.round(summary.IsDelivery || 0)),
          ],
          ["Others", Math.round(summary.restaurantSales.otherCount || 0)],
        ]
      : []),
    ["Total Transactions", salesData.length],
    [],
    ["KOT TYPE BREAKDOWN"],
    ...Object.entries(kotBreakdown).map(([type, data]) => [
      type,
      Math.round(data.amount),
      data.count,
    ]),
    [
      "TOTAL",
      Math.round(
        Object.values(kotBreakdown).reduce((sum, k) => sum + k.amount, 0)
      ),
      Object.values(kotBreakdown).reduce((sum, k) => sum + k.count, 0),
    ],
  ];

  const csv = csvContent
    .map((row) =>
      row
        .map((cell) => {
          const value = cell == null ? "" : String(cell);
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    `Sales_Report_${reportPeriod.replace(/\s+/g, "_")}.csv`
  );
  link.href = url;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/* ===================== Main Component ===================== */

const BillSummary = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [reportPeriod, setReportPeriod] = useState("");
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [kotTypeFilter, setKotTypeFilter] = useState("all");
  const [mealPeriodFilter, setMealPeriodFilter] = useState("all");

  const [businessType, setBusinessType] = useState(null);
  const [summary, setSummary] = useState({
    hotelSales: null,
    restaurantSales: null,
    agentCount: 0,
    countWithOutAgent: 0,
    restaurantCount: 0,
    IsRoomService: 0,
    IsTakeaway: 0,
    IsDelivery: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const owner = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const typeFromUrl = urlParams.get("type");
    if (typeFromUrl) {
      setBusinessType(typeFromUrl);
    }
  }, [location.search]);

  const updateDateTime = () => {
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-GB") +
      " " +
      now.toTimeString().split(" ")[0];
    setCurrentDateTime(formatted);
  };

  const getFilterOptions = () => {
    const kotTypes = [
      ...new Set(salesData.map((item) => item.kotType).filter(Boolean)),
    ];
    const mealPeriods = [
      ...new Set(salesData.map((item) => item.mealPeriod).filter(Boolean)),
    ];

    return {
      kotTypes: ["all", ...kotTypes],
      mealPeriods: ["all", ...mealPeriods],
    };
  };

  const fetchSalesData = async (start = startDate, end = endDate) => {
    if (!start || !end) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(start) > new Date(end)) {
      setError("Start date cannot be later than end date");
      return;
    }

    if (!cmp_id) {
      setError("Company ID is required. Please select an organization.");
      return;
    }

    if (!owner) {
      setError("Owner information is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const salesParams = {
        startDate: start,
        endDate: end,
        owner: owner.owner || owner._id,
        businessType,
      };

      const response = await api.get(
        `/api/sUsers/hotel-sales/${cmp_id}/${businessType}`,
        { params: salesParams }
      );

      const result = response.data;

      if (result.success) {
        setSalesData(result.data.sales || []);
        setSummary(result.data.summary || {});
        const formattedStart = formatDisplayDate(start);
        const formattedEnd = formatDisplayDate(end);
        setReportPeriod(`${formattedStart} To ${formattedEnd}`);
        updateDateTime();
      } else {
        setError(result.message || "Failed to fetch sales data");
        setSalesData([]);
        setSummary({
          hotelSales: null,
          restaurantSales: null,
          agentCount: 0,
          countWithOutAgent: 0,
          restaurantCount: 0,
          IsRoomService: 0,
          IsTakeaway: 0,
          IsDelivery: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching sales data:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch sales data. Please check your connection and try again."
      );
      setSalesData([]);
      setSummary({
        hotelSales: null,
        restaurantSales: null,
        agentCount: 0,
        countWithOutAgent: 0,
        restaurantCount: 0,
        IsRoomService: 0,
        IsTakeaway: 0,
        IsDelivery: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSalesData = salesData.filter((item) => {
    const kotMatch = kotTypeFilter === "all" || item.kotType === kotTypeFilter;
    const mealMatch =
      mealPeriodFilter === "all" || item.mealPeriod === mealPeriodFilter;
    return kotMatch && mealMatch;
  });

  const clearError = () => setError(null);

  const totals = filteredSalesData.reduce(
    (acc, item) => {
      const grossAmount = (item.amount || 0) - (item.igst || 0);

      return {
        amount: acc.amount + grossAmount,
        disc: acc.disc + (item.disc || 0),
        roundOff: acc.roundOff + (item.roundOff || 0),
        total: acc.total + (item.total || 0),
        cgst: acc.cgst + (item.cgst || 0),
        sgst: acc.sgst + (item.sgst || 0),
        igst: acc.igst + (item.igst || 0),
        totalWithTax: acc.totalWithTax + (item.totalWithTax || 0),
        cash: acc.cash + Number(item.cash || 0),
        credit: acc.credit + Number(item.credit || 0),
        upi: acc.upi + (Number(item.upi) ? Number(item.upi) || 0 : 0),
        bank: acc.bank + Number(item.bank || 0),
        card: acc.card + (Number(item.card) ? Number(item.card) || 0 : 0),
      };
    },
    {
      amount: 0,
      disc: 0,
      roundOff: 0,
      total: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalWithTax: 0,
      cash: 0,
      credit: 0,
      upi: 0,
      bank: 0,
      card: 0,
    }
  );

  const { kotTypes, mealPeriods } = getFilterOptions();

  useEffect(() => {
    if (!startDate && !endDate) {
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
    }
  }, []);

  useEffect(() => {
    if (cmp_id && owner && businessType && startDate && endDate) {
      fetchSalesData(startDate, endDate);
    }
  }, [cmp_id, owner, businessType, startDate, endDate]);

  const handlePDFExport = () => {
    if (filteredSalesData.length === 0) {
      alert("No data to export");
      return;
    }
    generatePDF(
      filteredSalesData,
      summary,
      owner,
      reportPeriod,
      businessType || "all",
      totals,
      kotTypeFilter,
      mealPeriodFilter
    );
  };

  const handleExcelExport = () => {
    if (filteredSalesData.length === 0) {
      alert("No data to export");
      return;
    }
    exportToExcel(
      filteredSalesData,
      summary,
      owner,
      reportPeriod,
      businessType || "all",
      totals,
      kotTypeFilter,
      mealPeriodFilter
    );
  };

  return (
    <>
      <TitleDiv
        title={
          businessType === "hotel"
            ? "Hotel Daily Summary"
            : "Restaurant Daily Summary"
        }
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 p-6">
        <div className=" mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-200">
          {/* Header */}
          <div className="text-center border-b border-gray-300 pb-4 mb-6">
            <div className="text-xl md:text-2xl font-semibold tracking-wide text-gray-900">
              {owner?.companyName || owner?.name || "Sales Report"}
            </div>
            <div className="mt-1 text-xs md:text-sm text-gray-500">
              {owner?.flat || owner?.road || "Sales Register of the Outlet"}
            </div>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-gray-900 text-white text-xs md:text-sm font-semibold tracking-wide uppercase shadow-sm">
              Sales Register - {businessType === "hotel" ? "Hotel" : "Restaurant"}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left: Dates + All */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-xs md:text-sm text-gray-700">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      clearError();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-xs md:text-sm text-gray-700">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      clearError();
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-xs md:text-sm text-gray-700">
                    All Types
                  </label>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setBusinessType("all");
                      } else {
                        const urlParams = new URLSearchParams(location.search);
                        const typeFromUrl = urlParams.get("type");
                        if (typeFromUrl) {
                          setBusinessType(typeFromUrl);
                        }
                      }
                    }}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Right: KOT / Meal filters */}
              {businessType !== "hotel" && (
                <div className="flex flex-wrap items-center gap-4 justify-start md:justify-end">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-xs md:text-sm text-gray-700">
                      KOT Type
                    </label>
                    <select
                      value={kotTypeFilter}
                      onChange={(e) => setKotTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      {kotTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === "all" ? "All KOT Types" : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-xs md:text-sm text-gray-700">
                      Meal Period
                    </label>
                    <select
                      value={mealPeriodFilter}
                      onChange={(e) => setMealPeriodFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      {mealPeriods.map((period) => (
                        <option key={period} value={period}>
                          {period === "all" ? "All Periods" : period}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {(kotTypeFilter !== "all" || mealPeriodFilter !== "all") && (
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-xs md:text-sm font-semibold text-gray-600">
                  Active Filters
                </span>
                {kotTypeFilter !== "all" && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                    <span>KOT: {kotTypeFilter}</span>
                    <button
                      onClick={() => setKotTypeFilter("all")}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200"
                      title="Clear KOT filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                {mealPeriodFilter !== "all" && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
                    <span>Meal: {mealPeriodFilter}</span>
                    <button
                      onClick={() => setMealPeriodFilter("all")}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-green-200"
                      title="Clear meal filter"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  onClick={() => {
                    setKotTypeFilter("all");
                    setMealPeriodFilter("all");
                  }}
                  className="ml-2 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 shadow-sm"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Error / Loading / Period */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="text-xs md:text-sm">
                  <span className="font-semibold mr-1">Error:</span>
                  <span>{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="ml-3 text-lg font-bold hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {reportPeriod && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 text-xs md:text-sm text-gray-600">
              <div>
                Period:{" "}
                <span className="font-semibold text-gray-900">
                  {reportPeriod}
                </span>
              </div>
              <div className="mt-1 md:mt-0">
                Printed at{" "}
                <span className="font-semibold text-blue-700">
                  {currentDateTime}
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-10">
              <div className="mx-auto h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-xs md:text-sm text-gray-600">
                Fetching sales data, please wait...
              </p>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white mb-6">
            <table className="w-full border-collapse text-[11px] md:text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Bill No
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Date
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Agent Name
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Gross Amount
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    CGST
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    SGST
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Total Tax
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Disc
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Round Off
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Net Total
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Cash
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    UPI
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Bank
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Card
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Mode
                  </th>
                  {businessType !== "hotel" && (
                    <>
                      <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                        Meal Period
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                        KOT Type
                      </th>
                    </>
                  )}
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Credit
                  </th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">
                    Credit Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredSalesData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={businessType !== "hotel" ? 19 : 17}
                      className="border border-gray-200 px-3 py-6 text-center text-gray-500 text-xs"
                    >
                      {error
                        ? "Unable to load data."
                        : `No ${
                            businessType === "all" ? "" : businessType
                          } sales records found for the selected period.`}
                    </td>
                  </tr>
                ) : (
                  filteredSalesData.map((row, index) => {
                    const isCreditSale =
                      row.partyAccount === "Sundry Debtors" ||
                      row.mode === "Credit" ||
                      (row.credit || 0) > 0;
                    const gross = (row.amount || 0) - (row.igst || 0);
               
                    return (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0
                            ? "bg-white hover:bg-gray-50"
                            : "bg-gray-50 hover:bg-gray-100"
                        }
                      >
                        <td className="border border-gray-200 px-2 py-1 text-left">
                          {row.billNo || "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-center">
                          {row.date
                            ? new Date(row.date).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-left">
                          {row.partyName || "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Math.round(gross)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {(row.cgst || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {(row.sgst || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {(row.igst || 0).toFixed(2)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Math.round(row.disc || 0)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Math.round(row.roundOff || 0)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Math.round(row.totalWithTax || 0)}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Number(row.cash)
                            ? Math.round(Number(row.cash))
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Number(row.upi)
                            ? Math.round(Number(row.upi))
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Number(row.bank)
                            ? Math.round(Number(row.bank))
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {Number(row.card)
                            ? Math.round(Number(row.card))
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-center">
                          {row.mode || "-"}
                        </td>
                        {businessType !== "hotel" && (
                          <>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              {row.mealPeriod || "-"}
                            </td>
                            <td className="border border-gray-200 px-2 py-1 text-center">
                              {row.kotType || "-"}
                            </td>
                          </>
                        )}
                        <td className="border border-gray-200 px-2 py-1 text-right">
                          {isCreditSale
                            ? Math.round(row.totalWithTax || 0)
                            : "-"}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-left">
                          {isCreditSale
                            ? row.creditDescription || row.partyName || "-"
                            : "-"}
                        </td>
                      </tr>
                    );
                  })
                )}

                {filteredSalesData.length > 0 && (
                  <tr className="bg-gray-900 text-white font-semibold">
                    <td className="border border-gray-800 px-2 py-2 text-left">
                      Total
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-center">
                      -
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-center">
                      -
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.amount)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {(totals.cgst).toFixed(2)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {(totals.sgst).toFixed(2)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.cgst + totals.sgst)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.disc)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.roundOff)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.totalWithTax)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.cash)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.upi)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.bank || 0)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.card || 0)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-center">
                      -
                    </td>
                    {businessType !== "hotel" && (
                      <>
                        <td className="border border-gray-800 px-2 py-2 text-center">
                          -
                        </td>
                        <td className="border border-gray-800 px-2 py-2 text-center">
                          -
                        </td>
                      </>
                    )}
                    <td className="border border-gray-800 px-2 py-2 text-right">
                      {Math.round(totals.credit)}
                    </td>
                    <td className="border border-gray-800 px-2 py-2 text-center">
                      -
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary + Breakdown */}
          {salesData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              {/* Financial Summary */}
              <div className="text-xs bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-sm text-gray-800">
                  Financial Summary
                </h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">
                        Gross Amount
                      </td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.amount)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">
                        Discount
                      </td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.disc)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">CGST</td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.cgst)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">SGST</td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.sgst)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">
                        Total Tax
                      </td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.cgst + totals.sgst )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">Cash</td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.cash)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">UPI</td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.upi)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">Bank</td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.bank || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">Card</td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.card || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-700 font-medium">
                        Credit Amount
                      </td>
                      <td className="py-1 text-right text-gray-900">
                        {Math.round(totals.credit)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-300">
                      <td className="py-2 text-gray-900 font-semibold">
                        Net Sale
                      </td>
                      <td className="py-2 text-right text-gray-900 font-semibold">
                        {Math.round(totals.totalWithTax)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Business Type Breakdown */}
              <div className="text-xs bg-gray-50 rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-sm text-gray-800">
                  Business Type Breakdown
                </h3>
                <table className="w-full">
                  <tbody>
                    {businessType !== "restaurant" && summary.hotelSales && (
                      <>
                        <tr className="bg-blue-50">
                          <td className="font-semibold py-2 px-2 text-gray-800">
                            Hotel Sales
                          </td>
                          <td className="text-right py-2 px-2 text-gray-900">
                            {Math.round(summary.agentCount || 0) +
                              Math.round(summary.countWithOutAgent || 0) ||
                              "0"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Transactions With Agent
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.agentCount || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Transactions With Out Agent
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.countWithOutAgent || 0)}
                          </td>
                        </tr>
                      </>
                    )}

                    {businessType !== "hotel" && summary.restaurantSales && (
                      <>
                        <tr className="bg-green-50">
                          <td className="font-semibold py-2 px-2 text-gray-800">
                            Restaurant Sales
                          </td>
                          <td className="text-right py-2 px-2 text-gray-900">
                            {Math.round(summary.restaurantCount || 0) || "0"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Room Service
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.IsRoomService || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Take Away
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.IsTakeaway || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Delivery
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.IsDelivery || 0)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Dine In
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.restaurantCount || 0) -
                              (Math.round(summary.IsRoomService || 0) +
                                Math.round(summary.IsTakeaway || 0) +
                                Math.round(summary.IsDelivery || 0))}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 px-2 text-gray-600">
                            - Others
                          </td>
                          <td className="text-right py-1 px-2 text-gray-800">
                            {Math.round(summary.restaurantSales.otherCount || 0)}
                          </td>
                        </tr>
                      </>
                    )}

                    <tr className="border-t border-gray-300">
                      <td className="font-semibold py-2 px-2 text-sm text-gray-900">
                        Total Transactions
                      </td>
                      <td className="text-right py-2 px-2 font-semibold text-sm text-gray-900">
                        {filteredSalesData.length}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-6 border-t border-gray-200 pt-3 text-[11px] text-gray-600 italic">
            <div>
              * This report shows{" "}
              {businessType === "all"
                ? "all sales transactions"
                : `only ${businessType} sales transactions`}
              .
            </div>
            <div>
              * Sales are classified by business type, party details, amount
              threshold, department, and item analysis.
            </div>
            <div>* Complimentary and cancelled bills are excluded.</div>
          </div>

          {/* Actions */}
          <div className="mt-6 text-center">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handlePDFExport}
                disabled={filteredSalesData.length === 0}
                className="px-5 py-2 rounded-full bg-red-600 text-white text-xs md:text-sm font-semibold shadow-md hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                Export PDF
              </button>
              <button
                onClick={handleExcelExport}
                disabled={filteredSalesData.length === 0}
                className="px-5 py-2 rounded-full bg-blue-600 text-white text-xs md:text-sm font-semibold shadow-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                Export Excel
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 rounded-full bg-gray-700 text-white text-xs md:text-sm font-semibold shadow-md hover:bg-gray-800"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillSummary;
