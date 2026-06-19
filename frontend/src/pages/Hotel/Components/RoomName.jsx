import { useState } from "react";

const RoomName = ({ rooms = "" }) => {
  const roomArray = Array.isArray(rooms)
    ? rooms
    : String(rooms).split(",").map((r) => r.trim()).filter(Boolean);

  const [expanded, setExpanded] = useState(false);
  const visibleCount = 3;

  if (!roomArray.length) return <span>-</span>;

  const displayText = expanded
    ? roomArray.join(", ")
    : roomArray.slice(0, visibleCount).join(", ") +
      (roomArray.length > visibleCount ? ", ..." : "");

  return (
    <span>
      {displayText}
      {roomArray.length > visibleCount && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-1 text-blue-600 underline"
        >
          {expanded ? "show less" : "more"}
        </button>
      )}
    </span>
  );
};

export default RoomName;