import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "@/api/api";
import { Users, Utensils, Trash2 } from "lucide-react";
import { taxCalculator } from "../Helper/taxCalculator";
import { GrFormAdd } from "react-icons/gr";

// Reorganized & corrected AvailableRooms component with improved tax logic
function AvailableRooms({
  onSelect = () => {},
  placeholder = "Search and select a party...",
  selectedParty = null,
  className = "",
  disabled = false,
  selectedRoomData,
  sendToParent,
  formData,
  selectedRoomId,
   isTariffRateChange = false,  // ✅ Add this
  roomIdToUpdate = null,
}) {
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(selectedParty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pendingRoomId, setPendingRoomId] = useState(null);
  const [pendingRoomQueue, setPendingRoomQueue] = useState([]);

const [isEditingSingleRoom, setIsEditingSingleRoom] = useState(false);

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 50;


useEffect(() => {
  const fetchBookings = async () => {
    if (formData?.selectedRooms?.length > 0) {
      // Check if we're in tariff rate change mode for a specific room
      if (isTariffRateChange && roomIdToUpdate) {
        setIsEditingSingleRoom(true);
        
        // Find the specific room being edited
         let specificRoom = formData.selectedRooms.find(
          (room) => {
            const roomId = room.roomId?._id?.toString() || 
                          room.roomId?.toString() || 
                          room._id?.toString();
            return roomId === roomIdToUpdate.toString();
          }
        );
        
        if (specificRoom) {
          // If priceLevel is missing or incomplete, fetch full room details
          if (!specificRoom.priceLevel || specificRoom.priceLevel.length === 0) {
            try {
              console.log("Fetching full room details for:", specificRoom.roomId);
              
              // Option 1: If you have a getRoomById endpoint
              // const response = await api.get(
              //   `/api/sUsers/getRoomById/${specificRoom.roomId || specificRoom._id}`,
              //   { withCredentials: true }
              // );
              
              // Option 2: Use existing getRooms endpoint with search
              const response = await api.get(
                `/api/sUsers/getRooms/${cmp_id}`,
                { 
                  params: { roomId: specificRoom.roomId || specificRoom._id },
                  withCredentials: true 
                }
              );
              
              const roomData = response.data?.roomData?.[0] || response.data?.room;
              
              if (roomData) {
                // Merge fetched data with existing room data
                specificRoom = {
                  ...specificRoom,
                  priceLevel: roomData.priceLevel || [],
                  roomType: roomData.roomType || specificRoom.roomType,
                  hsnDetails: roomData.hsn || specificRoom.hsnDetails,
                  roomName: roomData.roomName || specificRoom.roomName,
                };
                console.log("Merged room data:", specificRoom);
              }
            } catch (error) {
              console.error("Error fetching room details:", error);
              // Continue with existing data even if fetch fails
            }
          }
          // Normalize the room data structure
          const normalizedRoom = {
            roomId: specificRoom.roomId || specificRoom._id,
            roomName: specificRoom.roomName,
            priceLevel: specificRoom.priceLevel || [],
            selectedPriceLevel: specificRoom.selectedPriceLevel || specificRoom.priceLevelId,
            roomType: specificRoom.roomType,
            pax: specificRoom.pax || 2,
            priceLevelRate: specificRoom.priceLevelRate || 0,
            stayDays: specificRoom.stayDays || formData.stayDays || 1,
            hsnDetails: specificRoom.hsnDetails || specificRoom.hsn,
            totalAmount: specificRoom.totalAmount || 0,
            // Preserve existing tax data if available
            amountAfterTax: specificRoom.amountAfterTax,
            amountWithOutTax: specificRoom.amountWithOutTax,
            taxPercentage: specificRoom.taxPercentage,
            foodPlanTaxRate: specificRoom.foodPlanTaxRate,
            additionalPaxAmount: specificRoom.additionalPaxAmount,
            foodPlanAmount: specificRoom.foodPlanAmount,
            taxAmount: specificRoom.taxAmount,
            additionalPaxAmountWithTax: specificRoom.additionalPaxAmountWithTax,
            additionalPaxAmountWithOutTax: specificRoom.additionalPaxAmountWithOutTax,
            foodPlanAmountWithTax: specificRoom.foodPlanAmountWithTax,
            foodPlanAmountWithOutTax: specificRoom.foodPlanAmountWithOutTax,
            baseAmount: specificRoom.baseAmount,
            baseAmountWithTax: specificRoom.baseAmountWithTax,
            totalCgstAmt: specificRoom.totalCgstAmt,
            totalSgstAmt: specificRoom.totalSgstAmt,
            totalIgstAmt: specificRoom.totalIgstAmt,
          };
          
          // Recalculate tax for this room
          const taxCalculation = await calculateTax(normalizedRoom);
          console.log("Tariff Rate Change - Normalized Room:", taxCalculation);
          setBookings([taxCalculation]);
        }
      } else {
        // Normal mode - show all rooms
        setIsEditingSingleRoom(false);
        const updatedBookings = await Promise.all(
          formData.selectedRooms.map(async (booking) => {
            // Normalize each booking's data structure
            const normalizedBooking = {
              roomId: booking.roomId || booking._id,
              roomName: booking.roomName,
              priceLevel: booking.priceLevel || [],
              selectedPriceLevel: booking.selectedPriceLevel || booking.priceLevelId,
              roomType: booking.roomType,
              pax: booking.pax || 2,
              priceLevelRate: booking.priceLevelRate || 0,
              stayDays: booking.stayDays || formData.stayDays || 1,
              hsnDetails: booking.hsnDetails || booking.hsn,
              totalAmount: booking.totalAmount || 0,
              // Preserve existing tax data
              amountAfterTax: booking.amountAfterTax,
              amountWithOutTax: booking.amountWithOutTax,
              taxPercentage: booking.taxPercentage,
              foodPlanTaxRate: booking.foodPlanTaxRate,
              additionalPaxAmount: booking.additionalPaxAmount,
              foodPlanAmount: booking.foodPlanAmount,
              taxAmount: booking.taxAmount,
              additionalPaxAmountWithTax: booking.additionalPaxAmountWithTax,
              additionalPaxAmountWithOutTax: booking.additionalPaxAmountWithOutTax,
              foodPlanAmountWithTax: booking.foodPlanAmountWithTax,
              foodPlanAmountWithOutTax: booking.foodPlanAmountWithOutTax,
              baseAmount: booking.baseAmount,
              baseAmountWithTax: booking.baseAmountWithTax,
              totalCgstAmt: booking.totalCgstAmt,
              totalSgstAmt: booking.totalSgstAmt,
              totalIgstAmt: booking.totalIgstAmt,
            };
            
            const taxCalculation = await calculateTax(normalizedBooking);
            return taxCalculation;
          })
        );
        console.log("Normal Mode - All Bookings:", updatedBookings);
        setBookings(updatedBookings);
      }
    } else if (rooms?.length > 0 && selectedRoomId) {
      let specificRoom = rooms.find((room) => room._id === selectedRoomId);
      if (specificRoom) {
        handleSelect(specificRoom);
      }
    }
  };

  fetchBookings();
}, [
  formData?.selectedRooms?.length,
  formData?.stayDays,
  rooms?.length,
  isTariffRateChange,
  roomIdToUpdate,
]);


  useEffect(() => {
    if (!formData?.additionalPaxDetails && !formData?.foodPlan) return;
    if (!selectedRoomId) return;
    const bookingData = bookings?.find(
      (item) => item.roomId === selectedRoomId
    );

    const recalculateTax = async () => {
      if (bookingData) {
        const taxCalculation = await calculateTax(bookingData);
        setBookings((prev) =>
          prev.map((b) => (b.roomId === selectedRoomId ? taxCalculation : b))
        );
      }
    };

    recalculateTax();
  }, [formData?.additionalPaxDetails, formData?.foodPlan, selectedRoomId]);

  useEffect(() => {
    if (!formData?.bookingType) return;

    const handleBookingTypeChange = async () => {
      if (bookings?.length > 0) {
        const updatedBookings = await Promise.all(
          bookings.map(async (booking) => {
            const taxCalculation = await calculateTax(booking);
            return taxCalculation;
          })
        );
        console.log(updatedBookings);
        setBookings(updatedBookings);
      }
    };

    handleBookingTypeChange();
  }, [formData?.bookingType]);

  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const location = useLocation();

  const fetchRooms = useCallback(
  async (pageNum = 1, searchTerm = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum,
        limit: PAGE_SIZE,
        search: searchTerm,
        type: formData?.roomType || "All",
      };

      // Add date range for availability checking
      if (formData?.arrivalDate) {
        params.arrivalDate = formData.arrivalDate;
      }
      if (formData?.checkOutDate) {
        params.checkOutDate = formData.checkOutDate;
      }

      console.log("Sending params to backend:", params);

      const res = await api.get(`/api/sUsers/getRooms/${cmp_id}`, {
        params,
        withCredentials: true,
      });

      const newRooms = res.data?.roomData || [];
      
      // Filter out rooms that are already selected in current booking
      const availableRooms = newRooms.filter(room => {
        const isAlreadyBooked = bookings.some(booking => booking.roomId === room._id);
        if (isAlreadyBooked) {
          console.log(`Filtering out already selected room: ${room.roomName}`);
        }
        return !isAlreadyBooked;
      });

      console.log("Available rooms after filtering out selected:", availableRooms.length);

      setRooms((prev) => (pageNum === 1 ? availableRooms : [...prev, ...availableRooms]));
      setHasMore(availableRooms.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load available rooms.");
    } finally {
      setLoading(false);
    }
  },
  [cmp_id, location.pathname, formData?.roomType, formData?.arrivalDate, formData?.checkOutDate, bookings]
);
  const recalculateBookingTotals = useCallback((booking) => {
    const baseAmount =
      Number(booking.priceLevelRate || 0) * Number(booking.stayDays || 0);
    return {
      ...booking,
      totalAmount: baseAmount,
    };
  }, []);

  const calculateTax = useCallback(
    async (booking) => {
      if (!booking) return booking;

      const updatedRoom = recalculateBookingTotals(booking);
      try {
        const taxResponse = await taxCalculator(
          updatedRoom,
          configurations[0]?.addRateWithTax?.hotelSale,
          formData,
          booking.roomId
        );
        console.log(taxResponse);

        return {
          ...updatedRoom,
          amountAfterTax: taxResponse?.amountWithTax || updatedRoom.totalAmount,
          amountWithOutTax: taxResponse?.amountWithOutTax,
          taxPercentage: taxResponse?.taxRate || 0,
          foodPlanTaxRate: taxResponse?.foodPlanTaxRate || 0,
          additionalPaxAmount: taxResponse?.additionalPaxAmount || 0,
          foodPlanAmount: taxResponse?.foodPlanAmount || 0,
          taxAmount: taxResponse?.taxAmount || 0,
          additionalPaxAmountWithTax:
            taxResponse?.additionalPaxAmountWithTax || 0,
          additionalPaxAmountWithOutTax:
            taxResponse?.additionalPaxAmountWithOutTax || 0,
          foodPlanAmountWithTax: taxResponse?.foodPlanAmountWithTax || 0,
          foodPlanAmountWithOutTax: taxResponse?.foodPlanAmountWithOutTax || 0,
          baseAmount: taxResponse?.baseAmount || 0,
          baseAmountWithTax: taxResponse?.baseAmountWithTax || 0,
          totalCgstAmt: taxResponse?.totalCgstAmt || 0,
          totalSgstAmt: taxResponse?.totalSgstAmt || 0,
          totalIgstAmt: taxResponse?.totalIgstAmt || 0,
        };
      } catch (err) {
        console.error("Tax calculation failed:", err);
        return {
          ...updatedRoom,
          amountAfterTax: updatedRoom.totalAmount,
          taxPercentage: 0,
          additionalPaxAmount: 0,
          foodPlanAmount: 0,
        };
      }
    },
    [formData, configurations, recalculateBookingTotals]
  );

  useEffect(() => {
    if (pendingRoomQueue.length === 0) return;

    const roomIdToUpdate = pendingRoomQueue[0];
    const roomToUpdate = bookings.find((b) => b.roomId === roomIdToUpdate);

    if (!roomToUpdate) {
      setPendingRoomQueue((prev) => prev.slice(1));
      return;
    }

    let isMounted = true;

    (async () => {
      const updated = await calculateTax(roomToUpdate);
      if (!isMounted) return;
      setBookings((prev) =>
        prev.map((b) => (b.roomId === roomIdToUpdate ? updated : b))
      );
      setPendingRoomQueue((prev) => prev.slice(1));
    })();

    return () => {
      isMounted = false;
    };
  }, [pendingRoomQueue, bookings]);

