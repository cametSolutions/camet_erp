import { FaAngleDown } from "react-icons/fa";
import { IoIosAnalytics } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function StatusFilter() {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () => {
    navigate("/sUsers/statusFilterList", {
      state: { from: location.pathname },
    });
  };


  const {selectedStatus} = useSelector((state) => state.statusFilter);
  return (
    <div>
      <div className="flex items-center gap-2 cursor-pointer">
        <IoIosAnalytics />

        {
          Object.keys(selectedStatus).length !== 0 ? (
            <div
              onClick={handleClick}
              className="flex items-center gap-2"
            >
              <p className="font-bold text-gray-500 text-xs ">{selectedStatus.title}</p>
              <FaAngleDown className="" />
            </div>
          ) : (
            <div
              onClick={handleClick}
              className="flex items-center gap-2 hover:transform hover:scale-[1.05] ease-out duration-150"
            >
              <p className="font-semibold text-gray-500 text-xs ">Select status</p>
              <FaAngleDown className="" />
            </div>
          )
        }
        {/* <div
          onClick={handleClick}
          className="flex items-center gap-2 hover:transform hover:scale-[1.05] ease-out duration-150"
        >
          <p className="font-semibold text-gray-500 text-xs ">Select status</p>
          <FaAngleDown className="" />
        </div> */}
      </div>
    </div>
  );
}

export default StatusFilter;
