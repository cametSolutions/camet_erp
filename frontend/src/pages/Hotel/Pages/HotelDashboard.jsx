import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { BedDouble, Filter, X } from "lucide-react";
import AnimatedBackground from "../Components/AnimatedBackground";
import RoomStatus from "../Components/RoomStatus";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";

const HotelDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
const [showRoomModal, setShowRoomModal] = useState(false);
const [selectedRoomData, setSelectedRoomData] = useState(null);

  // Filter states
  const [roomTypes, setRoomTypes] = useState([]);
  const [floorTypes, setFloorTypes] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);

  // Selected filters
  const [filters, setFilters] = useState({
    roomType: "",
    floorType: "",
    bedType: "",
    status: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const [selectedDate, setSelectedDate] = useState(() => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // format YYYY-MM-DD
});


  // Fetch all rooms
 const fetchRooms = useCallback(async (date) => {
  setIsLoading(true);
  setLoader(true);
  
  try {
    const res = await api.get(`/api/sUsers/getAllRoomsWithStatus/${cmp_id}`, {
      params: { selectedDate: date },
      withCredentials: true,
    });
    const roomsData = res.data.rooms || [];
    setRooms(roomsData);
    setFilteredRooms(roomsData);

    // Extract filter options
     const uniqueRoomTypes = [
        ...new Set(
          roomsData.map((room) => room.roomType?.brand).filter(Boolean)
        ),
      ];
      const uniqueFloorTypes = [
        ...new Set(
          roomsData.map((room) => room.roomFloor?.subcategory).filter(Boolean)
        ),
      ];
      const uniqueBedTypes = [
        ...new Set(
          roomsData.map((room) => room.bedType?.category).filter(Boolean)
        ),
      ];
 setRoomTypes(uniqueRoomTypes);
      setFloorTypes(uniqueFloorTypes);
      setBedTypes(uniqueBedTypes);

  } catch (error) {
    console.log("Error fetching rooms:", error);
  } finally {
    setIsLoading(false);
    setLoader(false);
  }
}, [cmp_id]);

  // Filter rooms based on selected filters
  const applyFilters = useCallback(() => {
    let filtered = rooms;

    if (filters.roomType) {
      filtered = filtered.filter(
        (room) => room.roomType?.brand === filters.roomType
      );
    }

    if (filters.floorType) {
      filtered = filtered.filter(
        (room) => room.roomFloor?.subcategory === filters.floorType
      );
    }

    if (filters.bedType) {
      filtered = filtered.filter(
        (room) => room.bedType?.category === filters.bedType
      );
    }

    if (filters.status) {
      filtered = filtered.filter((room) => room.status === filters.status);
    }

    setFilteredRooms(filtered);
  }, [rooms, filters]);

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      roomType: "",
      floorType: "",
      bedType: "",
      status: "",
    });
  };

  // Group rooms by brand (roomType.brand)
  const groupRoomsByType = (roomsToGroup) => {
    return roomsToGroup.reduce((acc, room) => {
      // Use the brand from roomType, fallback to 'Unknown'
      const type = room.roomType?.brand || "Unknown Room Brand";
      acc[type] = acc[type] || [];
      acc[type].push(room);
      return acc;
    }, {});
  };


  const statusColors = {
  vacant: "from-emerald-500 to-teal-600",  // green gradient
  booked: "from-red-500 to-pink-600",      // red/pink gradient
  occupied: "from-orange-500 to-red-600",  // orange/red gradient
  dirty: "from-yellow-500 to-orange-600",
  blocked: "from-gray-500 to-slate-800",
};
const handleRoomAction = async (action) => {
  if (!selectedRoomData) return;

  if (action === "booking") {
    navigate("/sUsers/bookingPage", { state: { room: selectedRoomData } });
    return;
  }
   if (action === "CheckIn") {
    navigate("/sUsers/checkInPage", { state: { room: selectedRoomData } });
    return;
  }

  if (action === "dirty" || action === "blocked") {
    try {
      await api.post(`/api/Susers/updateStatus/${selectedRoomData._id}`, {
        status: action
      }, { withCredentials: true });

      // Update status locally so UI updates instantly
      setRooms((prev) =>
        prev.map((room) =>
          room._id === selectedRoomData._id ? { ...room, status: action } : room
        )
      );
      setFilteredRooms((prev) =>
        prev.map((room) =>
          room._id === selectedRoomData._id ? { ...room, status: action } : room
        )
      );

      setShowRoomModal(false);
    } catch (error) {
      console.error("Error updating room status:", error);
    }
  }
};



  // Calculate status counts
  const getStatusCounts = () => {
    const counts = {
      vacant: 0,
      occupied: 0,
      booked: 0,
      dirty: 0,
      blocked: 0,
    };

    filteredRooms.forEach((room) => {
      if (counts.hasOwnProperty(room.status)) {
        counts[room.status]++;
      }
    });

    return counts;
  };

