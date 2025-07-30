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

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 50;

  useEffect(() => {
    
    if (formData?.selectedRooms?.length > 0) {
      setBookings(formData?.selectedRooms);
    }
  }, [formData?.selectedRooms]);

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
  console.log(formData?.bookingType);
  if (!formData?.bookingType) return;

  const handleBookingTypeChange = async () => {
    if (bookings?.length > 0) {
      const updatedBookings = await Promise.all(
        bookings.map(async (booking) => {
          const taxCalculation = await calculateTax(booking);
          return taxCalculation;
        })
      );
      console.log("updatedBookings", updatedBookings);
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
        const res = await api.get(`/api/sUsers/getRooms/${cmp_id}`, {
          params: {
            page: pageNum,
            limit: PAGE_SIZE,
            search: searchTerm,
            type: formData?.roomType || "All",
          },
          withCredentials: true,
        });
        const newRooms = res.data?.roomData;
        setRooms((prev) => (pageNum === 1 ? newRooms : [...prev, ...newRooms]));
        setHasMore(newRooms.length === PAGE_SIZE);
      } catch (err) {
        console.error(err);
        setError("Failed to load rooms.");
      } finally {
        setLoading(false);
      }
    },
    [cmp_id, location.pathname, formData?.roomType]
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
          configurations[0]?.addRateWithTax?.sale,
          formData,
          booking.roomId
        );

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
      const total = bookings.reduce(
        (acc, b) => acc + Number(b.amountAfterTax || b.totalAmount || 0),
        0
      );
      setTotalAmount(total);
      sendToParent(bookings, total);
    } else {
      setTotalAmount(0);
      sendToParent([], 0);
    }
  }, [bookings]);

  const handlePriceLevelChange = (e, roomId) => {
    const selectedLevelId = e.target.value;
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.roomId !== roomId) return booking;
        const level = booking.priceLevel.find((p) => p._id === selectedLevelId);
        const newRate = level?.priceRate || booking.roomType?.roomRent || 0;
        return {
          ...booking,
          selectedPriceLevel: selectedLevelId,
          priceLevelRate: newRate,
          totalAmount: Number(booking.stayDays || 0) * Number(newRate),
        };
      })
    );
    // setPendingRoomId(roomId);
  };

  const handleDaysChange = (e, roomId) => {
    const newDays = Number(e.target.value) || 0;
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
    const newRate = e.target.value;
    console.log(newRate);
    setBookings((prev) =>
      prev.map((b) =>
        b.roomId === roomId
          ? { ...b, priceLevelRate: newRate, totalAmount: newRate * b.stayDays }
          : b
      )
    );
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
    setBookings((prev) => prev.filter((b) => b.roomId !== roomId));
  };

  const handleSelect = async (room) => {
    const defaultRate =
      room?.priceLevel[0]?.priceRate || room?.roomType?.roomRent || 0;
    const stayDays = formData?.stayDays || 1;
    console.log(room);
    let booking = {
      roomId: room._id,
      roomName: room.roomName,
      priceLevel: room.priceLevel || [],
      selectedPriceLevel: room.priceLevel[0]?.priceLevel?._id || room.roomType?._id,
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
                              {priceLevel?.priceLevel?.pricelevel ||
                                priceLevel?.pricelevel}
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
                        value={booking.priceLevelRate}
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
                    <td className="px-4 py-3 whitespace-nowrap flex-1">
                      <div className="flex flex-col items-center">
                        {/* Amount with Tax */}
                        <span className="w-28 px-3 py-2 border border-emerald-300 rounded-md font-bold text-emerald-600 bg-emerald-50 text-sm text-center">
                          ₹{Number(booking.totalAmount || 0).toFixed(2)}{" "}
                        </span>

                        {/* Amount without Tax */}
                        {configurations[0]?.addRateWithTax?.sale && (
                          <span className="px-3   text-gray-700 text-xs text-center">
                            ₹
                            {(
                              Number(booking.totalAmount || 0) /
                              (1 + (booking.taxPercentage || 0) / 100)
                            ).toFixed(2) } (Exc)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-bold text-center">
                      {Number(booking.taxPercentage || 0).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-bold text-center">
                      {Number(
                        booking.amountAfterTax || booking.totalAmount || 0
                      ).toFixed(2)}
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
                          <p>
                            {Number(
                              booking?.additionalPaxAmountWithOutTax || 0
                            ).toFixed(2)}
                          </p>
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
                          <p>
                            {Number(
                              booking?.foodPlanAmountWithOutTax || 0
                            ).toFixed(2)}
                          </p>
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
                  <td
                    colSpan={6}
                    className="px-4 py-3 text-right font-bold text-gray-700"
                  >
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
                        <span>
                          Food ₹{Number(formData.foodPlanTotal).toFixed(2)}
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
      )}
    </>
  );
}

export default AvailableRooms;
