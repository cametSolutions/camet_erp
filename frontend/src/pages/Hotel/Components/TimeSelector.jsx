import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';

const TimeSelector = ({ 
  initialTime = null, 
  onTimeChange,
}) => {
  // Get current time formatted as 12-hour string
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    if (hours === 0) hours = 12;
    if (hours > 12) hours = hours - 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  console.log(initialTime)

  const defaultTime = initialTime || getCurrentTime();
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTime, setSelectedTime] = useState(defaultTime);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");
  
  const containerRef = useRef(null);
  const hourInputRef = useRef(null);

  // Parse initial time
  useEffect(() => {
    
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hour, minute] = time.split(':');
      return { hour, minute, period };
    };
    
    const parsed = parseTime(defaultTime);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
  }, [defaultTime]);

  // Close editing when clicking outside
  useEffect(() => {
    
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  // Handle keyboard events
  useEffect(() => {
    
    const handleKeyDown = (event) => {
      if (!isEditing) return;
      
      if (event.key === 'Escape') {
        handleCancel();
      } else if (event.key === 'Enter') {
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, hour, minute, period]);


  // useEffect used to sent the selected time to the parent
  useEffect(() => {
    
    if(selectedTime){
      onTimeChange(selectedTime)
    }
  },[selectedTime])

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      hourInputRef.current?.focus();
      hourInputRef.current?.select();
    }, 50);
  };

  const validateHour = (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1) return "01";
    if (num > 12) return "12";
    return num.toString().padStart(2, '0');
  };

  const validateMinute = (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return "00";
    if (num > 59) return "59";
    return num.toString().padStart(2, '0');
  };

  const handleHourChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setHour(value);
    }
  };

  const handleMinuteChange = (e) => {
    const value = e.target.value;
    if (value.length <= 2) {
      setMinute(value);
    }
  };

  const handleHourBlur = () => {
    setHour(validateHour(hour));
  };

  const handleMinuteBlur = () => {
    setMinute(validateMinute(minute));
  };

  const handleConfirm = () => {
    const validHour = validateHour(hour);
    const validMinute = validateMinute(minute);
    const timeString = `${validHour}:${validMinute} ${period}`;
    
    setSelectedTime(timeString);
    setHour(validHour);
    setMinute(validMinute);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to current selected time
    const parseTime = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      const [hour, minute] = time.split(':');
      return { hour, minute, period };
    };
    
    const parsed = parseTime(selectedTime);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
    setIsEditing(false);
  };

  const handlePeriodToggle = () => {
    setPeriod(period === 'AM' ? 'PM' : 'AM');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div
        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
        onClick={!isEditing ? handleEdit : undefined}
      >
   
        {!isEditing ? (
          // Display Mode
          <div className="flex items-center justify-between">
            <span className=" text-sm font-medium">
              {selectedTime}
            </span>
            <Clock className="w-5 h-5" />
          </div>
        ) : (
          // Edit Mode
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Hour input */}
              <input
                ref={hourInputRef}
                type="number"
                min="1"
                max="12"
                value={hour}
                onChange={handleHourChange}
                onBlur={handleHourBlur}
                className="w-10 bg-transparent border-none text-black text-sm font-medium text-center focus:outline-none "
                onClick={(e) => e.stopPropagation()}
              />
              
              <span className="text-white text-lg font-medium">:</span>
              
              {/* Minute input */}
              <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={handleMinuteChange}
                onBlur={handleMinuteBlur}
                className="w-10 bg-transparent border-none text-black text-sm font-medium text-center focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* AM/PM toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePeriodToggle();
                }}
                className="ml-2 px-2 py-1 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
              >
                {period}
              </button>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirm();
                }}
                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                title="Confirm"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSelector;