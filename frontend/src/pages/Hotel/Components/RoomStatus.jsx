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
  const statusConfig = {
    vacant: {
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/25",
      hoverShadow: "hover:shadow-emerald-500/40",
      glowColor: "group-hover:shadow-emerald-400/30",
      dotColor: "bg-emerald-500",
      textColor: "text-white",
      border: "border-emerald-300/30",
      hoverBorder: "hover:border-emerald-200/50",
    },
    "checkIn" : {
      gradient: "from-sky-400 to-violet-600",
      shadow: "shadow-sky-500/25",
      hoverShadow: "hover:shadow-sky-500/40",
      glowColor: "group-hover:shadow-sky-400/30",
      dotColor: "bg-orange-500",
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
      border: "border-gray-400/30",
      hoverBorder: "hover:border-gray-300/50",
    },
  };

  const config = statusConfig[status] || statusConfig.vacant;

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer w-full
        bg-gradient-to-br ${config.gradient}
        border-2 ${config.border} ${config.hoverBorder}
        transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-1
        ${config.shadow} ${config.hoverShadow}
        hover:shadow-2xl ${config.glowColor}
        group min-h-[45px] sm:min-h-[60px]
        backdrop-blur-sm
        transform-gpu
      `}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-full"></div>
      
      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

      {/* Status indicator with pulse animation */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 ${config.dotColor} rounded-full animate-pulse`}></div>
        <div className={`absolute inset-0 w-2 h-2 ${config.dotColor} rounded-full opacity-75 animate-ping`}></div>
      </div>

      {/* Content */}
      <div className="relative p-3 sm:p-4 h-full flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span
              className={`${config.textColor} font-bold text-sm sm:text-lg tracking-tight drop-shadow-sm group-hover:drop-shadow-md transition-all duration-200`}
            >
              {room}
            </span>
            {type && (
              <span
                className={`${config.textColor} text-xs sm:text-sm opacity-80 group-hover:opacity-100 transition-opacity duration-200 font-medium`}
              >
                {type}
              </span>
            )}
          </div>
        </div>

        {/* Additional info section */}
        {(guest || checkIn || checkOut) && (
          <div className="mt-2 space-y-1">
            {guest && (
              <div className={`${config.textColor} text-xs opacity-75 group-hover:opacity-100 transition-opacity`}>
                {guest}
              </div>
            )}
            {(checkIn || checkOut) && (
              <div className={`${config.textColor} text-xs opacity-75 group-hover:opacity-100 transition-opacity flex gap-2`}>
                {checkIn && <span>In: {checkIn}</span>}
                {checkOut && <span>Out: {checkOut}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 group-hover:bg-white/40 transition-colors duration-300"></div>
    </div>
  );
};

export default RoomStatus;