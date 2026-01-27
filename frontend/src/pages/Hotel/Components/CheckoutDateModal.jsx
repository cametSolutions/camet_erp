/* eslint-disable react/prop-types */
import { useState } from "react"
import { X, Calendar } from "lucide-react"

export default function CheckoutDateModal({
  checkouts,
  onDateChange,
  onDaysChange
}) {
console.log(checkouts)
  // Store original data separately (deep clone)
  // const [originalCheckouts] = useState(() =>
  //   checkouts.length > 0 ? JSON.parse(JSON.stringify(checkouts)) : []
  // )
  const [checkOutDateTracker, setCheckOutDateTracker] = useState(
    new Date().toISOString().split("T")[0]
  )
  // const [checkOutDateOld, setCheckOutDateOld] = useState(
  //   new Date(checkoutData[0].checkOutDate).toISOString().split("T")[0]
  // )

  // const [checkouts, setCheckouts] = useState(
  //   checkoutData.length > 0
  //     ? checkoutData.map((checkout) => {
  //         const arrival = new Date(checkout.arrivalDate)
  //         const checkoutDate = new Date(checkOutDateTracker)
  //         const diffTime = checkoutDate - arrival
  //         const calculatedDays =
  //           diffTime === 0 ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  //         const time = new Date().toLocaleTimeString([], {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //           hour12: true // 12-hour format
  //         })

  //         checkout.selectedRooms.forEach((room) => {
  //           room.stayDays = calculatedDays
  //         })

  //         return {
  //           ...checkout,
  //           stayDays: calculatedDays,
  //           checkOutTime: time,
  //           checkOutDate: checkOutDateTracker
  //         }
  //       })
  //     : [
  //         {
  //           _id: "1",
  //           checkOutDate: "2024-01-15",
  //           arrivalDate: "2024-01-10",
  //           voucherNumber: "V001",
  //           stayDays: 2.5,
  //           selectedRooms: [
  //             { _id: "r1", roomName: "101", priceLevelRate: 2000 }
  //           ]
  //         }
  //       ]
  // )

  // const handleNewDateChange = (id, newDate) => {
  //   setCheckOutDateTracker(newDate)
  //   setCheckouts(
  //     checkouts.map((checkout) => {
  //       if (checkout._id === id) {
  //         const arrival = new Date(checkout.arrivalDate)
  //         const checkoutDate = new Date(newDate)
  //         const diffTime = checkoutDate - arrival
  //         const calculatedDays =
  //           diffTime === 0 ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  //         const originalCheckout = originalCheckouts.find((oc) => oc._id === id)
  //         if (!originalCheckout) return checkout

  //         const updatedRooms =
  //           checkout.selectedRooms?.map((room) => {
  //             const originalRoom = originalCheckout.selectedRooms?.find(
  //               (or) => or._id === room._id || or.roomName === room.roomName
  //             )

  //             if (!originalRoom) return room

  //             const originalStayDays =
  //               originalRoom.stayDays || originalCheckout.stayDays || 1
  //             const originalBaseAmount = originalRoom.baseAmount || 0
  //             const originalTaxAmount = originalRoom.taxAmount || 0
  //             const originalFoodPlanWithTax =
  //               originalRoom.foodPlanAmountWithTax || 0
  //             const originalFoodPlanWithoutTax =
  //               originalRoom.foodPlanAmountWithOutTax || 0
  //             const originalPaxWithTax =
  //               originalRoom.additionalPaxAmountWithTax || 0
  //             const originalPaxWithoutTax =
  //               originalRoom.additionalPaxAmountWithOutTax || 0

  //             // Calculate daily rates from ORIGINAL totals
  //             const baseAmountPerDay = originalBaseAmount / originalStayDays
  //             const taxAmountPerDay = originalTaxAmount / originalStayDays
  //             const foodPlanWithTaxPerDay =
  //               originalFoodPlanWithTax / originalStayDays
  //             const foodPlanWithoutTaxPerDay =
  //               originalFoodPlanWithoutTax / originalStayDays

  //             // ✅ FIX: Calculate pax per day based on ORIGINAL FULL DAYS only
  //             const originalFullDays = Math.floor(originalStayDays)
  //             const paxWithTaxPerDay =
  //               originalFullDays > 0 ? originalPaxWithTax / originalFullDays : 0
  //             const paxWithoutTaxPerDay =
  //               originalFullDays > 0
  //                 ? originalPaxWithoutTax / originalFullDays
  //                 : 0

  //             // Calculate new totals based on calculatedDays
  //             const fullDays = Math.floor(calculatedDays)
  //             const fractionalDay = calculatedDays - fullDays

  //             let newBaseAmount = fullDays * baseAmountPerDay
  //             let newTaxAmount = fullDays * taxAmountPerDay
  //             let newFoodPlanWithTax = fullDays * foodPlanWithTaxPerDay
  //             let newFoodPlanWithoutTax = fullDays * foodPlanWithoutTaxPerDay

  //             // ✅ FIX: Only multiply by FULL days for pax
  //             let newPaxWithTax = fullDays * paxWithTaxPerDay
  //             let newPaxWithoutTax = fullDays * paxWithoutTaxPerDay

  //             // Add fractional day amounts (50%) - but NOT for pax
  //             if (fractionalDay > 0) {
  //               newBaseAmount += baseAmountPerDay * 0.5
  //               newTaxAmount += taxAmountPerDay * 0.5
  //               newFoodPlanWithTax += foodPlanWithTaxPerDay * 0.5
  //               newFoodPlanWithoutTax += foodPlanWithoutTaxPerDay * 0.5
  //               // ✅ NO pax charges for fractional day
  //             }

  //             return {
  //               ...room,
  //               stayDays: calculatedDays,
  //               baseAmount: Math.round(newBaseAmount * 100) / 100,
  //               taxAmount: Math.round(newTaxAmount * 100) / 100,
  //               baseAmountWithTax:
  //                 Math.round((newBaseAmount + newTaxAmount) * 100) / 100,
  //               foodPlanAmountWithTax:
  //                 Math.round(newFoodPlanWithTax * 100) / 100,
  //               foodPlanAmountWithOutTax:
  //                 Math.round(newFoodPlanWithoutTax * 100) / 100,
  //               additionalPaxAmountWithTax:
  //                 Math.round(newPaxWithTax * 100) / 100,
  //               additionalPaxAmountWithOutTax:
  //                 Math.round(newPaxWithoutTax * 100) / 100
  //             }
  //           }) || []

  //         return {
  //           ...checkout,
  //           checkOutDate: newDate,
  //           stayDays: calculatedDays,
  //           selectedRooms: updatedRooms
  //         }
  //       }
  //       return checkout
  //     })
  //   )
  // }

  // const handleStayDaysChange = (id, newDays) => {
  //   let newCheckoutDate = new Date(new Date().toISOString().split("T")[0])
  //   setCheckouts(
  //     checkouts.map((checkout) => {
  //       if (checkout._id === id) {
  //         // Allow empty string or incomplete decimal input
  //         if (newDays === "" || newDays === "." || newDays.endsWith(".")) {
  //           return {
  //             ...checkout,
  //             stayDays: newDays
  //           }
  //         }

  //         const stayDays = parseFloat(newDays)

  //         // Validate input
  //         if (isNaN(stayDays) || stayDays <= 0) {
  //           return {
  //             ...checkout,
  //             stayDays: newDays
  //           }
  //         }

  //         const fullDays = Math.floor(stayDays)
  //         const fractionalDay = stayDays - fullDays

  //         const originalCheckout = originalCheckouts.find((oc) => oc._id === id)

  //         if (!originalCheckout) {
  //           console.error("Original checkout data not found for id:", id)
  //           return checkout
  //         }

  //         const updatedRooms =
  //           checkout.selectedRooms?.map((room) => {
  //             const originalRoom = originalCheckout.selectedRooms?.find(
  //               (or) => or._id === room._id || or.roomName === room.roomName
  //             )

  //             if (!originalRoom) {
  //               console.error("Original room data not found for room:", room)
  //               return room
  //             }

  //             const originalStayDays =
  //               originalRoom.stayDays || originalCheckout.stayDays || 1
  //             const originalBaseAmount = originalRoom.baseAmount || 0
  //             const originalTaxAmount = originalRoom.taxAmount || 0
  //             const originalFoodPlanWithTax =
  //               originalRoom.foodPlanAmountWithTax || 0
  //             const originalFoodPlanWithoutTax =
  //               originalRoom.foodPlanAmountWithOutTax || 0
  //             const originalPaxWithTax =
  //               originalRoom.additionalPaxAmountWithTax || 0
  //             const originalPaxWithoutTax =
  //               originalRoom.additionalPaxAmountWithOutTax || 0

  //             console.log("Original Data:", {
  //               originalStayDays,
  //               originalBaseAmount,
  //               originalTaxAmount,
  //               stayDays
  //             })

  //             // Calculate daily rates from ORIGINAL totals
  //             const baseAmountPerDay = originalBaseAmount / originalStayDays
  //             const taxAmountPerDay = originalTaxAmount / originalStayDays
  //             const foodPlanWithTaxPerDay =
  //               originalFoodPlanWithTax / originalStayDays
  //             const foodPlanWithoutTaxPerDay =
  //               originalFoodPlanWithoutTax / originalStayDays

  //             // ✅ FIX: Calculate pax per day based on ORIGINAL FULL DAYS only
  //             const originalFullDays = Math.floor(originalStayDays)
  //             const paxWithTaxPerDay =
  //               originalFullDays > 0 ? originalPaxWithTax / originalFullDays : 0
  //             const paxWithoutTaxPerDay =
  //               originalFullDays > 0
  //                 ? originalPaxWithoutTax / originalFullDays
  //                 : 0

  //             // Calculate new totals: full days + fractional day
  //             let newBaseAmount = fullDays * baseAmountPerDay
  //             let newTaxAmount = fullDays * taxAmountPerDay
  //             let newFoodPlanWithTax = fullDays * foodPlanWithTaxPerDay
  //             let newFoodPlanWithoutTax = fullDays * foodPlanWithoutTaxPerDay

  //             // ✅ FIX: Only multiply by FULL days for pax
  //             let newPaxWithTax = fullDays * paxWithTaxPerDay
  //             let newPaxWithoutTax = fullDays * paxWithoutTaxPerDay

  //             // Add fractional day amounts (50%) - but NOT for pax
  //             if (fractionalDay > 0) {
  //               newBaseAmount += baseAmountPerDay * 0.5
  //               newTaxAmount += taxAmountPerDay * 0.5
  //               newFoodPlanWithTax += foodPlanWithTaxPerDay * 0.5
  //               newFoodPlanWithoutTax += foodPlanWithoutTaxPerDay * 0.5
  //               // ✅ NO pax charges for fractional day
  //             }

  //             console.log("Calculated New Amounts:", {
  //               newBaseAmount,
  //               newTaxAmount,
  //               newPaxWithTax,
  //               newPaxWithoutTax,
  //               baseAmountPerDay,
  //               fullDays,
  //               fractionalDay
  //             })

  //             return {
  //               ...room,
  //               stayDays: stayDays,
  //               baseAmount: Math.round(newBaseAmount * 100) / 100,
  //               taxAmount: Math.round(newTaxAmount * 100) / 100,
  //               baseAmountWithTax:
  //                 Math.round((newBaseAmount + newTaxAmount) * 100) / 100,
  //               foodPlanAmountWithTax:
  //                 Math.round(newFoodPlanWithTax * 100) / 100,
  //               foodPlanAmountWithOutTax:
  //                 Math.round(newFoodPlanWithoutTax * 100) / 100,
  //               additionalPaxAmountWithTax:
  //                 Math.round(newPaxWithTax * 100) / 100,
  //               additionalPaxAmountWithOutTax:
  //                 Math.round(newPaxWithoutTax * 100) / 100
  //             }
  //           }) || []

  //         // Calculate new checkout date
  //         const arrival = new Date(checkout.arrivalDate)
  //         newCheckoutDate = new Date(arrival)
  //         const daysToAdd = Math.floor(stayDays)
  //         newCheckoutDate.setDate(arrival.getDate() + daysToAdd)

  //         return {
  //           ...checkout,
  //           selectedRooms: updatedRooms,
  //           stayDays: stayDays,
  //           checkOutDate: newCheckoutDate.toISOString().split("T")[0]
  //         }
  //       }
  //       return checkout
  //     })
  //   )
  //   setCheckOutDateTracker(newCheckoutDate.toISOString().split("T")[0])
  // }

  const handleConfirm = () => {
    console.log(checkouts)
    onClose(checkouts)
  }

  const handleCancel = () => {
    setCheckouts(JSON.parse(JSON.stringify(checkouts)))
    onClose(null)
  }

  
  // console.log(checkouts[0]?.);
console.log(checkouts)
  return (
    <div className="border rounded-md bg-white overflow-hidden m-3">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Voucher</th>
            <th className="p-2 text-left">Checkout Date</th>
            <th className="p-2 text-left">Days</th>
          </tr>
        </thead>

        <tbody>
          {checkouts.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-2">{c.voucherNumber}</td>

              <td className="p-2">
                <input
                  type="date"
                  value={c.checkOutDate}
                  onChange={(e) => onDateChange(c._id, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </td>

              <td className="p-2">
                <input
                  type="number"
                  step="0.5"
                  value={c.stayDays}
                  onChange={(e) => onDaysChange(c._id, e.target.value)}
                  className="border rounded px-2 py-1 w-24"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    //   <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
    //     <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
    //       <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
    //         <Calendar size={18} />
    //         Update Checkout Dates
    //       </h2>
    //       <button
    //         onClick={handleCancel}
    //         className="text-gray-400 hover:text-gray-600 transition-colors p-1"
    //       >
    //         <X size={20} />
    //       </button>
    //     </div>

    //     <div className="flex-1 overflow-auto">
    //       <div className="min-w-full">
    //         <table className="w-full text-sm">
    //           <thead className="bg-gray-100 sticky top-0">
    //             <tr>
    //               <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
    //                 Voucher
    //               </th>
    //                 <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
    //                 Actual CheckIn Date
    //               </th>
    //               <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
    //                 Actual CheckOut Date
    //               </th>
    //               <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
    //                 New Date
    //               </th>
    //               <th className="text-left py-2 px-3 font-medium text-gray-700 text-xs uppercase tracking-wider">
    //                 Days
    //               </th>
    //             </tr>
    //           </thead>
    //           <tbody className="divide-y divide-gray-100">
    //             {checkouts.map((checkout, index) => (
    //               <tr
    //                 key={checkout._id}
    //                 className={`${
    //                   index % 2 === 0 ? "bg-white" : "bg-gray-50"
    //                 } hover:bg-blue-50 transition-colors`}
    //               >
    //                 <td className="py-2 px-3">
    //                   <div className="font-medium text-gray-900 text-sm">
    //                     {checkout.voucherNumber}
    //                   </div>
    //                 </td>
    //                 <td className="py-2 px-3">
    //                   <div className="flex items-center gap-1">
    //                     <Calendar size={14} className="text-gray-400" />
    //                     <span className="text-gray-700 text-sm">
    //                       {new Date(checkout.arrivalDate).toLocaleDateString(
    //                         "en-GB",
    //                         {
    //                           day: "2-digit",
    //                           month: "short",
    //                           year: "2-digit",
    //                         }
    //                       )}
    //                     </span>
    //                   </div>
    //                 </td>
    //                 <td className="py-2 px-3">
    //                   <div className="flex items-center gap-1">
    //                     <Calendar size={14} className="text-gray-400" />
    //                     <span className="text-gray-700 text-sm">
    //                       {new Date(checkOutDateOld).toLocaleDateString(
    //                         "en-GB",
    //                         {
    //                           day: "2-digit",
    //                           month: "short",
    //                           year: "2-digit",
    //                         }
    //                       )}
    //                     </span>
    //                   </div>
    //                 </td>

    //                 <td className="py-2 px-3">
    //                   <input
    //                     type="date"
    //                     value={checkOutDateTracker}
    //                     onChange={(e) =>
    //                       handleNewDateChange(checkout._id, e.target.value)
    //                     }
    //                     className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    //                   />
    //                 </td>

    //                 <td className="py-2 px-3">
    //                   <div className="flex items-center gap-2">
    //                     <input
    //                       type="number"
    //                       value={checkout.stayDays || ""}
    //                       onChange={(e) =>
    //                         handleStayDaysChange(checkout._id, e.target.value)
    //                       }
    //                       className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
    //                       min="0.5"
    //                       step="0.5"
    //                       placeholder="0"
    //                     />
    //                     <span className="text-xs text-gray-500">days</span>
    //                   </div>
    //                 </td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>

    //     {checkouts.length === 0 && (
    //       <div className="flex-1 flex items-center justify-center py-8 text-gray-500">
    //         <div className="text-center">
    //           <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
    //           <p>No checkout dates available</p>
    //         </div>
    //       </div>
    //     )}

    //     <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
    //       <button
    //         onClick={handleCancel}
    //         className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
    //       >
    //         Cancel
    //       </button>
    //       <button
    //         onClick={handleConfirm}
    //         className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
    //       >
    //         Update Dates
    //       </button>
    //       <div className="text-xs text-gray-500 flex items-center px-2">
    //         {checkouts.length} items
    //       </div>
    //     </div>
    //   </div>
    // </div>
  )
}