useEffect(() => {
  if (bookings.length > 0) {
    // Calculate totals for currently displayed bookings
    const total = bookings.reduce(
      (acc, b) => acc + Number(b.amountAfterTax || b.totalAmount || 0),
      0
    );
    
    const paxTotal = bookings.reduce(
      (acc, b) => {
        const paxPerDay = Number(b.additionalPaxAmountWithTax || 0);
        const days = Number(b.stayDays || 1);
        return acc + (paxPerDay * days);
      },
      0
    );
    
    const foodTotal = Number(formData?.foodPlanTotal || 0);
    const finalTotal = total + paxTotal + foodTotal;
    
    // If in single-room edit mode, merge with other rooms before sending to parent
    if (isEditingSingleRoom && roomIdToUpdate && formData?.selectedRooms?.length > 1) {
      // Get all other rooms except the one being edited
      const otherRooms = formData.selectedRooms.filter(
        (room) => room.roomId !== roomIdToUpdate && room._id !== roomIdToUpdate
      );
      
      // Merge the edited room with other rooms
      const allRooms = [...otherRooms, ...bookings];
      
      // Recalculate total for all rooms
      const allRoomsTotal = allRooms.reduce(
        (acc, b) => acc + Number(b.amountAfterTax || b.totalAmount || 0),
        0
      );
      
      const allRoomsPaxTotal = allRooms.reduce(
        (acc, b) => {
          const paxPerDay = Number(b.additionalPaxAmountWithTax || 0);
          const days = Number(b.stayDays || 1);
          return acc + (paxPerDay * days);
        },
        0
      );
      
      const allRoomsFinalTotal = allRoomsTotal + allRoomsPaxTotal + foodTotal;
      
      setTotalAmount(allRoomsFinalTotal);
      sendToParent(allRooms, allRoomsFinalTotal);
    } else {
      // Normal mode - send as is
      setTotalAmount(finalTotal);
      sendToParent(bookings, finalTotal);
    }
  } else {
    setTotalAmount(0);
    sendToParent([], 0);
  }
}, [bookings, formData?.foodPlanTotal, isEditingSingleRoom, roomIdToUpdate, formData?.selectedRooms]);


const handlePriceLevelChange = (e, roomId) => {
  const selectedLevelId = e.target.value;
  
  setBookings((prev) =>
    prev.map((booking) => {
      if (booking.roomId !== roomId) return booking;
      
      // Find the selected price level
      const level = booking.priceLevel.find((p) => {
        // Handle both normalized and non-normalized price level structures
        return p._id === selectedLevelId || 
               p.priceLevel?._id === selectedLevelId;
      });
      
      // Determine the new rate
      let newRate = 0;
      if (level) {
        // Price level found
        newRate = level?.priceRate || level?.priceLevel?.priceRate || 0;
      } else if (selectedLevelId === booking?.roomType?._id) {
        // "Normal" rate selected (room type base rate)
        newRate = booking.roomType?.roomRent || 0;
      }
      
      console.log("Price Level Change:", {
        selectedLevelId,
        level,
        newRate,
        booking
      });
      
      return {
        ...booking,
        selectedPriceLevel: selectedLevelId,
        priceLevelRate: newRate,
        totalAmount: Number(booking.stayDays || 0) * Number(newRate),
      };
    })
  );
  
  // Queue for tax recalculation
  setPendingRoomQueue((prev) =>
    prev.includes(roomId) ? prev : [...prev, roomId]
  );
};
  const handleDaysChange = (e, roomId) => {
    const newDays = Number(e.target.value || 0) 
    setBookings((prev) =>
      prev.map((b) =>
        b.roomId === roomId
          ? { ...b, stayDays: newDays, totalAmount: newDays * b.priceLevelRate }
          : b
      )
    );
    setPendingRoomQueue((prev) =>
      prev.includes(roomId) ? prev : [...prev, roomId]
    );
  };

 const handlePriceLevelRateChange = (e, roomId) => {
  const newRate = Number(e.target.value);
  console.log("Rate Change - New Rate:", newRate, "for Room:", roomId);
  
  setBookings((prev) =>
    prev.map((b) =>
      b.roomId === roomId
        ? { 
            ...b, 
            priceLevelRate: newRate, 
            totalAmount: newRate * (b.stayDays || 1)
          }
        : b
    )
  );
  
  // Queue for tax recalculation
  setPendingRoomQueue((prev) =>
    prev.includes(roomId) ? prev : [...prev, roomId]
  );
};

  const handlePaxChange = (e, roomId) => {
    const newPax = Number(e.target.value) || 0;
    setBookings((prev) =>
      prev.map((b) => (b.roomId === roomId ? { ...b, pax: newPax } : b))
    );
    setPendingRoomId(roomId);
  };

const handleDelete = (roomId) => {
  if (isEditingSingleRoom) {
    // Show message or prevent deletion when editing single room
    toast.error("Cannot delete room while in tariff rate change mode");
    return;
  }
  let filteredRoom = bookings.filter((b) => b.roomId !== roomId);
  setBookings(filteredRoom);
};

  const handleSelect = async (room) => {
    const defaultRate =
      room?.priceLevel[0]?.priceRate || room?.roomType?.roomRent || 0;
    const stayDays = formData?.stayDays || 1;

    let booking = {
      roomId: room._id,
      roomName: room.roomName,
      priceLevel: room.priceLevel || [],
      selectedPriceLevel: room.priceLevel[0]?._id || room.roomType?._id,
      roomType: room.roomType,
      pax: 2,
      priceLevelRate: defaultRate,
      stayDays,
      hsnDetails: room.hsn,
      totalAmount: defaultRate * stayDays,
    };
    booking = await calculateTax(booking);
    setBookings((prev) =>
      prev.some((b) => b.roomId === booking.roomId) ? prev : [...prev, booking]
    );
    setSelectedValue(room);
    setIsOpen(false);
    setSearch("");
    onSelect(room);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedValue(null);
    setSearch("");
    onSelect(null);
  };

  const handleSearch = useCallback(
    (term) => {
      setSearch(term);
      setPage(1);
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => fetchRooms(1, term), 300);
    },
    [fetchRooms]
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRooms(nextPage, search);
    }
  }, [loading, hasMore, page, fetchRooms, search]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50) loadMore();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setSelectedValue(selectedParty), [selectedParty]);
  useEffect(() => {
    if (cmp_id) fetchRooms(1);
  }, [cmp_id, fetchRooms]);
  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);


  // Add this useEffect after your existing useEffects, before the console.log(bookings)
useEffect(() => {
  // Refresh rooms when bookings change to update the dropdown
  if (isOpen && cmp_id) {
    fetchRooms(1, search);
  }
}, [bookings.length]); // Triggers when rooms are added/removed from bookings

  console.log(formData);
  return (
    <>
      <div className={`relative w-full ${className}`} ref={dropdownRef}>
        <div className="relative">
          <input	
            type="text"
            value={selectedValue ? selectedValue.roomName : search}
            onChange={(e) => handleSearch(e.target.value)}
             onClick={() => {
    if (!disabled && !isEditingSingleRoom) setIsOpen(true);
  }}
           placeholder={isEditingSingleRoom ? "Room selection disabled during rate change" : placeholder}
  disabled={disabled || isEditingSingleRoom}
  className={`w-full px-4 py-3 pr-20 border rounded-lg bg-white ${
    disabled || isEditingSingleRoom ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
/>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {selectedValue && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto"
            onScroll={handleScroll}
          >
            {loading && rooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500 animate-pulse">
                Loading rooms...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : rooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No rooms found
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => handleSelect(room)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {room.roomName}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && rooms.length > 0 && (
              <div className="p-3 text-center text-gray-500 animate-pulse">
                Loading more...
              </div>
            )}
            {!hasMore && rooms.length > 0 && (
              <div className="p-3 text-center text-gray-400 text-sm">
                No more parties
              </div>
            )}
          </div>
        )}
      </div>
      {bookings.length > 0 && (
        <div className="w-full max-w-full mx-auto p-2">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden border border-white/20 rounded-lg">
            <div className="overflow-auto max-h-[80vh]">
              <table className="w-full min-w-max table-auto border-collapse text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                    <th className="w-8 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      #
                    </th>
                    <th className="w-28 px-2 py-2 text-left text-xs font-bold text-white uppercase">
                      Room
                    </th>
                    <th className="w-20 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Level
                    </th>
                    <th className="w-16 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Rate
                    </th>
                    <th className="w-12 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Days
                    </th>
                    <th className="w-12 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Pax
                    </th>
                    <th className="w-20 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Total
                    </th>
                    <th className="w-12 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Tax
                    </th>
                    <th className="w-20 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      W/Tax
                    </th>
                    <th className="w-10 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      P+
                    </th>
                    <th className="w-16 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Food
                    </th>
                    <th className="w-32 px-1 py-2 text-center text-xs font-bold text-white uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <tr
                      key={booking?.roomId}
                      className="hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <td className="px-1 py-1 text-center font-medium text-blue-600 text-xs">
                        {index + 1}
                      </td>

                      <td className="px-2 py-1">
                        <div className="min-w-0">
                          <p className="font-medium text-emerald-600 text-xs truncate">
                            {booking.roomName}
                          </p>
                          <p className="text-red-500 text-xs truncate">
                            {booking.roomType?.brand}
                          </p>
                        </div>
                      </td>

  <td className="px-1 py-1">
  {booking.priceLevel && booking.priceLevel.length > 0 ? (
    <select
      value={booking.selectedPriceLevel || ""}
      onChange={(e) => handlePriceLevelChange(e, booking.roomId)}
      className="w-full px-1 py-1 border border-red-300 rounded text-red-600 bg-red-50 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
    >
      {booking.priceLevel.map((priceLevel) => {
        // Handle both data structures
        const levelId = priceLevel._id || priceLevel.priceLevel?._id;
        const levelName = priceLevel.pricelevel || 
                         priceLevel.priceLevel?.pricelevel || 
                         "Unknown";
        
        return (
          <option key={levelId} value={levelId}>
            {levelName}
          </option>
        );
      })}
      {booking?.roomType && (
        <option value={booking?.roomType?._id}>
          Normal (₹{booking?.roomType?.roomRent || 0})
        </option>
      )}
    </select>
  ) : (
    <span className="text-red-500 text-xs">No Level</span>
  )}
</td>

                      <td className="px-1 py-1">
                        <input
                          type="number"
                          value={booking.priceLevelRate}
                          onChange={(e) =>
                            handlePriceLevelRateChange(e, booking.roomId)
                          }
                          min="-1"
                          step="0.01"
                          className="w-full px-1 py-1 border border-red-300 rounded text-red-600 bg-red-50 text-xs text-center focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </td>

                      <td className="px-1 py-1">
                        <input
                          type="number"
                          value={booking.stayDays || 0}
                          onChange={(e) => handleDaysChange(e, booking.roomId)}
                          min="0"
                          className="w-full px-1 py-1 border border-purple-300 rounded text-purple-600 bg-purple-50 text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>

                      <td className="px-1 py-1">
                        <input
                          type="number"
                          value={booking.pax || 2}
                          onChange={(e) => handlePaxChange(e, booking.roomId)}
                          min="1"
                          className="w-full px-1 py-1 border border-emerald-300 rounded font-medium text-emerald-600 bg-emerald-50 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="px-1 py-1">
                        <div className="text-center">
                          <span className="block font-bold text-emerald-600 text-xs leading-tight">
                            ₹{Number(booking.totalAmount || 0).toFixed(0)}
                          </span>
                          {configurations[0]?.addRateWithTax?.hotelSale && (
                            <span className="block text-gray-600 text-xs leading-tight">
                              ₹
                              {(
                                Number(booking.totalAmount || 0) /
                                (1 + (booking.taxPercentage || 0) / 100)
                              ).toFixed(0)}
                              
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-1 py-1 text-center text-emerald-600 font-bold text-xs">
                        {Number(booking.taxPercentage || 0).toFixed(1)}%
                      </td>

                      <td className="px-1 py-1 text-center text-emerald-600 font-bold text-xs">
                        ₹
                        {Number(
                          booking.amountAfterTax || booking.totalAmount || 0
                        ).toFixed(0)}
                      </td>

                      <td className="px-1 py-1 text-center text-emerald-600 font-bold text-xs">
                        {formData?.additionalPaxDetails?.reduce((acc, item) => {
                          if (item.roomId == booking.roomId) {
                            return acc + 1;
                          }
                          return acc;
                        }, 0) || 0}
                      </td>

                      <td className="px-1 py-1 text-center text-emerald-600 text-xs">
                        <div className="max-w-16 truncate">
                          {formData?.foodPlan
                            ?.filter((item) => item.roomId === booking.roomId)
                            .map((item, index) => (
                              <span key={index} className="block truncate">
                                {item.foodPlan}
                              </span>
                            )) || "None"}
                        </div>
                      </td>

                      <td className="px-1 py-1">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-center gap-1">
                            <div className="text-center">
                              <button
                                onClick={() => {
                                  selectedRoomData(booking?.roomId, "addPax");
                                  setPendingRoomId(booking.roomId);
                                }}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-1 rounded text-xs font-medium hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center gap-1"
                              >
                                <Users className="w-3 h-3" />
                                Pax
                              </button>
                              <div className="text-xs font-bold text-blue-700 mt-1">
                                {booking?.stayDays > 1 ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-gray-500">
                                      {booking?.stayDays} × ₹{Number(booking?.additionalPaxAmountWithOutTax || 0).toFixed(0)}
                                    </span>
                                    <span className="text-xs font-bold">
                                      ₹{Number((booking?.additionalPaxAmountWithOutTax || 0) * (booking?.stayDays || 1)).toFixed(0)}
                                    </span>
                                  </div>
                                ) : (
                                  <span>₹{Number(booking?.additionalPaxAmountWithOutTax || 0).toFixed(0)}</span>
                                )}
                              </div>
                            </div>

                            <div className="text-center">
                              <button
                                onClick={() => {
                                  selectedRoomData(
                                    booking?.roomId,
                                    "addFoodPlan"
                                  );
                                  setPendingRoomId(booking.roomId);
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded text-xs font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center gap-1"
                              >
                                <Utensils className="w-3 h-3" />
                                Food
                              </button>
                              <p className="text-xs font-bold text-blue-700 mt-1">
                                {Number(
                                  booking?.foodPlanAmountWithOutTax || 0
                                ).toFixed(0)}
                              </p>
                            </div>

                            <button
                              onClick={() => handleDelete(booking.roomId)}
                              className=" text-white px-2 py-1 rounded hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="bg-gray-100 font-bold sticky bottom-0">
                    <td
                      colSpan={6}
                      className="px-2 py-2 text-right font-bold text-gray-700 text-sm"
                    >
                      Total Amount:
                    </td>
                    <td className="px-1 py-2 text-center font-bold text-blue-700 text-sm">
                      ₹{Number(totalAmount).toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                    <td className="px-1 py-2 font-bold text-blue-700 text-center text-xs">
                      <div className="flex  gap-2">
                        {formData?.paxTotal && (
                          <span>
                            Pax ₹{Number(formData.paxTotal * formData.stayDays).toFixed(0)}
                          </span>
                        )}
                        {formData?.foodPlanTotal && (
                          <span>
                            Food ₹{Number(formData.foodPlanTotal).toFixed(0)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
};

export default AvailableRooms;
