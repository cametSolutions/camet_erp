/* eslint-disable react/prop-types */
import { FaUserTie } from "react-icons/fa";

function PartyTile({ partyName }) {
  return (
    <div className="flex items-center gap-2 p-3 text-sm shadow-lg bg-white">
      <FaUserTie />
      <p className="font-bold"> {partyName}</p>
    </div>
  );
}

export default PartyTile;
