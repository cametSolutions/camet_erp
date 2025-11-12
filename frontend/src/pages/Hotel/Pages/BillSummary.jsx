import { useState, useEffect } from "react";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

// For PDF export
const generatePDF = async (
  salesData,
  summary,
  owner,
  reportPeriod,
  businessType,
  totals,
  kotTypeFilter,
  mealPeriodFilter
) => {
  // Create a new window for PDF generation
  const printWindow = window.open("", "_blank");
  
const computeKotBreakdown = (salesData) => {
  return salesData.reduce((acc, item) => {
    const kotType = item.kotType || "Unknown";
    if (!acc[kotType]) acc[kotType] = { amount: 0, count: 0 };
    acc[kotType].amount += item.totalWithTax || 0;
    acc[kotType].count += 1;
    return acc;
  }, {});
};
const kotBreakdown = computeKotBreakdown(salesData);
 const businessTypeTitle = () => {
    switch (businessType) {
      case "hotel":
        return "Hotel Sales Register - Accommodation & Room Service";
      case "restaurant":
        return "Restaurant Sales Register - Food & Beverage Service";
      default:
        return "Combined Sales Register - Hotel & Restaurant";
    }
  };

   const filterInfo = () => {
    const filters = [];
    if (kotTypeFilter !== "all") filters.push(`KOT Type: ${kotTypeFilter}`);
    if (mealPeriodFilter !== "all") filters.push(`Meal Period: ${mealPeriodFilter}`);
    return filters.length > 0 ? `<div style="margin-top: 5px; font-size: 10px;">Filters Applied: ${filters.join(', ')}</div>` : '';
  };
  console.log(businessType);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales Report - ${reportPeriod}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        .header { text-center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
        .company-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .company-address { font-size: 10px; color: #666; }
        .report-title { font-size: 14px; margin-top: 10px; }
        .business-type { margin-top: 10px; }
        .badge { padding: 5px 10px; border-radius: 15px; font-size: 10px; font-weight: bold; }
        .hotel-badge { background-color: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
        .restaurant-badge { background-color: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .report-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px; }
        th, td { border: 1px solid black; padding: 4px; text-align: center; }
        th { background-color: #f3f4f6; font-weight: bold; }
        .text-left { text-align: left !important; }
        .text-right { text-align: right !important; }
        .totals-row { background-color: #f3f4f6; font-weight: bold; }
        .summary-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .summary-table { width: 100%; }
        .summary-table td { border: none; padding: 2px 5px; }
        .summary-title { font-weight: bold; margin-bottom: 10px; font-size: 12px; }
        .notes { font-size: 10px; font-style: italic; color: #666; margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${
          owner?.companyName || owner?.name || "Sales Report"
        }</div>
        <div class="company-address">${
          owner?.address || owner?.road || "Sales Register"
        }</div>
        <div class="report-title">${businessTypeTitle()}</div>
           ${filterInfo()}
      ${businessType !== "all" ? `
          <div class="business-type">
            <span class="badge ${businessType === "hotel" ? "hotel-badge" : "restaurant-badge"}">
              ${businessType === "hotel" ? "🏨 Hotel Sales Only" : "🍽️ Restaurant Sales Only"}
            </span>
          </div>
        ` : ""}
      </div>
<div>
  <div class="summary-title">KOT Type Breakdown</div>
  <table class="summary-table">
    ${Object.entries(kotBreakdown)
      .map(
        ([type, data]) => `
        <tr>
          <td><strong>${type}</strong></td>
          <td class="text-right">${data.amount.toFixed(2)}</td>
          <td class="text-right">${data.count}</td>
        </tr>`
      )
      .join("")}
    <tr style="border-top: 2px solid black;">
      <td><strong>Total</strong></td>
      <td class="text-right"><strong>${Object.values(kotBreakdown)
        .reduce((sum, k) => sum + k.amount, 0)
        .toFixed(2)}</strong></td>
      <td class="text-right"><strong>${Object.values(kotBreakdown)
        .reduce((sum, k) => sum + k.count, 0)}</strong></td>
    </tr>
  </table>
</div>
      <div class="report-info">
        <div>For the Period <strong>${reportPeriod}</strong></div>
        <div>Print Date & Time: <strong>${new Date().toLocaleString()}</strong></div>
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
            <th>Mode</th>
            <th>Meal Period</th>
            <th>KOT Type</th>
            <th>Credit</th>
            <th>Credit Desc</th>
          </tr>
        </thead>
         <tbody>
          ${salesData.map((row) => {
            const isCreditSale = row.partyAccount === "Sundry Debtors" || row.mode === "Credit" || row.credit > 0;
            const isCashSale = (row.partyAccount === "Cash-in-Hand" || row.partyAccount === "CASH") && !isCreditSale;
            const isBankSale = (row.partyAccount === "Bank Accounts" || row.partyAccount === "Gpay") && !isCreditSale;
            const grossAmount = (row.amount || 0) - (row.igst || 0);
            
            return `
            <tr>
              <td class="text-left">${row.billNo || "-"}</td>
              <td>${row.date ? new Date(row.date).toLocaleDateString() : "-"}</td>
              <td class="text-left">${row.partyName || "-"}</td>
              <td class="text-right">${grossAmount.toFixed(2)}</td>
              <td>${(row.cgst || 0).toFixed(2)}</td>
              <td>${(row.sgst || 0).toFixed(2)}</td>
              <td>${(row.igst || 0).toFixed(2)}</td>
              <td>${(row.disc || 0).toFixed(2)}</td>
              <td>${(row.roundOff || 0).toFixed(2)}</td>
              <td>${(row.totalWithTax || 0).toFixed(2)}</td>
              <td>${isCashSale ? (row.totalWithTax || 0).toFixed(2) : "-"}</td>
              <td>${isBankSale ? (row.totalWithTax || 0).toFixed(2) : "-"}</td>
              <td><span class="mode-badge mode-${isCreditSale ? 'credit' : isBankSale ? 'upi' : 'cash'}">${isCreditSale ? "Credit" : isBankSale ? "UPI" : "Cash"}</span></td>
              <td>${row.mealPeriod || "-"}</td>
              <td>${row.kotType || "-"}</td>
              <td>${isCreditSale ? (row.totalWithTax || 0).toFixed(2) : "-"}</td>
              <td class="text-left">${isCreditSale ? (row.creditDescription || row.partyName || "-") : "-"}</td>
            </tr>
          `;}).join("")}
          <tr class="totals-row">
            <td class="text-left" colspan="3">Total</td>
            <td class="text-right">${totals.amount.toFixed(2)}</td>
            <td>${totals.cgst.toFixed(2)}</td>
            <td>${totals.sgst.toFixed(2)}</td>
            <td>${totals.igst.toFixed(2)}</td>
            <td>${totals.disc.toFixed(2)}</td>
            <td>${totals.roundOff.toFixed(2)}</td>
            <td>${totals.totalWithTax.toFixed(2)}</td>
            <td>${totals.cash.toFixed(2)}</td>
            <td>${totals.upi.toFixed(2)}</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>${totals.credit.toFixed(2)}</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>

         <div class="summary-section">
        <div>
          <div class="summary-title">Financial Summary</div>
          <table class="summary-table">
            <tr><td><strong>Gross Amount</strong></td><td class="text-right">${totals.amount.toFixed(2)}</td></tr>
            <tr><td><strong>Discount</strong></td><td class="text-right">${totals.disc.toFixed(2)}</td></tr>
            <tr><td><strong>CGST</strong></td><td class="text-right">${totals.cgst.toFixed(2)}</td></tr>
            <tr><td><strong>SGST</strong></td><td class="text-right">${totals.sgst.toFixed(2)}</td></tr>
            <tr><td><strong>Total Tax</strong></td><td class="text-right">${totals.igst.toFixed(2)}</td></tr>
            <tr><td><strong>Net Cash</strong></td><td class="text-right">${totals.cash.toFixed(2)}</td></tr>
            <tr><td><strong>UPI</strong></td><td class="text-right">${totals.upi.toFixed(2)}</td></tr>
            <tr><td><strong>Credit Amount</strong></td><td class="text-right">${totals.credit.toFixed(2)}</td></tr>
            <tr style="border-top: 2px solid black;"><td><strong>Net Sale</strong></td><td class="text-right"><strong>${totals.totalWithTax.toFixed(2)}</strong></td></tr>
          </table>
        </div>
        <div>
          <div class="summary-title">Business Type Breakdown</div>
          <table class="summary-table">
            ${businessType === "hotel" && summary.hotelSales ? `
              <tr style="background-color: #dbeafe;"><td><strong>Hotel Sales</strong></td><td class="text-right">${summary.hotelSales.amount?.toFixed(2) || "0.00"}</td></tr>
              <tr><td>- Transactions</td><td class="text-right">${summary.hotelSales.count || 0}</td></tr>
            ` : ""}
            ${businessType === "restaurant" && summary.restaurantSales ? `
              <tr style="background-color: #dcfce7;"><td><strong>Restaurant Sales</strong></td><td class="text-right">${summary.restaurantSales.amount?.toFixed(2) || "0.00"}</td></tr>
              <tr><td>- Transactions</td><td class="text-right">${summary.restaurantSales.count || 0}</td></tr>
            ` : ""}
            ${businessType === "all" ? `
              ${summary.hotelSales ? `<tr style="background-color: #dbeafe;"><td><strong>Hotel Sales</strong></td><td class="text-right">${summary.hotelSales.amount?.toFixed(2) || "0.00"}</td></tr>
              <tr><td>- Transactions</td><td class="text-right">${summary.hotelSales.count || 0}</td></tr>` : ""}
              ${summary.restaurantSales ? `<tr style="background-color: #dcfce7;"><td><strong>Restaurant Sales</strong></td><td class="text-right">${summary.restaurantSales.amount?.toFixed(2) || "0.00"}</td></tr>
              <tr><td>- Transactions</td><td class="text-right">${summary.restaurantSales.count || 0}</td></tr>` : ""}
            ` : ""}
            <tr style="border-top: 2px solid black;"><td><strong>Total Transactions</strong></td><td class="text-right"><strong>${salesData.length}</strong></td></tr>
          </table>
        </div>
<div>
  <div class="summary-title">KOT Type Breakdown</div>
  <table class="summary-table">
    ${Object.entries(kotBreakdown)
      .map(
        ([type, data]) => `
        <tr>
          <td><strong>${type}</strong></td>
          <td class="text-right">${data.amount.toFixed(2)}</td>
          <td class="text-right">${data.count}</td>
        </tr>`
      )
      .join("")}
    <tr style="border-top: 2px solid black;">
      <td><strong>Total</strong></td>
      <td class="text-right"><strong>${Object.values(kotBreakdown)
        .reduce((sum, k) => sum + k.amount, 0)
        .toFixed(2)}</strong></td>
      <td class="text-right"><strong>${Object.values(kotBreakdown)
        .reduce((sum, k) => sum + k.count, 0)}</strong></td>
    </tr>
  </table>
</div>


      </div>



      <div class="notes">
        <div>* This report shows ${businessType === "all" ? "all sales transactions" : `only ${businessType} sales transactions`}</div>
        ${kotTypeFilter !== "all" || mealPeriodFilter !== "all" ? `<div>* Filtered by: ${[kotTypeFilter !== "all" ? `KOT Type: ${kotTypeFilter}` : "", mealPeriodFilter !== "all" ? `Meal Period: ${mealPeriodFilter}` : ""].filter(Boolean).join(", ")}</div>` : ""}
        
        <div>* Complimentary and cancelled sales are not included in totals</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

// For Excel export
const exportToExcel = (
  salesData,
  summary,
  owner,
  reportPeriod,
  businessType,
  totals,
    kotTypeFilter,
  mealPeriodFilter
) => {
  const filterInfo = [];
   if (kotTypeFilter !== "all") filterInfo.push(`KOT Type: ${kotTypeFilter}`);
  if (mealPeriodFilter !== "all") filterInfo.push(`Meal Period: ${mealPeriodFilter}`);

const computeKotBreakdown = (salesData) => {
  return salesData.reduce((acc, item) => {
    const kotType = item.kotType || "Unknown";
    if (!acc[kotType]) acc[kotType] = { amount: 0, count: 0 };
    acc[kotType].amount += item.totalWithTax || 0;
    acc[kotType].count += 1;
    return acc;
  }, {});
};


  const kotBreakdown = computeKotBreakdown(salesData);

  const csvContent = [
    // Header information
    [owner?.companyName || owner?.name || "Sales Report"],
    [owner?.address || owner?.road || ""],
    [`Report Period: ${reportPeriod}`],
   [`Business Type: ${businessType === "all" ? "All Sales" : businessType.charAt(0).toUpperCase() + businessType.slice(1)}`],
    ...(filterInfo.length > 0 ? [[`Filters: ${filterInfo.join(", ")}`]] : []),
    [`Generated: ${new Date().toLocaleString()}`],
    [], // Empty row

    // Table headers
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
      "Payment Mode",
      "Meal Period",
      "KOT Type",
      "Credit",
      "Credit Description",
    ],

    // Data rows
     ...salesData.map((row) => {
      const isCreditSale = row.partyAccount === "Sundry Debtors" || row.mode === "Credit" || row.credit > 0;
      const isCashSale = (row.partyAccount === "Cash-in-Hand" || row.partyAccount === "CASH") && !isCreditSale;
      const isBankSale = (row.partyAccount === "Bank Accounts" || row.partyAccount === "Gpay") && !isCreditSale;
      const grossAmount = (row.amount || 0) - (row.igst || 0);

      return [
        row.billNo || "",
        row.date ? new Date(row.date).toLocaleDateString() : "",
        row.partyName || "",
        grossAmount.toFixed(2),
        (row.cgst || 0).toFixed(2),
        (row.sgst || 0).toFixed(2),
        (row.igst || 0).toFixed(2),
        (row.disc || 0).toFixed(2),
        (row.roundOff || 0).toFixed(2),
        (row.totalWithTax || 0).toFixed(2),
        isCashSale ? (row.totalWithTax || 0).toFixed(2) : "",
        isBankSale ? (row.totalWithTax || 0).toFixed(2) : "",
        isCreditSale ? "Credit" : isBankSale ? "UPI" : "Cash",
        row.mealPeriod || "",
        row.kotType || "",
        isCreditSale ? (row.totalWithTax || 0).toFixed(2) : "",
        isCreditSale ? (row.creditDescription || row.partyName || "") : "",
      ];
    }),


    // Totals row
      [
      "TOTAL",
      "",
      "",
      totals.amount.toFixed(2),
      totals.cgst.toFixed(2),
      totals.sgst.toFixed(2),
      totals.igst.toFixed(2),
      totals.disc.toFixed(2),
      totals.roundOff.toFixed(2),
      totals.totalWithTax.toFixed(2),
      totals.cash.toFixed(2),
      totals.upi.toFixed(2),
      "",
      "",
      "",
      totals.credit.toFixed(2),
      "",
    ],

    [], // Empty row
      // Summary section
    ["FINANCIAL SUMMARY"],
    ["Gross Amount", totals.amount.toFixed(2)],
    ["Discount", totals.disc.toFixed(2)],
    ["CGST", totals.cgst.toFixed(2)],
    ["SGST", totals.sgst.toFixed(2)],
    ["Total Tax", totals.igst.toFixed(2)],
    ["Net Cash", totals.cash.toFixed(2)],
    ["UPI", totals.upi.toFixed(2)],
    ["Credit Amount", totals.credit.toFixed(2)],
    ["Net Sale", totals.totalWithTax.toFixed(2)],

    [], // Empty row

    // Business breakdown
    ["BUSINESS TYPE BREAKDOWN"],
    ...(businessType === "hotel" && summary.hotelSales ? [
      ["Hotel Sales", summary.hotelSales.amount?.toFixed(2) || "0.00"],
      ["Hotel Transactions", summary.hotelSales.count || 0],
    ] : []),
    ...(businessType === "restaurant" && summary.restaurantSales ? [
      ["Restaurant Sales", summary.restaurantSales.amount?.toFixed(2) || "0.00"],
      ["Restaurant Transactions", summary.restaurantSales.count || 0],
    ] : []),
    ...(businessType === "all" ? [
      ...(summary.hotelSales ? [
        ["Hotel Sales", summary.hotelSales.amount?.toFixed(2) || "0.00"],
        ["Hotel Transactions", summary.hotelSales.count || 0],
      ] : []),
      ...(summary.restaurantSales ? [
        ["Restaurant Sales", summary.restaurantSales.amount?.toFixed(2) || "0.00"],
        ["Restaurant Transactions", summary.restaurantSales.count || 0],
      ] : []),
    ] : []),
    ["Total Transactions", salesData.length],




  ];


  csvContent.push([]);
csvContent.push(["KOT TYPE BREAKDOWN"]);
Object.entries(kotBreakdown).forEach(([type, data]) => {
  csvContent.push([type, data.amount.toFixed(2), data.count]);
});
csvContent.push([
  "TOTAL",
  Object.values(kotBreakdown)
    .reduce((sum, k) => sum + k.amount, 0)
    .toFixed(2),
  Object.values(kotBreakdown)
    .reduce((sum, k) => sum + k.count, 0),
]);

  // Convert to CSV format
   const csv = csvContent
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && (cell.includes(",") || cell.includes('"')) 
            ? `"${cell.replace(/"/g, '""')}"` 
            : cell
        )
        .join(",")
    )
    .join("\n");
    csvContent.push([]);
csvContent.push(["KOT TYPE BREAKDOWN"]);
Object.entries(kotBreakdown).forEach(([type, data]) => {
  csvContent.push([type, data.amount.toFixed(2), data.count]);
});
csvContent.push([
  "TOTAL",
  Object.values(kotBreakdown)
    .reduce((sum, k) => sum + k.amount, 0)
    .toFixed(2),
  Object.values(kotBreakdown)
    .reduce((sum, k) => sum + k.count, 0),
]);


  // Create and download file
   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Sales_Report_${reportPeriod.replace(/\s+/g, "_")}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
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

  const [businessType, setBusinessType] = useState("all");
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalDiscount: 0,
    totalCgst: 0,
    totalSgst: 0,
    totalIgst: 0,
    totalCash: 0,
    totalCredit: 0,
    totalUpi: 0,
    totalCheque: 0,
    totalBank: 0,
    totalFinalAmount: 0,
    totalRoundOff: 0,
  });

  // Get URL parameters and Redux data
  const location = useLocation();
  const navigate = useNavigate();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const owner = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // Extract business type from URL parameters
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
      now.toLocaleDateString("en-GB") + " " + now.toTimeString().split(" ")[0];
    setCurrentDateTime(formatted);
  };

  const getFilterOptions = () => {
  const kotTypes = [...new Set(salesData.map(item => item.kotType).filter(Boolean))];
  const mealPeriods = [...new Set(salesData.map(item => item.mealPeriod).filter(Boolean))];
  

 
  return {
    kotTypes: ["all", ...kotTypes],
    mealPeriods: ["all", ...mealPeriods]
  };
};

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper functions for business type styling

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
        businessType: businessType,
      };

      console.log("Sending params:", salesParams);

      const response = await api.get(`/api/sUsers/hotel-sales/${cmp_id}`, {
        params: salesParams,
      });

      const result = response.data;

      if (result.success) {
        setSalesData(result.data.sales || []);
        setSummary(result.data.summary || {});

        const formattedStart = formatDateForDisplay(start);
        const formattedEnd = formatDateForDisplay(end);
        setReportPeriod(`${formattedStart} To ${formattedEnd}`);
        updateDateTime();

        console.log(
          `Loaded ${
            result.data.sales?.length || 0
          } ${businessType} sales records`
        );
      } else {
        setError(result.message || "Failed to fetch sales data");
        setSalesData([]);
        setSummary({
          totalAmount: 0,
          totalDiscount: 0,
          totalCgst: 0,
          totalSgst: 0,
          totalIgst: 0,
          totalCash: 0,
          totalCredit: 0,
          totalUpi: 0,
          totalCheque: 0,
          totalBank: 0,
          totalFinalAmount: 0,
          totalRoundOff: 0,
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
        totalAmount: 0,
        totalDiscount: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        totalCash: 0,
        totalCredit: 0,
        totalUpi: 0,
        totalCheque: 0,
        totalBank: 0,
        totalFinalAmount: 0,
        totalRoundOff: 0,
      });
    } finally {
      setLoading(false);
    }
  };


   const filteredSalesData = salesData.filter(item => {
  const kotMatch = kotTypeFilter === "all" || item.kotType === kotTypeFilter;
  const mealMatch = mealPeriodFilter === "all" || item.mealPeriod === mealPeriodFilter;
  return kotMatch && mealMatch;
});

  const generateReport = async () => {
    await fetchSalesData();
  };

  const clearError = () => {
    setError(null);
  };

  // Calculate totals from the current salesData for display consistency
  const totals = filteredSalesData.reduce(
    (acc, item) => {
      const isCashSale =
        item.partyAccount === "Cash-in-Hand" || item.partyAccount === "CASH";

        const isBankSale=
        item.partyAccount === "Bank" || item.partyAccount === "Bank Accounts" || item.partyAccount === "Gpay";

 const isCreditSale = 
      item.partyAccount === "Sundry Debtors" ||
      item.mode === "Credit" ||
      item.credit > 0;


 const grossAmount = (item.amount || 0)  - (item.igst || 0);

      return {
       amount: acc.amount + grossAmount,
        disc: acc.disc + (item.disc || 0),
        roundOff: acc.roundOff + (item.roundOff || 0),
        total: acc.total + (item.total || 0),
        cgst: acc.cgst + (item.cgst || 0),
        sgst: acc.sgst + (item.sgst || 0),
        igst: acc.igst + (item.igst || 0),
        totalWithTax: acc.totalWithTax + (item.totalWithTax || 0),

        // ✅ Modified logic:
        cash: acc.cash + (isCashSale ? item.totalWithTax || 0 : 0),

        // Keep other payment modes the same
        credit: acc.credit +(isCreditSale ? item.totalWithTax || 0 : 0),
        upi: acc.upi + (isBankSale ? item.totalWithTax || 0 : 0),
        cheque: acc.cheque + (isBankSale ? item.totalWithTax || 0 : 0),
        bank: acc.bank + (isBankSale ? item.totalWithTax || 0 : 0),
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
      cheque: 0,
      bank: 0,
    }
  );


  const { kotTypes, mealPeriods } = getFilterOptions();
  // console.log(totals);
  // console.log(salesData);

  useEffect(() => {
    // Initialize with current date
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);

    // Fetch data for today on component mount if required data is available
    if (cmp_id && owner && businessType) {
      fetchSalesData(today, today);
    }
  }, [cmp_id, owner, businessType]);

  // Auto-fetch data when dates or business type change (with debounce)
  useEffect(() => {
    if (
      startDate &&
      endDate &&
      startDate !== "" &&
      endDate !== "" &&
      cmp_id &&
      businessType
    ) {
      const timeoutId = setTimeout(() => {
        fetchSalesData();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate, cmp_id, businessType]);

 const handlePDFExport = () => {
  if (filteredSalesData.length === 0) {  // ✅ Changed
    alert("No data to export");
    return;
  }
  generatePDF(
    filteredSalesData,  // ✅ Changed
    summary, 
    owner, 
    reportPeriod, 
    businessType, 
    totals,
    kotTypeFilter,      // ✅ Pass filters
    mealPeriodFilter    // ✅ Pass filters
  );
};
 const handleExcelExport = () => {
  if (filteredSalesData.length === 0) {  // ✅ Changed
    alert("No data to export");
    return;
  }
  exportToExcel(
    filteredSalesData,  // ✅ Changed
    summary,
    owner,
    reportPeriod,
    businessType,
    totals,
    kotTypeFilter,      // ✅ Pass filters
    mealPeriodFilter    // ✅ Pass filters
  );
};
  console.log(salesData);
  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-6xl mx-auto bg-white p-5 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-3 mb-5">
          <div className="text-lg font-bold mb-1">
            {owner?.companyName || owner?.name || "Sales Report"}
          </div>
          <div className="text-xs text-gray-600">
            {owner?.address || owner?.road || "Sales Register"}
          </div>
          <div className="text-sm font-bold mt-2">
            SALES REGISTER OF THE OUTLET - {businessType}{" "}
            {salesData?.[0]?.kotType || ""}
          </div>
        </div>

        {/* Date Controls and Business Type Selector */}
      <div className="bg-gray-50 p-4 rounded-md mb-5">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left side - Date filters */}
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="font-bold text-sm">From Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            clearError();
          }}
          className="px-2 py-2 border border-gray-300 rounded text-sm"
          disabled={loading}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="font-bold text-sm">To Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            clearError();
          }}
          className="px-2 py-2 border border-gray-300 rounded text-sm"
          disabled={loading}
        />
      </div>
    </div>

    {/* Right side - KOT Type and Meal Period filters */}
        {businessType !== "hotel" && (
    <div className="flex flex-wrap items-center gap-4 justify-end">
      <div className="flex items-center gap-2">
        <label className="font-bold text-sm">KOT Type:</label>
        <select
          value={kotTypeFilter}
          onChange={(e) => setKotTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
          disabled={loading}
        >
          {kotTypes.map((type) => (
            <option key={type} value={type}>
              {type === "all" ? "All Types" : type}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <label className="font-bold text-sm">Meal Period:</label>
        <select
          value={mealPeriodFilter}
          onChange={(e) => setMealPeriodFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm bg-white"
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
  
  {/* Active filters display */}
  {(kotTypeFilter !== "all" || mealPeriodFilter !== "all") && (
    <div className="mt-3 flex flex-wrap gap-2 items-center">
      <span className="text-sm font-semibold text-gray-600">Active Filters:</span>
      {kotTypeFilter !== "all" && (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-2">
          KOT: {kotTypeFilter}
          <button
            onClick={() => setKotTypeFilter("all")}
            className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
            title="Clear filter"
          >
            ×
          </button>
        </span>
      )}
      {mealPeriodFilter !== "all" && (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-2">
          Meal: {mealPeriodFilter}
          <button
            onClick={() => setMealPeriodFilter("all")}
            className="hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center"
            title="Clear filter"
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
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium hover:bg-gray-300"
      >
        Clear All Filters
      </button>
    </div>
  )}
</div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <div>
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading sales data...</p>
          </div>
        )}

        {/* Report Info */}
        {reportPeriod && (
          <div className="flex justify-between mb-4 text-xs">
            <div>
              For the Period <span className="font-medium">{reportPeriod}</span>
            </div>
            <div>
              Print Date & Time:{" "}
              <span className="font-bold text-blue-600">{currentDateTime}</span>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto mb-5">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-t border-l border-black p-2 text-center font-bold">
                  Bill No
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Date
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Agent Name
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                 Gross Amount
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  CGST
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  SGST
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Total Tax
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Disc
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Round off
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Net Total
                </th>
                {/* <th className="border-t border-black p-2 text-center font-bold">
                  Total
                </th> */}
                <th className="border-t border-black p-2 text-center font-bold">
                  Cash
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  UPI
                </th>
                <th className="border-t border-black p-2 text-center font-bold">
                  Mode
                </th>
                  {businessType !== "hotel" && (
                <th className="border-t border-black p-2 text-center font-bold">
                  Meal Period
                </th>
              )}
               {businessType !== "hotel" && (
                <th className="border-t border-black p-2 text-center font-bold">
                  Kot Type
                </th>
                  )}
                <th className="border-t border-black p-2 text-center font-bold">
                  Credit
                </th>
                <th className="border-t border-r border-black p-2 text-center font-bold">
                  Credit Description
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredSalesData.length === 0 ? (
                <tr>
                  <td
                    colSpan="15"
                    className="border border-black p-4 text-center text-gray-500"
                  >
                    {error
                      ? "Unable to load data"
                      : `No ${
                          businessType === "all" ? "" : businessType
                        } sales data found for the selected period`}
                  </td>
                </tr>
              ) : (
                filteredSalesData.map((row, index) => {
                    const isCreditSale = 
    row.partyAccount === "Sundry Debtors" ||
    row.mode === "Credit" ||
    row.credit > 0;
    
  const isCashSale = 
    (row.partyAccount === "Cash-in-Hand" || row.partyAccount === "CASH") &&
    !isCreditSale;
    
  const isBankSale = 
    (row.partyAccount === "Bank Accounts" || row.partyAccount === "Gpay") &&
    !isCreditSale;
               return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-black p-2 text-left pl-3">
                      {row.billNo || "-"}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                    </td>
                    <td className="border border-black p-2 text-right pr-3">
                      {row.partyName}
                    </td>
                  <td className="border border-black p-2 text-right pr-3">
  {((row.amount || 0) - (row.igst || 0)).toFixed(2)}
</td>

                    <td className="border border-black p-2 text-center">
                      {(row?.cgst || 0).toFixed(2)}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {(row?.sgst || 0).toFixed(2)}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {(row?.igst || 0).toFixed(2)}
                    </td>

                    <td className="border border-black p-2 text-center">
                      {(row.disc || 0).toFixed(2)}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {(row.roundOff || 0).toFixed(2)}
                    </td>
                    <td className="border border-black p-2 text-center">
                      {(row.totalWithTax || 0).toFixed(2)}
                    </td>
                     <td className="border border-black p-2 text-center">
            {isCashSale ? (row.totalWithTax || 0).toFixed(2) : "-"}
          </td>
                     <td className="border border-black p-2 text-center">
            {isBankSale ? (row.totalWithTax || 0).toFixed(2) : "-"}
          </td>
                     <td className="border border-black p-2 text-center">
        <span className={`px-2 py-1 mx-1 rounded text-xs font-semibold ${
          isCreditSale 
            ? "bg-orange-100 text-orange-800" 
            : isBankSale 
            ? "bg-blue-100 text-blue-800" 
            : "bg-green-100 text-green-800"
        }`}>
          {isCreditSale ? "Credit" : isBankSale ? "UPI" : "Cash"}
        </span>
      </td>
       {businessType !== "hotel" && (
                    <td className="border border-black p-2 text-center">
                      {row.mealPeriod || "-"}
                    </td>
       )}
        {businessType !== "hotel" && (
                    <td className="border border-black p-2 text-center">
                      {row.kotType || "-"}
                    </td>
        )}
                     <td className="border border-black p-2 text-center">
            {isCreditSale ? (row.totalWithTax || 0).toFixed(2) : "-"}
          </td>
                      <td className="border border-black p-2 text-center">
            {isCreditSale ? (row.creditDescription || row.partyName) : "-"}
          </td>
                    {/* <td className="border border-black p-2 text-center">
                      {(row.total || 0).toFixed(2)}
                    </td>

                    <td className="border border-black p-2 text-center">
                      0.00
                    </td> */}
                  </tr>
                  );
    })
  )}
              {/* Totals Row */}
              {salesData.length > 0 && (
                <tr className="border-t-2 border-black font-bold bg-gray-100">
                  <td className="border border-black p-2 text-left pl-3">
                    Total
                  </td>
                  <td className="border border-black p-2 text-center">-</td>
                  <td className="border border-black p-2 text-center">-</td>
                  <td className="border border-black p-2 text-right pr-3">
                    {totals.amount.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.cgst.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.sgst.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.igst.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.disc.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.roundOff.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.totalWithTax.toFixed(2)}
                  </td>

                  <td className="border border-black p-2 text-center">
                    {totals.cash.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {totals.upi.toFixed(2)}
                  </td>

                  <td className="border border-black p-2 text-center">-</td>
                  {/* <td className="border border-black p-2 text-center">-</td>
                  <td className="border border-black p-2 text-center">-</td> */}
                  <td className="border border-black p-2 text-center">
                    {totals.credit.toFixed(2)}
                  </td>
                  <td className="border border-black p-2 text-center">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section with Business Breakdown */}
        {salesData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {/* Financial Summary */}
            <div className="text-xs">
              <h3 className="font-bold mb-3 text-sm">Financial Summary</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-bold py-1">Gross Amount</td>
                    <td className="text-right py-1">
                      {totals.amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Discount</td>
                    <td className="text-right py-1">
                      {totals.disc.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">CGST</td>
                    <td className="text-right py-1">
                      {totals.cgst.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">SGST</td>
                    <td className="text-right py-1">
                      {totals.sgst.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Total Tax</td>
                    <td className="text-right py-1">
                      {totals.igst.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Total</td>
                    <td className="text-right py-1">
                      {totals.totalWithTax.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Net Cash</td>
                    <td className="text-right py-1">
                      {totals.cash.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">UPI</td>
                    <td className="text-right py-1">{totals.upi.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Round off</td>
                    <td className="text-right py-1">
                      {totals.roundOff.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold py-1">Credit Amount</td>
                    <td className="text-right py-1">
                      {totals.credit.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-black">
                    <td className="font-bold py-1 text-sm">Net Sale</td>
                    <td className="text-right py-1 font-bold text-sm">
                      {totals.totalWithTax.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Business Breakdown */}
            <div className="text-xs">
              <h3 className="font-bold mb-3 text-sm">
                Business Type Breakdown
              </h3>
              <table className="w-full">
                <tbody>
                  {businessType === "hotel" && summary.hotelSales && (
                    <>
                      <tr className="bg-blue-50">
                        <td className="font-bold py-2 px-2">Hotel Sales</td>
                        <td className="text-right py-2 px-2">
                          {summary.hotelSales.amount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2 text-gray-600">
                          - Transactions
                        </td>
                        <td className="text-right py-1 px-2">
                          {summary.hotelSales.count || 0}
                        </td>
                      </tr>
                    </>
                  )}

                  {businessType === "restaurant" && summary.restaurantSales && (
                    <>
                      <tr className="bg-green-50">
                        <td className="font-bold py-2 px-2">
                          Restaurant Sales
                        </td>
                        <td className="text-right py-2 px-2">
                          {summary.restaurantSales.amount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2 text-gray-600">
                          - Transactions
                        </td>
                        <td className="text-right py-1 px-2">
                          {summary.restaurantSales.count || 0}
                        </td>
                      </tr>
                   

  {/* KOT Type Breakdown */}
                      {(() => {
                        const kotBreakdown = filteredSalesData.reduce((acc, item) => {
                          const kotType = item.kotType || "Unknown";
                          if (!acc[kotType]) {
                            acc[kotType] = { amount: 0, count: 0 };
                          }
                          acc[kotType].amount += item.totalWithTax || 0;
                          acc[kotType].count += 1;
                          return acc;
                        }, {});

                        return Object.entries(kotBreakdown).map(([type, data]) => (
                          <tr key={type}>
                            <td className="py-1 px-4 text-gray-900 text-xs font-bold">
                              {type}
                            </td>
                            <td className="text-right py-1 px-2 text-xs font-bold">
                              {data.amount.toFixed(2)}
                            </td>
                          </tr>
                        ));
                      })()}
                    </>
                  )}
                  {summary.otherSales && summary.otherSales.count > 0 && (
                    <>
                      <tr className="bg-gray-50">
                        <td className="font-bold py-2 px-2">Other Sales</td>
                        <td className="text-right py-2 px-2">
                          {summary.otherSales.amount?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2 text-gray-600">
                          - Transactions
                        </td>
                        <td className="text-right py-1 px-2">
                          {summary.otherSales.count || 0}
                        </td>
                      </tr>
                    </>
                  )}

                  <tr className="border-t-2 border-black">
                    <td className="font-bold py-2 px-2 text-sm">
                      Total Transactions
                    </td>
                    <td className="text-right py-2 px-2 font-bold text-sm">
                      {salesData.length}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="text-xs italic text-gray-600 mt-5 border-t pt-3">
          <div className="mb-1">
            * This report shows{" "}
            {businessType === "all"
              ? "all sales transactions"
              : `only ${businessType} sales transactions`}
          </div>
          <div className="mb-1">
            * Sales are classified based on business type, party details, amount
            threshold, department, or item analysis
          </div>
          <div>
            * Complimentary and cancelled sales are not included in totals
          </div>
        </div>

        {/* Export and Action Buttons */}
        <div className="text-center mt-5 no-print">
          <div className="flex flex-wrap justify-center gap-3">
            {/* <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-2"
            >
              🖨️ Print Report
            </button> */}
            <button
              onClick={handlePDFExport}
              disabled={filteredSalesData.length === 0}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm font-medium flex items-center gap-2"
            >
              📄 Export PDF
            </button>
            <button
              onClick={handleExcelExport}
              disabled={filteredSalesData.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium flex items-center gap-2"
            >
              📊 Export Excel
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm font-medium"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillSummary;
