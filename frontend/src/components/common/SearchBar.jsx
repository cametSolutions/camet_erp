/* eslint-disable react/prop-types */
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosCloseCircleOutline } from "react-icons/io";

function SearchBar({ onType }) {
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      <div className="flex items-center py-1 px-4 bg-white shadow-lg relative">
        <CiSearch size={20} className="mr-2" />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onType(e.target.value);
          }}
          className="no-focus-box border-none w-full pr-8"
          placeholder="Search by name..."
        />
      </div>
      <button
        onClick={() => {
          setSearch("");
          onType("");
        }}
        type="submit"
        className={`${
          search.length > 0 ? "block" : "hidden"
        }  absolute end-[10px] top-1/2 transform -translate-y-1/2 text-gray-500  text-md px-2 py-1`}
      >
        <IoIosCloseCircleOutline />
      </button>
    </div>
  );
}

export default SearchBar;
