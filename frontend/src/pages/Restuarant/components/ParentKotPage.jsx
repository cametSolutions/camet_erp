import React, { useState, useEffect } from "react";
import useFetch from "@/customHook/useFetch";
import {
  UtensilsCrossed,
  Hash,
  LayoutGrid,
  IndianRupee,
  X,
  Search,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function ParentKotPage({ setShowParentKots, cmp_id, setSelectedParentKot,handleTagKotConfirmation }) {
  const [kotData, setKotData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const { data, loading } = useFetch(
    `/api/sUsers/getKotData/${cmp_id}?date=${selectedDate}`,
  );

  useEffect(() => {
    if (data) setKotData(data?.data || []);
  }, [data]);

  // Go to previous / next day
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const formatDisplay = (dateStr) => {
    const d = new Date(dateStr);
    if (isToday) return "Today";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const typeColors = {
    "dine-in": "bg-emerald-100 text-emerald-700 border border-emerald-200",
    takeaway: "bg-amber-100 text-amber-700 border border-amber-200",
    delivery: "bg-blue-100 text-blue-700 border border-blue-200",
  };

  const filtered = kotData.filter((kot) => {
    const q = searchQuery.toLowerCase();
    return (
      (kot.status !== "completed" &&
        kot.voucherNumber?.toLowerCase().includes(q)) ||
      kot.tableNumber?.toString().includes(q) ||
      kot.type?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <div>
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            KOT Orders
          </h1>
          <p className="text-[11px] text-slate-400">Kitchen Order Tickets</p>
        </div>
        <button
          onClick={() => setShowParentKots(false)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Date Picker Row */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          {/* Prev Day */}
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Date Display + Native Input */}
          <label className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors group">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-700 flex-1">
              {formatDisplay(selectedDate)}
            </span>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute opacity-0 w-0 h-0"
            />
            <span className="text-[10px] text-slate-400 group-hover:text-indigo-400 transition-colors">
              {selectedDate}
            </span>
          </label>

          {/* Next Day */}
          <button
            onClick={() => shiftDate(1)}
            disabled={isToday}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Today shortcut */}
          {!isToday && (
            <button
              onClick={() =>
                setSelectedDate(new Date().toISOString().split("T")[0])
              }
              className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-indigo-300 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search voucher, table, type…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Count bar */}
      {!loading && kotData.length > 0 && (
        <div className="px-4 py-1.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            {filtered.length} of {kotData.length} orders
          </span>
          <span className="text-[10px] font-semibold text-indigo-500">
            ₹
            {filtered
              .reduce((s, k) => s + (k.total || 0), 0)
              .toLocaleString("en-IN")}
          </span>
        </div>
      )}

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 flex flex-col gap-2.5">
        {/* Loading */}
        {loading &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-slate-100 animate-pulse"
            />
          ))}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <UtensilsCrossed className="w-9 h-9 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {searchQuery ? "No matching KOTs" : "No KOTs for this date"}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              {searchQuery
                ? "Try a different search term"
                : "Try selecting a different date"}
            </p>
          </div>
        )}

        {/* Cards */}
        {filtered.map((kot) => (
          <div
            key={kot._id?.$oid || kot._id}
            className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between hover:shadow-md hover:border-indigo-100 transition-all duration-200"
            onClick={() => {
              handleTagKotConfirmation(kot);
              setShowParentKots(false);
            }}
          >
            {/* Left */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-sm font-bold text-slate-800 tracking-tight">
                  {kot.voucherNumber}
                </span>
              </div>
              <span
                className={`self-start text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  typeColors[kot.type] ||
                  "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {kot.type}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-slate-400">
                  <LayoutGrid className="w-3 h-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    Table
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-700">
                  {kot.tableNumber}
                </span>
              </div>

              <div className="w-px h-8 bg-slate-100" />

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-slate-400">
                  <IndianRupee className="w-3 h-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wide">
                    Total
                  </span>
                </div>
                <span className="text-sm font-bold text-indigo-600">
                  ₹{kot.total}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ParentKotPage;
