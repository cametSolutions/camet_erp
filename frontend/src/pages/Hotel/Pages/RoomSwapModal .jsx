import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Clock, X, ArrowRight } from 'lucide-react';

const RoomSwapModal = ({ 
  isOpen, 
  onClose, 
  selectedRoom, 
  onConfirmSwap,
  cmp_id,
  api 
}) => {
  const [checkedInGuests, setCheckedInGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch checked-in guests when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCheckedInGuests();
    }
  }, [isOpen]);

  const fetchCheckedInGuests = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sUsers/getCheckedInGuests/${cmp_id}`, {
        withCredentials: true,
      });
      
      setCheckedInGuests(response.data.guests || []);
    } catch (error) {
      console.error('Error fetching checked-in guests:', error);
      alert('Failed to load checked-in guests');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRoom = async () => {
  if (!selectedGuest || !selectedRoom) return;

  try {
    setLoading(true);

    // Take the first selected room (or whichever is chosen by user)
       const oldRoomId = selectedGuest.room._id;
    const response = await api.put(
      `/api/sUsers/swapRoom/${selectedGuest._id}`,  // <-- use checkInId = guest._id
      {
        newRoomId: selectedRoom._id,
        oldRoomId: oldRoomId,
      },
      {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.data.success) {
      alert(
        `Room successfully swapped from ${response.data.swapDetails.fromRoom.name} to ${response.data.swapDetails.toRoom.name}`
      );
      onConfirmSwap();
      onClose();
    }
  } catch (error) {
    console.error("Error swapping room:", error);
    alert(
      `Failed to swap room: ${
        error.response?.data?.message || error.message
      }`
    );
  } finally {
    setLoading(false);
  }
};

  // Filter guests based on search term
  // Flatten guests into guest-room entries
const flattenedGuests = checkedInGuests.flatMap((guest) =>
  guest.selectedRooms.map((room) => ({
     _id:guest. _id,
    voucherNumber: guest.voucherNumber, // use _id from guest
    customerName: guest.customerName,
    mobileNumber: guest.mobileNumber,
    checkInDate: guest.arrivalDate, // use arrivalDate
    checkOutDate: guest.checkOutDate,
    room: {
      _id: room.roomId?._id || room.roomId,
      roomName: room.roomId?.roomName || room.roomName,
    },
  }))
);


// Apply search filter
const filteredGuests = flattenedGuests.filter(
  (entry) =>
    entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.mobileNumber.includes(searchTerm) ||
    entry.room.roomName.toLowerCase().includes(searchTerm.toLowerCase())
);


  if (!isOpen) return null;
console.log(filteredGuests)
console.log(checkedInGuests)
console.log(selectedGuest)
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - More compact */}
        <div className="bg-slate-700 px-4 py-3 border-b border-slate-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              Room Swap - {selectedRoom?.roomName}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-600 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search Bar - More compact */}
        <div className="p-3 border-b border-slate-600 flex-shrink-0">
          <input
            type="text"
            placeholder="Search by name, phone, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Guest List - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredGuests.length > 0 ? (
            <div className="space-y-2">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.checkInId}
                  onClick={() => setSelectedGuest(guest)}
                  className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                    selectedGuest?.checkInId === guest.checkInId
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-600 bg-slate-700 hover:border-blue-400 hover:bg-slate-650'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Guest Name - More compact */}
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-sm truncate">
                          {guest.customerName}
                        </span>
                      </div>


<div className="flex items-center gap-2 mb-1">
                        <User className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span className="text-white font-semibold text-sm truncate">
                          {guest.voucherNumber}
                        </span>
                      </div>
                      {/* Current Room & Phone in one line */}
                      <div className="flex items-center gap-4 mb-1">
    <div className="flex items-center gap-1">
  <MapPin className="w-3 h-3 text-green-400 flex-shrink-0" />
  <span className="text-gray-300 text-xs">
    {guest.room?.roomName}
  </span>
</div>

                        <div className="text-gray-400 text-xs">
                          {guest.mobileNumber}
                        </div>
                      </div>

                      {/* Check-in Date - More compact */}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        <span className="text-gray-400 text-xs">
                          {new Date(guest.checkInDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Arrow indicator for selected guest */}
                    {selectedGuest?.checkInId === guest.checkInId && (
                      <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                {searchTerm ? 'No guests found matching your search' : 'No checked-in guests found'}
              </p>
            </div>
          )}
        </div>

        {/* Footer - More compact */}
        <div className="bg-slate-700 px-4 py-3 border-t border-slate-600 flex-shrink-0">
          {selectedGuest && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-md p-2 mb-3">
              <div className="text-xs text-blue-300 font-medium mb-1">
                Room Swap Summary:
              </div>
              <div className="text-xs text-gray-300">
                Move <strong>{selectedGuest.customerName}</strong> from{' '}
                <span className="text-red-300 font-medium">{selectedGuest?.room?.roomName}</span>{' '}
                to <span className="text-green-300 font-medium">{selectedRoom?.roomName}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSwapRoom}
              disabled={!selectedGuest || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  Swapping...
                </>
              ) : (
                <>
                  <ArrowRight className="w-3 h-3" />
                  Confirm Swap
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSwapModal;