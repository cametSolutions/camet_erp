/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { setSelectedOption } from "../../../slices/filterSlices/summaryFilter";
import { useDispatch, useSelector } from "react-redux";

function SummaryDropdown({
  bgColor = "#ffff",
  textColor = "#6b7280",
  hoverColor,
  border = "1px solid #d1d5db",
  filterKeys = [],
  ...props
}) {
  const [option, setOption] = useState("Ledger");
  const [isHover, setIsHover] = useState(false);
  const dispatch = useDispatch();

  const selectedOption = useSelector(
    (state) => state.summaryFilter.selectedOption
  );

  useEffect(() => {
    setOption(selectedOption);
  }, [selectedOption]);

  // All possible dropdown values
  const ALL_OPTIONS = [
    "Ledger",
    "Stock Item",
    "voucher",
    "Stock Group",
    "Stock Category",
    "MonthWise",
  ];

  // Remove options that exist in filterKeys
  const visibleOptions = ALL_OPTIONS.filter(
    (opt) => !filterKeys.includes(opt)
  );

  return (
    <div>
      <select
        {...props}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{
          backgroundColor: isHover ? hoverColor : bgColor,
          border: border,
          color: textColor,
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
          dispatch(setSelectedOption(e.target.value));
          setOption(e.target.value);
        }}
      >
        {visibleOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SummaryDropdown;
