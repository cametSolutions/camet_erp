import React, { useState } from "react";
import { X, Calendar } from "lucide-react";

export default function CheckoutDateModal({
  isOpen = true,
  onClose,
  checkoutData = [],
}) {
  const [checkouts, setCheckouts] = useState(
    checkoutData.length > 0 ? checkoutData : [
      {
        _id: "1",
        checkOutDate: "2024-01-15",
        arrivalDate: "2024-01-10",
        voucherNumber: "V001",
        stayDays: 2.5
      },
      {
        _id: "2", 
        checkOutDate: "2024-01-20",
        arrivalDate: "2024-01-15",
        voucherNumber: "V002",
        stayDays: 3
      },
      {
        _id: "3",
        checkOutDate: "2024-01-25", 
        arrivalDate: "2024-01-20",
        voucherNumber: "V003",
        stayDays: 4.5
      }
    ]
  );

  const handleNewDateChange = (id, newDate) => {
    setCheckouts(
      checkouts.map((checkout) => {
        if (checkout._id == id) {
          const arrival = new Date(checkout.arrivalDate);
          const checkoutDate = new Date(newDate);
          const diffTime = checkoutDate - arrival;
          const calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          return { 
            ...checkout, 
            checkOutDate: newDate, 
            stayDays: calculatedDays
          };
        }
        return checkout;
      })
    );
  };

const handleStayDaysChange = (id, newDays) => {
  setCheckouts(
    checkouts.map((checkout) => {
      if (checkout._id === id) {
        const stayDays = parseFloat(newDays) || 0;

        // Round up fractional days to nearest whole day
        const roundedDays = Math.ceil(stayDays);

        // Calculate new checkout date
        const arrival = new Date(checkout.arrivalDate);
        const newCheckoutDate = new Date(arrival);
        newCheckoutDate.setDate(arrival.getDate() + roundedDays);

        return {
          ...checkout,
          stayDays: stayDays, // keep original entered days (can be 2.5)
          checkOutDate: newCheckoutDate.toISOString().split("T")[0], // format as YYYY-MM-DD
        };
      }
      return checkout;
    })
  );
};
// const handleStayDaysChange = (checkoutId, newDays) => {
//   console.log("checkouts", checkouts);
//   setCheckouts(
//     checkouts.map((checkout) => {
//       if (checkout._id === checkoutId) {
//         const stayDays = Math.ceil(parseFloat(newDays) || 0);

//         // update ALL rooms with same stayDays
//         const updatedRooms = checkout.selectedRooms.map((room) => ({
//           ...room,
//           stayDays,
//         }));

//         // calculate new checkout date
//         const arrival = new Date(checkout.arrivalDate);
//         const newCheckoutDate = new Date(arrival);
//         newCheckoutDate.setDate(arrival.getDate() + stayDays);

//         return {
//           ...checkout,
//           selectedRooms: updatedRooms,
//           checkOutDate: newCheckoutDate.toISOString().split("T")[0],
//           stayDays,
//         };
//       }
//       return checkout;
//     })
//   );
// };

  const handleConfirm = () => {
    onClose(checkouts);
  };

  const handleCancel = () => {
    onClose(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={18} />
            Update Checkout Dates
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Compact Table Body with Fixed Height */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Voucher
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Current Date
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    New Date
                  </th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
                    Days
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {checkouts.map((checkout, index) => (
                  <tr
                    key={checkout._id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900 text-sm">
                        {checkout.voucherNumber}
                      </div>
                    </td>
                    
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-700 text-sm">
                          {new Date(checkout.checkOutDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={checkout.checkOutDate}
                        onChange={(e) => handleNewDateChange(checkout._id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={checkout.stayDays || 0}
                          onChange={(e) => handleStayDaysChange(checkout._id, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0.5"
                          step="0.5"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500">days</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {checkouts.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-8 text-gray-500">
            <div className="text-center">
              <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No checkout dates available</p>
            </div>
          </div>
        )}

        {/* Compact Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Update Dates
          </button>
          <div className="text-xs text-gray-500 flex items-center px-2">
            {checkouts.length} items
          </div>
        </div>
      </div>
    </div>
  );
}