const setSelectedRoom = (room) => {
  // Prevent popup for occupied rooms
  if (room.status === "occupied") {
    return;
  }
  setSelectedRoomData(room);
  setShowRoomModal(true);
};



useEffect(() => {
  fetchRooms(selectedDate);
}, [fetchRooms, selectedDate]);


  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const statusCounts = getStatusCounts();
  const grouped = groupRoomsByType(filteredRooms);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden p-3">
      <AnimatedBackground />
      <div className="mx-auto relative z-10">
        {/* Header */}
        <div className="bg-[#0B1D34] flex flex-col md:flex-row p-2 gap-2 md:gap-0">
          <div>
            <h3 className="font-bold text-blue-400 flex items-center gap-2 text-base md:text-lg">
              <BedDouble className="w-5 h-5 text-cyan-400" />
              Room Status Overview
            </h3>
          </div>

          <div className="md:ml-auto flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <button
              className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
              onClick={() => navigate("/sUsers/bookingPage")}
            >
              Room Booking
            </button>
            <button
              className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
              onClick={() => navigate("/sUsers/checkInPage")}
            >
              Check In
            </button>
            <button
              className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
              onClick={() => navigate("/sUsers/checkOutList")}
            >
              Check Out
            </button>
            <button
              className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
              onClick={() => navigate("/sUsers/partyList")}
            >
              New Guest
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-3 py-1 rounded text-sm flex items-center gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
<div className="mb-4">
  <label htmlFor="selectedDate" className="text-gray-300 mr-2">Select Date:</label>
  <input
    type="date"
    id="selectedDate"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
    max={new Date().toISOString().split("T")[0]} // Optional: max date today
  />
</div>

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-[#0B1D34] p-4 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Room Type Filter */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Room Brand
                </label>
                <select
                  value={filters.roomType}
                  onChange={(e) =>
                    handleFilterChange("roomType", e.target.value)
                  }
                  className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Room Brands</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor Type Filter */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Floor
                </label>
                <select
                  value={filters.floorType}
                  onChange={(e) =>
                    handleFilterChange("floorType", e.target.value)
                  }
                  className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Floors</option>
                  {floorTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bed Type Filter */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Bed Type
                </label>
                <select
                  value={filters.bedType}
                  onChange={(e) =>
                    handleFilterChange("bedType", e.target.value)
                  }
                  className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Bed Types</option>
                  {bedTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-gray-300 text-sm mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="booked">Booked</option>
                  <option value="dirty">Dirty</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 pt-6 border-t border-white/20">
          {[
            {
              label: "Vacant",
              color: "from-emerald-500 to-teal-600",
              count: statusCounts.vacant,
            },
            {
              label: "Occupied",
              color: "from-orange-500 to-red-600",
              count: statusCounts.occupied,
            },
            {
              label: "Booked",
              color: "from-red-500 to-pink-600",
              count: statusCounts.booked,
            },
            {
              label: "Dirty",
              color: "from-yellow-500 to-orange-600",
              count: statusCounts.dirty,
            },
            {
              label: "Blocked",
              color: "from-gray-500 to-slate-800",
              count: statusCounts.blocked,
            },
          ].map((status, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-6 rounded bg-gradient-to-r ${status.color} flex items-center justify-center`}
              >
                <p className="text-white text-xs font-bold">{status.count}</p>
              </div>
              <span className="text-gray-300 text-sm">{status.label}</span>
            </div>
          ))}
        </div>
{showRoomModal && selectedRoomData && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-lg font-bold text-white mb-4">
        Room: {selectedRoomData.roomName}
      </h2>
      
      <label className="text-gray-300 mb-2 block">Select Action:</label>
      <select
        className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 mb-4"
        onChange={(e) => handleRoomAction(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Choose...</option>
        <option value="booking">Booking</option>
        <option value="CheckIn">CheckIn</option>
        <option value="dirty">Mark as Dirty</option>
        <option value="blocked">Mark as Blocked</option>
      </select>

      <button
        onClick={() => setShowRoomModal(false)}
        className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

        {/* Loading State */}
        {loader && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Room Grid */}
        {!loader && Object.entries(grouped).length > 0
          ? Object.entries(grouped).map(([brand, rooms]) => (
              <div key={brand} className="mt-3">
                <h2 className="text-white text-sm font-semibold mb-2">
                  {brand} ({rooms.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {rooms.map((room, index) => (
 <div
  key={room._id}
  style={{ animationDelay: `${index * 0.05}s` }}
  className={`animate-slide-in rounded-lg p-2  || "from-gray-500 to-slate-800"}`}
  onClick={() => setSelectedRoom(room)}
>
  <RoomStatus
    {...room}
    room={room.roomName}
    name={room.roomName}
    status={room.status}
    onClick={() => setSelectedRoom(room)}
  />
</div>



                  ))}
                </div>
              </div>
            ))
          : !loader && (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  No rooms found matching the selected filters.
                </p>
              </div>
            )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HotelDashboard;
