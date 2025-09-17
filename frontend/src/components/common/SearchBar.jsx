/* eslint-disable react/prop-types */
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosCloseCircleOutline } from "react-icons/io";
// import { IoIosCloseCircleOutline } from "react-icons/io";

function SearchBar({ onType, toggle, from }) {
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = () => {
    if (search == "completed") {
     
      setSearch("pending");
setChecked(false)
      onType("pending")
    } else {
      if (from == "/sUsers/bookingList" || from == "/sUsers/checkInList") {
        setSearch("completed");
        setChecked(true)
        onType("completed");
      }
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-white shadow-lg px-4 py-2.5 rounded-md border border-gray-300">
      {/* search icon */}
      <CiSearch size={20} className="text-gray-500" />

      {/* input */}
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

      {/* clear button */}
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

      {/* toggle */}
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
  );
}

export default SearchBar;
