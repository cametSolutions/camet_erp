import React, { useEffect, useMemo, useState } from "react";

import api from "@/api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


const TouristReport = () => {
  const [filters, setFilters] = useState({
    fromDate: "2025-08-01",
    toDate: "2026-03-23",
  });

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    totalPax: 0,
    totalNations: 0,
    totalBookings: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const printMeta = useMemo(() => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-GB"),
      time: now.toLocaleTimeString("en-GB"),
    };
  }, []);

  const formatDisplayDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      // replace with your existing API endpoint
      const response = await api.get("/api/sUsers/tourist-report", {
        params: {
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        },
      });

      const result = response?.data;

      if (result?.data && Array.isArray(result.data)) {
        setRows(result.data);
        setSummary({
          totalPax:
            result?.summary?.totalPax ??
            result.data.reduce((sum, item) => sum + Number(item.pax || 0), 0),
          totalNations:
            result?.summary?.totalNations ?? result.data.length,
          totalBookings: result?.summary?.totalBookings ?? 0,
        });
      } else if (Array.isArray(result)) {
        setRows(result);
        setSummary({
          totalPax: result.reduce((sum, item) => sum + Number(item.pax || 0), 0),
          totalNations: result.length,
          totalBookings: 0,
        });
      } else {
        setRows([]);
        setSummary({
          totalPax: 0,
          totalNations: 0,
          totalBookings: 0,
        });
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch report");
      setRows([]);
      setSummary({
        totalPax: 0,
        totalNations: 0,
        totalBookings: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReport();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!rows.length) return;

    const excelRows = rows.map((item, index) => ({
      "Sl No": index + 1,
      Nation: item.nation || item.country || "UNKNOWN",
      Pax: Number(item.pax || 0),
    }));

    excelRows.push({});
    excelRows.push({
      "Sl No": "",
      Nation: "TOTAL",
      Pax: Number(summary.totalPax || 0),
    });

    const worksheet = XLSX.utils.json_to_sheet(excelRows, { origin: "A5" });

    XLSX.utils.sheet_add_aoa(
      worksheet,
      [
        ["Tourist Report"],
        [
          `Report From ${formatDisplayDate(filters.fromDate)} To ${formatDisplayDate(
            filters.toDate
          )}`,
        ],
        [`Generated On ${printMeta.date} ${printMeta.time}`],
      ],
      { origin: "A1" }
    );

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 35 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tourist Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // ✅ this actually starts the download
    saveAs(
      fileData,
      `tourist-report-${filters.fromDate}-to-${filters.toDate}.xlsx`
    );
  };
  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl print:max-w-full">
        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Tourist Report
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Nation wise pax report using existing API
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
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-0 transition focus:border-teal-600"
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
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-0 transition focus:border-teal-600"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Loading..." : "Get Report"}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                >
                  Print
                </button>
                 <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={!rows.length}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Export Excel
                </button>
              </div>
            </form>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 print:hidden">
            {error}
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none md:p-7">
          <div className="mb-2 text-sm text-slate-700">
            Report From {formatDisplayDate(filters.fromDate)} To{" "}
            {formatDisplayDate(filters.toDate)}
          </div>

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-green-700 md:text-3xl">
                Tourist Report
              </h2>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs font-medium text-slate-500">
                Print Date & Time
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {printMeta.date} {printMeta.time}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y-[3px] border-[#7b1e1e]">
                  <th className="px-2 py-2 text-left text-sm font-bold tracking-wide text-slate-800 md:text-base">
                    NATION
                  </th>
                  <th className="w-28 px-2 py-2 text-right text-sm font-bold tracking-wide text-slate-800 md:text-base">
                    PAX
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-2 py-8 text-center text-sm text-slate-500"
                    >
                      Loading report...
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-dashed border-slate-300"
                    >
                      <td className="px-2 py-2 text-slate-800">
                        {item.nation || item.country || "UNKNOWN"}
                      </td>
                      <td className="px-2 py-2 text-right font-medium text-slate-900">
                        {item.pax || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      className="px-2 py-8 text-center text-sm text-slate-500"
                    >
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>

              {!loading && rows.length > 0 ? (
                <tfoot>
                  <tr className="border-t-2 border-slate-900">
                    <td className="px-2 py-3 text-sm font-bold text-slate-900">
                      TOTAL
                    </td>
                    <td className="px-2 py-3 text-right text-sm font-bold text-slate-900">
                      {summary.totalPax}
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristReport;