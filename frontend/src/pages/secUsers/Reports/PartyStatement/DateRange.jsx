import { useState } from "react";
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
} from "date-fns";
import { BsFillCalendar2DateFill } from "react-icons/bs";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useDispatch, useSelector } from "react-redux";
import { addDate } from "../../../../../slices/date";
import { useNavigate } from "react-router-dom";

const DateRange = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { title } = useSelector((state) => state.date);


  const submitHandler = (rangeName, start, end) => {
    dispatch(
      addDate({ rangeName, start: start.toISOString(), end: end.toISOString() })
    );
    navigate(-1);
  };

  // Function to get the start and end dates for each range
  const getRangeDates = (rangeType) => {
    let startDate, endDate;

    switch (rangeType) {
      case "Today":
        startDate = endDate = startOfToday();
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
        startDate = new Date(new Date().getFullYear(), 3, 1); // Starting from April 1st
        endDate = new Date(new Date().getFullYear() + 1, 2, 31); // Ending on March 31st next year
        break;
      case "Previous Financial Year":
        startDate = new Date(new Date().getFullYear() - 1, 3, 1); // Last year April 1st
        endDate = new Date(new Date().getFullYear(), 2, 31); // Ending on March 31st this year
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
        {ranges.map((rangeName) => {
          const { start, end } = getRangeDates(rangeName);

          return (
            <div
              key={rangeName}
              className={`${title === rangeName ? "bg-violet-300 text-white" : ""}    flex justify-between  cursor-pointer shadow-md  p-6 hover:shadow-xl rounded-md hover:bg-violet-300 text-gray-500 hover:text-white `}
              // onClick={() =>{ setSelectedRange(rangeName);setRangeDates({startDate:start,endDate:end})}}
              onClick={() => {
                submitHandler(rangeName, start, end);
              }}
            >
              <span className="font-bold text-[10px] md:text-xs flex items-center gap-3">
                {" "}
                <BsFillCalendar2DateFill className="  text-xs " /> {rangeName}
              </span>
              <span className="font-bold text-[9px] md:text-xs ">
                <span className="font-bold text-[9px] md:text-xs">
                  {format(start, "dd-MMM-yyyy")}
                  {rangeName !== "Today" && ` - ${format(end, "dd-MMM-yyyy")}`}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DateRange;
