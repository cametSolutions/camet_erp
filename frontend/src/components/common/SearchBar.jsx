/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineCalendarToday } from "react-icons/md";
import { addBookingDate } from "../../../slices/dateSlice";
import { useDispatch } from "react-redux";
function SearchBar({
  onType,
  toggle,
  from,
  onDateChange,
  extraActions,
  initialFromDate,
  initialToDate,
}) {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(new Date().getDate() - 30);
  const [fromDate, setFromDate] = useState(
    initialFromDate || thirtyDaysAgo.toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(initialToDate || today);

  useEffect(() => {
    if (initialFromDate) setFromDate(initialFromDate);
    if (initialToDate) setToDate(initialToDate);
  }, [initialFromDate, initialToDate]);

  const handleCheckboxChange = () => {
    if (search === "completed") {
      setSearch("pending");
      setChecked(false);
      onType("pending");
    } else {
      if (from === "/sUsers/bookingList" || from === "/sUsers/checkInList") {
        setSearch("completed");
        setChecked(true);
        onType("completed");
      }
    }
  };

  const handleFromDate = (e) => {
    const val = e.target.value;
    dispatch(addBookingDate({ start: val, end: toDate }));
    setFromDate(val);
    if (val > toDate) {
      setToDate(val);
      onDateChange?.({ from: val, to: val });
    } else {
      onDateChange?.({ from: val, to: toDate });
    }
  };

  const handleToDate = (e) => {
    const val = e.target.value;
    dispatch(addBookingDate({ start: fromDate, end: val }));
    setToDate(val);
    onDateChange?.({ from: fromDate, to: val });
  };

  const handleResetDates = () => {
    dispatch(addBookingDate({ start: today, end: today }));
    setFromDate(today);
    setToDate(today);
    onDateChange?.({ from: today, to: today });
  };

  const isToday = fromDate === today && toDate === today;

  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      <div className="flex items-center space-x-3 bg-white shadow-lg px-4 py-2.5 rounded-md border border-gray-300 flex-1 min-w-[200px]">
        <CiSearch size={20} className="text-gray-500 shrink-0" />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onType(e.target.value);
          }}
          className="flex-1 border-none outline-none"
          placeholder="Search by name..."
        />

        {search.length > 0 && (
          <button
            onClick={() => {
              setSearch("");
              onType("");
            }}
            type="button"
            className="text-gray-500"
          >
            <IoIosCloseCircleOutline size={20} />
          </button>
        )}

        {toggle && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={handleCheckboxChange}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-blue-500 transition"></div>
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5 flex items-center justify-center">
              {checked ? (
                <svg width="8" height="6" viewBox="0 0 11 8" fill="none">
                  <path
                    d="M10.0915 0.951972C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962 1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584 0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2 4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="0.4"
                  />
                </svg>
              ) : (
                <svg
                  className="h-3 w-3 stroke-current text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
          </label>
        )}
      </div>

      <div className="flex items-center gap-2 bg-white shadow-lg px-3 py-2.5 rounded-md border border-gray-300 shrink-0">
        <MdOutlineCalendarToday size={16} className="text-gray-500 shrink-0" />

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 font-medium">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDate}
            className="border-none outline-none text-xs text-gray-700 cursor-pointer"
          />
        </div>

        <span className="text-gray-300 text-sm select-none">|</span>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 font-medium">To</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            onChange={handleToDate}
            className="border-none outline-none text-xs text-gray-700 cursor-pointer"
          />
        </div>

        {!isToday && (
          <button
            onClick={handleResetDates}
            type="button"
            className="text-xs text-blue-500 hover:text-blue-700 underline whitespace-nowrap ml-1"
          >
            Today
          </button>
        )}
      </div>

      {extraActions && (
        <div className="flex items-center gap-2 shrink-0">
          {extraActions}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
