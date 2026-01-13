/* eslint-disable react/prop-types */
/* eslint-disable no-case-declarations */
import { useState } from "react"
import {
  format,
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
} from "date-fns"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { BsFillCalendar2DateFill, BsCalendar3 } from "react-icons/bs"
import { useDispatch, useSelector } from "react-redux"
import { addDate } from "../../../slices/filterSlices/date"
import { useNavigate } from "react-router-dom"
import TitleDiv from "../common/TitleDiv"
import { ChevronRight } from "lucide-react"

const DateRange = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { title } = useSelector((state) => state.date)
  
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [customStartDate, setCustomStartDate] = useState(null)
  const [customEndDate, setCustomEndDate] = useState(null)

  const submitHandler = (rangeName, start, end) => {
    if (!start || !end) return

    const newstart = new Date(start)
    const newend = new Date(end)

    const startdate = new Date(
      Date.UTC(
        newstart.getFullYear(),
        newstart.getMonth(),
        newstart.getDate(),
        0, 0, 0
      )
    )
    const enddate = new Date(
      Date.UTC(
        newend.getFullYear(),
        newend.getMonth(),
        newend.getDate(),
        0, 0, 0
      )
    )

    dispatch(
      addDate({
        rangeName,
        start: startdate.toISOString(),
        end: enddate.toISOString(),
        initial: true
      })
    )
    navigate(-1)
  }

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      if (customEndDate < customStartDate) {
        alert("End date cannot be before start date.")
        return
      }
      submitHandler("Custom Date", customStartDate, customEndDate)
    } else {
      alert("Both start and end dates must be selected.")
    }
  }

  const getRangeDates = (rangeType) => {
    let startDate, endDate
    const today = new Date()
    const getUtcToday = () => new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0))

    switch (rangeType) {
      case "Today":
        startDate = endDate = getUtcToday()
        break
      case "Yesterday":
        startDate = endDate = subDays(new Date(), 1)
        break
      case "This Week":
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 })
        break
      case "Last Week":
        startDate = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })
        endDate = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })
        break
      case "Last 7 Days":
        startDate = subDays(new Date(), 6)
        endDate = new Date()
        break
      case "This Month":
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
        break
      case "Last Month":
        startDate = startOfMonth(subMonths(new Date(), 1))
        endDate = endOfMonth(subMonths(new Date(), 1))
        break
      case "Last 30 Days":
        startDate = subDays(new Date(), 29)
        endDate = new Date()
        break
      case "This Quarter":
        startDate = startOfQuarter(new Date())
        endDate = endOfQuarter(new Date())
        break
      case "Last Quarter":
        startDate = startOfQuarter(subMonths(new Date(), 3))
        endDate = endOfQuarter(subMonths(new Date(), 3))
        break
      case "Current Financial Year":
        startDate = new Date(new Date().getFullYear(), 3, 1)
        endDate = new Date(new Date().getFullYear() + 1, 2, 31)
        break
      case "Previous Financial Year":
        startDate = new Date(new Date().getFullYear() - 1, 3, 1)
        endDate = new Date(new Date().getFullYear(), 2, 31)
        break
      case "Last Year":
        startDate = startOfYear(subMonths(new Date(), 12))
        endDate = endOfYear(subMonths(new Date(), 12))
        break
      default:
        startDate = endDate = new Date()
    }
    return { start: startDate, end: endDate }
  }

  const ranges = [
    "Today", "Yesterday", "This Week", "Last Week", "Last 7 Days",
    "This Month", "Last Month", "Last 30 Days", "This Quarter",
    "Last Quarter", "Current Financial Year", "Previous Financial Year", "Last Year"
  ]

  const CustomDateInput = ({ value, onClick, placeholder }) => (
    <div 
      className="flex items-center bg-white border border-gray-300 rounded px-2 py-1.5 cursor-pointer hover:border-blue-400 transition-colors w-full"
      onClick={onClick}
    >
      <BsCalendar3 className="text-gray-400 text-xs mr-2" />
      <span className={`text-xs ${value ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
        {value || placeholder}
      </span>
    </div>
  )

  return (
    <div className="flex-col pb-4">
      <TitleDiv title="Date Range" />
      <div className="flex flex-col px-3 py-2 gap-2">
        
        <div
          className={`${
            title?.includes(" to ") || showCustomPicker ? "bg-slate-100 ring-1 ring-slate-300" : "bg-white"
          } flex flex-col shadow-sm border border-gray-100 rounded-lg overflow-hidden transition-all duration-200`}
        >
          <div 
            className="flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50"
            onClick={() => setShowCustomPicker(!showCustomPicker)}
          >
            <span className="font-bold text-xs text-gray-600 flex items-center gap-2">
              <BsFillCalendar2DateFill className="text-blue-500" /> 
              Custom Range
            </span>
            <ChevronRight className={`w-3 h-3 text-gray-400 transition-transform ${showCustomPicker ? 'rotate-90' : ''}`} />
          </div>

          {showCustomPicker && (
            <div className="px-3 pb-3 pt-1 flex flex-col gap-2 bg-slate-50 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-semibold text-gray-500 mb-0.5 block">From</label>
                  <DatePicker
                    selected={customStartDate}
                    onChange={(date) => setCustomStartDate(date)}
                    selectsStart
                    startDate={customStartDate}
                    endDate={customEndDate}
                    placeholderText="Start Date"
                    dateFormat="dd-MMM-yyyy"
                    customInput={<CustomDateInput placeholder="Select" />}
                    maxDate={new Date()}
                    fixedHeight
                    // FIX: Render outside this container to avoid sidebar clipping
                    portalId="root"
                    popperClassName="!z-[9999]" 
                    popperPlacement="bottom-start"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-semibold text-gray-500 mb-0.5 block">To</label>
                  <DatePicker
                    selected={customEndDate}
                    onChange={(date) => setCustomEndDate(date)}
                    selectsEnd
                    startDate={customStartDate}
                    endDate={customEndDate}
                    minDate={customStartDate}
                    placeholderText="End Date"
                    dateFormat="dd-MMM-yyyy"
                    customInput={<CustomDateInput placeholder="Select" />}
                    maxDate={new Date()}
                    fixedHeight
                    // FIX: Render outside this container to avoid sidebar clipping
                    portalId="root"
                    popperClassName="!z-[9999]"
                    popperPlacement="bottom-end"
                  />
                </div>
              </div>

              <button
                onClick={handleCustomDateSubmit}
                disabled={!customStartDate || !customEndDate}
                className={`w-full py-1.5 rounded text-xs font-semibold transition-all ${
                  !customStartDate || !customEndDate
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                Apply Range
              </button>
            </div>
          )}
        </div>

        {ranges.map((rangeName) => {
          const { start, end } = getRangeDates(rangeName)
          const isActive = title === rangeName

          return (
            <div
              key={rangeName}
              className={`${
                isActive ? "bg-blue-50 border-blue-200" : "bg-white hover:bg-gray-50 border-transparent"
              } flex justify-between items-center cursor-pointer shadow-sm border p-3 rounded-lg transition-all duration-150 group`}
              onClick={() => submitHandler(rangeName, start, end)}
            >
              <span className={`font-bold text-xs flex items-center gap-2 ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
                <BsFillCalendar2DateFill className={`text-[10px] ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} /> 
                {rangeName}
              </span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {format(start, "dd MMM")}
                {rangeName !== "Today" && ` - ${format(end, "dd MMM")}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DateRange
  