/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { setSelectedOption } from "../../../slices/filterSlices/summaryFilter";
import { useDispatch, useSelector } from "react-redux";
function SummaryDropdown({ bgColor="#ffff",textColor="#6b7280"}) {

  const [option,setOption] = useState("Ledger")
  const dispatch=useDispatch()

  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  );

  useEffect(() => {
    setOption(selectedOption);
  }, [selectedOption]);

  
  return (
    <div className="">
      <select
      style={{backgroundColor:bgColor,color:textColor}}
        className="   w-full sm:max-w-sm md:max-w-sm text-sm font-bold   py-2 px-3  cursor-pointer no-focus-box outline-none border-none !border-b"
        value={option}
        onChange={(e) => {
          dispatch(setSelectedOption(e.target.value))
          setOption(e.target.value)
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
export default SummaryDropdown
