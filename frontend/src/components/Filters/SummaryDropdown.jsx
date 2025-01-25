/* eslint-disable react/prop-types */
import React from "react"
function SummmaryDropdown({ selectedOption, handleLedger }) {
  return (
    <div className="">
      <select
        className="w-full sm:max-w-sm md:max-w-sm bg-[#219ebc] text-white font-semibold py-2 px-3   cursor-pointer no-focus-box border-none !border-b"
        value={selectedOption}
        onChange={(e) => {
          // console.log(e.target.value)
          handleLedger(e.target.value)
        }}
      >
        <option value="Ledger">Ledger</option>
        <option value="Stock Item">Stock Item</option>
        <option value="Stock Group">Stock Group</option>
        <option value="Stock Category">Stock Category</option>
      </select>
    </div>
  )
}
export default SummmaryDropdown
