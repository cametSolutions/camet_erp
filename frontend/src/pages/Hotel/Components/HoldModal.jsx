/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";

export default function HoldModal({
  isOpen = true,
  closeModal,
  selectedHolds = [],
  checkInData = [],
  cmp_id,
  fetchBookings,
}) {
 
  // State management
  const [holdData, setHoldData] = useState([]);
  const [selectedTaggedCheckIn, setSelectedTaggedCheckIn] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize holds data
  useEffect(() => {
    if (selectedHolds.length > 0) {
      const processedHolds = selectedHolds.map((hold) => {
        const arrival = new Date(hold.arrivalDate);

        // Set today to start of the day (00:00:00)
        const holdUntil = new Date();
        holdUntil.setUTCHours(0, 0, 0, 0);

        const diffTime = holdUntil - arrival;

        const calculatedDays = Math.max(
          1,
          Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
        );

        return {
          ...hold,
          stayDays: calculatedDays,
          selectedRooms: hold.selectedRooms || [],
          checkOutDate: holdUntil.toISOString().split("T")[0],
        };
      });

      setHoldData(processedHolds);
    }
  }, [selectedHolds]);

  // Handle stay days change
  const handleStayDaysChange = (id, newDays) => {
    setHoldData(
      holdData.map((hold) => {
        if (hold._id === id) {
          if (newDays === "" || newDays === "." || newDays.endsWith(".")) {
            return { ...hold, stayDays: newDays };
          }

          const stayDays = parseFloat(newDays); // number of days
          const arrivalDate = new Date(hold.arrivalDate);

          const checkOutDate = new Date(hold.checkOutDate);
          checkOutDate.setDate(arrivalDate.getDate() + stayDays);

          if (isNaN(stayDays) || stayDays <= 0) {
            return {
              ...hold,
              stayDays: newDays,
              checkOutDate: checkOutDate.toISOString().split("T")[0],
            };
          }

          return {
            ...hold,
            stayDays,
            checkOutDate: checkOutDate.toISOString().split("T")[0],
          };
        }
        return hold;
      }),
    );
  };

  // Handle hold date change
  const handleHoldDateChange = (id, field, newDate) => {
    console.log(id, field, newDate);
    setHoldData(
      holdData.map((hold) => {
        if (hold._id === id) {
          let arrival = new Date(hold.arrivalDate);
          let holdUntil = new Date(hold.checkOutDate);
          if (field == "arrivalDate") {
            arrival = new Date(newDate);
          }
          if (field == "checkOutDate") {
            holdUntil = new Date(newDate);
          }

          holdUntil.setUTCHours(0, 0, 0, 0);

          const diffTime = holdUntil - arrival;
          const calculatedDays = Math.max(
            1,
            Math.ceil(diffTime / (1000 * 60 * 60 * 24)),
          );

          return {
            ...hold,
            arrival: arrival.toISOString().split("T")[0],
            checkOutDate: holdUntil.toISOString().split("T")[0],
            stayDays: calculatedDays,
          };
        }

        return hold;
      }),
    );
  };

  // Handle confirm
const handleConfirm = async () => {
  if (!selectedTaggedCheckIn) {
    toast.error("Please select a check-in to tag");
    return;
  }

  if (!holdData || holdData.length === 0) {
    toast.error("No holds selected");
    return;
  }

  try {
    setLoading(true); // optional loading state

    const { data } = await api.post(
      `/api/sUsers/controlTaggedCheckIn/${cmp_id}`,
      {
        checkInId: selectedTaggedCheckIn,
        holds: holdData,
      },
      { withCredentials: true }
    );

    toast.success(data.message || "Tagged successfully");

    closeModal(false); // close only on success
    fetchBookings()
  } catch (error) {
    console.error(error);
    toast.error(error?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-[95vw] max-w-2xl h-[90vh] rounded-xl shadow-xl flex flex-col text-xs md:text-sm">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0 bg-gradient-to-r from-blue-50 to-transparent">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-800">
            <Calendar size={18} className="text-blue-600" /> Hold Details
          </h2>
          <button
            onClick={() => closeModal(false)}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= SELECTED HOLDS SUMMARY ================= */}
        {checkInData.length > 0 && (
          <div className="px-4 py-2 border-b bg-gray-50 flex-shrink-0">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Please select check-in for tag
            </p>

            <select
              className="border border-blue-300 rounded px-2 py-1 text-[11px] text-blue-700 bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              value={selectedTaggedCheckIn}
              onChange={(e) => setSelectedTaggedCheckIn(e.target.value)}
            >
              <option value="">Select tag check-in</option>

              {checkInData.map((hold) => (
                <option key={hold._id} value={hold._id}>
                  #{hold.voucherNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ================= CONTENT AREA ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {holdData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Calendar size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No holds selected</p>
            </div>
          ) : (
            holdData.map((hold) => (
              <div
                key={hold._id}
                className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
              >
                {/* Hold Number */}
                <p className="text-xs font-semibold text-blue-600 mb-2">
                  Check in number #{hold.voucherNumber}
                </p>

                {/* Hold From Date */}
                <div className="mb-2">
                  <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                    Arrival Date
                  </label>
                  <input
                    type="date"
                    value={hold.arrivalDate}
                    onChange={(e) =>
                      handleHoldDateChange(
                        hold._id,
                        "arrivalDate",
                        e.target.value,
                      )
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Hold Until Date */}
                <div className="mb-2">
                  <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                    CheckOutDate
                  </label>
                  <input
                    type="date"
                    value={hold.checkOutDate}
                    onChange={(e) =>
                      handleHoldDateChange(
                        hold._id,
                        "checkOutDate",
                        e.target.value,
                      )
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Stay Days */}
                <div className="mb-2">
                  <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                    Stay Days
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={hold.stayDays}
                    onChange={(e) =>
                      handleStayDaysChange(hold._id, e.target.value)
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Assigned Rooms */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-600">
                    Rooms
                  </label>

                  <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] text-gray-800 shadow-sm truncate">
                    {hold.selectedRooms?.length > 0
                      ? hold.selectedRooms.map((r) => r.roomName).join(", ")
                      : "No rooms assigned"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex-shrink-0 border-t px-4 py-3 flex justify-end gap-2 bg-white">
          <button
            onClick={() => closeModal(false)}
            className="px-4 py-1.5 text-xs border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={holdData.length === 0 || loading}
            className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
           {loading ? "Loading..." : "Confirm Hold"} 
          </button>
        </div>
      </div>
    </div>
  );
}
