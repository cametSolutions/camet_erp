import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { BedDouble, Filter, X, Calendar, User, Clock } from "lucide-react";
import AnimatedBackground from "../Components/AnimatedBackground";
import RoomStatus from "../Components/RoomStatus";
import Tooltip from "./ToolTip";
import RoomTooltipContent from "./RoomTooltipContent ";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import {toast} from "sonner";
import CalenderComponent from "../Components/CalenderComponent";
import ReactDOM from "react-dom";
import RoomSwapModal from "./RoomSwapModal ";
const HotelDashboard = () => {
  const [rooms, setRooms] = useState([]);
  const [tooltipData, setTooltipData] = useState({});
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoomData, setSelectedRoomData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRoomSwapModal, setShowRoomSwapModal] = useState(false);

  const [tooltipX, setTooltipX] = useState(0);
  const [tooltipY, setTooltipY] = useState(0);
  const [hoveredRoomId, setHoveredRoomId] = useState(null);
  // Filter states
  const [roomTypes, setRoomTypes] = useState([]);
  const [floorTypes, setFloorTypes] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const limit = 60;
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

  // Add these state variables at the top of your component
  const [showBookingDetails, setShowBookingDetails] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Add this useEffect for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchBookings = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      if (bookingsLoading) return;

      setBookingsLoading(true);

      try {
        const params = new URLSearchParams({
          page: pageNumber,
          limit,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }
        params.append("modal", "booking");

        const res = await api.get(
          `/api/sUsers/getBookings/${cmp_id}?${params}`,
          {
            withCredentials: true,
          }
        );

        if (pageNumber === 1) {
          setBookings(res?.data?.bookingData);
        } else {
          setBookings((prevBookings) => [
            ...prevBookings,
            ...res?.data?.bookingData,
          ]);
        }

        setHasMore(res.data.pagination?.hasMore);
        setPage(pageNumber);
      } catch (error) {
        console.log(error);
        setHasMore(false);
        // toast.error("Failed to load bookings");
      } finally {
        setBookingsLoading(false);
      }
    },
    [cmp_id]
  );

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // Fetch all rooms
  const fetchRooms = useCallback(
    async (date) => {
      setIsLoading(true);
      setLoader(true);

      try {
        const res = await api.get(
          `/api/sUsers/getAllRoomsWithStatus/${cmp_id}`,
          {
            params: { selectedDate: date },
            withCredentials: true,
          }
        );
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
    },
    [cmp_id]
  );
  const fetchDateBasedData = useCallback(
    async (date) => {
      setIsLoading(true);
      setLoader(true);

      try {
        const res = await api.get(
          `/api/sUsers/getDateBasedRoomsWithStatus/${cmp_id}`,
          {
            params: { selectedDate: date },
            withCredentials: true,
          }
        );

        const roomsData = res.data || [];
        setTooltipData(roomsData);
      } catch (error) {
        console.log("Error fetching date based data:", error);
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id]
  );

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
    vacant: "from-emerald-500 to-teal-600", // green gradient
    booked: "from-red-500 to-pink-600", // red/pink gradient
    occupied: "from-orange-500 to-red-600", // orange/red gradient
    dirty: "from-yellow-500 to-orange-600",
    blocked: "from-gray-500 to-slate-800",
  };

  const handleRoomAction = async (action) => {
    if (!selectedRoomData) return;

    if (action === "booking") {
      navigate("/sUsers/bookingPage", {
        state: { roomId: selectedRoomData?._id },
      });
      return;
    }
    if (action === "CheckIn") {
      navigate("/sUsers/checkInPage", {
        state: { roomId: selectedRoomData?._id },
      });
      return;
    }
  if (action === "checkOut") {
  // ✅ Pass the specific room data to filter check-ins
  navigate("/sUsers/checkInList", {
    state: { 
      roomId: selectedRoomData?._id,
      roomName: selectedRoomData?.roomName,
      filterByRoom: true // Flag to indicate filtering is needed
    },
  });
  return;
}

if (action === "editChecking") {
  setShowRoomModal(false);
  
  try {
    const checkInDetails = await fetchRoomCheckInDetails(selectedRoomData._id);
    
    if (checkInDetails?.success && checkInDetails?.checkIn) {
      // Navigate to edit checking page with tariff rate change flag
      navigate("/sUsers/editChecking", {
        state: {
          ...checkInDetails.checkIn,
          fromDashboard: true  // ✅ Flag to indicate tariff rate change
        }
      });
    } else {
      toast.error("No active check-in found for this room");
    }
  } catch (error) {
    console.error("Error navigating to edit checking:", error);
    toast.error("Failed to load check-in details");
  }
  return;
}
    if (action === "swapRoom") {
      // Check if room is available for swap (should be vacant)
      // if (selectedRoomData.status !== "vacant") {
      //   alert("Room must be vacant to swap guests into it");
      //   return;
      // }
      setShowRoomModal(false);
      setShowRoomSwapModal(true);
      return;
    }

    if (["dirty", "blocked", "vacant"].includes(action)) {
      try {
        console.log("Updating room status:", {
          roomId: selectedRoomData._id,
          newStatus: action,
        }); // Debug log

        const res = await api.put(
          `/api/sUsers/updateStatus/${selectedRoomData._id}`,
          { status: action },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Status update response:", res.data); // Debug log

        await fetchRooms(selectedDate);

        // Update the main rooms array
        // setRooms((prev) =>
        //   prev.map((room) =>
        //     room._id === updatedRoom._id
        //       ? { ...room, status: updatedRoom.status }
        //       : room
        //   )
        // );

        // // Update the filtered rooms array
        // setFilteredRooms((prev) =>
        //   prev.map((room) =>
        //     room._id === updatedRoom._id
        //       ? { ...room, status: updatedRoom.status }
        //       : room
        //   )
        // );

        // Close the modal
        setShowRoomModal(false);

        // Optional: Show success message
        console.log(
          `Room ${selectedRoomData.roomName} status updated to ${action}`
        );
      } catch (error) {
        console.error("Error updating room status:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // Optional: Show error message to user
        alert(
          `Failed to update room status: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };
  const fetchRoomCheckInDetails = async (roomId) => {
  try {
    setIsLoading(true);
    const res = await api.get(
      `/api/sUsers/getRoomCheckInDetails/${cmp_id}/${roomId}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching check-in details:", error);
    toast.error(error?.response?.data?.message || "Failed to fetch room details");
    return null;
  } finally {
    setIsLoading(false);
  }
};

  const handleRoomSwapConfirm = async () => {
    try {
      // Refresh rooms data after successful swap
      await fetchRooms(selectedDate);
      setShowRoomSwapModal(false);
      setSelectedRoomData(null);
    } catch (error) {
      console.error("Error refreshing data after room swap:", error);
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
    // if (room.status === "occupied") {
    //   return;
    // }
    setSelectedRoomData(room);
    setShowRoomModal(true);
  };

  useEffect(() => {
    fetchRooms(selectedDate);
    fetchDateBasedData(selectedDate);
  }, [fetchRooms, selectedDate]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const statusCounts = getStatusCounts();
  const grouped = groupRoomsByType(filteredRooms);

  const handleCalenderDate = (date, show) => {
    console.log(date.toISOString().split("T")[0], show);
    setSelectedDate(date.toISOString().split("T")[0]);
    setShowCalendar(show);
  };

  const scrollbarStyles = {
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0, 0, 0, 0.7) rgba(0, 0, 0, 0.2)", // black thumb, lighter black track
  };
  return (
    <>
      <style>
        {`
        .custom-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}
      </style>
      <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        <AnimatedBackground />

        {/* Main Layout Container */}
        <div className="relative z-10">
          <div className="p-3">
            {/* Header */}
            <div className="bg-[#0B1D34] flex flex-col md:flex-row p-2 gap-2 md:gap-0 mb-4">
              <div>
                <h3 className="font-bold text-blue-400 flex items-center gap-2 text-base md:text-lg">
                  <BedDouble className="w-5 h-5 text-cyan-400" />
                  Room Status Overview
                </h3>
              </div>

              <div className="md:ml-auto flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
                <button
                  className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
                  onClick={() => navigate("/sUsers/bookingList")}
                >
                  Room Booking
                </button>
                <button
                  className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
                  onClick={() => navigate("/sUsers/checkInList")}
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
                  className="
                hidden md:flex
        flex items-center gap-2 px-4 py-1.5 rounded-xl
        font-semibold text-xs transition-all duration-300
        whitespace-nowrap flex-shrink-0
        bg-gradient-to-r from-green-600 to-emerald-600 text-white 
        border-transparent shadow-lg shadow-emerald-500/25
        hover:scale-105 active:scale-95 transform
        hover:from-green-700 hover:to-emerald-700
      "
                  onClick={() => navigate("/sUsers/BillSummary?type=hotel")}
                >
                  <span className="text-sm">📊</span>
                  Hotel Daily Sales
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-3 py-1 rounded text-sm flex items-center gap-1"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {/* Mobile Booking Toggle Button */}
                {isMobile && (
                  <button
                    onClick={() => setShowBookingDetails(!showBookingDetails)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4" />
                    Bookings
                  </button>
                )}
              </div>
            </div>

            {/* Date Selector */}
            <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {!showCalendar && (
                <div>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-sm">
                    <label
                      htmlFor="selectedDate"
                      className="text-gray-300 text-sm font-medium whitespace-nowrap"
                    >
                      Select Date:
                    </label>
                    <input
                      type="date"
                      id="selectedDate"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-slate-700 text-white border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
              <div className={`${showCalendar ? "w-full" : "ml-auto"}`}>
                <CalenderComponent
                  sendDateToParent={handleCalenderDate}
                  bookingData={bookings}
                />
              </div>
            </div>
            {/* Filters Section */}
            {showFilters && (
              <div className="bg-[#0B1D34] p-4 border-t border-white/20 mb-4">
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
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
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
            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/20 mb-6">
              {[
                {
                  label: "Vacant",
                  color: "from-emerald-500 to-teal-600",
                  count: statusCounts.vacant,
                },
                {
                  label: "Occupied",
                  color: "from-sky-400 to-violet-600",
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
                    <p className="text-white text-xs font-bold">
                      {status.count}
                    </p>
                  </div>
                  <span className="text-gray-300 text-sm">{status.label}</span>
                </div>
              ))}
            </div>

            {/* Main Content Area - Side by Side Layout */}
            <div className={`flex gap-6 ${isMobile ? "flex-col" : "flex-row"}`}>
              {/* Left Side - Room Grid */}
              <div
                className={`${
                  isMobile ? "w-full" : showBookingDetails ? "flex-1" : "w-full"
                } transition-all duration-300`}
              >
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
                        <div
                          className={`grid gap-3 ${
                            isMobile
                              ? "grid-cols-2 sm:grid-cols-4"
                              : showBookingDetails
                              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                              : "grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
                          }`}
                        >
                          {rooms.map((room, index) => (
                            <div
                              key={room._id}
                              style={{ animationDelay: `${index * 0.05}s` }}
                              className="animate-slide-in rounded-lg p-1"
                              onClick={() => setSelectedRoom(room)}
                              onMouseEnter={(e) => {
                                setHoveredRoomId(room._id);
                                setTooltipX(e.clientX);
                                setTooltipY(e.clientY);
                              }}
                              onMouseMove={(e) => {
                                setTooltipX(e.clientX);
                                setTooltipY(e.clientY);
                              }}
                              onMouseLeave={() => setHoveredRoomId(null)}
                            >
                              <RoomStatus
                                {...room}
                                room={room.roomName}
                                name={room.roomName}
                                status={room.status}
                                onClick={() => setSelectedRoom(room)}
                              />

                              {hoveredRoomId === room._id &&
                                ReactDOM.createPortal(
                                  <Tooltip
                                    style={{
                                      position: "fixed",
                                      top: `${tooltipY - 40}px`,
                                      left: `${tooltipX + 15}px`,
                                      zIndex: 99999,
                                      pointerEvents: "none",
                                    }}
                                  >
                                    <RoomTooltipContent
                                      room={room}
                                      tooltipData={tooltipData}
                                    />
                                  </Tooltip>,
                                  document.body // 👈 mounted outside RoomStatus
                                )}
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

              {/* Right Side - Booking Details */}
              {showBookingDetails && (
                <>
                  {/* Mobile Overlay */}
                  {isMobile && (
                    <div
                      className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                      onClick={() => setShowBookingDetails(false)}
                    />
                  )}

                  {/* Booking Details Panel */}
                  <div
                    className={`custom-scroll ${
                      isMobile
                        ? "fixed right-0 top-0 z-50 w-80 max-w-[90vw] h-full bg-[#0B1D34] border-l border-white/20 transform transition-transform duration-300 ease-in-out"
                        : "w-80 flex-shrink-0 bg-[#0B1D34] border border-white/20 rounded-lg"
                    } flex flex-col h-screen ${isMobile ? "p-0" : "p-4"}`}
                    style={scrollbarStyles}
                  >
                    {/* Booking Section Header */}
                    <div
                      className={`flex items-center justify-between   ${
                        isMobile ? "p-4 border-b border-white/20" : "mb-4"
                      }`}
                    >
                      <div className="">
                        <h3 className="font-bold text-blue-400 flex items-center gap-2 text-lg">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                          Recent Bookings
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          Today's reservations
                        </p>
                      </div>

                      {/* Close button for mobile */}
                      {isMobile && (
                        <button
                          onClick={() => setShowBookingDetails(false)}
                          className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-400" />
                        </button>
                      )}
                    </div>

                    {/* Booking Details Content */}
                    <div
                      className={`flex-1 overflow-y-auto ${
                        isMobile ? "px-4 pb-4" : ""
                      }`}
                    >
                      {bookingsLoading && bookings.length === 0 ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      ) : bookings.filter((b) => {
                          const bookingDate = new Date(b.bookingDate);
                          const today = new Date();
                          const isToday =
                            bookingDate.getFullYear() === today.getFullYear() &&
                            bookingDate.getMonth() === today.getMonth() &&
                            bookingDate.getDate() === today.getDate();
                          return (
                            isToday && b.status?.toLowerCase() !== "checkin"
                          );
                        }).length > 0 ? (
                        <div className="space-y-3">
                          {bookings
                            .filter((b) => {
                              const bookingDate = new Date(b.bookingDate);
                              const today = new Date();
                              const isToday =
                                bookingDate.getFullYear() ===
                                  today.getFullYear() &&
                                bookingDate.getMonth() === today.getMonth() &&
                                bookingDate.getDate() === today.getDate();
                              return (
                                isToday && b.status?.toLowerCase() !== "checkin"
                              );
                            })
                            .map((booking, index) => (
                              <div
                                key={booking._id || index}
                                className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-blue-500/50 transition-colors"
                              >
                                {/* Guest Info */}
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                                  <span className="text-white font-semibold text-sm truncate">
                                    {booking.customerName}
                                  </span>
                                </div>

                                {/* Booking Number */}
                                <div className="text-gray-300 text-xs mb-2">
                                  <span className="text-blue-400">
                                    Booking Number
                                  </span>{" "}
                                  <span className="break-all">
                                    {booking.voucherNumber}
                                  </span>
                                </div>

                                {/* Dates */}
                                <div className="text-xs text-gray-400 mb-2">
                                  <div className="flex items-center gap-1 mb-1">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    <span>
                                      Date: {formatDate(booking.bookingDate)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    <span>Time: {booking.arrivalTime}</span>
                                  </div>
                                </div>

                                {/* Phone */}
                                <div className="text-gray-300 text-xs">
                                  <span className="text-blue-400">
                                    Phone Number
                                  </span>{" "}
                                  <span className="break-all">
                                    {booking.mobileNumber}
                                  </span>
                                </div>

                                <div className="text-gray-300 text-xs flex gap-1">
                                  <span className="text-blue-400">
                                    Room Number
                                  </span>
                                  {booking.selectedRooms.map((room) => {
                                    return (
                                      <div
                                        key={room.id || room.roomName}
                                        className="text-gray-300 text-xs"
                                      >
                                        <span className="break-all">
                                          {room.roomName}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">
                            No bookings found for today
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Room Action Modal */}
        {showRoomModal && selectedRoomData && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-90 max-w-[150vw] ">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white mb-4">
                  Room: {selectedRoomData.roomName}
                </h2>
                {selectedRoomData.status === "occupied" && (
                  <span className="px-3 py-1 bg-gradient-to-r from-sky-400 to-violet-600 text-white text-xs font-semibold rounded-full">
                    Occupied
                  </span>
                )}
              </div>
              <label className="text-gray-300 mb-2 block">Select Action:</label>
              <select
                className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 mb-4"
                onChange={(e) => handleRoomAction(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose...
                </option>
                {selectedRoomData.status === "occupied" ? (
                  <>
                    <option value="editChecking">Edit Tarrif Rate</option>
                    <option value="checkOut">CheckOut</option>
                    <option value="swapRoom">Swap Room</option>
                  </>
                ) : (
                  <>
                    {selectedRoomData.status !== "booked" && (
                      <>
                        <option value="booking">Booking</option>
                        <option value="CheckIn">CheckIn</option>
                      </>
                    )}
                    <option value="dirty">Mark as Dirty</option>
                    <option value="blocked">Mark as Blocked</option>
                    <option value="vacant">Mark as available</option>
                    <option value="swapRoom">Swap Room</option>
                  </>
                )}
              </select>

              <button
                onClick={() => setShowRoomModal(false)}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <RoomSwapModal
          isOpen={showRoomSwapModal}
          onClose={() => {
            setShowRoomSwapModal(false);
            setSelectedRoomData(null);
          }}
          selectedRoom={selectedRoomData}
          onConfirmSwap={handleRoomSwapConfirm}
          cmp_id={cmp_id}
          api={api}
        />
        {/* Animations */}

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
    </>
  );
};

export default HotelDashboard;
