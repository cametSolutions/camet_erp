/* eslint-disable react/prop-types */
import React from "react"
function SummmaryDropdown({ selectedOption, handleFilter,bgColor="#ffff",textColor="#6b7280"}) {
  
  return (
    <div className="">
      <select
      style={{backgroundColor:bgColor,color:textColor}}
        className="w-full sm:max-w-sm md:max-w-sm text-sm font-bold   py-2 px-3  cursor-pointer no-focus-box border-none !border-b"
        value={selectedOption}
        onChange={(e) => {
          // console.log(e.target.value)
          handleFilter(e.target.value)
        }}
      >
        <option value="Ledger">Ledger</option>
        <option value="Stock Item">Stock Item</option>
        {/* <option value="Stock Group">Stock Group</option>
        <option value="Stock Category">Stock Category</option> */}
      </select>
    </div>
  )
}
export default SummmaryDropdown
