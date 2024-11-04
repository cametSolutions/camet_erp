import { RiUser3Fill } from "react-icons/ri";
import { FaAngleDown } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function PartyFilter() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedParty } = useSelector((state) => state.partyFilter);


  const handleClick = () => {
    navigate("/sUsers/partyFilterList", { state: { from: location.pathname } });
  };
  return (
    <div className="flex items-center gap-2 cursor-pointer bg-white ">
      <RiUser3Fill />

      {Object.keys(selectedParty).length !== 0 ? (
        <div   onClick={handleClick} className="flex items-center gap-2">
          <p className="font-bold text-gray-500 text-xs ">
            {selectedParty.partyName}
          </p>
          <FaAngleDown className="" />
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="flex items-center gap-2 hover:transform hover:scale-[1.05] ease-out duration-150"
        >
          <p className="font-semibold text-gray-500 text-xs ">Select Party</p>
          <FaAngleDown className="" />
        </div>
      )}
    </div>
  );
}

export default PartyFilter;
