/* eslint-disable react/prop-types */
import { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { IoIosCloseCircleOutline } from "react-icons/io";

function SearchBar({ onType }) {
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      <input
        onChange={(e) => {
          setSearch(e.target.value);
          onType(e.target.value);
        }}
        value={search}
        type="search"
        id="default-search"
        className="block w-full p-2 text-sm text-gray-900 border  rounded-lg border-gray-300  bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Search..."
          
      />
      <button
        type="submit"
        className="text-white absolute end-[10px] top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-2 py-1"
      >
        <IoIosSearch />
      </button>
      <button
        onClick={() => {
          setSearch("");
          onType("");
        }}
        type="submit"
        className={`${
          search.length > 0 ? "block" : "hidden"
        }  absolute end-[40px] top-1/2 transform -translate-y-1/2 text-gray-500  text-md px-2 py-1`}
      >
        <IoIosCloseCircleOutline />
      </button>
    </div>
  );
}

export default SearchBar;
