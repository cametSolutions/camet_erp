import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "@/api/api";
import { useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";

const OccupancyCheckoutReport = () => {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
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

  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/sUsers/occupancy-checkout-report", {
        params: {
          fromDate: filters.fromDate || "",
          toDate: filters.toDate || "",
          cmp_id,
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
      setError(
        err?.response?.data?.message || err?.message || "Failed to fetch report"
      );
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
        [
          "Report Date :-",
          report.reportDate || filters.toDate,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Print Date & Time :",
          `${printMeta.date} ${printMeta.time}`,
        ],
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
        [
          "Occupancy %",
          report.summary?.occupancyPercentage || 0,
          "Rooms occupied",
          report.summary?.roomsOccupied || 0,
        ],
        [
          "House Count",
          report.summary?.houseCount || 0,
          "Vacant",
          report.summary?.vacant || 0,
        ],
        [
          "Domestic",
          report.summary?.domestic || 0,
          "Cleaning",
          report.summary?.cleaning || 0,
        ],
        [
          "Foreigners",
          report.summary?.foreigners || 0,
          "Blocked",
          report.summary?.blocked || 0,
        ],
        [
          "Room Revenue",
          report.summary?.roomRevenue || 0,
          "Total",
          report.summary?.totalRooms || 0,
        ],
        ["A.R.R.", report.summary?.arr || 0],
      ],
      { origin: `B${statsStart}` }
    );

    const planStart = statsStart;
    XLSX.utils.sheet_add_aoa(ws, [["Plan", "Rms", "Pax", "Addnl", "Total"]], {
      origin: `I${planStart + 2}`,
    });

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
     <>
          <TitleDiv
            title={
            "Occupancy  of rooms report"
            }
          />
    <div className="min-h-screen bg-slate-100 p-2 md:p-3 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl print:max-w-full">
        <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:hidden md:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
                Occupancy Checkout Report
              </h1>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Checkout report with statistics, plan summary and room status
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid w-full grid-cols-1 gap-2 md:grid-cols-3 lg:w-auto"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  From Date
                </label>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleChange}
                  className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  To Date
                </label>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleChange}
                  className="h-8 rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-teal-700 px-3 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Get Report"}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Print
                </button>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={!report.rows.length}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Export Excel
                </button>
              </div>
            </form>
          </div>
        </div>

        {error ? (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 print:hidden">
            {error}
          </div>
        ) : null}

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none md:p-4">
          <h2 className="text-lg font-semibold text-slate-900">
            THE FEEL MUNNAR RESORT AND SPA
          </h2>
          <p className="mt-3 text-sm font-semibold">
            Occupancy List Summary :-
          </p>

          <div className="mt-4 flex flex-col gap-1 text-xs md:flex-row md:justify-between">
            <div>
              <span className="font-medium">Report Date :- </span>
              <span>{report.reportDate || filters.toDate}</span>
            </div>
            <div>
              <span className="font-medium">Print Date & Time :- </span>
              <span>
                {printMeta.date} {printMeta.time}
              </span>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 text-left">
                  <th className="px-1.5 py-1.5">Sl.No.</th>
                  <th className="px-1.5 py-1.5">Room</th>
                  <th className="px-1.5 py-1.5">Grc No</th>
                  <th className="px-1.5 py-1.5">Guest Name</th>
                  <th className="px-1.5 py-1.5">Company</th>
                  <th className="px-1.5 py-1.5 text-right">Pax</th>
                  <th className="px-1.5 py-1.5">Arrival</th>
                  <th className="px-1.5 py-1.5">Departure</th>
                  <th className="px-1.5 py-1.5">Plan</th>
                  <th className="px-1.5 py-1.5 text-right">Tariff</th>
                  <th className="px-1.5 py-1.5 text-right">Disc %</th>
                  <th className="px-1.5 py-1.5 text-right">Discount Amt.</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="12"
                      className="px-1.5 py-6 text-center text-slate-500"
                    >
                      Loading report...
                    </td>
                  </tr>
                ) : report.rows.length ? (
                  report.rows.map((row) => (
                    <tr key={row.slNo} className="border-b border-slate-200">
                      <td className="px-1.5 py-1.5">{row.slNo}</td>
                      <td className="px-1.5 py-1.5">{row.room}</td>
                      <td className="px-1.5 py-1.5">{row.grcNo}</td>
                      <td className="px-1.5 py-1.5">{row.guestName}</td>
                      <td className="px-1.5 py-1.5">{row.company}</td>
                      <td className="px-1.5 py-1.5 text-right">{row.pax}</td>
                      <td className="px-1.5 py-1.5">
                        {formatDateTime(row.arrivalDate)}
                      </td>
                      <td className="px-1.5 py-1.5">
                        {formatDateTime(row.departureDate)}
                      </td>
                      <td className="px-1.5 py-1.5">{row.plan}</td>
                      <td className="px-1.5 py-1.5 text-right">{row.tariff}</td>
                      <td className="px-1.5 py-1.5 text-right">
                        {row.discountPercent}
                      </td>
                      <td className="px-1.5 py-1.5 text-right">
                        {row.discountAmount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      className="px-1.5 py-6 text-center text-slate-500"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-semibold">
                ***** Statistics *****
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Occupancy %</span>
                  <span>{report.summary?.occupancyPercentage || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>House Count</span>
                  <span>{report.summary?.houseCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domestic</span>
                  <span>{report.summary?.domestic || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Foreigners</span>
                  <span>{report.summary?.foreigners || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Revenue</span>
                  <span>{report.summary?.roomRevenue || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>A.R.R.</span>
                  <span>{report.summary?.arr || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span>Rooms occupied</span>
                  <span>{report.summary?.roomsOccupied || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vacant</span>
                  <span>{report.summary?.vacant || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning</span>
                  <span>{report.summary?.cleaning || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Blocked</span>
                  <span>{report.summary?.blocked || 0}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{report.summary?.totalRooms || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="px-1.5 py-1.5 text-left">Plan</th>
                    <th className="px-1.5 py-1.5 text-right">Rms</th>
                    <th className="px-1.5 py-1.5 text-right">Pax</th>
                    <th className="px-1.5 py-1.5 text-right">Addnl</th>
                    <th className="px-1.5 py-1.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.planSummary.map((plan, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="px-1.5 py-1.5">{plan.plan}</td>
                      <td className="px-1.5 py-1.5 text-right">{plan.rms}</td>
                      <td className="px-1.5 py-1.5 text-right">{plan.pax}</td>
                      <td className="px-1.5 py-1.5 text-right">{plan.addnl}</td>
                      <td className="px-1.5 py-1.5 text-right">{plan.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 max-w-sm">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="px-1.5 py-1.5 text-left">ROOMNO</th>
                  <th className="px-1.5 py-1.5 text-left">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {report.roomStatus.map((room, idx) => (
                  <tr key={idx} className="border-b border-slate-200">
                    <td className="px-1.5 py-1.5">{room.roomNo}</td>
                    <td className="px-1.5 py-1.5">{room.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
  
};

export default OccupancyCheckoutReport;