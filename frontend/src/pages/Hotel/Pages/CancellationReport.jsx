import api from "@/api/api";
import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";

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
 const cmp_id = useSelector(
     (state) => state.secSelectedOrganization.secSelectedOrg._id,
   );
  const owner = useSelector((state) => state.secSelectedOrganization.secSelectedOrg);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cancelType, setCancelType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState([]);

  const [summary, setSummary] = useState({
    total: 0,
    booking: 0,
    checkin: 0,
    checkout: 0,
    kot: 0,
    sale: 0,
  });

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

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
    

      const res = await api.get(`/api/sUsers/cancellation-report/${cmp_id}`, { params: {
    startDate,
    endDate,
    cancelType,
    owner: owner?.id || owner?.owner || "",
  }, });

      if (res.data?.success) {
        setReportData(res.data.data || []);
        setSummary(res.data.summary || {
          total: 0,
          booking: 0,
          checkin: 0,
          checkout: 0,
          kot: 0,
          sale: 0,
          receipt:0,
        });
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
    setCancelType("all");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate(new Date().toISOString().split("T")[0]);
    setReportData([]);
    setError("");
  };
console.log(reportData)
return (
  <>
    <div
      style={{
        padding: 20,
        fontFamily: "Segoe UI, sans-serif",
        background: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "12px 18px",
          marginBottom: 15,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1a3a5c",
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          CANCELLATION REPORT
        </h2>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            color: "#666",
          }}
        >
          {owner?.companyName || owner?.name || ""}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 15,
          marginBottom: 15,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                marginBottom: 4,
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
                height: 36,
                padding: "0 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                marginBottom: 4,
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
                height: 36,
                padding: "0 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                marginBottom: 4,
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
                height: 36,
                padding: "0 10px",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                minWidth: 150,
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
              height: 36,
              background: "#0f766e",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0 16px",
              fontWeight: 600,
              
              cursor: "pointer",
            }}
          >
            {loading ? "Loading..." : "Fetch"}
          </button>

          <button
            onClick={clearFilters}
            style={{
              height: 36,
              background: "#e5e7eb",
              color: "#111",
              border: "none",
              borderRadius: 6,
              padding: "0 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 12,
          marginBottom: 15,
        }}
      >
        {[
          ["Total", summary.total],
          ["Booking", summary.booking],
          ["Check In", summary.checkin],
          ["Check Out", summary.checkout],
          ["KOT", summary.kot],
          ["Sale", summary.sale],
          ["Sale", summary.receipt],
        ].map(([title, value]) => (
          <div
            key={title}
            style={{
              background: "#fff",
              padding: 12,
              borderRadius: 10,
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 4,
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#1a3a5c",
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
            padding: 10,
            borderRadius: 8,
            marginBottom: 15,
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#1a3a5c",
                  color: "#fff",
                }}
              >
                <th style={{ padding: 10, textAlign: "left" }}>Type</th>
                <th style={{ padding: 10, textAlign: "left" }}>
                  Voucher No
                </th>
                <th style={{ padding: 10, textAlign: "left" }}>
                  Cancelled By
                </th>
                <th style={{ padding: 10, textAlign: "left" }}>
                  Cancelled Date
                </th>
                <th style={{ padding: 10, textAlign: "left" }}>
                  Reason
                </th>
                
              </tr>
            </thead>

            <tbody>
              {!loading && reportData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: 30,
                      color: "#777",
                    }}
                  >
                    No cancellation records found
                  </td>
                </tr>
              ) : (
                reportData.map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      background:
                        index % 2 === 0
                          ? "#ffffff"
                          : "#f8fafc",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <td style={{ padding: 10 }}>
                      {row.cancelType}
                    </td>

                    <td style={{ padding: 10 }}>
                      {row.voucherNumber}
                    </td>

                    <td style={{ padding: 10 }}>
                      {row.cancelledByName || "-"}
                    </td>

                    <td style={{ padding: 10 }}>
                      {row.cancelledAt
                        ? formatDisplayDate(
                            row.cancelledAt
                          )
                        : "-"}
                    </td>

                    <td style={{ padding: 10 }}>
                      {row.reason || "-"}
                    </td>

                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Total */}
      {reportData.length > 0 && (
        <div
          style={{
            marginTop: 15,
            background: "#1a3a5c",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Total Cancellation Records : {summary.total}
        </div>
      )}
    </div>
  </>
);
};

export default CancellationReport;