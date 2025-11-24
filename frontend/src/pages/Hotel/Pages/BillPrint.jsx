import { useEffect, useState, useRef, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { useReactToPrint } from "react-to-print"
import api from "@/api/api"
import Logo from "../../../assets/images/hill.png"
import TitleDiv from "@/components/common/TitleDiv"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
// import {
//   handlePrintInvoice,
//   handleDownloadPDF,
// } from "../PrintSide/generateHotelInvoicePDF ";
import {
  handleBillPrintInvoice,
  handleBillDownloadPDF
} from "../PrintSide/generateBillPrintPDF"
import Outstanding from "@/pages/voucherReports/outstanding/Outstanding"
// import { Title } from "@radix-ui/react-dialog";

const HotelBillPrint = () => {
  // Router and Redux state
  const location = useLocation()
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  )
  const navigate = useNavigate()

  // Props from location state
  const selectedCheckOut = location.state?.selectedCheckOut || []
console.log(selectedCheckOut)
const a=selectedCheckOut.some((it)=>it.originalCheckInId)
console.log(a)
  const checkoutmode = location?.state?.checkoutMode || null
  const cheinids = location?.state?.checkinIds

  // const selectedCustomerId = location.state?.customerId;
  const isForPreview = location.state?.isForPreview

  // Component state (global for fetch results used across docs)
  const [outStanding, setOutStanding] = useState([])
  const [kotData, setKotData] = useState([])
  const [showSplitPopUp, setShowSplitPopUp] = useState(false)
  const [selected, setSelected] = useState("default")
  const printReference = useRef(null)

  // Fetch debit and KOT once for all docs shown
  const fetchDebitData = async (data) => {
    try {
      const res = await api.post(
        `/api/sUsers/fetchOutStandingAndFoodData`,
        { data },
        { withCredentials: true }
      )
      if (res.data.success) {
        console.log(res.data.data)
        setOutStanding(res.data.data || [])
        setKotData(res.data.kotData || [])
      }
    } catch (error) {
      toast.error(error.message)
      console.error("Error fetching debit data:", error)
    }
  }

  useEffect(() => {
    if (selectedCheckOut?.length > 0) {
console.log(selectedCheckOut)
      fetchDebitData(selectedCheckOut)
    }
  }, [selectedCheckOut])

  // Split handlers
  const handleSplitPayment = () => setShowSplitPopUp(true)
  const handleChange = (value) => setSelected(value)
  const handleSplit = () => {
    setShowSplitPopUp(false)
    if (selected === "room") {
      setKotData([])
    } else if (selected === "restaurant") {
      setOutStanding([])
    }
  }

  // Utils
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Per-doc transforms
  const transformDocToDateWiseLines = (doc) => {
    const result = []
    const startDate = new Date(doc.arrivalDate)
    ;(doc.selectedRooms || []).forEach((room) => {
      const stayDays = room.stayDays || 1
      const fullDays = Math.floor(stayDays)
      const fractionalDay = stayDays - fullDays

      const perDayAmount =
        Number(room.priceLevelRate || 0) ||
        Number(room.baseAmountWithTax || 0) / stayDays
      const baseAmountPerDay = Number(room.baseAmount || 0) / stayDays
      const taxAmountPerDay = Number(room.taxAmount || 0) / stayDays
      const foodPlanAmountWithTaxPerDay =
        Number(room.foodPlanAmountWithTax || 0) / stayDays
      const foodPlanAmountWithOutTaxPerDay =
        Number(room.foodPlanAmountWithOutTax || 0) / stayDays
      const additionalPaxDataWithTaxPerDay =
        Number(room.additionalPaxAmountWithTax || 0) / stayDays
      const additionalPaxDataWithOutTaxPerDay =
        Number(room.additionalPaxAmountWithOutTax || 0) / stayDays

      for (let i = 0; i < fullDays; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)
        const formattedDate = currentDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")

        result.push({
          date: formattedDate,
          description: `Room Rent - Room ${room.roomName}`,
          docNo: doc.voucherNumber,
          amount: baseAmountPerDay,
          baseAmountWithTax: perDayAmount,
          baseAmount: baseAmountPerDay,
          taxAmount: taxAmountPerDay,
          voucherNumber: doc.voucherNumber,
          roomName: room.roomName,
          hsn: room?.hsnDetails?.hsn,
          customerName: doc.customerId?.partyName,
          foodPlanAmountWithTax: foodPlanAmountWithTaxPerDay,
          foodPlanAmountWithOutTax: foodPlanAmountWithOutTaxPerDay,
          additionalPaxDataWithTax: additionalPaxDataWithTaxPerDay,
          additionalPaxDataWithOutTax: additionalPaxDataWithOutTaxPerDay,
          roomId: room?.roomId || room?._id
        })
      }

      if (fractionalDay > 0) {
        const fractionalDate = new Date(startDate)
        fractionalDate.setDate(startDate.getDate() + fullDays)
        const formattedFractionalDate = fractionalDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-")

        result.push({
          date: formattedFractionalDate,
          description: `Room Rent - Room ${room.roomName} (Half Day)`,
          docNo: doc.voucherNumber,
          amount: baseAmountPerDay * 0.5,
          baseAmountWithTax: perDayAmount * 0.5,
          baseAmount: baseAmountPerDay * 0.5,
          taxAmount: taxAmountPerDay * 0.5,
          voucherNumber: doc.voucherNumber,
          roomName: room.roomName,
          hsn: room?.hsnDetails?.hsn,
          customerName: doc.customerId?.partyName,
          foodPlanAmountWithTax: foodPlanAmountWithTaxPerDay * 0.5,
          foodPlanAmountWithOutTax: foodPlanAmountWithOutTaxPerDay * 0.5,
          additionalPaxDataWithTax: additionalPaxDataWithTaxPerDay * 0.5,
          additionalPaxDataWithOutTax: additionalPaxDataWithOutTaxPerDay * 0.5,
          roomId: room?.roomId || room?._id
        })
      }
    })

    return result
  }

  // Per-doc KOT totals aggregation helper
  const getKotTotalsByRoom = (kots = []) => {
    const map = new Map()
    kots.forEach((kot) => {
      const roomId = kot?.kotDetails?.roomId
      if (!roomId) return
      const amount = Number(
        kot?.finalAmount ?? kot?.subTotal ?? kot?.total ?? 0
      )
      const key = String(roomId)
      map.set(key, (map.get(key) ?? 0) + amount)
    })
    return map
  }

  // Build per-room restaurant line for a doc’s rooms only
  const buildPerRoomRestaurantLinesForDoc = (doc) => {
console.log(doc)
    const roomIdSet = new Set(
      (doc.selectedRooms || [])
        .map((r) => String(r?.roomId || r?._id))
        .filter(Boolean)
    )

    const filteredKots = (kotData || []).filter((k) =>
      roomIdSet.has(String(k?.kotDetails?.roomId || ""))
    )

    const kotTotalsByRoom = getKotTotalsByRoom(filteredKots)

    const lines = []
    for (const [roomId, amount] of kotTotalsByRoom.entries()) {
      const roomName =
        (doc.selectedRooms || []).find(
          (r) => String(r?.roomId || r?._id) === roomId
        )?.roomName || ""
      const firstKot = filteredKots.find(
        (k) => String(k?.kotDetails?.roomId) === roomId
      )
      const docNo = firstKot?.salesNumber || "-"

      lines.push({
        date: formatDate(new Date()),
        description: `Restaurant - Room ${roomName}`,
        docNo,
        amount: Number(amount || 0),
        taxes: 0,
        advance: "",
        roomName,
        roomId
      })
    }
    return lines
  }

  // Helpers to decide where to show advances
  const docOwnsAdvances = (doc) => {
    const originalId = doc?.originalCustomerId
    const custId = doc?.customerId?._id || doc?.customerId
    if (!custId) return false
    // If originalId exists, match it; if not provided, treat as original/primary and allow
    return originalId ? String(originalId) === String(custId) : true
  }

  const findFirstPrimaryIdx = (docs) => {
    const idx = (docs || []).findIndex((d) => docOwnsAdvances(d))
    return idx >= 0 ? idx : 0
  }

  // Build bill payload per doc; gate advances via useAdvances
  const prepareBillDataForDoc = (doc, useAdvances) => {
    // Lines from room stay
    const dateWiseLines = transformDocToDateWiseLines(doc)

    // Totals for room parts
    const roomTariffTotal = dateWiseLines.reduce(
      (t, i) => t + Number(i.baseAmount || 0),
      0
    )
    const planAmount = dateWiseLines.reduce(
      (t, i) => t + Number(i.foodPlanAmountWithOutTax || 0),
      0
    )
    const additionalPaxAmount = dateWiseLines.reduce(
      (t, i) => t + Number(i.additionalPaxDataWithOutTax || 0),
      0
    )
    const roomTaxTotal = dateWiseLines.reduce(
      (t, i) => t + Number(i.taxAmount || 0),
      0
    )
    const sgstAmount = roomTaxTotal / 2
    const cgstAmount = roomTaxTotal / 2

    // Per-room restaurant lines (for this doc’s rooms)
    const perRoomRestaurantLines = buildPerRoomRestaurantLinesForDoc(doc)
    const restaurantTotal = perRoomRestaurantLines.reduce(
      (t, l) => t + Number(l.amount || 0),
      0
    )

    // Build grouped charges
    const groupedRoomCharges = (() => {
      const charges = []
      const groups = {}
      dateWiseLines.forEach((i) => {
        const k = i.roomName
        if (!groups[k]) groups[k] = []
        groups[k].push(i)
      })

      Object.keys(groups).forEach((roomName) => {
        const roomDays = groups[roomName]

        roomDays.forEach((item) => {
          charges.push({
            date: item.date,
            description: item.description,
            docNo: item.docNo || "-",
            amount:
              (item.baseAmount || 0) +
              (item.additionalPaxDataWithOutTax || 0) +
              (item.foodPlanAmountWithOutTax || 0),
            taxes: (item.taxAmount || 0).toFixed(2),
            advance: "",
            roomName: item.roomName
          })
        })

        const roomTotalTax = roomDays.reduce(
          (sum, i) => sum + (i.taxAmount || 0),
          0
        )
        const roomCGST = roomTotalTax / 2
        const roomSGST = roomTotalTax / 2

        if (roomCGST > 0) {
          charges.push({
            date: formatDate(new Date()),
            description: `CGST on Rent@6% (${roomName})`,
            docNo: "-",
            amount: 0,
            taxes: roomCGST.toFixed(2),
            advance: "",
            roomName
          })
        }

        if (roomSGST > 0) {
          charges.push({
            date: formatDate(new Date()),
            description: `SGST on Rent@6% (${roomName})`,
            docNo: "-",
            amount: 0,
            taxes: roomSGST.toFixed(2),
            advance: "",
            roomName
          })
        }

        const roomKot = perRoomRestaurantLines.find(
          (l) => l.roomName === roomName
        )
        if (roomKot && Number(roomKot.amount) > 0) {
          charges.push({
            date: roomKot.date,
            description: roomKot.description,
            docNo: roomKot.docNo,
            amount: roomKot.amount,
            taxes: 0,
            advance: "",
            roomName
          })
        }
      })

      return charges
    })()
console.log(doc)
// const a=doc.some((item)=>item.originalCheckInId)
console.log(a)
console.log(doc.customerId?.party_master_id)
console.log(doc.originalCustomerId)
console.log(doc.originalCheckInId)
console.log(doc.customerId.party_master_id)
console.log(outStanding)
console.log(Outstanding.length)
    // Advances only on the decided bill
    const advanceEntries = useAdvances
      ? (outStanding || []).filter((item)=>doc.customerId?.party_master_id===item?.party_id).map((t) => ({
          date: formatDate(t.bill_date || t.billdate || new Date()),
          description: "Advance",
          docNo: t.bill_no || t.billno || "-",
          amount: -Math.abs(t.bill_amount || t.billamount || 0),
          taxes: "",
          advance: Math.abs(t.bill_amount || t.billamount || 0).toFixed(2)
        }))
      : []

    const advanceTotal = useAdvances
      ? (outStanding || []).filter((item)=>doc.customerId?.party_master_id===item?.party_id).reduce(
          (sum, t) => sum + Number(t.bill_amount || t.billamount || 0),
          0
        )
      : 0
console.log(advanceEntries)
    // Combine charges and compute balances
    const allCharges = [...groupedRoomCharges, ...advanceEntries]
    console.log(allCharges)
    let cumulativeBalance = 0
    const chargesWithBalance = allCharges.map((charge) => {
      let currentAmount = Number(charge.amount || 0)
      const lineTaxes = Number(charge.taxes || 0)

      if (String(charge.description).includes("Room Rent")) {
        cumulativeBalance += currentAmount + lineTaxes
      } else if (charge.description === "Advance") {
        cumulativeBalance += currentAmount
      } else if (
        String(charge.description).includes("CGST") ||
        String(charge.description).includes("SGST")
      ) {
        // don't add amount (0) again
      } else {
        cumulativeBalance += currentAmount
      }

      return {
        ...charge,
        balance: Number.isFinite(cumulativeBalance)
          ? cumulativeBalance.toFixed(2)
          : "0.00"
      }
    })
    console.log(chargesWithBalance)

    const grandTotal =
      roomTariffTotal +
      planAmount +
      additionalPaxAmount +
      roomTaxTotal +
      restaurantTotal
    const netPay = grandTotal - advanceTotal

    // Compose hotel/guest info per doc
    const guestRooms = (doc.selectedRooms || [])
      .map((r) => r.roomName)
      .join(", ")
    const pax =
      (doc.selectedRooms || []).reduce(
        (acc, curr) => acc + Number(curr.pax || 0),
        0
      ) || 1

    const convertNumberToWords = (amount) =>
      `${Math.round(amount || 0)} Rupees Only`

    return {
      hotel: {
        name: organization?.name,
        address:
          `${organization?.flat || ""} ${organization?.road || ""} ${
            organization?.landmark || ""
          }`.trim() || "Erattayar road, Kattapana, Kerala India",
        phone: organization?.mobile,
        email: organization?.email,
        website: organization?.website,
        pan: organization?.pan,
        gstin: organization?.gstNum,
        sacCode: "996311",
        logo: organization?.logo
      },
      guest: {
        name: doc?.customerId?.partyName,
        roomNo: guestRooms,
        billNo: doc?.voucherNumber,
        travelAgent: doc?.agentId?.name,
        address: doc?.customerId?.billingAddress || "",
        phone: doc?.customerId?.mobileNumber || "",
        gstNo: doc?.customerId?.gstNo || ""
      },
      stay: {
        billDate: formatDate(new Date()),
        arrival: `${formatDate(doc?.arrivalDate)} ${doc?.arrivalTime || ""}`,
        departure: `${formatDate(doc?.checkOutDate || new Date())} ${
          doc?.checkOutTime || new Date().toLocaleTimeString()
        }`,
        days: doc?.selectedRooms?.[0]?.stayDays,
        plan: planAmount,
        pax,
        tariff: doc?.selectedRooms?.[0]?.baseAmount || 0
      },
      charges: chargesWithBalance,
      summary: {
        roomRent: roomTariffTotal,
        sgst: sgstAmount,
        cgst: cgstAmount,
        restaurant: restaurantTotal,
        roomService: 0,
        foodPlan: planAmount,
        additionalPax: additionalPaxAmount,
        total: grandTotal,
        totalWords: convertNumberToWords(grandTotal)
      },
      payment: {
        mode: "Credit",
        total: grandTotal,
        advance: advanceTotal,
        netPay
      }
    }
  }

  // Build all billData per doc; decide where advances appear
  const bills = useMemo(() => {
    const docs = selectedCheckOut || []

    if (!docs.length) return []
    const firstPrimaryIdx = findFirstPrimaryIdx(docs)

    return docs.map((doc, idx) => {
      // Rule: if this doc owns advances, show here; else show on firstPrimaryIdx
      const owns = docOwnsAdvances(doc)
      const useAdvances = owns ? true : idx === firstPrimaryIdx
      return prepareBillDataForDoc(doc, useAdvances)
    })
  }, [selectedCheckOut, outStanding, kotData, organization])

  // Print handlers use first bill by default for metadata
  const handlePrint = useReactToPrint({
    content: () => printReference.current,
    documentTitle: "Hotel Bill",
    removeAfterPrint: true
  })

  const handlePrintPDF = (isPrint) => {
    const multi = bills && bills.length ? bills : []
    if (!multi.length) return

    if (!isPrint) {
      handleBillDownloadPDF(multi) // pass array
    } else {
      handleBillPrintInvoice(multi) // pass array
    }
  }

  return (
    <>
      <TitleDiv title="Bill Print" />

      {showSplitPopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Select Option
            </h2>

            <div className="flex items-center mb-3">
              <input
                id="opt-default"
                type="radio"
                name="split-option"
                value="default"
                checked={selected === "default"}
                onChange={() => setSelected("default")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-default"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Default Print
              </label>
            </div>

            <div className="flex items-center mb-3">
              <input
                id="opt-room"
                type="radio"
                name="split-option"
                value="room"
                checked={selected === "room"}
                onChange={() => setSelected("room")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-room"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Room based
              </label>
            </div>

            <div className="flex items-center mb-5">
              <input
                id="opt-restaurant"
                type="radio"
                name="split-option"
                value="restaurant"
                checked={selected === "restaurant"}
                onChange={() => setSelected("restaurant")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-restaurant"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Restaurant based
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSplitPopUp(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSplit}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                disabled={!selected}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="font-sans bg-gray-100 p-5 min-h-screen"
        ref={printReference}
      >
        {/* Render one complete bill per selectedCheckOut doc */}
        {bills.map((billData, pageIdx) => (
          <div
            key={pageIdx}
            style={{
              maxWidth: "21cm",
              margin: "0 auto",
              padding: "0.5cm",
              backgroundColor: "white",
              fontFamily: "Arial, sans-serif",
              fontSize: "11px",
              lineHeight: "1.1",
              color: "#000",
              pageBreakAfter: pageIdx < bills.length - 1 ? "always" : "auto"
            }}
          >
            {/* Header */}
            <div
              className="page-header flex"
              style={{
                textAlign: "center",
                borderBottom: "1px solid #000",
                paddingBottom: "8px",
                marginBottom: "10px"
              }}
            >
              <div style={{ flex: "0 0 120px" }}>
                {Logo && (
                  <img
                    src={Logo}
                    alt="Logo"
                    style={{ width: "120px", height: "auto" }}
                  />
                )}
              </div>
              <div className="ml-auto">
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    textTransform: "uppercase"
                  }}
                >
                  {billData?.hotel?.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    lineHeight: "1.2"
                  }}
                >
                  {billData?.hotel?.address}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    lineHeight: "1.2"
                  }}
                >
                  Phone: {billData?.hotel?.phone}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "3px",
                    lineHeight: "1.2"
                  }}
                >
                  E-mail: {billData?.hotel?.email} | Website{" "}
                  {billData?.hotel?.website}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.1"
                  }}
                >
                  PAN NO: {billData?.hotel?.pan} | GSTIN:{" "}
                  {billData?.hotel?.gstin}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.1"
                  }}
                >
                  SAC CODE-{billData?.hotel?.sacCode}
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div style={{ marginBottom: "10px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "10px"
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "15%",
                        padding: "2px 0",
                        fontWeight: "bold"
                      }}
                    >
                      GRC No
                    </td>
                    <td style={{ width: "15%", padding: "2px 0" }}>
                      {billData?.guest?.billNo}
                    </td>
                    <td
                      style={{
                        width: "15%",
                        padding: "2px 0",
                        fontWeight: "bold"
                      }}
                    >
                      Bill No
                    </td>
                    <td style={{ width: "15%", padding: "2px 0" }}>
                      {billData?.guest?.billNo}
                    </td>
                    <td
                      style={{
                        width: "10%",
                        padding: "2px 0",
                        fontWeight: "bold"
                      }}
                    >
                      Date
                    </td>
                    <td style={{ width: "30%", padding: "2px 0" }}>
                      {billData?.stay?.billDate}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      GUEST
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.name}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Arrival
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.arrival}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Departure
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.departure}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Address
                    </td>
                    <td colSpan="3" style={{ padding: "2px 0" }}>
                      {billData?.guest?.address}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Plan
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.plan} Pax {billData?.stay?.pax}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Phone
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.phone}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Tariff
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.tariff}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      No. of Days
                    </td>
                    <td style={{ padding: "2px 0" }}>{billData?.stay?.days}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Travel Agent
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.travelAgent}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      GST No
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.hotel?.gstin}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Company
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.hotel?.name}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Room No
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.roomNo}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Charges Table */}
            <div style={{ marginBottom: "10px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #000",
                  fontSize: "10px"
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "left"
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "left"
                      }}
                    >
                      Doc No
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "left"
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right"
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right"
                      }}
                    >
                      Taxes
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right"
                      }}
                    >
                      Advance
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right"
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billData?.charges?.map((charge, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #000", padding: "3px" }}>
                        {charge.date}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "center"
                        }}
                      >
                        {charge.docNo}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "3px" }}>
                        {charge.description}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right"
                        }}
                      >
                        {Number(charge.amount || 0).toFixed(2)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right"
                        }}
                      >
                        {charge.taxes}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right"
                        }}
                      >
                        {charge.advance}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right"
                        }}
                      >
                        {charge.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary + Payment */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              {/* Summary */}
              <div style={{ flex: "1" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                    fontSize: "11px"
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "left",
                          fontWeight: "bold"
                        }}
                      >
                        Summary
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "right",
                          fontWeight: "bold"
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Room Rent
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        {billData?.summary?.roomRent?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>

                    {billData?.summary?.foodPlan > 0 && (
                      <tr>
                        <td
                          style={{ border: "1px solid #000", padding: "4px" }}
                        >
                          Food Plan
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "right"
                          }}
                        >
                          {billData?.summary?.foodPlan?.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2
                            }
                          )}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        SGST on Rent
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        {billData?.summary?.sgst?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        CGST on Rent
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        {billData?.summary?.cgst?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Ac Restaurant
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        {billData?.summary?.restaurant?.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2
                          }
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Room Service
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        {billData?.summary?.roomService?.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2
                          }
                        )}
                      </td>
                    </tr>

                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold"
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "bold"
                        }}
                      >
                        {billData?.summary?.total?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment */}
              <div style={{ flex: "1" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                    fontSize: "11px"
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th
                        colSpan="2"
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "left",
                          fontWeight: "bold"
                        }}
                      >
                        Payment Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold"
                        }}
                      >
                        PAYMODE
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold",
                          textAlign: "center"
                        }}
                      >
                        AMOUNT
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        {billData?.payment?.mode}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        {billData?.payment?.total?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold",
                          textAlign: "center"
                        }}
                        colSpan="2"
                      >
                        {billData?.guest?.name}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{ border: "1px solid #000", padding: "4px" }}
                        colSpan="2"
                      >
                        <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                          {billData?.summary?.totalWords}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        <div>Total :</div>
                        <div>Less Advance:</div>
                        <div style={{ fontWeight: "bold" }}>Net Pay :</div>
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right"
                        }}
                      >
                        <div>
                          {Number(billData?.payment?.total || 0).toFixed(2)}
                        </div>
                        <div>
                          {Number(billData?.payment?.advance || 0).toFixed(2)}
                        </div>
                        <div style={{ fontWeight: "bold" }}>
                          {Number(billData?.payment?.netPay || 0).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ border: "1px solid #000" }}>
              <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
                <div
                  style={{
                    flex: "1",
                    padding: "8px",
                    borderRight: "1px solid #000",
                    fontSize: "10px",
                    fontWeight: "bold"
                  }}
                >
                  Please Deposit Your Room and Locker Keys
                </div>
                <div style={{ flex: "1", padding: "8px", fontSize: "10px" }}>
                  Regardless of charge instructions, I agree to be held
                  personally liable for the payment of total amount of bill.
                  Please collect receipt if you have paid cash.
                </div>
              </div>

              <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
                <div
                  style={{
                    flex: "1",
                    padding: "12px",
                    borderRight: "1px solid #000",
                    textAlign: "left",
                    fontSize: "10px"
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                    Prepared By
                  </div>
                  <div>FO</div>
                </div>
                <div
                  style={{
                    flex: "1",
                    padding: "12px",
                    borderRight: "1px solid #000",
                    textAlign: "left",
                    fontSize: "10px"
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                    Manager
                  </div>
                  <div
                    style={{
                      height: "15px",
                      borderBottom: "1px solid #000",
                      margin: "10px 0"
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    flex: "1",
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "10px"
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                    Guest Signature & Date
                  </div>
                  <div
                    style={{
                      height: "15px",
                      borderBottom: "1px solid #000",
                      margin: "10px 0"
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ display: "flex" }}>
                <div
                  style={{
                    flex: "1",
                    padding: "8px",
                    borderRight: "1px solid #000",
                    fontStyle: "italic",
                    fontSize: "10px"
                  }}
                >
                  We hope you enjoyed your stay and would like to welcome you
                  back...
                </div>
                <div
                  style={{
                    padding: "8px",
                    fontSize: "10px",
                    textAlign: "center",
                    minWidth: "120px"
                  }}
                >
                  Original Bill
                  <br />
                  Page {pageIdx + 1}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Print Styles */}
        <style>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { margin: 0; padding: 0; }
            @page { margin: 0.5cm; size: A4; }
            .page-header { position: running(header); page-break-inside: avoid; break-inside: avoid; }
            .charges-table, .summary-section, .payment-section { page-break-inside: avoid; }
          }
        `}</style>
      </div>

      {/* Action buttons */}
      <div className="no-print w-full flex justify-center">
        <div className="no-print flex flex-wrap gap-3 mb-4 p-4">
          <button
            onClick={() => handlePrintPDF(false)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            📄 Download PDF
          </button>

          <button
            onClick={handleSplitPayment}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            💳 Split Payment
          </button>

          {isForPreview && (
            <button
              onClick={() => {
                // For preview confirm, use first bill’s netPay as balanceToPay
                const first = bills[0]
                const balanceToPay = first?.payment?.netPay || 0
                const firstDoc = selectedCheckOut[0]
                navigate("/sUsers/checkInList", {
                  state: {
                    selectedCheckOut,
                    selectedCustomer: firstDoc?.customerId,
                    balanceToPay,
                    kotData,
                    checkoutmode,
                    cheinids
                  }
                })
              }}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              ✅ Confirm
            </button>
          )}

          <button
            onClick={() => handlePrintPDF(true)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>
    </>
  )
}

export default HotelBillPrint
