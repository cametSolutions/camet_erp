import { useState, useEffect } from "react";
import { X, Users, DoorOpen, CheckCircle, CreditCard } from "lucide-react";

export default function IntegratedCheckoutPanel({ 
  selectedCheckOut = [], 
  onClose, 
  onProceedToCheckout,
  selectedCustomer,
  setSelectedCustomer 
}) {
  const [roomAssignments, setRoomAssignments] = useState([]);
  const [errors, setErrors] = useState({});
  const [showRoomSelection, setShowRoomSelection] = useState(false);

  // Initialize room assignments
  useEffect(() => {
    if (selectedCheckOut.length > 0) {
      const allRooms = selectedCheckOut.flatMap((checkIn) =>
        checkIn.selectedRooms.map((room) => ({
          checkInId: checkIn._id,
          checkInNumber: checkIn.voucherNumber,
          roomId: room._id,
          roomName: room.roomName,
          roomType: room.roomType?.brand || "Standard",
          originalCustomer: checkIn.customerId,
          selectedCustomer: checkIn.customerId,
          isSelected: true,
        }))
      );
      setRoomAssignments(allRooms);
    }
  }, [selectedCheckOut]);

  // Handle customer selection for a room
  const handleCustomerSelect = (index, customerId) => {
    const customer = selectedCheckOut
      .map(co => co.customerId)
      .find(c => c._id === customerId);
    
    const updated = [...roomAssignments];
    updated[index].selectedCustomer = customer;
    setRoomAssignments(updated);
    
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  // Toggle room selection
  const toggleRoomSelection = (index) => {
    const updated = [...roomAssignments];
    updated[index].isSelected = !updated[index].isSelected;
    setRoomAssignments(updated);
  };

  // Validate assignments
  const validateAssignments = () => {
    const newErrors = {};
    roomAssignments.forEach((assignment, index) => {
      if (assignment.isSelected && (!assignment.selectedCustomer || !assignment.selectedCustomer._id)) {
        newErrors[index] = "Please select a customer for this room";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle proceed
  const handleProceed = () => {
    if (!validateAssignments()) return;

    const selectedRooms = roomAssignments.filter(a => a.isSelected);
    const groupedByCustomer = {};
    
    selectedRooms.forEach((assignment) => {
      const customerId = assignment.selectedCustomer._id;
      if (!groupedByCustomer[customerId]) {
        groupedByCustomer[customerId] = {
          customer: assignment.selectedCustomer,
          checkIns: [],
        };
      }

      let checkInGroup = groupedByCustomer[customerId].checkIns.find(
        (ci) => ci.checkInId === assignment.checkInId
      );

      if (!checkInGroup) {
        const originalCheckIn = selectedCheckOut.find(
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

    const result = Object.values(groupedByCustomer).map((group) => ({
      customerId: group.customer._id,
      customerName: group.customer.partyName,
      customer: group.customer,
      checkIns: group.checkIns,
    }));

    onProceedToCheckout(result);
  };

  const selectedRoomsCount = roomAssignments.filter(a => a.isSelected).length;
  const unselectedRoomsCount = roomAssignments.filter(a => !a.isSelected).length;

  // Get unique customers from selected checkout
  const uniqueCustomers = Array.from(
    new Map(selectedCheckOut.map(co => [co.customerId._id, co.customerId])).values()
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Checkout</h3>
                <p className="text-xs text-gray-600">{selectedCheckOut.length} booking(s)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500">Selected</div>
              <div className="text-lg font-bold text-blue-600">{selectedRoomsCount}</div>
            </div>
            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500">Customers</div>
              <div className="text-lg font-bold text-green-600">
                {new Set(roomAssignments.filter(a => a.isSelected).map(a => a.selectedCustomer?._id)).size}
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg text-center">
              <div className="text-xs text-gray-500">Remaining</div>
              <div className="text-lg font-bold text-orange-600">{unselectedRoomsCount}</div>
            </div>
          </div>
        </div>

        {/* Room Selection Toggle */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setShowRoomSelection(!showRoomSelection)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            <span>Room & Customer Assignment</span>
            <span className="text-xs">{showRoomSelection ? '▼' : '▶'}</span>
          </button>
        </div>

        {/* Room Assignment List */}
        {showRoomSelection && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {roomAssignments.map((assignment, index) => (
              <div
                key={`${assignment.checkInId}-${assignment.roomId}`}
                className={`border rounded-lg p-3 transition-all ${
                  assignment.isSelected 
                    ? errors[index] 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {/* Room Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={assignment.isSelected}
                      onChange={() => toggleRoomSelection(index)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Room {assignment.roomName}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {assignment.checkInNumber} | {assignment.roomType}
                      </p>
                    </div>
                  </div>
                  <DoorOpen className="text-blue-600" size={20} />
                </div>

                {/* Original Customer */}
                <div className="mb-2 p-2 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-500">Original Guest:</p>
                  <p className="text-xs font-medium text-gray-700">
                    {assignment.originalCustomer?.partyName || "N/A"}
                  </p>
                </div>

                {/* Customer Selection - Only show if selected */}
                {assignment.isSelected && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Checkout To:
                    </label>
                    <select
                      value={assignment.selectedCustomer?._id || ''}
                      onChange={(e) => handleCustomerSelect(index, e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select customer...</option>
                      {uniqueCustomers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.partyName}
                        </option>
                      ))}
                    </select>
                    {errors[index] && (
                      <p className="text-red-500 text-xs mt-1">{errors[index]}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Compact View when not showing room selection */}
        {!showRoomSelection && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {selectedCheckOut.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg"
                >
                  <span className="font-medium text-gray-700">
                    #{item.voucherNumber}
                  </span>
                  <span className="text-gray-600">
                    {item.selectedRooms?.length} room(s)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partial Checkout Warning */}
        {unselectedRoomsCount > 0 && (
          <div className="mx-3 mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 text-sm">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-yellow-800">Partial Checkout</p>
                <p className="text-xs text-yellow-700">
                  {unselectedRoomsCount} room(s) will remain checked in
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Selection */}
        <div className="p-3 border-t border-gray-200">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Primary Customer
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Choose a customer...</option>
            {uniqueCustomers.map((customer) => (
              <option
                key={customer._id}
                value={customer._id}
              >
                {customer.partyName}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
            >
              Clear All
            </button>
            <button
              onClick={handleProceed}
              disabled={selectedRoomsCount === 0}
              className="flex-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-4 h-4" />
              {unselectedRoomsCount > 0 ? 'Partial Checkout' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}