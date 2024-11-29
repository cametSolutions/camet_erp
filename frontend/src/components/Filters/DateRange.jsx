/* eslint-disable no-case-declarations */
import React, { useState } from "react";
import {
  format,
  startOfToday,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns";
import { BsFillCalendar2DateFill } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { addDate } from "../../../slices/filterSlices/date";
import { useNavigate } from "react-router-dom";
import TitleDiv from "../common/TitleDiv";

const DateRange = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { title } = useSelector((state) => state.date);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const submitHandler = (rangeName, start, end) => {
    dispatch(
      addDate({
        rangeName,
        start: start.toISOString(),
        end: end.toISOString(),
      })
    );
    navigate(-1);
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      const startDate = parseISO(customStartDate);
      const endDate = parseISO(customEndDate);

      if (endDate < startDate) {
        alert("End date cannot be before start date.");
        return;
      }

      submitHandler(
        "Custom Date",
        startDate,
        endDate
      );
    } else {
      alert("Both start and end dates must be selected.");
    }
  };

  const formatDisplayDate = (dateString) =>
    dateString ? format(parseISO(dateString), "dd-MMM-yyyy") : "";

  const getRangeDates = (rangeType) => {
    let startDate, endDate;
    switch (rangeType) {
      case "Today":
        // Use a function that gets the current date at midnight in UTC
        const today = new Date();
        startDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
        endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));
        break;
    
      case "Yesterday":
        startDate = endDate = subDays(new Date(), 1);
        break;
      case "This Week":
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "Last Week":
        startDate = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        endDate = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        break;
      case "Last 7 Days":
        startDate = subDays(new Date(), 6);
        endDate = new Date();
        break;
      case "This Month":
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      case "Last Month":
        startDate = startOfMonth(subMonths(new Date(), 1));
        endDate = endOfMonth(subMonths(new Date(), 1));
        break;
      case "Last 30 Days":
        startDate = subDays(new Date(), 29);
        endDate = new Date();
        break;
      case "This Quarter":
        startDate = startOfQuarter(new Date());
        endDate = endOfQuarter(new Date());
        break;
      case "Last Quarter":
        startDate = startOfQuarter(subMonths(new Date(), 3));
        endDate = endOfQuarter(subMonths(new Date(), 3));
        break;
      case "Current Financial Year":
        startDate = new Date(new Date().getFullYear(), 3, 1);
        endDate = new Date(new Date().getFullYear() + 1, 2, 31);
        break;
      case "Previous Financial Year":
        startDate = new Date(new Date().getFullYear() - 1, 3, 1);
        endDate = new Date(new Date().getFullYear(), 2, 31);
        break;
      case "Last Year":
        startDate = startOfYear(subMonths(new Date(), 12));
        endDate = endOfYear(subMonths(new Date(), 12));
        break;
      default:
        startDate = endDate = new Date();
    }

    return { start: startDate, end: endDate };
  };

  const ranges = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "Last 7 Days",
    "This Month",
    "Last Month",
    "Last 30 Days",
    "This Quarter",
    "Last Quarter",
    "Current Financial Year",
    "Previous Financial Year",
    "Last Year",
  ];

  return (
    <div className="flex-col">
      <TitleDiv title="Date Range" />
      <div className="flex flex-col px-3 py-2 gap-2">
        <div
          className={`${
            title?.includes(" to ") ? "bg-slate-300 " : ""
          } flex flex-col cursor-pointer shadow-md p-6 hover:shadow-xl rounded-md hover:bg-slate-300 text-gray-500`}
          onClick={() => setShowCustomPicker(!showCustomPicker)}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-[10px] md:text-xs flex items-center gap-3">
              <BsFillCalendar2DateFill className="text-xs" /> Custom Range
            </span>
            {!showCustomPicker && title?.includes(" to ") && (
              <span className="font-bold text-[9px] md:text-xs">{title}</span>
            )}
          </div>

          {showCustomPicker && (
            <div
              className="mt-4 flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <div className="w-full p-2 rounded border text-sm flex items-center gap-2 bg-white">
                      <BsFillCalendar2DateFill className="text-gray-500 min-w-[16px]" />
                      <span className="text-gray-700">
                        {customStartDate
                          ? formatDisplayDate(customStartDate)
                          : "Select date"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <div className="w-full p-2 rounded border text-sm flex items-center gap-2 bg-white">
                      <BsFillCalendar2DateFill className="text-gray-500 min-w-[16px]" />
                      <span className="text-gray-700">
                        {customEndDate
                          ? formatDisplayDate(customEndDate)
                          : "Select date"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCustomDateSubmit}
                disabled={!customStartDate || !customEndDate}
                className={`px-4 py-2 rounded text-sm text-white ${
                  !customStartDate || !customEndDate
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Apply Custom Range
              </button>
            </div>
          )}
        </div>

        {ranges.map((rangeName) => {
          const { start, end } = getRangeDates(rangeName);

          return (
            <div
              key={rangeName}
              className={`${
                title === rangeName ? "bg-slate-300 " : ""
              } flex justify-between cursor-pointer shadow-md p-6 hover:shadow-xl rounded-md hover:bg-slate-300 text-gray-500`}
              onClick={() => submitHandler(rangeName, start, end)}
            >
              <span className="font-bold text-[10px] md:text-xs flex items-center gap-3">
                <BsFillCalendar2DateFill className="text-xs" /> {rangeName}
              </span>
              <span className="font-bold text-[9px] md:text-xs">
                {format(start, "dd-MMM-yyyy")}
                {rangeName !== "Today" && ` - ${format(end, "dd-MMM-yyyy")}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DateRange;
