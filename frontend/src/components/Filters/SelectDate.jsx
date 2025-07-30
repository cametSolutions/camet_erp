import { BsCalendarDateFill } from "react-icons/bs"
import { Link } from "react-router-dom"
import { useSelector} from "react-redux"

function SelectDate() {
  const { start, end, title } = useSelector((state) => state.date)
 
 
  
  return (
    <div className="flex justify-between  items-center p-3 bg-white  ">
      <div className="flex justify-evenly items-center gap-3 text-xs">
        <BsCalendarDateFill />
        <p className="font-semibold text-gray-500 ">{title}</p>
        <p className="font-semibold text-gray-500 text-[9px] sm:text-[12px] ">
          {new Date(start).toDateString()} - {new Date(end).toDateString()}
        </p>
      </div>
      <div className="">
        <Link to="/sUsers/dateRange">
          <p className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer">
            Change
          </p>
        </Link>
      </div>
    </div>
  )
}

export default SelectDate
