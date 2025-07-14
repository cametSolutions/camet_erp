import { useEffect, useState, useCallback, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import api from "@/api/api";
import { Users, Utensils, Trash2 } from "lucide-react";

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

  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const PAGE_SIZE = 50;

  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const location = useLocation();

  const fetchRooms = useCallback(
    async (pageNum = 1, searchTerm = "") => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/sUsers/getRooms/${cmp_id}`, {
          params: { page: pageNum, limit: PAGE_SIZE, search: searchTerm , type : formData?.roomType ? formData?.roomType : "All"},
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
    [cmp_id, location.pathname,formData?.roomType]
  );

  // useEffect used to calculate the total amount
  useEffect(() => {

    if (bookings.length > 0) {
      let total = bookings.reduce((acc, curr) => {
        return acc + Number(curr.totalAmount);
      }, 0);

      setTotalAmount(total);
      sendToParent(bookings, total);
    }
  }, [bookings]);

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

  const handleSelect = (party) => {
    let bookingObject = {
      roomId: party._id,
      roomName: party.roomName,
      priceLevel: party.priceLevel,
      selectedPriceLevel: party.priceLevel[0].pricelevel,
      priceLevelRate: party.priceLevel[0].priceRate,
      stayDays: formData.stayDays || 1,
      totalAmount:
        Number(party.priceLevel[0].priceRate) * Number(formData.stayDays || 1),
    };
    setBookings((prev) => {
      const alreadyExists = prev?.some(
        (booking) => booking.roomId === bookingObject.roomId
      );
      if (alreadyExists) return prev;
      return [...prev, bookingObject];
    });

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
  const handlePriceLevelChange = (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            return {
              ...booking,
              selectedPriceLevel: e.target.value,
              priceLevelRate: data.priceLevel.find(
                (item) => item?._id === e.target.value
              )?.priceRate,
              totalAmount:
                Number(booking?.stayDays || 0) *
                Number(
                  data.priceLevel.find((item) => item?._id === e.target.value)
                    ?.priceRate || 0
                ),
            };
          }
          return booking;
        });
        console.log(updatedBookings);
        return updatedBookings;
      });
    }
  };

  const handleDaysChange = (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            return {
              ...booking,
              stayDays: e.target.value,
              totalAmount:
                Number(booking?.priceLevelRate || 0) *
                Number(e.target.value || 0),
            };
          }
          return booking;
        });
        console.log(updatedBookings);
        return updatedBookings;
      });
    }
  };
  const handlePriceLevelRateChange = (e, roomId) => {
    let data = bookings.find((item) => item.roomId === roomId);
    if (data) {
      setBookings((prev) => {
        const updatedBookings = prev.map((booking) => {
          if (booking.roomId === roomId) {
            return {
              ...booking,
              priceLevelRate: e.target.value,
              totalAmount:
                Number(booking?.stayDays || 0) * Number(e.target.value || 0),
            };
          }
          return booking;
        });

        return updatedBookings;
      });
    }
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
        <div className="mt-4 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/20">
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
                    Total (₹)
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

                    <td className="px-4 py-3 whitespace-nowrap text-center font-medium text-emerald-600">
                      {booking.roomName}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={booking.selectedPriceLevel}
                        onChange={(e) =>
                          handlePriceLevelChange(e, booking.roomId)
                        }
                        className="w-24 px-3 py-2 border border-red-300 rounded-md font-medium text-red-600 bg-red-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                      >
                        {booking.priceLevel.map((priceLevel) => (
                          <option key={priceLevel?._id} value={priceLevel?._id}>
                            {priceLevel?.priceLevel?.pricelevel}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        value={booking.priceLevelRate}
                        onChange={(e) =>
                          handlePriceLevelRateChange(e, booking.roomId)
                        }
                        className="w-24 px-3 py-2 border border-red-300 rounded-md font-medium text-red-600 bg-red-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        value={booking.stayDays}
                        onChange={(e) => handleDaysChange(e, booking.roomId)}
                        className="w-20 px-3 py-2 border border-purple-300 rounded-md font-medium text-purple-600 bg-purple-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="number"
                        value={booking.totalAmount}
                        className="w-28 px-3 py-2 border border-emerald-300 rounded-md font-bold text-emerald-600 bg-emerald-50 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
                      />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            selectedRoomData(booking?.roomId, "addPax")
                          }
                          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs tracking-wide hover:from-orange-600 hover:to-amber-600 transition-all duration-200 flex items-center"
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Add Pax
                        </button>
                        <button
                          onClick={() =>
                            selectedRoomData(booking?.roomId, "addFoodPlan")
                          }
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-md font-semibold text-xs tracking-wide hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 flex items-center"
                        >
                          <Utensils className="w-4 h-4 mr-1" />
                          Food Plan
                        </button>
                        <button
                          onClick={() => handleDelete(booking.roomId)}
                          className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-2 py-1.5 rounded-md hover:from-red-600 hover:to-rose-600 transition-all duration-200 flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                <tr className="hover:bg-blue-50/50 transition-all duration-300 hover:scale-[1] hover:shadow-lg">
                  <td colSpan={4}></td>{" "}
                  {/* Empty cells to push content to right */}
                  <td className="px-2 py-3 text-right font-bold text-emerald-700">
                    Total Amount
                  </td>
                  <td className="px-1 py-3 text-center font-bold text-blue-700">
                    {totalAmount}
                  </td>{" "}
                  <td className="px-1 py-3 font-bold text-blue-700">
                    <div className="flex justify-center gap-4">
                      {formData?.paxTotal && <p>Pax:{formData?.paxTotal}</p>}
                      {formData?.foodPlanTotal && (
                        <p>Food:{formData?.foodPlanTotal}</p>
                      )}
                    </div>
                  </td>
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
// <AdditionalPaxDetails
//       cmp_id={cmp_id}
//       sendDataToParent={handleAdditionalPaxDetails}
//     />
//     <FoodPlanComponent
//       cmp_id={cmp_id}
//       sendDataToParent={handleFoodPlanData}
//     />
