import React from "react";


const RoomStatus = ({
  room,
  status,
  guest,
  checkIn,
  checkOut,
  onClick,
  type,
}) => {
  const statusColors = {
    vacant: "from-emerald-500 to-teal-600", // green gradient
    booked: "from-red-500 to-pink-600", // red/pink gradient
    occupied: "from-sky-400 to-violet-600", // orange/red gradient
    dirty: "from-yellow-500 to-orange-600",
    blocked: "from-gray-500 to-slate-800",
  };
  const statusStyles = {
    vacant: {
      // bg: 'from-gray-700 to-gray-800',
      border: "border-gray-600",
      text: "text-gray-300",
      hoverBg: "hover:from-gray-600 hover:to-gray-700",
      hoverBorder: "hover:border-white/50",
    },
    occupied: {
      // bg: 'from-gray-800 to-black',
      border: "border-white/30",
      text: "text-white",
      hoverBg: "hover:from-gray-700 hover:to-gray-900",
      hoverBorder: "hover:border-white/60",
    },
    booked: {
      // bg: 'from-black to-gray-900',
      border: "border-white/40",
      text: "text-white",
      hoverBg: "hover:from-gray-900 hover:to-black",
      hoverBorder: "hover:border-white/70",
    },
    dirty: {
      // bg: 'from-gray-600 to-gray-700',
      border: "border-gray-500",
      text: "text-gray-300",
      hoverBg: "hover:from-gray-500 hover:to-gray-600",
      hoverBorder: "hover:border-white/40",
    },
    blocked: {
      // bg: 'from-gray-900 to-black',
      border: "border-gray-700",
      text: "text-gray-400",
      hoverBg: "hover:from-gray-800 hover:to-gray-900",
      hoverBorder: "hover:border-white/30",
    },
  };

  const style = statusStyles[status] || statusStyles.vacant;

  return (
  <div
  onClick={onClick}
  className={`
    relative overflow-hidden rounded-lg cursor-pointer w-full
    border ${style.border}
    transition-all duration-200 
    hover:scale-102
    shadow-md hover:shadow-lg
    bg-gradient-to-r ${statusColors[status] || statusColors.vacant}
    ${style.hoverBg} ${style.hoverBorder}
    group min-h-[40px] sm:min-h-[55px]
  `}
>
  {/* Status indicator dot */}
  <div
    className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full 
      ${
        status === "vacant"
          ? "bg-emerald-500"
          : status === "occupied"
          ? "bg-orange-500"
          : status === "booked"
          ? "bg-red-500"
          : status === "dirty"
          ? "bg-yellow-500"
          : status === "blocked"
          ? "bg-gray-500"
          : "bg-gray-300"
      }
      group-hover:scale-110 transition-transform
    `}
  />

  <div className="relative p-2 sm:p-2.5 h-full flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <span
        className={`${style.text} font-semibold text-xs sm:text-sm group-hover:text-white transition-colors`}
      >
        {room}
      </span>
    </div>

    {type && (
      <div
        className={`${style.text} text-[10px] sm:text-xs opacity-70 group-hover:opacity-100 transition-opacity`}
      >
        {type}
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"></div>
  </div>
</div>

  );
};

export default RoomStatus;
