import api from "@/api/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TitleDiv from "@/components/common/TitleDiv";

const fmt = (n) =>
  (n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const today = new Date().toISOString().split("T")[0];
const get29DaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d.toISOString().split("T")[0];
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

const TD = ({ children, right, bold, muted, green }) => (
  <td
    style={{
      padding: "7px 10px",
      textAlign: right ? "right" : "left",
      fontWeight: bold ? 700 : 400,
      color: muted ? "#666" : green ? "#059669" : "#111",
      whiteSpace: "nowrap",
      fontSize: 12,
    }}
  >
    {children}
  </td>
);

export default function TravelAgentSalesReport() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id
  );

  const [fromDate,      setFromDate]      = useState(get29DaysAgo());
  const [toDate,        setToDate]        = useState(today);
  const [selectedAgent, setSelectedAgent] = useState("ALL");
  const [agentList,     setAgentList]     = useState([]);
  const [reportData,    setReportData]    = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  // ── Agent dropdown ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cmp_id) return;
    api
      .get("/api/sUsers/travel-agent-sales/agents", { params: { cmp_id } })
      .then(({ data }) => { if (data.success) setAgentList(data.data || []); })
      .catch(console.error);
  }, [cmp_id]);

  // ── Fetch report ──────────────────────────────────────────────────────────
  const fetchReport = useCallback(async () => {
    if (!cmp_id) { setError("Company not selected"); return; }
    setLoading(true);
    setError("");
    setReportData([]);
    try {
      const { data } = await api.get("/api/sUsers/travel-agent-sales", {
        params: {
          cmp_id,
          from: fromDate,
          to:   toDate,
          ...(selectedAgent !== "ALL" && { agentId: selectedAgent }),
        },
      });
      if (!data.success) throw new Error(data.message || "Failed to fetch");
      setReportData(data.agentSummary || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [cmp_id, fromDate, toDate, selectedAgent]);

  useEffect(() => {
    if (cmp_id) fetchReport();
  }, [cmp_id]);

  // ── Grand totals ──────────────────────────────────────────────────────────
  const grand = useMemo(
    () =>
      reportData.reduce(
        (acc, a) => ({
          RRent:  acc.RRent  + (a.totalRRent  || 0),
          EBed:   acc.EBed   + (a.totalEBed   || 0),
          PlAmt:  acc.PlAmt  + (a.totalPlAmt  || 0),
          TOTAL:  acc.TOTAL  + (a.totalTOTAL  || 0),
          CGST:   acc.CGST   + (a.totalCGST   || 0),
          SGST:   acc.SGST   + (a.totalSGST   || 0),
          NetAmt: acc.NetAmt + (a.totalNetAmt || 0),
          count:  acc.count  + (a.sales?.length || 0),
        }),
        { RRent: 0, EBed: 0, PlAmt: 0, TOTAL: 0, CGST: 0, SGST: 0, NetAmt: 0, count: 0 }
      ),
    [reportData]
  );

  // ── Excel export ──────────────────────────────────────────────────────────
  const exportToExcel = () => {
    const rows = [];
    rows.push(["TRAVEL AGENT SALES REPORT"]);
    rows.push([`Period: ${fromDate}  To  ${toDate}`]);
    rows.push([]);

    reportData.forEach((agent) => {
      rows.push([`Agent: ${agent.agentName}`, `Mobile: ${agent.agentMobile || ""}`, `GST: ${agent.agentGst || ""}`]);
      rows.push(["SlNo","BillNo","RoomNo","Guest Name","CheckInDate","CheckOutDate","NoD","Plan","RRent","EBed","PlAmt","TOTAL","CGST","SGST","NetAmt"]);

      agent.sales.forEach((s) =>
        rows.push([
          s.SlNo,
          s.BillNo       || "",
          s.RoomNo       || "",
          s.GuestName    || "",
          s.CheckInDate  || "",
          s.CheckOutDate || "",
          s.NoD          ?? "",
          s.Plan         || "",
          s.RRent  || 0,
          s.EBed   || 0,
          s.PlAmt  || 0,
          s.TOTAL  || 0,
          s.CGST   || 0,
          s.SGST   || 0,
          s.NetAmt || 0,
        ])
      );

      rows.push(["","","","","","","","Sub Total",
        agent.totalRRent, agent.totalEBed, agent.totalPlAmt,
        agent.totalTOTAL, agent.totalCGST, agent.totalSGST, agent.totalNetAmt,
      ]);
      rows.push([]);
    });

    rows.push(["","","","","","","","Grand Total",
      grand.RRent, grand.EBed, grand.PlAmt,
      grand.TOTAL, grand.CGST, grand.SGST, grand.NetAmt,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [6,16,14,24,13,13,6,10,12,10,10,12,10,10,12].map((w) => ({ wch: w }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agent Sales");
    XLSX.writeFile(wb, `travel-agent-sales-${fromDate}-to-${toDate}.xlsx`);
  };

  // ── PDF export ────────────────────────────────────────────────────────────
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(13);
    doc.text("TRAVEL AGENT SALES REPORT", 14, 12);
    doc.setFontSize(10);
    doc.text(`Period: ${fromDate}  To  ${toDate}`, 14, 19);

    const HEAD = [["SlNo","BillNo","RoomNo","Guest Name","CheckInDate","CheckOutDate","NoD","Plan","RRent","EBed","PlAmt","TOTAL","CGST","SGST","NetAmt"]];
    const COLS = [
      { cellWidth: 8  },
      { cellWidth: 22 },
      { cellWidth: 18 },
      { cellWidth: 30 },
      { cellWidth: 20 },
      { cellWidth: 20 },
      { cellWidth: 10 },
      { cellWidth: 12 },
      { halign: "right", cellWidth: 16 },
      { halign: "right", cellWidth: 14 },
      { halign: "right", cellWidth: 14 },
      { halign: "right", cellWidth: 16 },
      { halign: "right", cellWidth: 14 },
      { halign: "right", cellWidth: 14 },
      { halign: "right", cellWidth: 18 },
    ];

    let finalY = 24;

    reportData.forEach((agent, i) => {
      if (i > 0) finalY += 4;
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text(`Agent: ${agent.agentName}${agent.agentMobile ? "   |   " + agent.agentMobile : ""}`, 14, finalY);
      doc.setFont(undefined, "normal");

      const body = agent.sales.map((s) => [
        s.SlNo,
        s.BillNo || "", s.RoomNo || "", s.GuestName || "",
        s.CheckInDate || "", s.CheckOutDate || "",
        s.NoD ?? "", s.Plan || "",
        fmt(s.RRent), fmt(s.EBed), fmt(s.PlAmt),
        fmt(s.TOTAL), fmt(s.CGST), fmt(s.SGST), fmt(s.NetAmt),
      ]);

      body.push(["","","","","","","","Sub Total",
        fmt(agent.totalRRent), fmt(agent.totalEBed), fmt(agent.totalPlAmt),
        fmt(agent.totalTOTAL), fmt(agent.totalCGST), fmt(agent.totalSGST), fmt(agent.totalNetAmt),
      ]);

      autoTable(doc, {
        startY:       finalY + 3,
        head:         HEAD,
        body,
        styles:       { fontSize: 7, cellPadding: 1.5 },
        headStyles:   { fillColor: [26, 58, 92], textColor: 255 },
        columnStyles: COLS,
        didParseCell: (h) => {
          if (h.row.raw?.[7] === "Sub Total") {
            h.cell.styles.fontStyle = "bold";
            h.cell.styles.fillColor = [240, 244, 255];
          }
        },
      });
      finalY = doc.lastAutoTable.finalY;
    });

    autoTable(doc, {
      startY: finalY + 5,
      body: [["","","","","","","","Grand Total",
        fmt(grand.RRent), fmt(grand.EBed), fmt(grand.PlAmt),
        fmt(grand.TOTAL), fmt(grand.CGST), fmt(grand.SGST), fmt(grand.NetAmt),
      ]],
      styles:       { fontSize: 8, fontStyle: "bold", fillColor: [26, 58, 92], textColor: 255 },
      columnStyles: COLS,
    });

    doc.save(`travel-agent-sales-${fromDate}-to-${toDate}.pdf`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <TitleDiv title="TRAVEL AGENT SALES REPORT" />

      <div style={{ padding: 20, fontFamily: "Segoe UI, sans-serif", background: "#f5f6fa", minHeight: "100vh" }}>

        {/* FILTER BAR */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-sm font-bold uppercase tracking-tight text-slate-800 md:text-base">
              Travel Agent Sales Report
            </h1>
            <div className="flex flex-wrap items-end gap-2">

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">From</label>
                <input
                  type="date" value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">To</label>
                <input
                  type="date" value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-9 w-36 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="h-9 w-48 rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                >
                  <option value="ALL">All Agents</option>
                  {agentList.map((a) => (
                    <option key={a._id} value={a._id}>{a.agentName}</option>
                  ))}
                </select>
              </div>

              <button onClick={fetchReport}
                className="h-9 rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white hover:bg-teal-800">
                Fetch
              </button>
              <button onClick={exportToExcel} disabled={!reportData.length}
                className="h-9 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Excel
              </button>
              <button onClick={exportToPDF} disabled={!reportData.length}
                className="h-9 rounded-lg bg-rose-700 px-4 text-xs font-semibold text-white hover:bg-rose-800 disabled:opacity-50 disabled:cursor-not-allowed">
                PDF
              </button>

            </div>
          </div>
        </div>

        {/* STATES */}
        {loading && (
          <div style={{ padding: 30, textAlign: "center", color: "#555" }}>
            Loading report...
          </div>
        )}
        {error && (
          <div style={{ padding: 12, background: "#fee2e2", color: "#b91c1c", borderRadius: 8, marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}
        {!loading && !error && reportData.length === 0 && (
          <div style={{ padding: 30, textAlign: "center", color: "#888" }}>
            No data found. Click <strong>Fetch</strong> to load report.
          </div>
        )}

        {/* ONE TABLE PER AGENT */}
        {!loading && !error && reportData.map((agent, index) => (
          <div key={`${agent.agentId}-${index}`} style={{ marginBottom: 28, background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>

            {/* Agent Header */}
            <div style={{ background: "#eef2f7", padding: "10px 14px", borderBottom: "1px solid #dde3ee" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1a3a5c" }}>
                {agent.agentName}
              </span>
              {agent.agentMobile && (
                <span style={{ fontSize: 12, color: "#555", marginLeft: 14 }}>
                  📞 {agent.agentMobile}
                </span>
              )}
              {agent.agentGst && (
                <span style={{ fontSize: 12, color: "#555", marginLeft: 14 }}>
                  GST: {agent.agentGst}
                </span>
              )}
              <span style={{ float: "right", fontSize: 12, color: "#666" }}>
                {agent.sales.length} booking{agent.sales.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <TH>SlNo</TH>
                    <TH>BillNo</TH>
                    <TH>RoomNo</TH>
                    <TH>Guest Name</TH>
                    <TH>CheckInDate</TH>
                    <TH>CheckOutDate</TH>
                    <TH right>NoD</TH>
                    <TH>Plan</TH>
                    <TH right>RRent</TH>
                    <TH right>EBed</TH>
                    <TH right>PlAmt</TH>
                    <TH right>TOTAL</TH>
                    <TH right>CGST</TH>
                    <TH right>SGST</TH>
                    <TH right>NetAmt</TH>
                  </tr>
                </thead>
                <tbody>
                  {agent.sales.map((s, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background:   idx % 2 === 0 ? "#fff" : "#f9fafb",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <TD muted>{s.SlNo}</TD>
                      <TD>{s.BillNo || "-"}</TD>
                      <TD bold>{s.RoomNo || "-"}</TD>
                      <TD>{s.GuestName || "-"}</TD>
                      <TD muted>{s.CheckInDate || "-"}</TD>
                      <TD muted>{s.CheckOutDate || "-"}</TD>
                      <TD right>{s.NoD ?? "-"}</TD>
                      <TD>{s.Plan || "-"}</TD>
                      <TD right>{fmt(s.RRent)}</TD>
                      <TD right green={s.EBed > 0}>{s.EBed > 0 ? fmt(s.EBed) : "—"}</TD>
                      <TD right>{fmt(s.PlAmt)}</TD>
                      <TD right>{fmt(s.TOTAL)}</TD>
                      <TD right muted>{fmt(s.CGST)}</TD>
                      <TD right muted>{fmt(s.SGST)}</TD>
                      <TD right bold>{fmt(s.NetAmt)}</TD>
                    </tr>
                  ))}

                  {/* Sub Total row */}
                  <tr style={{ background: "#eef2ff", borderTop: "2px solid #c7d2fe" }}>
                    <td colSpan={8} style={{ padding: "9px 10px", fontWeight: 700, fontSize: 12, color: "#1a3a5c" }}>
                      Sub Total
                    </td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalRRent)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalEBed)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalPlAmt)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalTOTAL)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalCGST)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalSGST)}</td>
                    <td style={{ padding: "9px 10px", textAlign: "right", fontWeight: 700, fontSize: 12 }}>{fmt(agent.totalNetAmt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* GRAND TOTAL */}
        {!loading && !error && reportData.length > 0 && (
          <div style={{ background: "#1a3a5c", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ color: "#fff" }}>
                  <td colSpan={8} style={{ padding: "13px 14px", fontWeight: 700, fontSize: 13 }}>
                    Grand Total — {grand.count} booking{grand.count !== 1 ? "s" : ""}
                  </td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 700 }}>{fmt(grand.RRent)}</td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 700 }}>{fmt(grand.EBed)}</td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 700 }}>{fmt(grand.PlAmt)}</td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 700 }}>{fmt(grand.TOTAL)}</td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 700 }}>{fmt(grand.CGST)}</td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 700 }}>{fmt(grand.SGST)}</td>
                  <td style={{ padding: "13px 10px", textAlign: "right", fontWeight: 800, fontSize: 14 }}>{fmt(grand.NetAmt)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}