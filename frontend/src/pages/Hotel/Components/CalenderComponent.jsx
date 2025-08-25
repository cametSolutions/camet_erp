import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, Clock, CalendarDays } from "lucide-react";

const CalenderComponent = ({sendDateToParent, bookingData}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateMonthDays = (year, month) => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const navigateYear = (direction) => {
    setCurrentYear(currentYear + direction);
  };

  const goToCurrentYear = () => {
    setCurrentYear(new Date().getFullYear());
  };

  const handleDateClick = (year, month, day) => {
    if (day) {
      const selected = new Date(year, month, day);
      setSelectedDate(selected);
      sendDateToParent(selected,true);
    }
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      day &&
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (year, month, day) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    );
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "No date selected";
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isWeekend = (year, month, day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const isBookingDate = (year, month, day) => {
    if (!day || !bookingData || !Array.isArray(bookingData)) return false;
    
    const dateToCheck = new Date(year, month, day);
    const dateString = dateToCheck.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    return bookingData.some(booking => {
      // Check both arrivalDate and checkOutDate
      const arrivalDate = booking.arrivalDate;
      const checkOutDate = booking.checkOutDate;
      
      if (arrivalDate === dateString || checkOutDate === dateString) {
        return true;
      }
      
      // Also check if the date falls between arrival and checkout (for multi-day stays)
      if (arrivalDate && checkOutDate) {
        const arrival = new Date(arrivalDate);
        const checkout = new Date(checkOutDate);
        return dateToCheck >= arrival && dateToCheck < checkout;
      }
      
      return false;
    });
  };

  const getBookingInfo = (year, month, day) => {
    if (!day || !bookingData || !Array.isArray(bookingData)) return null;
    
    const dateToCheck = new Date(year, month, day);
    const dateString = dateToCheck.toISOString().split('T')[0];
    
    const booking = bookingData.find(booking => {
      const arrivalDate = booking.arrivalDate;
      const checkOutDate = booking.checkOutDate;
      
      if (arrivalDate === dateString || checkOutDate === dateString) {
        return true;
      }
      
      if (arrivalDate && checkOutDate) {
        const arrival = new Date(arrivalDate);
        const checkout = new Date(checkOutDate);
        return dateToCheck >= arrival && dateToCheck < checkout;
      }
      
      return false;
    });
    
    return booking;
  };

  const MonthGrid = ({ year, month, monthName }) => {
    const days = generateMonthDays(year, month);

    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-wide">
            {monthName}
          </h3>
          <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {dayNames.map((day, index) => (
            <div key={day} className={`text-center text-xs font-semibold py-1 rounded ${
              index === 0 || index === 6 
                ? 'text-blue-400 bg-slate-700/50' 
                : 'text-slate-300 bg-slate-700/30'
            }`}>
              {day.slice(0, 1)}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, index) => {
            const bookingInfo = getBookingInfo(year, month, day);
            const isBookingDay = isBookingDate(year, month, day);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(year, month, day)}
                disabled={!day}
                title={bookingInfo ? `Booking: ${bookingInfo.customerName || 'Guest'} - Room: ${bookingInfo.selectedRooms?.[0]?.roomName || 'N/A'}` : ''}
                className={`
                  w-6 h-6 flex items-center justify-center text-xs rounded font-medium
                  transition-all duration-200 relative overflow-hidden group
                  ${!day ? "cursor-default opacity-0" : "hover:scale-110 cursor-pointer"}
                  ${
                    isToday(year, month, day)
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/50"
                      : ""
                  }
                  ${
                    isSelected(year, month, day) && !isToday(year, month, day)
                      ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold shadow-lg shadow-blue-400/30"
                      : ""
                  }
                  ${
                    isBookingDay && !isToday(year, month, day) && !isSelected(year, month, day)
                      ? "bg-gradient-to-br from-red-500 to-red-600 text-white font-bold shadow-lg shadow-red-500/30 ring-1 ring-red-400/50"
                      : ""
                  }
                  ${
                    day &&
                    !isToday(year, month, day) &&
                    !isSelected(year, month, day) &&
                    !isBookingDay
                      ? isWeekend(year, month, day)
                        ? "text-blue-300 bg-slate-700/40 hover:bg-slate-600/60 border border-slate-600/50"
                        : "text-slate-200 bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/30"
                      : ""
                  }
                `}
              >
                {day && (
                  <>
                    <span className="relative z-10">{day}</span>
                    {!isToday(year, month, day) && !isSelected(year, month, day) && !isBookingDay && (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/20 group-hover:to-blue-600/20 transition-all duration-200 rounded"></div>
                    )}
                    {isBookingDay && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
           <div className="relative">
        {/* <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        > */}
          <Calendar size={16} className="text-white m-2" 
           onClick={() =>{
             setShowCalendar(!showCalendar)
             sendDateToParent( new Date(),!showCalendar)
            }}/>
          {/* <span className="text-sm font-medium">Calendar</span> */}
        {/* </button> */}
      </div>

      {showCalendar && (
        <div className="mt-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full">
            
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <CalendarDays size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Calendar Selection</h2>
                  <p className="text-slate-400 text-xs">Choose your preferred date</p>
                </div>
              </div>
              
              <button
                onClick={() => {setShowCalendar(false); sendDateToParent( new Date(),false)}}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Year Navigation */}
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-3 shadow-lg">
              <button
                onClick={() => navigateYear(-1)}
                className="p-2 hover:bg-slate-600 rounded-lg transition-all duration-200 text-slate-300 hover:text-white hover:scale-110"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  {currentYear}
                </h1>
                <button
                  onClick={goToCurrentYear}
                  className="mt-1 px-3 py-1 bg-gradient-to-r from-slate-600 to-slate-700 text-slate-200 rounded text-xs font-medium hover:from-slate-500 hover:to-slate-600 transition-all duration-200"
                >
                  Current Year
                </button>
              </div>

              <button
                onClick={() => navigateYear(1)}
                className="p-2 hover:bg-slate-600 rounded-lg transition-all duration-200 text-slate-300 hover:text-white hover:scale-110"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
              <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 border border-blue-700/50 rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-600/20 rounded">
                    <Clock size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-xs font-medium">Selected Date</p>
                    <p className="text-sm text-white font-bold">
                      {formatSelectedDate()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Year Grid - All 12 Months */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {monthNames.map((monthName, monthIndex) => (
                <MonthGrid
                  key={monthIndex}
                  year={currentYear}
                  month={monthIndex}
                  monthName={monthName}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-slate-700">
              <p className="text-slate-400 text-xs">
                Select any date to continue • {currentYear} Calendar View
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalenderComponent;