import React, { useState, useEffect } from "react";
import { X, Users, DoorOpen, Plus, Trash2 } from "lucide-react";
import CustomerSearchInputBox from "../Components/CustomerSearchInPutBox";

export default function EnhancedCheckoutModal({
  isOpen = true,
  onClose,
  selectedCheckIns = [],
  onConfirm,
}) {
  // State to manage room-customer assignments
  const [roomAssignments, setRoomAssignments] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize room assignments when selectedCheckIns change
  useEffect(() => {
    if (selectedCheckIns.length > 0) {
      // Group all rooms from all check-ins
      const allRooms = selectedCheckIns.flatMap((checkIn) =>
        checkIn.selectedRooms.map((room) => ({
          checkInId: checkIn._id,
          checkInNumber: checkIn.voucherNumber,
          roomId: room._id,
          roomName: room.roomName,
          roomType: room.roomType?.brand || "Standard",
          originalCustomer: checkIn.customerId,
          selectedCustomer: checkIn.customerId, // Default to original customer
        }))
      );

      setRoomAssignments(allRooms);
    }
  }, [selectedCheckIns]);

  // Handle customer selection for a specific room
  const handleCustomerSelect = (index, customer) => {
    const updated = [...roomAssignments];
    updated[index].selectedCustomer = customer;
    setRoomAssignments(updated);
    
    // Clear error for this room if exists
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  // Remove a room from checkout (partial checkout)
  const handleRemoveRoom = (index) => {
    const updated = roomAssignments.filter((_, i) => i !== index);
    setRoomAssignments(updated);
  };

  // Add room back if needed
  const handleAddRoom = (checkInId, room) => {
    setRoomAssignments([
      ...roomAssignments,
      {
        checkInId,
        checkInNumber: room.voucherNumber,
        roomId: room._id,
        roomName: room.roomName,
        roomType: room.roomType?.brand || "Standard",
        originalCustomer: room.originalCustomer,
        selectedCustomer: room.originalCustomer,
      },
    ]);
  };

  // Validate before proceeding
  const validateAssignments = () => {
    const newErrors = {};
    roomAssignments.forEach((assignment, index) => {
      if (!assignment.selectedCustomer || !assignment.selectedCustomer._id) {
        newErrors[index] = "Please select a customer for this room";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle proceed to checkout
  const handleProceed = () => {
    if (!validateAssignments()) {
      return;
    }

    // Group rooms by customer
    const groupedByCustomer = {};
    roomAssignments.forEach((assignment) => {
      const customerId = assignment.selectedCustomer._id;
      if (!groupedByCustomer[customerId]) {
        groupedByCustomer[customerId] = {
          customer: assignment.selectedCustomer,
          checkIns: [],
        };
      }

      // Find if this checkIn already exists in the group
      let checkInGroup = groupedByCustomer[customerId].checkIns.find(
        (ci) => ci.checkInId === assignment.checkInId
      );

      if (!checkInGroup) {
        // Find the original checkIn data
        const originalCheckIn = selectedCheckIns.find(
          (ci) => ci._id === assignment.checkInId
        );
        checkInGroup = {
          checkInId: assignment.checkInId,
          checkInNumber: assignment.checkInNumber,
          originalCheckIn: originalCheckIn,
          rooms: [],
        };
        groupedByCustomer[customerId].checkIns.push(checkInGroup);
      }

      checkInGroup.rooms.push({
        roomId: assignment.roomId,
        roomName: assignment.roomName,
        roomType: assignment.roomType,
      });
    });

    // Convert to array format
    const result = Object.values(groupedByCustomer).map((group) => ({
      customerId: group.customer._id,
      customerName: group.customer.partyName,
      customer: group.customer,
      checkIns: group.checkIns,
    }));

    onConfirm(result);
  };

  if (!isOpen) return null;

  // Get all available rooms (not currently in assignments)
  const availableRooms = selectedCheckIns.flatMap((checkIn) =>
    checkIn.selectedRooms
      .filter(
        (room) =>
          !roomAssignments.some(
            (assignment) =>
              assignment.checkInId === checkIn._id &&
              assignment.roomId === room._id
          )
      )
      .map((room) => ({
        checkInId: checkIn._id,
        voucherNumber: checkIn.voucherNumber,
        ...room,
        originalCustomer: checkIn.customerId,
      }))
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-4 py-2">
          <h2 className="font-semibold text-gray-700 text-lg flex items-center gap-2">
            <Users size={20} /> Checkout Assignment
          </h2>
          <button
            onClick={() => onClose(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {roomAssignments.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">
              No rooms selected
            </p>
          ) : (
            roomAssignments.map((a, i) => (
              <div
                key={i}
                className={`border rounded-md p-3 ${
                  errors[i] ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <DoorOpen size={18} className="text-blue-500" />
                    <p className="font-medium text-sm">
                      {a.roomName} ({a.roomType})
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveRoom(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-gray-500 mb-1">
                  Original: {a.originalCustomer?.partyName || "N/A"}
                </p>

                <CustomerSearchInputBox
                  onSelect={(c) => handleCustomerSelect(i, c)}
                  selectedParty={a.selectedCustomer}
                  isAgent={false}
                  placeholder="Select customer..."
                />
                {errors[i] && (
                  <p className="text-xs text-red-500 mt-1">{errors[i]}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-3 flex justify-end gap-2">
          <button
            onClick={() => onClose(null)}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={roomAssignments.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}