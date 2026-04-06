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
  console.log(room);
  const statusConfig = {
    vacant: {
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
      hoverShadow: "hover:shadow-emerald-500/40",
      glowColor: "group-hover:shadow-emerald-400/30",
      dotColor: "bg-emerald-500",
      statusColor: "text-emerald-300",
      textColor: "text-white",
      border: "border-emerald-300/30",
      hoverBorder: "hover:border-emerald-200/50",
    },
    occupied: {
      gradient: "from-sky-400 to-violet-600",
      shadow: "shadow-sky-500/25",
      hoverShadow: "hover:shadow-sky-500/40",
      glowColor: "group-hover:shadow-sky-400/30",
      dotColor: "bg-sky-500",
      statusColor: "text-sky-300",
      textColor: "text-white",
      border: "border-sky-300/30",
      hoverBorder: "hover:border-sky-200/50",
    },
    booked: {
      gradient: "from-red-500 to-pink-600",
      shadow: "shadow-red-500/25",
      hoverShadow: "hover:shadow-red-500/40",
      glowColor: "group-hover:shadow-red-400/30",
      dotColor: "bg-red-500",
      statusColor: "text-red-300",
      textColor: "text-white",
      border: "border-red-300/30",
      hoverBorder: "hover:border-red-200/50",
    },
    dirty: {
      gradient: "from-yellow-500 to-orange-600",
      shadow: "shadow-yellow-500/25",
      hoverShadow: "hover:shadow-yellow-500/40",
      glowColor: "group-hover:shadow-yellow-400/30",
      dotColor: "bg-yellow-500",
      statusColor: "text-yellow-300",
      textColor: "text-white",
      border: "border-yellow-300/30",
      hoverBorder: "hover:border-yellow-200/50",
    },
    blocked: {
      gradient: "from-gray-500 to-slate-800",
      shadow: "shadow-gray-500/25",
      hoverShadow: "hover:shadow-gray-500/40",
      glowColor: "group-hover:shadow-gray-400/30",
      dotColor: "bg-gray-500",
      textColor: "text-white",
      statusColor: "text-gray-300",
      border: "border-gray-400/30",
      hoverBorder: "hover:border-gray-300/50",
    },
  };

  const config = statusConfig[status] || statusConfig.vacant;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg cursor-pointer w-full
        bg-gradient-to-br ${config.gradient}
        border ${config.border} ${config.hoverBorder}
        transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-0.5
        ${config.shadow} ${config.hoverShadow}
        hover:shadow-lg ${config.glowColor}
        group min-h-[60px]
        backdrop-blur-sm
        transform-gpu
      `}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>

      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

      {/* Status dot */}
      <div className="absolute top-1 right-1">
        <div className={`w-1.5 h-1.5 ${config.dotColor} rounded-full animate-pulse`}></div>
        <div className={`absolute inset-0 w-1.5 h-1.5 ${config.dotColor} rounded-full opacity-75 animate-ping border-x border-gray-500`}></div>
      </div>

      {/* Content */}
      <div className="relative px-2 py-1.5 h-full flex flex-col justify-between z-10">
        <div className="flex flex-col">
          {/* Room name */}
          <span className={`${config.textColor} font-bold text-xl leading-tight tracking-tight drop-shadow-sm`}>
            {room}
          </span>
          {/* Status label */}
          <span className={`text-sm font-medium leading-tight ${config.statusColor}`}>
            {status == "dirty" ? "Cleaning" : status}
          </span>
          {type && (
            <span className={`${config.textColor} text-sm opacity-80 font-medium leading-tight`}>
              {type}
            </span>
          )}
        </div>

        {/* Guest / dates — only shown when data exists */}
        {(guest || checkIn || checkOut) && (
          <div className="mt-1 space-y-0.5">
            {guest && (
              <div className={`${config.textColor} text-xs opacity-75`}>{guest}</div>
            )}
            {(checkIn || checkOut) && (
              <div className={`${config.textColor} text-sm opacity-75 flex gap-1`}>
                {checkIn && <span>In: {checkIn}</span>}
                {checkOut && <span>Out: {checkOut}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom highlight */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20 group-hover:bg-white/40 transition-colors duration-300"></div>
    </div>

  );
};

export default RoomStatus;