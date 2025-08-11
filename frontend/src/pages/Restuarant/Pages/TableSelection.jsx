import React, { useState } from 'react';
import { Users, Utensils, Clock } from 'lucide-react';

const TableSelection = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);
  
  // Sample table data with different statuses
  const tableData = Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
    status: ['available', 'occupied', 'reserved'][Math.floor(Math.random() * 3)],
    estimatedWait: Math.floor(Math.random() * 30)
  }));

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'from-emerald-500 via-green-400 to-teal-500';
      case 'occupied': return 'from-red-500 via-rose-400 to-pink-500';
      case 'reserved': return 'from-amber-500 via-yellow-400 to-orange-500';
      default: return 'from-gray-500 via-gray-400 to-slate-500';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'reserved': return 'Reserved';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-60 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-8 text-center">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 mb-4">
          Select Your Table
        </h1>
        <p className="text-gray-300 text-xl font-light">Choose from our available dining tables</p>
        
        {/* Legend */}
        <div className="flex justify-center mt-6 space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            <span className="text-gray-300">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
            <span className="text-gray-300">Occupied</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
            <span className="text-gray-300">Reserved</span>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="relative z-10 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tableData.map((table) => (
            <div
              key={table.id}
              className={`relative group cursor-pointer transform transition-all duration-500 hover:scale-105 ${
                selectedTable === table.id ? 'scale-105' : ''
              }`}
              onClick={() => setSelectedTable(table.id)}
              onMouseEnter={() => setHoveredTable(table.id)}
              onMouseLeave={() => setHoveredTable(null)}
            >
              {/* Main Card */}
              <div className={`
                relative h-80 rounded-2xl overflow-hidden shadow-2xl
                bg-gradient-to-br ${getStatusColor(table.status)}
                ${selectedTable === table.id ? 'ring-4 ring-white ring-opacity-50' : ''}
                ${hoveredTable === table.id ? 'shadow-3xl' : ''}
              `}>
                {/* Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm"></div>
                
                {/* Wood Texture Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`woodPattern${table.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                        <path d="M0 20 Q20 10 40 20 T80 20" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#woodPattern${table.id})`} className="text-black"/>
                  </svg>
                </div>

                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                  ${table.status === 'available' ? 'bg-green-500 bg-opacity-80 text-white' : ''}
                  ${table.status === 'occupied' ? 'bg-red-500 bg-opacity-80 text-white' : ''}
                  ${table.status === 'reserved' ? 'bg-amber-500 bg-opacity-80 text-white' : ''}
                `}>
                  {getStatusText(table.status)}
                </div>

                {/* Table Number - Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`
                    text-6xl font-bold text-white mb-4 transform transition-transform duration-300
                    ${hoveredTable === table.id ? 'scale-110' : ''}
                    drop-shadow-2xl
                  `}>
                    {table.id}
                  </div>
                  
                  <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-white mb-2">
                      <Users size={16} />
                      <span className="text-sm font-medium">{table.capacity} seats</span>
                    </div>
                    
                    {table.status === 'occupied' && (
                      <div className="flex items-center justify-center space-x-2 text-red-200">
                        <Clock size={14} />
                        <span className="text-xs">~{table.estimatedWait} min wait</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className={`
                  absolute inset-0 bg-white transition-opacity duration-300
                  ${hoveredTable === table.id ? 'opacity-10' : 'opacity-0'}
                `}></div>

                {/* Selection Effect */}
                {selectedTable === table.id && (
                  <div className="absolute inset-0 border-4 border-white border-opacity-50 rounded-2xl animate-pulse"></div>
                )}

                {/* Corner Accent */}
                <div className="absolute bottom-0 right-0 w-16 h-16 transform translate-x-8 translate-y-8">
                  <div className="w-full h-full bg-white bg-opacity-20 rounded-full transform -translate-x-8 -translate-y-8"></div>
                </div>
              </div>

              {/* Table Icon/Decoration */}
              <div className={`
                absolute -bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-300
                ${hoveredTable === table.id ? 'scale-110 -translate-y-1' : ''}
              `}>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <Utensils size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Table Info */}
      {selectedTable && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black bg-opacity-70 backdrop-blur-lg rounded-2xl p-6 text-white border border-white border-opacity-20">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Table {selectedTable} Selected</h3>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <span>Capacity: {tableData[selectedTable - 1]?.capacity} people</span>
                <span>•</span>
                <span>Status: {getStatusText(tableData[selectedTable - 1]?.status)}</span>
              </div>
              <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableSelection;