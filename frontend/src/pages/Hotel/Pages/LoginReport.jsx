import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Printer, FileSpreadsheet, FileText, Search, X } from "lucide-react";

import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";

const getOid = (v) => (v && typeof v === "object" && "$oid" in v ? v.$oid : v);
const getDateVal = (v) =>
  v && typeof v === "object" && "$date" in v ? v.$date : v;

const formatDateTime = (v) => {
  const raw = getDateVal(v);
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function LoginReport() {
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const today = new Date().toISOString().split("T")[0];

  const get30DaysAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  };

  const defaultFilters = {
    fromDate: get30DaysAgo(),
    toDate: today,
    status: "all",
    bookingType: "all",
    guestName: "",
    mobileNumber: "",
  };

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({
    total: 0,
    checkIn: 0,
    checkOut: 0,
    cancelled: 0,
  });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  const scrollRef = useRef(null);
  const requestIdRef = useRef(0);

  const totalPages = pagination?.totalPages || 1;
  const hasMore = page < totalPages;

const fetchReport = useCallback(async () => {
  try {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    if (search.trim()) {
      params.append("search", search.trim());
    }

    const { data } = await api.get(
      `/api/sUsers/loginReport/${cmp_id}?${params.toString()}`,
      { withCredentials: true }
    );

    const rows = data?.data || [];

    setReports((prev) => (page === 1 ? rows : [...prev, ...rows]));

    setPagination(data.pagination || {});
    setSummary(data.summary || {});
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to load report");
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
}, [cmp_id, filters, page, limit, search]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

 const handleScroll = () => {
  const el = scrollRef.current;
  if (!el || loading || loadingMore || !hasMore) return;

  const { scrollTop, scrollHeight, clientHeight } = el;

  console.log({
    page,
    hasMore,
    loading,
    loadingMore,
    scrollTop,
    scrollHeight,
    clientHeight,
  });

  const nearBottom = scrollHeight - scrollTop - clientHeight < 150;

  if (nearBottom) {
    console.log("Loading next page:", page + 1);
    setPage((prev) => prev + 1);
  }
};

const handleFilter = (field, value) => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = 0;
  }

  setReports([]);
  setPagination({});
  setPage(1);

  setFilters((prev) => ({
    ...prev,
    [field]: value,
  }));
};
  useEffect(() => {
  console.log("reports.length =", reports.length);
}, [reports]);

const handleCardClick = (field, value) => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = 0;
  }

  setReports([]);
  setPagination({});
  setPage(1);

  setFilters((prev) => ({
    ...prev,
    [field]: prev[field] === value ? "all" : value,
  }));
};

  const clearFilters = () => {
    setPage(1);
    setReports([]);
    setSearch("");
    setFilters(defaultFilters);
  };

  const handleSearchClick = () => {
    setPage(1);
    setReports([]);
    fetchReport();
  };

  const handlePrint = () => window.print();
  const handleExcel = () => {};
  const handlePdf = () => {};

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="shrink-0">
        <TitleDiv title="Login Report" />

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-3 mt-3 mx-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 border border-gray-300 rounded-md h-9 px-2 bg-white">
              <input
                type="date"
                className="text-sm text-gray-700 outline-none w-[125px]"
                value={filters.fromDate}
                onChange={(e) => handleFilter("fromDate", e.target.value)}
              />
              <span className="text-gray-300">–</span>
              <input
                type="date"
                className="text-sm text-gray-700 outline-none w-[125px]"
                value={filters.toDate}
                onChange={(e) => handleFilter("toDate", e.target.value)}
              />
            </div>

            <select
              className="h-9 text-sm text-gray-700 border border-gray-300 rounded-md px-2.5 bg-white outline-none cursor-pointer"
              value={filters.status}
              onChange={(e) => handleFilter("status", e.target.value)}
            >
              <option value="all">Status: All</option>
              <option value="checkIn">Check In</option>
              <option value="checkOut">Check Out</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* <select
              className="h-9 text-sm text-gray-700 border border-gray-300 rounded-md px-2.5 bg-white outline-none cursor-pointer"
              value={filters.bookingType}
              onChange={(e) => handleFilter("bookingType", e.target.value)}
            >
              <option value="all">Booking: All</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select> */}

            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Search Guest / Room / Voucher"
                className="h-9 w-full text-sm border border-gray-300 rounded-md pl-8 pr-8 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
              />
              {search && (
                <button
                  onClick={() => {
                    setPage(1);
                    setReports([]);
                    setSearch("");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={clearFilters}
                className="h-9 px-3 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>

              <button
                onClick={handleSearchClick}
                className="h-9 px-3 flex items-center gap-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Search size={14} />
                Search
              </button>

              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-9">
                <button
                  onClick={handleExcel}
                  title="Export to Excel"
                  className="h-full px-2.5 flex items-center text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors"
                >
                  <FileSpreadsheet size={16} />
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={handlePdf}
                  title="Export to PDF"
                  className="h-full px-2.5 flex items-center text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                  <FileText size={16} />
                </button>
                <div className="w-px h-5 bg-gray-200" />
                <button
                  onClick={handlePrint}
                  title="Print"
                  className="h-full px-2.5 flex items-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Printer size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-3 mx-4">
          <button
            onClick={() => handleFilter("status", "all")}
            className={`text-left bg-blue-50/70 rounded-lg px-3.5 py-2.5 border transition-all ${
              filters.status === "all"
                ? "border-blue-400 ring-1 ring-blue-200"
                : "border-blue-100 hover:border-blue-200"
            }`}
          >
            <p className="text-xs text-gray-500">Total Records</p>
            <h2 className="text-lg font-bold text-gray-800">{summary.total}</h2>
          </button>

          <button
            onClick={() => handleCardClick("status", "checkIn")}
            className={`text-left bg-green-50/70 rounded-lg px-3.5 py-2.5 border transition-all ${
              filters.status === "checkIn"
                ? "border-green-400 ring-1 ring-green-200"
                : "border-green-100 hover:border-green-200"
            }`}
          >
            <p className="text-xs text-gray-500">Checked In</p>
            <h2 className="text-lg font-bold text-green-600">
              {summary.checkIn}
            </h2>
          </button>

          <button
            onClick={() => handleCardClick("status", "checkOut")}
            className={`text-left bg-red-50/70 rounded-lg px-3.5 py-2.5 border transition-all ${
              filters.status === "checkOut"
                ? "border-red-400 ring-1 ring-red-200"
                : "border-red-100 hover:border-red-200"
            }`}
          >
            <p className="text-xs text-gray-500">Checked Out</p>
            <h2 className="text-lg font-bold text-red-600">
              {summary.checkOut}
            </h2>
          </button>

          <button
            onClick={() => handleCardClick("status", "cancelled")}
            className={`text-left bg-orange-50/70 rounded-lg px-3.5 py-2.5 border transition-all ${
              filters.status === "cancelled"
                ? "border-orange-400 ring-1 ring-orange-200"
                : "border-orange-100 hover:border-orange-200"
            }`}
          >
            <p className="text-xs text-gray-500">Cancelled</p>
            <h2 className="text-lg font-bold text-orange-600">
              {summary.cancelled}
            </h2>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 mx-4 mt-3 mb-4">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="bg-white rounded-lg border border-gray-200 shadow-sm h-full overflow-auto"
        >
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1.5 border whitespace-nowrap">#</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Voucher No</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Guest Name</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Room</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Arrival</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Last Updated</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Created</th>
                <th className="px-2 py-1.5 border whitespace-nowrap">Created By</th>
                <th className="px-2 py-1.5 border">Room Swap History</th>
                <th className="px-2 py-1.5 border">Partial Checkout</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-500">
                    No Records Found
                  </td>
                </tr>
              ) : (
                <>
                  {reports.map((item, index) => {
                    const rowKey = getOid(item._id) || index;

                    const roomNameById = (id) => {
                      const target = getOid(id);
                      const room = item.selectedRooms?.find(
                        (r) => getOid(r.roomId) === target
                      );
                      return room?.roomName || "-";
                    };

                    return (
                      <tr key={rowKey} className="hover:bg-gray-50 align-top">
                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {index + 1}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {item.voucherNumber || "-"}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {item.guestName || item.customerName || "-"}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {item.selectedRooms?.map((room) => room.roomName).join(", ") || "-"}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {item.arrivalDate || "-"}
                          {item.arrivalTime && (
                            <div className="text-gray-400">{item.arrivalTime}</div>
                          )}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {formatDateTime(item.updatedAt)}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {formatDateTime(item.createdAt)}
                        </td>

                        <td className="border px-2 py-1.5 whitespace-nowrap">
                          {item.createdBy || "-"}
                        </td>

                        <td className="border px-2 py-1.5 min-w-[200px]">
                          {item.roomSwapHistory?.length ? (
                            <div className="space-y-1.5">
                              {item.roomSwapHistory.map((swap, i) => (
                                <div
                                  key={getOid(swap._id) || i}
                                  className="leading-tight"
                                >
                                  <span className="font-medium">
                                    {roomNameById(swap.fromRoomId)} → {roomNameById(swap.toRoomId)}
                                  </span>
                                  <div className="text-gray-400">
                                    {formatDateTime(swap.swapDate)}
                                    {swap.reason ? ` · ${swap.reason}` : ""}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        <td className="border px-2 py-1.5 min-w-[200px]">
                          {item.partialCheckoutHistory?.length ? (
                            <div className="space-y-1.5">
                              {item.partialCheckoutHistory.map((pc, i) => (
                                <div
                                  key={getOid(pc._id) || i}
                                  className="leading-tight"
                                >
                                  <span className="font-medium">
                                    {pc.roomsCheckedOut?.map((r) => r.roomName).join(", ") || "-"}
                                  </span>
                                  <div className="text-gray-400">
                                    {pc.saleVoucherNumber || "-"} · {formatDateTime(pc.date)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {loadingMore && (
                    <tr>
                      <td colSpan={10} className="text-center py-3 text-gray-400">
                        Loading more…
                      </td>
                    </tr>
                  )}

                  {!loadingMore && !hasMore && (
                    <tr>
                      <td colSpan={10} className="text-center py-3 text-gray-400">
                        Showing all {pagination?.total ?? reports.length} records
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LoginReport;