/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { setSelectedOption } from "../../../slices/filterSlices/summaryFilter"
import { useDispatch, useSelector } from "react-redux"
function SummaryDropdown({
  bgColor = "#ffff",
  textColor = "#6b7280",
  hoverColor,
  border="1px solid #d1d5db",
  ...props
}) {
  const [option, setOption] = useState("Ledger")
  const [isHover, setIsHover] = useState(false)
  const dispatch = useDispatch()

  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  )
  useEffect(() => {
    setOption(selectedOption)
  }, [selectedOption])

  return (
    <div >
      <select
        {...props}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{
          backgroundColor: isHover ? hoverColor : bgColor,
          border: border,
          color: textColor
        }}
        className="
        appearance-none    
        rounded-md           
        px-4 py-2           
        pr-8                 
        shadow-inner          
        focus:outline-none   
        transition-colors    
        cursor-pointer   
      "
        value={option}
        onChange={(e) => {
          dispatch(setSelectedOption(e.target.value))
          setOption(e.target.value)
        }}
      >
        <option value="Ledger">Ledger</option>
        <option value="Stock Item">Stock Item</option>
        <option value="voucher">Voucher</option>
        <option value="Stock Group">Stock Group</option>
        <option value="Stock Category">Stock Category</option>
        <option value="MonthWise">MonthWise</option>

      </select>
    </div>
  )
}
export default SummaryDropdown
