import React, { useState, useEffect, useRef } from 'react';
import { BsPersonFill, BsBoxArrowRight, BsBuildingFill } from 'react-icons/bs';

const ProfilePopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Sample companies data
  const companies = [
    { id: 1, name: 'Acme Inc', logo: '/api/placeholder/40/40' },
    { id: 2, name: 'Tech Solutions', logo: '/api/placeholder/40/40' },
    { id: 3, name: 'Innovate Co', logo: '/api/placeholder/40/40' }
  ];

  // Handle clicks outside the popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener when popover is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      {/* Profile Button */}
      {/* <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
      >
        <BsPersonFill size={24} />
      </button> */}
      <div>
        
      </div>

      {/* Popover Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-700 z-50">
          {/* Companies Section */}
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm text-gray-300 mb-2 flex items-center">
              <BsBuildingFill className="mr-2" /> Switch Companies
            </h4>
            {companies.map((company) => (
              <div 
                key={company.id} 
                className="flex items-center hover:bg-gray-800 p-2 rounded cursor-pointer"
              >
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-10 h-10 rounded-full mr-3"
                />
                <span className="text-white text-sm">{company.name}</span>
              </div>
            ))}
          </div>

          {/* Logout Section */}
          <div className="p-2">
            <button 
              className="w-full flex items-center text-red-400 hover:bg-gray-800 p-2 rounded"
              onClick={() => {
                // Add logout logic here
                console.log('Logging out');
              }}
            >
              <BsBoxArrowRight size={18} className="mr-2" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopover;