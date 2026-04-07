import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api"; // change to your actual api file
import { useSelector } from "react-redux";

const OccupancyCheckoutReport = () => {
  const [filters, setFilters] = useState({
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
  });

  const [report, setReport] = useState({
    summary: {},
    planSummary: [],
    rows: [],
    roomStatus: [],
    reportDate: "",
    printDateTime: "",
  });


   const cmp_id = useSelector(
           (state) => state.secSelectedOrganization.secSelectedOrg._id
         );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const printMeta = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
    };
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/sUsers/occupancy-checkout-report", {
        params: {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
          cmp_id: cmp_id,
        },
      });

      const result = response?.data;

      if (result?.success) {
        setReport({
          summary: result.summary || {},
          planSummary: result.planSummary || [],
          rows: result.rows || [],
          roomStatus: result.roomStatus || [],
          reportDate: result.reportDate || "",
          printDateTime: result.printDateTime || "",
        });
      } else {
        setError(result?.message || "Failed to fetch report");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

// helper (add near top of file)
const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value; // fallback if not a valid date
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const detailRows = report.rows.map((item) => ({
      "Sl.No.": item.slNo,
      Room: item.room,
      "Grc No": item.grcNo,
      "Guest Name": item.guestName,
      Company: item.company,
      Pax: item.pax,
      Arrival: `${item.arrivalDate || ""} ${item.arrivalTime || ""}`.trim(),
      Departure: item.departureDate,
      Plan: item.plan,
      Tariff: item.tariff,
      "Disc %": item.discountPercent,
      "Discount Amount": item.discountAmount,
    }));

    const ws = XLSX.utils.json_to_sheet([], { skipHeader: true });

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        ["THE FEEL MUNNAR RESORT AND SPA"],
        [],
        ["Occupancy List Summary :-"],
        [],
        ["Report Date :-", report.reportDate || filters.toDate, "", "", "", "", "", "", "", "", "Print Date & Time :", `${printMeta.date} ${printMeta.time}`],
        [],
      ],
      { origin: "B2" }
    );

    XLSX.utils.sheet_add_json(ws, detailRows, {
      origin: "B11",
      skipHeader: false,
    });

    const statsStart = report.rows.length + 16;

    XLSX.utils.sheet_add_aoa(
      ws,
      [
        ["***** Statistics *****"],
        [],
        ["Occupancy %", report.summary?.occupancyPercentage || 0, "Rooms occupied", report.summary?.roomsOccupied || 0],
        ["House Count", report.summary?.houseCount || 0, "Single", report.summary?.single || 0],
        ["Domestic", report.summary?.domestic || 0, "Double", report.summary?.double || 0],
        ["Foreigners", report.summary?.foreigners || 0, "Triple", report.summary?.triple || 0],
        ["Room Revenue", report.summary?.roomRevenue || 0, "Other", report.summary?.other || 0],
        ["A.R.R.", report.summary?.arr || 0, "Vacant", report.summary?.vacant || 0],
        ["", "", "Total", report.summary?.totalRooms || 0],
      ],
      { origin: `B${statsStart}` }
    );

    const planStart = statsStart;
    const planHeader = [["Plan", "Rms", "Pax", "Addnl", "Total"]];
    XLSX.utils.sheet_add_aoa(ws, planHeader, { origin: `I${planStart + 2}` });

    XLSX.utils.sheet_add_json(
      ws,
      report.planSummary.map((p) => ({
        Plan: p.plan,
        Rms: p.rms,
        Pax: p.pax,
        Addnl: p.addnl,
        Total: p.total,
      })),
      { origin: `I${planStart + 3}`, skipHeader: true }
    );

    const roomStatusStart = statsStart + 12;
    XLSX.utils.sheet_add_aoa(ws, [["ROOMNO", "STATUS"]], {
      origin: `B${roomStatusStart}`,
    });

    XLSX.utils.sheet_add_json(
      ws,
      report.roomStatus.map((r) => ({
        ROOMNO: r.roomNo,
        STATUS: r.status,
      })),
      { origin: `B${roomStatusStart + 1}`, skipHeader: true }
    );

    ws["!cols"] = [
      { wch: 4 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 24 },
      { wch: 18 },
      { wch: 8 },
      { wch: 14 },
      { wch: 14 },
      { wch: 10 },
      { wch: 12 },
      { wch: 10 },
      { wch: 14 },
      { wch: 10 },
      { wch: 10 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Occupancy Report");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      `occupancy-checkout-report-${filters.fromDate}-to-${filters.toDate}.xlsx`
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl print:max-w-full">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Occupancy Checkout Report
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Checkout report with statistics, plan summary and room status
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 lg:w-auto"
            >
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleChange}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-600"
                />
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Get Report"}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Print
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={!report.rows.length}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Export Excel
                </button>
              </div>
            </form>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 print:hidden">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none md:p-7">
          <h2 className="text-2xl font-bold text-slate-900">
            THE FEEL MUNNAR RESORT AND SPA
          </h2>
          <p className="mt-6 text-lg font-semibold">Occupancy List Summary :-</p>

          <div className="mt-6 flex flex-col gap-2 text-sm md:flex-row md:justify-between">
            <div>
              <span className="font-medium">Report Date :- </span>
              <span>{report.reportDate || filters.toDate}</span>
            </div>
            <div>
              <span className="font-medium">Print Date & Time :- </span>
              <span>{printMeta.date} {printMeta.time}</span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left">
                  <th className="px-2 py-2">Sl.No.</th>
                  <th className="px-2 py-2">Room</th>
                  <th className="px-2 py-2">Grc No</th>
                  <th className="px-2 py-2">Guest Name</th>
                  <th className="px-2 py-2">Company</th>
                  <th className="px-2 py-2 text-right">Pax</th>
                  <th className="px-2 py-2">Arrival</th>
                  <th className="px-2 py-2">Departure</th>
                  <th className="px-2 py-2">Plan</th>
                  <th className="px-2 py-2 text-right">Tariff</th>
                  <th className="px-2 py-2 text-right">Disc %</th>
                  <th className="px-2 py-2 text-right">Discount Amt.</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="12" className="px-2 py-8 text-center text-slate-500">
                      Loading report...
                    </td>
                  </tr>
                ) : report.rows.length ? (
                  report.rows.map((row) => (
                    <tr key={row.slNo} className="border-b border-slate-200">
                      <td className="px-2 py-2">{row.slNo}</td>
                      <td className="px-2 py-2">{row.room}</td>
                      <td className="px-2 py-2">{row.grcNo}</td>
                      <td className="px-2 py-2">{row.guestName}</td>
                      <td className="px-2 py-2">{row.company}</td>
                      <td className="px-2 py-2 text-right">{row.pax}</td>
                      <td className="px-2 py-2">{formatDateTime(row.arrivalDate)}</td>
                      <td className="px-2 py-2">{formatDateTime(row.departureDate)}</td>
                      <td className="px-2 py-2">{row.plan}</td>
                      <td className="px-2 py-2 text-right">{row.tariff}</td>
                      <td className="px-2 py-2 text-right">{row.discountPercent}</td>
                      <td className="px-2 py-2 text-right">{row.discountAmount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-2 py-8 text-center text-slate-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-bold">***** Statistics *****</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Occupancy %</span><span>{report.summary?.occupancyPercentage || 0}</span></div>
                <div className="flex justify-between"><span>House Count</span><span>{report.summary?.houseCount || 0}</span></div>
                <div className="flex justify-between"><span>Domestic</span><span>{report.summary?.domestic || 0}</span></div>
                <div className="flex justify-between"><span>Foreigners</span><span>{report.summary?.foreigners || 0}</span></div>
                <div className="flex justify-between"><span>Room Revenue</span><span>{report.summary?.roomRevenue || 0}</span></div>
                <div className="flex justify-between"><span>A.R.R.</span><span>{report.summary?.arr || 0}</span></div>
              </div>
            </div>

            <div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Rooms occupied</span><span>{report.summary?.roomsOccupied || 0}</span></div>
                <div className="flex justify-between"><span>Single</span><span>{report.summary?.single || 0}</span></div>
                <div className="flex justify-between"><span>Double</span><span>{report.summary?.double || 0}</span></div>
                <div className="flex justify-between"><span>Triple</span><span>{report.summary?.triple || 0}</span></div>
                <div className="flex justify-between"><span>Other</span><span>{report.summary?.other || 0}</span></div>
                <div className="flex justify-between"><span>Vacant</span><span>{report.summary?.vacant || 0}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{report.summary?.totalRooms || 0}</span></div>
              </div>
            </div>

            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="px-2 py-2 text-left">Plan</th>
                    <th className="px-2 py-2 text-right">Rms</th>
                    <th className="px-2 py-2 text-right">Pax</th>
                    <th className="px-2 py-2 text-right">Addnl</th>
                    <th className="px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.planSummary.map((plan, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="px-2 py-2">{plan.plan}</td>
                      <td className="px-2 py-2 text-right">{plan.rms}</td>
                      <td className="px-2 py-2 text-right">{plan.pax}</td>
                      <td className="px-2 py-2 text-right">{plan.addnl}</td>
                      <td className="px-2 py-2 text-right">{plan.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-10 max-w-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="px-2 py-2 text-left">ROOMNO</th>
                  <th className="px-2 py-2 text-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {report.roomStatus.map((room, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="px-2 py-2">{room.roomNo}</td>
                    <td className="px-2 py-2">{room.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyCheckoutReport;