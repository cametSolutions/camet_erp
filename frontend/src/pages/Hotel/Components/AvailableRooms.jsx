import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "@/api/api";
import { Users, Utensils, Trash2 } from "lucide-react";
import { taxCalculator } from "../Helper/taxCalculator";


function AvailableRooms({
  onSelect = () => {},
  placeholder = "Search and select a party...",
  selectedParty = null,
  className = "",
  disabled = false,
  selectedRoomData,
  sendToParent,
  formData,
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
  const [taxCalculationRoomId, setTaxCalculationRoomId] = useState(null);
  const [pendingRoomId, setPendingRoomId] = useState(null);

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 50;

  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const location = useLocation();

  const fetchRooms = useCallback(
    async (pageNum = 1, searchTerm = "") => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/sUsers/getRooms/${cmp_id}`, {
          params: {
            page: pageNum,
            limit: PAGE_SIZE,
            search: searchTerm,
            type: formData?.roomType ? formData?.roomType : "All",
          },
          withCredentials: true,
        });
        const newRooms = res.data?.roomData;
        setRooms((prev) => (pageNum === 1 ? newRooms : [...prev, ...newRooms]));
        setHasMore(newRooms.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    },
    [cmp_id, location.pathname, formData?.roomType]
  );

  console.log("selectedRoomData", formData);

  // Helper function to recalculate booking totals
  const recalculateBookingTotals = useCallback((booking) => {
    const baseAmount = Number(booking.priceLevelRate || 0) * Number(booking.stayDays || 0);
    return {
      ...booking,
      totalAmount: baseAmount,
    };
  }, []);

  // useEffect used to fetch calculate the room details
useEffect(() => {
  const calculateTax = async () => {
    if (!pendingRoomId) return;

    const selectedRoom = bookings.find(item => item.roomId === pendingRoomId);
    if (!selectedRoom) return;

    const updatedRoom = recalculateBookingTotals(selectedRoom);

    const taxResponse = await taxCalculator(
      updatedRoom,
      configurations[0]?.addRateWithTax?.saleOrder,
      formData,
      pendingRoomId
    );

    if (taxResponse) {
      setBookings(prev =>
        prev.map(booking => {
          if (booking.roomId === pendingRoomId) {
            const recalculatedBooking = recalculateBookingTotals(booking);
            return {
              ...recalculatedBooking,
              amountAfterTax: taxResponse.amountWithTax || recalculatedBooking.totalAmount,
              taxPercentage: taxResponse.taxRate || 0,
              additionalPaxAmount: taxResponse.additionalPaxAmount || 0,
              foodPlanAmount: taxResponse.foodPlanAmount || 0,
            };
          }
          return booking;
        })
      );
    }

    setPendingRoomId(null); // Reset after calculation
  };

  calculateTax();
}, [bookings, pendingRoomId, configurations, formData, recalculateBookingTotals]);


  // // useEffect used to calculate the total amount
  useEffect(() => {
    if (bookings.length > 0) {
      let total = bookings.reduce((acc, curr) => {
        return acc + Number(curr.amountAfterTax || curr.totalAmount || 0);
      }, 0);

      setTotalAmount(total);
      sendToParent(bookings, total);
      console.log(pendingRoomId);
      if (pendingRoomId) {
        setTaxCalculationRoomId(pendingRoomId);
        setPendingRoomId(null);
      }
    } else {
      setTotalAmount(0);
      sendToParent([], 0);
    }
  }, [bookings,pendingRoomId]);

  const handleSearch = useCallback(
    (term) => {
      setSearch(term);
      setPage(1);
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        fetchRooms(1, term);
      }, 300);
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

  const handleSelect = async (party) => {
    const defaultRate = party?.priceLevel[0]?.priceRate || party?.roomType?.roomRent || 0;
    const stayDays = formData.stayDays || 1;
    
    let bookingObject = {
      roomId: party._id,
      roomName: party.roomName,
      priceLevel: party?.priceLevel || [],
      selectedPriceLevel: party?.priceLevel[0]?._id || party?.roomType?._id,
      roomType: party?.roomType,
      pax: 2,
      priceLevelRate: defaultRate,
      stayDays: stayDays,
      hsnDetails: party.hsn,
      totalAmount: Number(defaultRate) * Number(stayDays),
    };

    try {
      let taxResponse = await taxCalculator(
        bookingObject,
        configurations[0]?.addRateWithTax?.saleOrder,
        formData
      );
      
      bookingObject.amountAfterTax = taxResponse?.amountWithTax || bookingObject.totalAmount;
      bookingObject.taxPercentage = taxResponse?.taxRate || 0;
      bookingObject.additionalPaxAmount = taxResponse?.additionalPaxAmount || 0;
      bookingObject.foodPlanAmount = taxResponse?.foodPlanAmount || 0;
    } catch (error) {
      console.error("Tax calculation failed:", error);
      bookingObject.amountAfterTax = bookingObject.totalAmount;
      bookingObject.taxPercentage = 0;
      bookingObject.additionalPaxAmount = 0;
      bookingObject.foodPlanAmount = 0;
    }

    setBookings((prev) => {
      const alreadyExists = prev?.some(
        (booking) => booking.roomId === bookingObject.roomId
      );
      if (alreadyExists) return prev;
      return [...prev, bookingObject];
    });
    console.log(bookings);

    setSelectedValue(party);
    setIsOpen(false);
    setSearch("");
    onSelect(party);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedValue(null);
    setSearch("");
    onSelect(null);
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

  useEffect(() => {
    setSelectedValue(selectedParty);
  }, [selectedParty]);

  useEffect(() => {
    if (cmp_id) fetchRooms(1);
  }, [cmp_id, fetchRooms]);

  useEffect(() => () => clearTimeout(debounceTimerRef.current), []);

  // function used to update total amount based on priceLevel
  const handlePriceLevelChange = async (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      const selectedPriceLevel = e.target.value;
      let newRate;
      
      // Find the selected price level rate
      if (selectedPriceLevel === data?.roomType?._id) {
        newRate = data?.roomType?.roomRent || 0;
      } else {
        const selectedLevel = data.priceLevel.find((item) => item?._id === selectedPriceLevel);
        newRate = selectedLevel?.priceRate || data?.roomType?.roomRent || 0;
      }

      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            const updatedBooking = {
              ...booking,
              selectedPriceLevel: selectedPriceLevel,
              priceLevelRate: newRate,
              totalAmount: Number(booking?.stayDays || 0) * Number(newRate),
            };
            return updatedBooking;
          }
          return booking;
        });
        return updatedBookings;
      });

      setPendingRoomId(roomId);
    }
  };

  // function used to handle stay days
  const handleDaysChange = (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      const newDays = Number(e.target.value) || 0;
      
      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            return {
              ...booking,
              stayDays: newDays,
              totalAmount: Number(booking?.priceLevelRate || 0) * newDays,
            };
          }
          return booking;
        });
        console.log(updatedBookings);
        return updatedBookings;
      });
    }
      setPendingRoomId(roomId);
  };

  const handlePriceLevelRateChange = (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      const newRate = Number(e.target.value) || "";
      console.log(newRate);
      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            return {
              ...booking,
              priceLevelRate: newRate,
              totalAmount: Number(booking?.stayDays || 0) * newRate,
            };
          }
          return booking;
        });

        return updatedBookings;
      });
    }
          setPendingRoomId(roomId);
  };

  const handlePaxChange = (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      const newPax = Number(e.target.value) || 0;
      
      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            return {
              ...booking,
              pax: newPax,
            };
          }
          return booking;
        });

        return updatedBookings;
      });
    }
    // Trigger tax recalculation when pax changes as it might affect additional charges
        setPendingRoomId(roomId);
  };

  // function used to delete room from table
  const handleDelete = (roomId) => {
    setBookings((prev) => {
      const updatedBookings = prev.filter(
        (booking) => booking.roomId !== roomId
      );
      return updatedBookings;
    });
  };

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
              if (!disabled) setIsOpen(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 pr-20 border rounded-lg bg-white ${
              disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
        <div className="mt-4 bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Sl No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase whitespace-nowrap">
                    Room No
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    PriceLevel
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Rate (₹)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Days
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Pax's
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Total (₹)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Tax
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Total With Tax (₹)
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Pax+
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Food+
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-white uppercase whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {bookings.map((booking, index) => (
                  <tr
                    key={booking?.roomId}
                    className="hover:bg-blue-50/50 transition-all duration-300 hover:scale-[1] hover:shadow-lg"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-center font-medium text-blue-600">
                      {index + 1}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-center font-medium text-emerald-600 flex-1 ">
                      <p>{booking.roomName}</p>
                      <p className="text-red-500">{booking.roomType?.brand}</p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap ">
                      {booking.priceLevel && booking.priceLevel.length > 0 ? (
                        <select
                          value={booking.selectedPriceLevel}
                          onChange={(e) =>
                            handlePriceLevelChange(e, booking.roomId)
                          }
                          className="w-24 px-3 py-2 border border-red-300 rounded-md font-medium text-red-600 bg-red-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                        >
                          {booking.priceLevel.map((priceLevel) => (
                            <option
                              key={priceLevel?._id}
                              value={priceLevel?._id}
                            >
                              {priceLevel?.priceLevel?.pricelevel || priceLevel?.pricelevel}
                            </option>
                          ))}
                          {booking?.roomType && (
                            <option value={booking?.roomType?._id}>
                              Normal price
                            </option>
                          )}
                        </select>
                      ) : (
                        <p className="text-red-500">No Price Level</p>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        value={booking.priceLevelRate }
                        onChange={(e) =>
                          handlePriceLevelRateChange(e, booking.roomId)
                        }
                        min="-1"
                        step="0.01"
                        className="w-24 px-3 py-2 border border-red-300 rounded-md font-medium text-red-600 bg-red-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        value={booking.stayDays || 0}
                        onChange={(e) => handleDaysChange(e, booking.roomId)}
                        min="0"
                        className="w-20 px-3 py-2 border border-purple-300 rounded-md font-medium text-purple-600 bg-purple-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center font-medium text-blue-600">
                      <input
                        type="number"
                        value={booking.pax || 2}
                        onChange={(e) => handlePaxChange(e, booking.roomId)}
                        min="1"
                        className="w-28 px-3 py-2 border border-emerald-300 rounded-md font-bold text-emerald-600 bg-emerald-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="w-28 px-3 py-2 border border-emerald-300 rounded-md font-bold text-emerald-600 bg-emerald-50 text-sm text-center inline-block">
                        {Number(booking.totalAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-bold text-center">
                      {Number(booking.taxPercentage || 0).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-bold text-center">
                      {Number(booking.amountAfterTax || booking.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-bold text-center">
                      {formData?.additionalPaxDetails?.reduce((acc, item) => {
                        if (item.roomId == booking.roomId) {
                          return acc + 1;
                        }
                        return acc;
                      }, 0) || 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-bold text-center">
                      {formData?.foodPlan
                        ?.filter((item) => item.roomId === booking.roomId)
                        .map((item, index) => (
                          <p key={index}>{item.foodPlan}</p>
                        )) || "None"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <div className="text-center font-bold text-blue-700">
                          <button
                            onClick={() => {
                              selectedRoomData(booking?.roomId, "addPax");
                              setPendingRoomId(booking.roomId);
                            }}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs tracking-wide hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center"
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Add Pax
                          </button>
                          <p>{Number(booking?.additionalPaxAmount || 0).toFixed(2)}</p>
                        </div>
                        <div className="text-center font-bold text-blue-700">
                          <button
                            onClick={() => {
                              selectedRoomData(booking?.roomId, "addFoodPlan");
                              setPendingRoomId(booking.roomId);
                            }}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs tracking-wide hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center"
                          >
                            <Utensils className="w-4 h-4 mr-1" />
                            Food Plan
                          </button>
                          <p>{Number(booking?.foodPlanAmount || 0).toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <button
                            onClick={() => {
                              handleDelete(booking.roomId);
                            }}
                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-1.5 rounded-md hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={6} className="px-4 py-3 text-right font-bold text-gray-700">
                    Total Amount:
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700">
                    ₹{Number(totalAmount).toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-3 font-bold text-blue-700 text-center flex">
                    <div className="flex  gap-4">
                      {formData?.paxTotal && (
                        <span>Pax ₹{Number(formData.paxTotal).toFixed(2)}</span>
                      )}
                      {formData?.foodPlanTotal && (
                        <span>Food ₹{Number(formData.foodPlanTotal).toFixed(2)}</span>
                      )}
                    </div>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default AvailableRooms;