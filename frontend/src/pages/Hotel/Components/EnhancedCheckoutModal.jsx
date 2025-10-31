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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Users size={24} className="text-blue-600" />
              Checkout Room Assignment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assign rooms to customers for checkout
            </p>
          </div>
          <button
            onClick={() => onClose(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {/* Room Assignment Cards */}
            {roomAssignments.map((assignment, index) => (
              <div
                key={`${assignment.checkInId}-${assignment.roomId}`}
                className={`border rounded-lg p-4 bg-white shadow-sm ${
                  errors[index] ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Room Info */}
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <DoorOpen className="text-blue-600" size={24} />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg">
                          Room {assignment.roomName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Check-in: {assignment.checkInNumber} | Type:{" "}
                          {assignment.roomType}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveRoom(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Remove from checkout"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Original Customer Info */}
                    <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">
                        Original Guest:
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {assignment.originalCustomer?.partyName || "N/A"}
                      </p>
                    </div>

                    {/* Customer Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Checkout To Customer:
                      </label>
                      <CustomerSearchInputBox
                        onSelect={(customer) =>
                          handleCustomerSelect(index, customer)
                        }
                        selectedParty={assignment.selectedCustomer}
                        isAgent={false}
                        placeholder="Search or select customer..."
                        sendSearchToParent={() => {}}
                      />
                      {errors[index] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[index]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Room Button - Show if there are available rooms */}
            {availableRooms.length > 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-3">
                  Available rooms not included in checkout:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {availableRooms.map((room) => (
                    <button
                      key={`${room.checkInId}-${room._id}`}
                      onClick={() => handleAddRoom(room.checkInId, room)}
                      className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                      <Plus size={16} className="text-blue-600" />
                      <span className="text-sm">
                        Room {room.roomName} ({room.voucherNumber})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {roomAssignments.length === 0 && (
              <div className="text-center py-12">
                <DoorOpen size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No rooms selected for checkout
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Rooms Selected</div>
              <div className="text-2xl font-bold text-blue-600">
                {roomAssignments.length}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Customers</div>
              <div className="text-2xl font-bold text-green-600">
                {new Set(roomAssignments.map((a) => a.selectedCustomer?._id)).size}
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Remaining Rooms</div>
              <div className="text-2xl font-bold text-orange-600">
                {availableRooms.length}
              </div>
            </div>
          </div>

          {/* Partial Checkout Warning */}
          {availableRooms.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600 mt-0.5">⚠️</div>
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    Partial Checkout
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {availableRooms.length} room(s) will remain in check-in status and can be checked out later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onClose(null)}
              className="flex-1 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              disabled={roomAssignments.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Users size={20} />
              {availableRooms.length > 0 ? 'Partial Checkout' : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}