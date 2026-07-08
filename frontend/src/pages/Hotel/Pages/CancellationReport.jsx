import api from "@/api/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import useFetch from "@/customHook/useFetch";
import { toast } from "sonner";
import { generateAndPrintKOT } from "@/pages/Restuarant/Helper/kotPrintHelper";
import TitleDiv from "../../../components/common/TitleDiv";
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${day}-${month}-${year} ${time}`;
};

const CancellationReport = () => {
  const {
    _id: cmp_id,
    configurations,
    name,
  } = useSelector((state) => state.secSelectedOrganization.secSelectedOrg);
  const owner = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cancelType, setCancelType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState([]);
  const [tableHeight, setTableHeight] = useState(320);

  const pageRef = useRef(null);
  const tableWrapperRef = useRef(null);

  const [summary, setSummary] = useState({
    total: 0,
    booking: 0,
    checkin: 0,
    checkout: 0,
    kot: 0,
    sale: 0,
    receipt: 0,
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    const calculateTableHeight = () => {
      if (pageRef.current && tableWrapperRef.current) {
        const wrapperTop = tableWrapperRef.current.getBoundingClientRect().top;
        const availableHeight = window.innerHeight - wrapperTop - 20;
        setTableHeight(availableHeight > 220 ? availableHeight : 220);
      }
    };

    calculateTableHeight();
    window.addEventListener("resize", calculateTableHeight);

    return () => window.removeEventListener("resize", calculateTableHeight);
  }, [reportData.length, error]);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be later than end date.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/api/sUsers/cancellation-report/${cmp_id}`, {
        params: {
          startDate,
          endDate,
          cancelType,
          owner: owner?.id || owner?.owner || "",
        },
      });

      if (res.data?.success) {
        setReportData(res.data.data || []);
        setSummary(
          res.data.summary || {
            total: 0,
            booking: 0,
            checkin: 0,
            checkout: 0,
            kot: 0,
            sale: 0,
            receipt: 0,
          },
        );
      } else {
        setReportData([]);
        setError(res.data?.message || "Failed to load cancellation report.");
      }
    } catch (err) {
      setReportData([]);
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setCancelType("all");
    setStartDate(today);
    setEndDate(today);
    setSearchTerm("");
    setReportData([]);
    setError("");
    setSummary({
      total: 0,
      booking: 0,
      checkin: 0,
      checkout: 0,
      kot: 0,
      sale: 0,
      receipt: 0,
    });
  };

  const filteredReportData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return reportData;

    return reportData.filter((row) => {
      const formattedDate = row.cancelledAt
        ? formatDisplayDate(row.cancelledAt).toLowerCase()
        : "";

      const bookingDate = row.date
        ? formatDisplayDate(row.date).toLowerCase()
        : "";

      return (
        (row.cancelType || "").toLowerCase().includes(search) ||
        (row.voucherNumber || "").toLowerCase().includes(search) ||
        (row.cancelledByName || "").toLowerCase().includes(search) ||
        (row.reason || "").toLowerCase().includes(search) ||
        formattedDate.includes(search) ||
        bookingDate.includes(search)
      );
    });
  }, [reportData, searchTerm]);

  const getExportData = () => {
    return reportData.map((row, index) => ({
      "Sl No": index + 1,
      Type: row.cancelType || "-",
      "Voucher No": row.voucherNumber || "-",
      Date: row.date ? formatDisplayDate(row.date) : "-",
      "Cancelled By": row.cancelledByName || "-",
      "Cancelled Date": row.cancelledAt
        ? formatDisplayDate(row.cancelledAt)
        : "-",
      Reason: row.reason || "-",
    }));
  };

  const exportToExcel = () => {
    if (!reportData.length) {
      setError("No data available to export.");
      return;
    }

    const exportData = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Cancellation Report");
    XLSX.writeFile(workbook, "Cancellation_Report.xlsx");
  };

  const exportToPDF = () => {
    if (!reportData.length) {
      setError("No data available to export.");
      return;
    }

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFontSize(14);
    doc.text("Cancellation Report", 14, 15);

    doc.setFontSize(10);
    doc.text(`${owner?.companyName || owner?.name || ""}`, 14, 21);
    doc.text(`From: ${startDate || "-"}   To: ${endDate || "-"}`, 14, 27);
    doc.text(`Type: ${cancelType}`, 14, 33);

    autoTable(doc, {
      startY: 38,
      head: [
        [
          "Sl No",
          "Type",
          "Voucher No",
          "Date",
          "Cancelled By",
          "Cancelled Date",
          "Reason",
        ],
      ],
      body: reportData.map((row, index) => [
        index + 1,
        row.cancelType || "-",
        row.voucherNumber || "-",
        row.date ? formatDisplayDate(row.date) : "-",
        row.cancelledByName || "-",
        row.cancelledAt ? formatDisplayDate(row.cancelledAt) : "-",
        row.reason || "-",
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [26, 58, 92],
        textColor: 255,
      },
      theme: "grid",
    });

    doc.save("Cancellation_Report.pdf");
  };

  const handlePrintRow = async (row) => {
    if (row.cancelType === "checkout") {
      const hasPrint1 = configurations[0]?.defaultPrint?.print1;

      if (!row.voucherId) {
        toast.error("Voucher not found");
        return;
      }

      const response = await api.get(
        `/api/sUsers/specificDataForPrint/${cmp_id}/${row.voucherId}/checkout`,
        { withCredentials: true },
      );

      const checkoutData = response?.data?.data;
      navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
        state: {
          selectedCheckOut: checkoutData,
          customerId: checkoutData?.customerId?._id,
          isForPreview: false,
        },
      });
    }
    if (row.cancelType === "sale") {
      const hasPrint1 = configurations[0]?.defaultPrint?.print1;

      if (!row.voucherId) {
        toast.error("Voucher not found");
        return;
      }

      const response = await api.get(
        `/api/sUsers/specificDataForPrint/${cmp_id}/${row.voucherNumber}/sale`,
        { withCredentials: true },
      );

      const checkoutData = response?.data?.data;
      navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
        state: {
          selectedCheckOut: checkoutData,
          customerId: checkoutData?.customerId?._id,
          isForPreview: false,
        },
      });
    }
    if (row.cancelType === "checkin" || row.cancelType === "booking") {
      if (!row.voucherId) {
        toast.error("Voucher not found");
        return;
      }
      let route = row.cancelType === "checkin" ? "checkin" : "booking";

      const response = await api.get(
        `/api/sUsers/specificDataForPrint/${cmp_id}/${row.voucherId}/${route}`,
        { withCredentials: true },
      );

      const checkoutData = response?.data?.data;
      navigate("/sUsers/CheckInPrint", {
        state: {
          selectedCheckOut: checkoutData,
          customerId: checkoutData?.customerId?._id,
          isForPreview: false,
        },
      });
    }
    if (row.cancelType === "receipt") {
      if (!row.voucherId) {
        toast.error("Voucher not found");
        return;
      }
       navigate(`/sUsers/recietpprint/${row.voucherId}`)
    }


    if (row.cancelType === "kot") {
      if (!row.voucherId) {
        toast.error("Voucher not found");
        return;
      }
      const response = await api.get(
        `/api/sUsers/specificDataForPrint/${cmp_id}/${row.voucherId}/kot`,
        { withCredentials: true },
      );

      const data = response?.data?.data[0];
      const orderData = {
        kotNo: data?.voucherNumber,
        tableNo: data?.tableNumber,
        items: data?.items,
        createdAt: data?.createdAt,
        customerName: data?.customer?.name,
        guestName: data?.customer?.guestName,
        type: data?.type,
        roomName: data?.roomId?.roomName,
        isCancelled: true,
      };
      generateAndPrintKOT(orderData, true, false, name);
    }
  };

  return (
    <>
     <TitleDiv title="Cancellation Report" />
    <div
      ref={pageRef}
      style={{
        padding: 12,
        fontFamily: "Segoe UI, sans-serif",
        background: "#f5f6fa",
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "10px 14px",
          marginBottom: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1a3a5c",
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          CANCELLATION REPORT
        </h2>

        <div
          style={{
            marginTop: 2,
            fontSize: 11,
            color: "#666",
          }}
        >
          {owner?.companyName || owner?.name || ""}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 12,
          marginBottom: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                marginBottom: 3,
                color: "#666",
                fontWeight: 600,
              }}
            >
              FROM DATE
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                height: 30,
                padding: "0 8px",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                fontSize: 11,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                marginBottom: 3,
                color: "#666",
                fontWeight: 600,
              }}
            >
              TO DATE
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                height: 30,
                padding: "0 8px",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                fontSize: 11,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 10,
                marginBottom: 3,
                color: "#666",
                fontWeight: 600,
              }}
            >
              TYPE
            </label>
            <select
              value={cancelType}
              onChange={(e) => setCancelType(e.target.value)}
              style={{
                height: 30,
                padding: "0 8px",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                minWidth: 130,
                fontSize: 11,
              }}
            >
              <option value="all">All</option>
              <option value="booking">Booking</option>
              <option value="checkin">Check In</option>
              <option value="checkout">Check Out</option>
              <option value="kot">KOT</option>
              <option value="sale">Sale</option>
              <option value="receipt">Receipt</option>
            </select>
          </div>

          <button
            onClick={fetchReport}
            disabled={loading}
            style={{
              height: 30,
              background: "#0f766e",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "0 12px",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {loading ? "Loading..." : "Fetch"}
          </button>

          <button
            onClick={clearFilters}
            style={{
              height: 30,
              background: "#e5e7eb",
              color: "#111",
              border: "none",
              borderRadius: 5,
              padding: "0 12px",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <button
            onClick={exportToExcel}
            style={{
              height: 30,
              background: "#15803d",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "0 12px",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            Excel
          </button>

          <button
            onClick={exportToPDF}
            style={{
              height: 30,
              background: "#b91c1c",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "0 12px",
              fontWeight: 600,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            PDF
          </button>

          <div style={{ minWidth: 180, flex: "1 1 220px" }}>
            <label
              style={{
                display: "block",
                fontSize: 10,
                marginBottom: 3,
                color: "#666",
                fontWeight: 600,
              }}
            >
              SEARCH
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Voucher / type / reason..."
              style={{
                width: "100%",
                height: 30,
                padding: "0 8px",
                border: "1px solid #d1d5db",
                borderRadius: 5,
                fontSize: 11,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(110px,1fr))",
          gap: 8,
          marginBottom: 10,
        }}
      >
        {[
          ["Total", summary.total],
          ["Booking", summary.booking],
          ["Check In", summary.checkin],
          ["Check Out", summary.checkout],
          ["KOT", summary.kot],
          ["Sale", summary.sale],
          ["Receipt", summary.receipt],
        ].map(([title, value]) => (
          <div
            key={title}
            style={{
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#666",
                marginBottom: 3,
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#1a3a5c",
                lineHeight: 1.1,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: 8,
            borderRadius: 6,
            marginBottom: 10,
            fontSize: 11,
          }}
        >
          {error}
        </div>
      )}

      <div
        ref={tableWrapperRef}
        style={{
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            height: tableHeight,
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 900,
              borderCollapse: "collapse",
              fontSize: 11,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1a3a5c",
                  color: "#fff",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                }}
              >
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Type</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>
                  Voucher No
                </th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>Date</th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>
                  Cancelled By
                </th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>
                  Cancelled Date
                </th>
                <th style={{ padding: "8px 10px", textAlign: "left" }}>
                  Reason
                </th>
                <th style={{ padding: "8px 10px", textAlign: "center" }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && filteredReportData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 20,
                      color: "#777",
                      fontSize: 11,
                    }}
                  >
                    {searchTerm
                      ? "No matching cancellation records found"
                      : "No cancellation records found"}
                  </td>
                </tr>
              ) : (
                filteredReportData.map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      background: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: "7px 10px" }}>
                      {row.cancelType || "-"}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      {row.voucherNumber || "-"}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      {row.date ? formatDisplayDate(row.date) : "-"}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      {row.cancelledByName || "-"}
                    </td>
                    <td style={{ padding: "7px 10px" }}>
                      {row.cancelledAt
                        ? formatDisplayDate(row.cancelledAt)
                        : "-"}
                    </td>
                    <td style={{ padding: "7px 10px" }}>{row.reason || "-"}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>
                        <button
                          onClick={() => handlePrintRow(row)}
                          style={{
                            height: 26,
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 5,
                            padding: "0 10px",
                            fontWeight: 600,
                            fontSize: 10,
                            cursor: "pointer",
                          }}
                        >
                          Print
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default CancellationReport;
