import React from 'react';
import { BedDouble, Users, Calendar, Settings, Activity } from 'lucide-react';

const RoomStatus = ({ room, status, guest, checkIn, checkOut, onClick, type }) => {
  const statusStyles = {
    vacant: {
      bg: 'from-gray-700 to-gray-800',
      border: 'border-gray-600',
      text: 'text-gray-300',
      hoverBg: 'hover:from-gray-600 hover:to-gray-700',
      hoverBorder: 'hover:border-white/50'
    },
    occupied: {
      bg: 'from-gray-800 to-black',
      border: 'border-white/30',
      text: 'text-white',
      hoverBg: 'hover:from-gray-700 hover:to-gray-900',
      hoverBorder: 'hover:border-white/60'
    },
    booked: {
      bg: 'from-black to-gray-900',
      border: 'border-white/40',
      text: 'text-white',
      hoverBg: 'hover:from-gray-900 hover:to-black',
      hoverBorder: 'hover:border-white/70'
    },
    dirty: {
      bg: 'from-gray-600 to-gray-700',
      border: 'border-gray-500',
      text: 'text-gray-300',
      hoverBg: 'hover:from-gray-500 hover:to-gray-600',
      hoverBorder: 'hover:border-white/40'
    },
    blocked: {
      bg: 'from-gray-900 to-black',
      border: 'border-gray-700',
      text: 'text-gray-400',
      hoverBg: 'hover:from-gray-800 hover:to-gray-900',
      hoverBorder: 'hover:border-white/30'
    }
  };

  const style = statusStyles[status] || statusStyles.vacant;

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl cursor-pointer w-full
        bg-gradient-to-br ${style.bg}
        border-2 ${style.border}
        transform transition-all duration-300 
        hover:scale-105 hover:rotate-1
        shadow-lg hover:shadow-2xl hover:shadow-white/10
        ${style.hoverBg} ${style.hoverBorder}
        group min-h-[50px] sm:min-h-[73px]
      `}
    >
      {/* Status indicator dot */}
     <div
  className={`absolute top-2 right-2 w-2 h-2 rounded-full 
    ${
      status === 'vacant'
        ? 'bg-emerald-500'
        : status === 'occupied'
        ? 'bg-orange-500'
        : status === 'booked'
        ? 'bg-red-500'
        : status === 'dirty'
        ? 'bg-yellow-500'
        : status === 'blocked'
        ? 'bg-gray-500'
        : 'bg-gray-300'
    }
    group-hover:scale-125 transition-transform
  `}
/>
    
      <div className="relative p-3 sm:p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className={`${style.text} font-bold text-sm sm:text-md group-hover:text-white transition-colors`}>
            {room}
          </span>
        </div>
        
        {type && (
          <div className={`${style.text} text-xs opacity-70 group-hover:opacity-100 transition-opacity`}>
            {type}
          </div>
        )}
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      </div>
    </div>
  );
};

export default RoomStatus;