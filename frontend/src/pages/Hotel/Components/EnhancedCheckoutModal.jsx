/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { X, Users, DoorOpen, Trash2 } from "lucide-react"
import CustomerSearchInputBox from "../Components/CustomerSearchInPutBox"
import CheckoutDateModal from "./CheckoutDateModal"

export default function EnhancedCheckoutModal({
  isOpen = true,
  onClose,
  selectedCheckIns = [],
  onConfirm,
  checkoutMode
}) {
  console.log("hfafffff")
  // State to manage room-customer assignments
  const [roomAssignments, setRoomAssignments] = useState([])
  const [errors, setErrors] = useState({})
  const [checkOutDateTracker, setCheckOutDateTracker] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [checkouts, setCheckouts] = useState(
    selectedCheckIns.length > 0
      ? selectedCheckIns.map((checkout) => {
          const arrival = new Date(checkout.arrivalDate)
          const checkoutDate = new Date(checkOutDateTracker)
          const diffTime = checkoutDate - arrival
          const calculatedDays =
            diffTime === 0 ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true // 12-hour format
          })

          checkout.selectedRooms.forEach((room) => {
            room.stayDays = calculatedDays
          })

          return {
            ...checkout,
            stayDays: calculatedDays,
            checkOutTime: time,
            checkOutDate: checkOutDateTracker
          }
        })
      : [
          {
            _id: "1",
            checkOutDate: "2024-01-15",
            arrivalDate: "2024-01-10",
            voucherNumber: "V001",
            stayDays: 2.5,
            selectedRooms: [
              { _id: "r1", roomName: "101", priceLevelRate: 2000 }
            ]
          }
        ]
  )
  const [originalCheckouts] = useState(() =>
    selectedCheckIns.length > 0 ? JSON.parse(JSON.stringify(selectedCheckIns)) : []
  )

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
          selectedCustomer: checkIn.selectedCustomer
            ? checkIn.selectedCustomer
            : checkIn.customerId // Default to original customer
        }))
      )

      setRoomAssignments(allRooms)
    }
  }, [selectedCheckIns])

  // Handle customer selection for a specific room
  const handleCustomerSelect = (index, customer) => {
    const updated = [...roomAssignments]
    updated[index].selectedCustomer = customer
    setRoomAssignments(updated)

    // Clear error for this room if exists
    const newErrors = { ...errors }
    delete newErrors[index]
    setErrors(newErrors)
  }

  // Remove a room from checkout (partial checkout)
  const handleRemoveRoom = (index) => {
    const updated = roomAssignments.filter((_, i) => i !== index)
    setRoomAssignments(updated)
  }

  // Add room back if needed
  // const handleAddRoom = (checkInId, room) => {
  //   setRoomAssignments([
  //     ...roomAssignments,
  //     {
  //       checkInId,
  //       checkInNumber: room.voucherNumber,
  //       roomId: room._id,
  //       roomName: room.roomName,
  //       roomType: room.roomType?.brand || "Standard",
  //       originalCustomer: room.originalCustomer,
  //       selectedCustomer: room.originalCustomer,
  //     },
  //   ]);
  // };

  // Validate before proceeding
  const validateAssignments = () => {
    const newErrors = {}
    roomAssignments.forEach((assignment, index) => {
      if (!assignment.selectedCustomer || !assignment.selectedCustomer._id) {
        newErrors[index] = "Please select a customer for this room"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle proceed to checkout
  const handleProceed = () => {
    if (!validateAssignments()) {
      return
    }
    // Step 1: Check if all selectedCustomer are same
    const firstCustomer = roomAssignments[0]?.selectedCustomer
    const isSameCustomer = roomAssignments.every(
      (item) => item.selectedCustomer._id === firstCustomer._id
    )

    let result
    console.log("HHHh")
    if (isSameCustomer) {
      console.log("HHHhh")
      // 🔥 Merge ALL into ONE customer
      const checkInMap = {}

      roomAssignments.forEach((assignment) => {
        if (!checkInMap[assignment.checkInId]) {
          const originalCheckIn = selectedCheckIns.find(
            (ci) => ci._id === assignment.checkInId
          )

          checkInMap[assignment.checkInId] = {
            checkInId: assignment.checkInId,
            checkInNumber: assignment.checkInNumber,
            originalCheckIn,
            rooms: []
          }
        }

        checkInMap[assignment.checkInId].rooms.push({
          roomId: assignment.roomId,
          roomName: assignment.roomName,
          roomType: assignment.roomType
        })
      })

      result = [
        {
          customerId: firstCustomer._id,
          customerName: firstCustomer.partyName,
          customer: firstCustomer,
          checkIns: Object.values(checkInMap)
        }
      ]
    } else {
      // 🔵 fallback → group by customers (old logic)
      const grouped = {}
      console.log(roomAssignments)
      console.log(roomAssignments.length)
      roomAssignments.forEach((assignment) => {
        const customerId = assignment.selectedCustomer._id

        if (!grouped[customerId]) {
          grouped[customerId] = {
            customer: assignment.selectedCustomer,
            checkIns: []
          }
        }

        let checkInGroup = grouped[customerId].checkIns.find(
          (ci) => ci.checkInId === assignment.checkInId
        )

        if (!checkInGroup) {
          const originalCheckIn = selectedCheckIns.find(
            (ci) => ci._id === assignment.checkInId
          )

          checkInGroup = {
            checkInId: assignment.checkInId,
            checkInNumber: assignment.checkInNumber,
            originalCheckIn,
            rooms: []
          }

          grouped[customerId].checkIns.push(checkInGroup)
        }

        checkInGroup.rooms.push({
          roomId: assignment.roomId,
          roomName: assignment.roomName,
          roomType: assignment.roomType
        })
      })

      result = Object.values(grouped).map((group) => ({
        customerId: group.customer._id,
        customerName: group.customer.partyName,
        customer: group.customer,
        checkIns: group.checkIns
      }))
    }

    console.log(result)

    onConfirm(result)
  }

  if (!isOpen) return null

  // Get all available rooms (not currently in assignments)
  selectedCheckIns.flatMap((checkIn) =>
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
        originalCustomer: checkIn.customerId
      }))
  )
  const handleCloseBasedOnDate = () => {}
  const handleNewDateChange = (id, newDate) => {
console.log(id,newDate)
    setCheckOutDateTracker(newDate)
    setCheckouts(
      checkouts.map((checkout) => {
        if (checkout._id === id) {
          const arrival = new Date(checkout.arrivalDate)
          const checkoutDate = new Date(newDate)
          const diffTime = checkoutDate - arrival
          const calculatedDays =
            diffTime === 0 ? 1 : Math.ceil(diffTime / (1000 * 60 * 60 * 24))

          const originalCheckout = originalCheckouts.find((oc) => oc._id === id)
          if (!originalCheckout) return checkout

          const updatedRooms =
            checkout.selectedRooms?.map((room) => {
              const originalRoom = originalCheckout.selectedRooms?.find(
                (or) => or._id === room._id || or.roomName === room.roomName
              )

              if (!originalRoom) return room

              const originalStayDays =
                originalRoom.stayDays || originalCheckout.stayDays || 1
              const originalBaseAmount = originalRoom.baseAmount || 0
              const originalTaxAmount = originalRoom.taxAmount || 0
              const originalFoodPlanWithTax =
                originalRoom.foodPlanAmountWithTax || 0
              const originalFoodPlanWithoutTax =
                originalRoom.foodPlanAmountWithOutTax || 0
              const originalPaxWithTax =
                originalRoom.additionalPaxAmountWithTax || 0
              const originalPaxWithoutTax =
                originalRoom.additionalPaxAmountWithOutTax || 0

              // Calculate daily rates from ORIGINAL totals
              const baseAmountPerDay = originalBaseAmount / originalStayDays
              const taxAmountPerDay = originalTaxAmount / originalStayDays
              const foodPlanWithTaxPerDay =
                originalFoodPlanWithTax / originalStayDays
              const foodPlanWithoutTaxPerDay =
                originalFoodPlanWithoutTax / originalStayDays

              // ✅ FIX: Calculate pax per day based on ORIGINAL FULL DAYS only
              const originalFullDays = Math.floor(originalStayDays)
              const paxWithTaxPerDay =
                originalFullDays > 0 ? originalPaxWithTax / originalFullDays : 0
              const paxWithoutTaxPerDay =
                originalFullDays > 0
                  ? originalPaxWithoutTax / originalFullDays
                  : 0

              // Calculate new totals based on calculatedDays
              const fullDays = Math.floor(calculatedDays)
              const fractionalDay = calculatedDays - fullDays

              let newBaseAmount = fullDays * baseAmountPerDay
              let newTaxAmount = fullDays * taxAmountPerDay
              let newFoodPlanWithTax = fullDays * foodPlanWithTaxPerDay
              let newFoodPlanWithoutTax = fullDays * foodPlanWithoutTaxPerDay

              // ✅ FIX: Only multiply by FULL days for pax
              let newPaxWithTax = fullDays * paxWithTaxPerDay
              let newPaxWithoutTax = fullDays * paxWithoutTaxPerDay

              // Add fractional day amounts (50%) - but NOT for pax
              if (fractionalDay > 0) {
                newBaseAmount += baseAmountPerDay * 0.5
                newTaxAmount += taxAmountPerDay * 0.5
                newFoodPlanWithTax += foodPlanWithTaxPerDay * 0.5
                newFoodPlanWithoutTax += foodPlanWithoutTaxPerDay * 0.5
                // ✅ NO pax charges for fractional day
              }

              return {
                ...room,
                stayDays: calculatedDays,
                baseAmount: Math.round(newBaseAmount * 100) / 100,
                taxAmount: Math.round(newTaxAmount * 100) / 100,
                baseAmountWithTax:
                  Math.round((newBaseAmount + newTaxAmount) * 100) / 100,
                foodPlanAmountWithTax:
                  Math.round(newFoodPlanWithTax * 100) / 100,
                foodPlanAmountWithOutTax:
                  Math.round(newFoodPlanWithoutTax * 100) / 100,
                additionalPaxAmountWithTax:
                  Math.round(newPaxWithTax * 100) / 100,
                additionalPaxAmountWithOutTax:
                  Math.round(newPaxWithoutTax * 100) / 100
              }
            }) || []

          return {
            ...checkout,
            checkOutDate: newDate,
            stayDays: calculatedDays,
            selectedRooms: updatedRooms
          }
        }
        return checkout
      })
    )
  }
  const handleStayDaysChange = (id, newDays) => {
    let newCheckoutDate = new Date(new Date().toISOString().split("T")[0])
    setCheckouts(
      checkouts.map((checkout) => {
        if (checkout._id === id) {
          // Allow empty string or incomplete decimal input
          if (newDays === "" || newDays === "." || newDays.endsWith(".")) {
            return {
              ...checkout,
              stayDays: newDays
            }
          }

          const stayDays = parseFloat(newDays)

          // Validate input
          if (isNaN(stayDays) || stayDays <= 0) {
            return {
              ...checkout,
              stayDays: newDays
            }
          }

          const fullDays = Math.floor(stayDays)
          const fractionalDay = stayDays - fullDays

          const originalCheckout = originalCheckouts.find((oc) => oc._id === id)

          if (!originalCheckout) {
            console.error("Original checkout data not found for id:", id)
            return checkout
          }

          const updatedRooms =
            checkout.selectedRooms?.map((room) => {
              const originalRoom = originalCheckout.selectedRooms?.find(
                (or) => or._id === room._id || or.roomName === room.roomName
              )

              if (!originalRoom) {
                console.error("Original room data not found for room:", room)
                return room
              }

              const originalStayDays =
                originalRoom.stayDays || originalCheckout.stayDays || 1
              const originalBaseAmount = originalRoom.baseAmount || 0
              const originalTaxAmount = originalRoom.taxAmount || 0
              const originalFoodPlanWithTax =
                originalRoom.foodPlanAmountWithTax || 0
              const originalFoodPlanWithoutTax =
                originalRoom.foodPlanAmountWithOutTax || 0
              const originalPaxWithTax =
                originalRoom.additionalPaxAmountWithTax || 0
              const originalPaxWithoutTax =
                originalRoom.additionalPaxAmountWithOutTax || 0

              console.log("Original Data:", {
                originalStayDays,
                originalBaseAmount,
                originalTaxAmount,
                stayDays
              })

              // Calculate daily rates from ORIGINAL totals
              const baseAmountPerDay = originalBaseAmount / originalStayDays
              const taxAmountPerDay = originalTaxAmount / originalStayDays
              const foodPlanWithTaxPerDay =
                originalFoodPlanWithTax / originalStayDays
              const foodPlanWithoutTaxPerDay =
                originalFoodPlanWithoutTax / originalStayDays

              // ✅ FIX: Calculate pax per day based on ORIGINAL FULL DAYS only
              const originalFullDays = Math.floor(originalStayDays)
              const paxWithTaxPerDay =
                originalFullDays > 0 ? originalPaxWithTax / originalFullDays : 0
              const paxWithoutTaxPerDay =
                originalFullDays > 0
                  ? originalPaxWithoutTax / originalFullDays
                  : 0

              // Calculate new totals: full days + fractional day
              let newBaseAmount = fullDays * baseAmountPerDay
              let newTaxAmount = fullDays * taxAmountPerDay
              let newFoodPlanWithTax = fullDays * foodPlanWithTaxPerDay
              let newFoodPlanWithoutTax = fullDays * foodPlanWithoutTaxPerDay

              // ✅ FIX: Only multiply by FULL days for pax
              let newPaxWithTax = fullDays * paxWithTaxPerDay
              let newPaxWithoutTax = fullDays * paxWithoutTaxPerDay

              // Add fractional day amounts (50%) - but NOT for pax
              if (fractionalDay > 0) {
                newBaseAmount += baseAmountPerDay * 0.5
                newTaxAmount += taxAmountPerDay * 0.5
                newFoodPlanWithTax += foodPlanWithTaxPerDay * 0.5
                newFoodPlanWithoutTax += foodPlanWithoutTaxPerDay * 0.5
                // ✅ NO pax charges for fractional day
              }

              console.log("Calculated New Amounts:", {
                newBaseAmount,
                newTaxAmount,
                newPaxWithTax,
                newPaxWithoutTax,
                baseAmountPerDay,
                fullDays,
                fractionalDay
              })

              return {
                ...room,
                stayDays: stayDays,
                baseAmount: Math.round(newBaseAmount * 100) / 100,
                taxAmount: Math.round(newTaxAmount * 100) / 100,
                baseAmountWithTax:
                  Math.round((newBaseAmount + newTaxAmount) * 100) / 100,
                foodPlanAmountWithTax:
                  Math.round(newFoodPlanWithTax * 100) / 100,
                foodPlanAmountWithOutTax:
                  Math.round(newFoodPlanWithoutTax * 100) / 100,
                additionalPaxAmountWithTax:
                  Math.round(newPaxWithTax * 100) / 100,
                additionalPaxAmountWithOutTax:
                  Math.round(newPaxWithoutTax * 100) / 100
              }
            }) || []

          // Calculate new checkout date
          const arrival = new Date(checkout.arrivalDate)
          newCheckoutDate = new Date(arrival)
          const daysToAdd = Math.floor(stayDays)
          newCheckoutDate.setDate(arrival.getDate() + daysToAdd)

          return {
            ...checkout,
            selectedRooms: updatedRooms,
            stayDays: stayDays,
            checkOutDate: newCheckoutDate.toISOString().split("T")[0]
          }
        }
        return checkout
      })
    )
    setCheckOutDateTracker(newCheckoutDate.toISOString().split("T")[0])
  }
  console.log(selectedCheckIns)

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
                  disabled={checkoutMode === "single"}
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
        <CheckoutDateModal
          onDaysChange={handleStayDaysChange}
          checkouts={checkouts}
          onDateChange={handleNewDateChange}
        />

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
  )
}
