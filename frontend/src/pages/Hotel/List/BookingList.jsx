import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import api from "../../../api/api"
import { toast } from "sonner"
import { FaEdit } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  MdDelete,
  MdCheckCircle,
  MdPayment,
  MdVisibility,
  MdCancel
} from "react-icons/md"
import { motion } from "framer-motion"

import Swal from "sweetalert2"
import CheckoutDateModal from "../Components/CheckoutDateModal"
import EnhancedCheckoutModal from "../Components/EnhancedCheckoutModal"
import CustomerSearchInputBox from "../Components/CustomerSearchInPutBox"
import {
  setPaymentDetails,
  setSelectedParty,
  setSelectedPaymentMode,
  setSelectedSplitPayment,
  setOnlinepartyName,
  setOnlineType
} from "../../../../slices/hotelSlices/paymentSlice.js"
import { FixedSizeList as List } from "react-window"
import InfiniteLoader from "react-window-infinite-loader"
import { useLocation } from "react-router-dom"
import SearchBar from "@/components/common/SearchBar"
import TitleDiv from "@/components/common/TitleDiv"
import { Check, CreditCard, X, Banknote, Plus, Trash2 } from "lucide-react"
import useFetch from "@/customHook/useFetch"

function BookingList() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [bookings, setBookings] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [parties, setPartylist] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  const [searchTerm, setSearchTerm] = useState("pending")
  const [listHeight, setListHeight] = useState(0)
  const [activeTab, setActiveTab] = useState("pending")
  const [partial, setIsPartial] = useState(false)
  const [checkOutUpdated, setCheckOutUpdated] = useState(false)
  const [selectedCheckOut, setSelectedCheckOut] = useState(
    location?.state?.selectedCheckOut || []
  )
  const [roomswithCurrentstatus, setroomswithCurrentStatus] = useState([])
  const [selectedonlinePartyname, setselectedOnlinepartyName] = useState(null)
  const [selectedOnlinetype, setselectedOnlinetype] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState({})
  const [saveLoader, setSaveLoader] = useState(false)
  const listRef = useRef()
  const searchTimeoutRef = useRef(null)
  const limit = 60

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [selectedDataForPayment, setSelectedDataForPayment] = useState(null)
  const [showCheckOutDateModal, setShowCheckOutDateModal] = useState(false)
  const [checkoutMode, setCheckoutMode] = useState("multiple")
  const [paymentMode, setPaymentMode] = useState("single")
  const [cashAmount, setCashAmount] = useState(0)
  const [onlineAmount, setOnlineAmount] = useState(0)
  const [paymentError, setPaymentError] = useState(null)
  const [selectedCash, setSelectedCash] = useState(null)
  const [selectedBank, setSelectedBank] = useState(null)
  const [cashOrBank, setCashOrBank] = useState({})
  const [checkinidsarray, setcheckinids] = useState(null)
  const [restaurantBaseSaleData, setRestaurantBaseSaleData] = useState({})
  const [showSelectionModal, setShowSelectionModal] = useState(true)
  const [showEnhancedCheckoutModal, setShowEnhancedCheckoutModal] =
    useState(false)
  const [processedCheckoutData, setProcessedCheckoutData] = useState(null)
  const [selectedCreditor, setSelectedCreditor] = useState("")
  const [dateandstaysdata, setdateandstaysdata] = useState([])
  // NEW: State for split payment rows and sources
  const [splitPaymentRows, setSplitPaymentRows] = useState([
    { customer: "", source: "", sourceType: "", amount: "", subsource: "" }
  ])
  const [bankAndCashSources, setBankAndCashSources] = useState({
    banks: [],
    cashs: []
  })
  const [combinedSources, setCombinedSources] = useState([])

  const { roomId, roomName, filterByRoom } = location.state || {}
  const paymentDetails = useSelector((state) => state.paymentSlice)
  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  )
  console.log(cmp_id)
  console.log(selectedBank)
  const getVoucherType = () => {
    const path = location.pathname
    if (path.includes("Receipt")) return "receipt"
    if (path.includes("Payment")) return "payment"
    return "sale"
  }
  console.log(paymentMethod)
  const { data: partylist } = useFetch(
    `/api/sUsers/singlecheckoutpartylist/${cmp_id}`,
    { params: { voucher: getVoucherType() } }
  )
  console.log(selectedCheckOut)
  // ADD THIS FUNCTION: Calculate total from all checkouts
  const calculateTotalAmount = (checkouts) => {
    if (!checkouts || checkouts.length === 0) return 0
    console.log(checkouts)
    return checkouts.reduce((total, checkout) => {
      console.log(checkout.balanceToPay)
      const checkouttotal = parseFloat(checkout.balanceToPay) || 0
      // if (checkout.selectedRooms && Array.isArray(checkout.selectedRooms)) {
      //   const checkoutTotal = checkout.selectedRooms.reduce((sum, room) => {
      //     return sum + (parseFloat(room.amountAfterTax) || 0)
      //   }, 0)
      //   return total + checkoutTotal
      // }
      return total + checkouttotal
    }, 0)
  }
  console.log(selectedCheckOut)
  useEffect(() => {
    if (location.pathname === "/sUsers/bookingList") {
      const fetchStatus = async () => {
        console.log("H", cmp_id)
        try {
          const res = await api.get(
            `/api/sUsers/getallnoncheckoutCheckins/${cmp_id}`,
            {
              withCredentials: true
            }
          )
          console.log(res.data.data)
          const a = res.data.data.map((item) => {
            return {
              roomId: item._id,
              status: item.status
            }
          })
          const ids = []
          res.data.data.forEach((item) => {
            item.selectedRooms?.forEach((room) => {
              if (room.roomId) {
                ids.push(room.roomId)
              }
            })
          })
          console.log(ids)
          setroomswithCurrentStatus(ids)
          console.log(a)
          console.log(res.data)
        } catch (error) {
          console.log(error.message)
        }
      }

      fetchStatus()
    }
  }, [location.pathname, cmp_id])

  useEffect(() => {
    // when global selectedCustomer changes, sync into selectedCheckOut
    //     if (!selectedCustomer) return
    // console.log("hhhh")
    //     const match = parties.find((p) => p._id === selectedCustomer)
    //     if (!match) return
    // console.log(match)
    // console.log("hhh")
    //     setSelectedCheckOut((prev) =>
    //       prev.map((item) => ({
    //         ...item,
    //         selectedCustomer: match
    //       }))
    //     )
  }, [selectedCustomer])

  useEffect(() => {
    if (partylist && partylist.partyList.length) {
      setPartylist(partylist.partyList)
    }
  }, [partylist])

  useEffect(() => {
    if (location?.state?.selectedCheckOut) {
      console.log(location?.state?.selectedCheckOut)
      setSelectedCheckOut(location?.state?.selectedCheckOut)
      setSelectedCustomer(location?.state?.selectedCustomer?._id)
      setRestaurantBaseSaleData(location?.state?.kotData)
      setCheckoutMode(location?.state?.checkoutmode)
      console.log(location.state.balanceToPay)
      setcheckinids(location?.state?.cheinids)
      setPaymentMode(paymentDetails?.paymentMode)

      if (paymentDetails?.paymentMode === "split") {
        setSplitPaymentRows(paymentDetails?.splitPayment)
      } else if (paymentDetails?.paymentMode === "credit") {
        setSelectedCreditor(paymentDetails?.paymentDetails?.selectedCreditor)
      } else {
        if (paymentDetails?.paymentDetails?.onlineAmount > 0) {
          setPaymentMethod("card")
        } else if (paymentDetails?.paymentMode === "single") {
          setPaymentMethod("cash")
        }
        setSelectedBank(paymentDetails?.paymentDetails?.selectedBank)
        setSelectedCash(paymentDetails?.paymentDetails?.selectedCash)
        setselectedOnlinepartyName(paymentDetails?.onlinePartyName)
        setselectedOnlinetype(paymentDetails?.onlineType)
      }

      console.log(
        "IIIIIIIIIII",
        paymentDetails?.paymentMode,
        paymentDetails,
        selectedBank,
        selectedCash
      )

      // CHANGED: Calculate total from all checkouts' selectedRooms
      const totalAmount = calculateTotalAmount(
        location?.state?.selectedCheckOut
      )

      setSelectedDataForPayment((prevData) => ({
        ...prevData,
        total: location?.state?.balanceToPay
      }))
      if (location?.state?.isForPreview) {
        setShowPaymentModal(true)
      }
    }
  }, [location?.state?.selectedCheckOut])

  console.log("IIIIIIIIIII", selectedBank, selectedCash)
  // ADD THIS: Update total whenever selectedCheckOut changes
  //   useEffect(() => {
  //     if (selectedCheckOut && selectedCheckOut.length > 0) {
  // console.log("H")
  //       const totalAmount = calculateTotalAmount(selectedCheckOut)
  //       setSelectedDataForPayment((prevData) => ({
  //         ...prevData,
  //         total: totalAmount
  //       }))
  //     }
  //   }, [selectedCheckOut])

  const searchData = (data) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(data)
      setPage(1)
      setBookings([])
      setHasMore(true)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  )
  console.log(paymentTypeData)

  // NEW: Fetch bank and cash sources
  useEffect(() => {
    const fetchBankAndCashSources = async () => {
      try {
        const response = await api.get(
          `/api/sUsers/getBankAndCashSources/${cmp_id}`,
          { withCredentials: true }
        )

        if (response.data && response.data.data) {
          const { banks, cashs } = response.data.data
          console.log(banks)
          console.log(cashs)
          setBankAndCashSources({ banks, cashs })

          // Combine banks and cash into a single array for the dropdown
          const combined = [
            ...cashs.map((cash) => ({
              id: cash._id,
              name: cash.cash_ledname,
              type: "cash"
            })),
            ...banks.map((bank) => ({
              id: bank._id,
              name: bank.bank_ledname,
              type: "bank"
            }))
          ]
          setCombinedSources(combined)
        }
      } catch (error) {
        console.error("Error fetching bank and cash sources:", error)
        toast.error("Failed to fetch payment sources")
      }
    }

    if (cmp_id) {
      fetchBankAndCashSources()
    }
  }, [cmp_id])

  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData.data

      setCashOrBank(paymentTypeData?.data)
      if (
        bankDetails &&
        bankDetails.length > 0 &&
        (selectedBank == "" || selectedBank == null)
      ) {
        console.log("kkkkkkk", bankDetails[0])
        setSelectedBank(bankDetails[0]._id)
        setselectedOnlinepartyName(bankDetails[0].partyName)
        setselectedOnlinetype(bankDetails[0].partyType)
      }

      if (
        cashDetails &&
        cashDetails.length > 0 &&
        (selectedCash == null || selectedCash == "")
      ) {
        setSelectedCash(cashDetails[0]._id)
      }
    }
  }, [paymentTypeData])
  console.log(selectedOnlinetype)
  console.log(selectedBank)
  const fetchBookings = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      console.log("h")
      if (isLoading) return

      setIsLoading(true)
      setLoader(pageNumber === 1)

      try {
        const params = new URLSearchParams({
          page: pageNumber,
          limit
        })

        if (searchTerm) {
          params.append("search", searchTerm)
        }

        if (filterByRoom && roomId) {
          params.append("roomId", roomId)
        }

        if (location.pathname == "/sUsers/checkInList") {
          params.append("modal", "checkIn")
        } else if (location.pathname == "/sUsers/bookingList") {
          params.append("modal", "booking")
        } else {
          console.log("h")
          params.append("modal", "checkOut")
        }
        const res = await api.get(
          `/api/sUsers/getBookings/${cmp_id}?${params}`,
          {
            withCredentials: true
          }
        )

        let bookingData = res?.data?.bookingData || []

        if (location.pathname === "/sUsers/checkInList") {
          bookingData = bookingData.flatMap((booking) => {
            if (booking.remainingRooms && booking.remainingRooms.length > 0) {
              return booking.remainingRooms.map((room) => ({
                ...booking,
                selectedRooms: [room],
                isPartialCheckout: true
              }))
            }
            return [booking]
          })
        }

        if (pageNumber === 1) {
          console.log("a")
          setBookings(bookingData)
        } else {
          setBookings((prev) => [...prev, ...bookingData])
        }

        setHasMore(res.data.pagination?.hasMore)
        setPage(pageNumber)
      } catch (error) {
        console.log(error)
        setHasMore(false)
        setBookings([])
      } finally {
        setIsLoading(false)
        setLoader(false)
      }
    },

    [cmp_id, activeTab, filterByRoom, roomId, location.pathname]
  )

  useEffect(() => {
    fetchBookings(1, searchTerm)
  }, [fetchBookings, searchTerm, activeTab])

  // useEffect(() => {
  //   if (selectedCheckOut.length > 0) {
  //     let prevObject = {};
  //     let total = selectedCheckOut.reduce(
  //       (acc, item) => acc + Number(item.balanceToPay),
  //       0
  //     );
  //     prevObject.total = total;
  //     setSelectedDataForPayment(prevObject);
  //   }
  // }, [selectedCheckOut]);
  console.log(selectedCustomer)
  const handleSingleCheckoutformultiplechekin = (selectcustomer) => {
console.log(selectedCustomer)
    const match = parties.find((item) => item._id === selectcustomer)
    if (!match) return
    console.log(match)

    setSelectedCheckOut((prev) =>
      prev.map((item) => ({
        ...item,
        selectedCustomer: match // <-- set the new party here
      }))
    )

    setSelectedCustomer(selectcustomer)
  }
  console.log(selectedCheckOut)
  const handleCancelBooking = async (id, voucherNumber) => {
    const confirmation = await Swal.fire({
      title: "Cancel Booking?",
      html: `
      <p>Are you sure you want to cancel booking <strong>${voucherNumber}</strong>?</p>
      <p class="text-sm text-gray-600 mt-2">This will mark the booking as cancelled but keep it in the system for records.</p>
    `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it"
    })

    if (confirmation.isConfirmed) {
      setLoader(true)
      try {
        const res = await api.put(
          `/api/sUsers/cancelBooking/${id}`,
          { status: "cancelled" },
          {
            headers: {
              "Content-Type": "application/json"
            },
            withCredentials: true
          }
        )

        await Swal.fire({
          title: "Cancelled!",
          text: res.data.message || "Booking has been cancelled successfully.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })

        fetchBookings(1, searchTerm)
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to cancel booking")
        console.log(error)
      } finally {
        setLoader(false)
      }
    }
  }

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    })

    if (confirmation.isConfirmed) {
      setLoader(true)
      try {
        const res = await api.delete(`/api/sUsers/deleteBooking/${id}`, {
          headers: {
            "Content-Type": "application/json"
          },
          withCredentials: true
        })

        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false
        })

        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== id)
        )
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete booking")
        console.log(error)
      } finally {
        setLoader(false)
      }
    }
  }

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95
      setListHeight(newHeight)
    }

    calculateHeight()
    window.addEventListener("resize", calculateHeight)

    return () => window.removeEventListener("resize", calculateHeight)
  }, [])

  const isItemLoaded = (index) => index < bookings.length

  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      return fetchBookings(page + 1, searchTerm)
    }
    return Promise.resolve()
  }

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2
    })}`
  }

  // NEW: Functions for split payment row management
  const addSplitPaymentRow = () => {
    setSplitPaymentRows([
      ...splitPaymentRows,
      { customer: "", source: "", sourceType: "", amount: "" }
    ])
  }

  const removeSplitPaymentRow = (index) => {
    if (splitPaymentRows.length > 1) {
      const updatedRows = splitPaymentRows.filter((_, i) => i !== index)
      setSplitPaymentRows(updatedRows)
    }
  }

  const updateSplitPaymentRow = (index, field, value) => {
    const updatedRows = [...splitPaymentRows]
    console.log(index)
    console.log(field)
    if (field === "source") {
      console.log(updatedRows)
      console.log(combinedSources)
      // When source changes, find the source details and update sourceType
      const selectedSource = combinedSources.find((s) => s.id === value)
      updatedRows[index].source = value
      updatedRows[index].sourceType = selectedSource ? selectedSource.type : ""
      updatedRows[index].subsource =
        selectedSource.name === "paytm" || selectedSource.name === "gpay"
          ? "upi"
          : selectedSource.name === "card"
            ? "card"
            : selectedSource.type
    } else {
      updatedRows[index][field] = value
    }
    console.log(updatedRows)
    setSplitPaymentRows(updatedRows)

    // Calculate total and validate
    const total = updatedRows.reduce(
      (sum, row) => sum + (parseFloat(row.amount) || 0),
      0
    )
    if (
      total >
      (selectedDataForPayment?.total ||
        Number(selectedCheckOut[0]?.balanceToPay)?.toFixed(2))
    ) {
      setPaymentError("Total split amount exceeds order total")
    } else {
      setPaymentError("")
    }
  }
  console.log(selectedOnlinetype)
  console.log("hddd")
  const handleSavePayment = async () => {
    console.log("hddd")
    console.log(selectedCheckOut)
    console.log(selectedCheckOut.length)

    setSaveLoader(true)
    let paymentDetails

    if (paymentMode == "single") {
      if (paymentMethod == "cash") {
        paymentDetails = {
          cashAmount:
            selectedDataForPayment?.total ||
            Number(selectedCheckOut[0]?.balanceToPay),
          onlineAmount: onlineAmount,
          selectedCash: selectedCash,
          selectedBank: "",
          paymentMode: paymentMode,
          paymenttypeDetails: {
            cash:
              selectedDataForPayment?.total ||
              Number(selectedCheckOut[0]?.balanceToPay),
            bank: 0,
            card: 0,
            upi: 0,
            credit: 0
          }
        }
      } else {
        console.log(
          "selectedonlinePartyname",
          selectedonlinePartyname,
          selectedOnlinetype
        )
        paymentDetails = {
          cashAmount: cashAmount,
          onlineAmount:
            selectedDataForPayment?.total ||
            Number(selectedCheckOut[0]?.balanceToPay),
          selectedCash: "",
          selectedBank: selectedBank,
          paymentMode: paymentMode,
          paymenttypeDetails: {
            cash: 0,
            bank:
              selectedonlinePartyname !== "paytm" &&
              selectedonlinePartyname !== "gpay" &&
              selectedonlinePartyname !== "card" &&
              selectedOnlinetype == "bank"
                ? selectedDataForPayment?.total ||
                  Number(selectedCheckOut[0]?.balanceToPay)
                : 0,
            upi:
              selectedonlinePartyname === "paytm" ||
              selectedonlinePartyname === "gpay"
                ? selectedDataForPayment?.total ||
                  Number(selectedCheckOut[0]?.balanceToPay)
                : 0,
            card:
              selectedonlinePartyname === "card"
                ? selectedDataForPayment?.total ||
                  Number(selectedCheckOut[0]?.balanceToPay)
                : 0,
            credit: 0
          }
        }
      }
    } else if (paymentMode === "credit") {
      if (!selectedCreditor || selectedCreditor === "") {
        setPaymentError("Please select a creditor")
        setSaveLoader(false)
        return
      }
      paymentDetails = {
        cashAmount:
          selectedDataForPayment?.total ||
          Number(selectedCheckOut[0]?.balanceToPay),
        selectedCreditor: selectedCreditor,
        paymentMode: paymentMode,
        paymenttypeDetails: {
          cash: 0,
          bank: 0,
          upi: 0,
          credit:
            selectedDataForPayment?.total ||
            Number(selectedCheckOut[0]?.balanceToPay),
          card: 0
        }
      }
    } else {
      // NEW: Handle split payment with rows
      const totalSplitAmount = splitPaymentRows.reduce(
        (sum, row) => sum + (parseFloat(row.amount) || 0),
        0
      )

      let payment = (
        selectedDataForPayment?.total ||
        Number(selectedCheckOut[0]?.balanceToPay) ||
        0
      ).toFixed(2)
      console.log("Paujsdf", totalSplitAmount, payment)

      if (totalSplitAmount != payment) {
        setPaymentError("Split payment amounts must equal the total amount.")
        setSaveLoader(false)
        return
      }

      // Validate that all rows have customer, source, and amount
      const hasInvalidRows = splitPaymentRows.some(
        (row) =>
          !row.customer ||
          !row.source ||
          !row.amount ||
          parseFloat(row.amount) <= 0
      )

      if (hasInvalidRows) {
        setPaymentError("Please fill in all payment details for each row.")
        setSaveLoader(false)
        return
      }

      // Aggregate cash and online amounts from split rows
      let totalCash = 0
      let totalOnline = 0
      let totalbank = 0
      let totalcard = 0
      let totalupi = 0

      splitPaymentRows.forEach((row) => {
        if (row.sourceType === "cash") {
          totalCash += parseFloat(row.amount) || 0
        } else if (row.sourceType === "bank") {
          totalOnline += parseFloat(row.amount) || 0
          if (row.subsource === "bank") {
            totalbank += parseFloat(row.amount) || 0
          } else if (row.subsource === "upi") {
            totalupi += parseFloat(row.amount) || 0
          } else if (row.subsource === "card") {
            totalcard += parseFloat(row.amount) || 0
          }
        }
      })

      paymentDetails = {
        cashAmount: totalCash,
        onlineAmount: totalOnline,
        paymentMode: paymentMode,
        splitDetails: splitPaymentRows, // Include split details
        paymenttypeDetails: {
          cash: totalCash,
          bank: totalbank,
          card: totalcard,
          upi: totalupi,
          credit: 0
        }
      }
    }

    console.log({
      paymentMethod: paymentMode,
      paymentDetails: paymentDetails,
      selectedCheckOut: selectedCheckOut,
      paidBalance: selectedDataForPayment?.total,
      selectedParty: selectedCustomer,
      restaurantBaseSaleData: restaurantBaseSaleData
    })
    console.log(paymentDetails)
    console.log(selectedCheckOut)
    console.log(selectedCheckOut.length)

    if (partial) {
      console.log("Hhhh")
      console.log(dateandstaysdata)
      proceedToCheckout(dateandstaysdata, processedCheckoutData)
      dispatch(setPaymentDetails(paymentDetails))
      dispatch(setSelectedParty(selectedCustomer))
      dispatch(setSelectedPaymentMode(paymentMode))
      dispatch(setSelectedSplitPayment(splitPaymentRows))
      dispatch(setOnlinepartyName(selectedonlinePartyname))
      dispatch(setOnlineType(selectedOnlinetype))
      setIsPartial(false)
    } else {
      console.log("hhhh")
      try {
        const response = await api.post(
          `/api/sUsers/convertCheckOutToSale/${cmp_id}`,
          {
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails,
            selectedCheckOut: selectedCheckOut,
            paidBalance: selectedDataForPayment?.total,
            selectedParty: selectedCustomer,
            restaurantBaseSaleData: restaurantBaseSaleData,
            checkoutMode, //to check if the checkout is single or multiple
            checkinIds: checkinidsarray //have array of checkinids ,if only its sinle checkout unless its null
          },
          { withCredentials: true }
        )
        console.log("hhhh")
        if (response.status === 200 || response.status === 201) {
          toast.success(response?.data?.message)
          handleCloseBasedOnDate()
        }
      } catch (error) {
        console.error(
          "Error updating order status:",
          error.response?.data || error.message
        )
      } finally {
        setSelectedCheckOut([])
        setCheckoutMode("multiple")
        setcheckinids(null)
        setSelectedCustomer(null)
        setSaveLoader(false)
        setCashAmount(0)
        setOnlineAmount(0)
        setSelectedCreditor("")
        setPaymentMode("single")
        setSplitPaymentRows([
          { customer: "", source: "", sourceType: "", amount: "" }
        ]) // Reset split rows
        setShowPaymentModal(false)
        fetchBookings(1, searchTerm)
      }
    }
  }
  console.log("h")
  const handleCheckOutData = async () => {
    setShowSelectionModal(false)
    setShowEnhancedCheckoutModal(true)
  }
  console.log(selectedCheckOut)
  const handleEnhancedCheckoutConfirm = async (roomAssignments, data) => {
    console.log(roomAssignments)
    setShowEnhancedCheckoutModal(false)
    setdateandstaysdata(data)
    // ✅ ALWAYS show checkout date modal - no condition
    setProcessedCheckoutData(roomAssignments)
    console.log("hhhh")
    setShowPaymentModal(true)
    setIsPartial(true)
    // setShowCheckOutDateModal(true)
  }
  console.log(processedCheckoutData)
  const handleCheckin = (e, el) => {
    console.log(el)
    const roomIds = el.selectedRooms.map((item) => item.roomId)
    console.log(roomIds)
    console.log(roomswithCurrentstatus)
    // const allVacant = roomids.every((id) => {
    //   const room = roomswithCurrentstatus.find((r) => r.roomId === id)
    // })
    const anyPresent = roomIds.some((id) => roomswithCurrentstatus.includes(id))

    if (anyPresent) {
      toast.error("Rooms are not vaccant")
      return
    } else {
      e.stopPropagation()
      if (location.pathname == "/sUsers/bookingList") {
        navigate(`/sUsers/checkInPage`, {
          state: { bookingData: el }
        })
      } else if (location.pathname === "/sUsers/checkOutList" && el.checkInId) {
        navigate(`/sUsers/EditCheckOut`, {
          state: el
        })
      } else {
        navigate(`/sUsers/CheckOutPage`, {
          state: { bookingData: el }
        })
      }
    }

    console.log("HH")
  }
  console.log(bookings)
  const proceedToCheckout = (roomAssignments, data) => {
    console.log(roomAssignments)
    console.log(data)

    console.log("hhhhhh")
    setSaveLoader(true)
    const hasPrint1 = configurations[0]?.defaultPrint?.print1
    let checkoutData
    let checkinids = null
    if (checkoutMode === "multiple") {
      console.log(data)
      console.log("hhh")
      checkoutData = data.flatMap((group) => {
        return group.checkIns.map((checkIn) => {
          const originalCheckIn = checkIn.originalCheckIn
          const id = checkIn?.checkInId
          const roomsToCheckout = originalCheckIn.selectedRooms.filter((room) =>
            checkIn.rooms.some((r) => r.roomId === room._id)
          )
          const originalCustomerId = originalCheckIn.customerId?._id
          const isPartialCheckout =
            roomsToCheckout.length < originalCheckIn.selectedRooms.length
          return {
            ...originalCheckIn,
            partyArray: checkIn.originalCheckIn.customerId.party_master_id,
            Totaladvance:
              Number(checkIn?.originalCheckIn?.advanceAmount || 0) +
              Number(checkIn?.originalCheckIn?.bookingId?.advanceAmount || 0),
            customerId: group.customer,
            allCheckInIds: [id],
            selectedRooms: roomsToCheckout,
            isPartialCheckout: isPartialCheckout,
            originalCheckInId: checkIn.checkInId,
            originalCustomerId: originalCustomerId,
            remainingRooms: originalCheckIn.selectedRooms.filter(
              (room) => !checkIn.rooms.some((r) => r.roomId === room._id)
            )
          }
        })
      })
      console.log("Hh")
    } else if (checkoutMode === "single") {
      console.log(roomAssignments)
      console.log(roomAssignments.length)
      let allCheckouts = data.flatMap((group) => {
        return group.checkIns.map((checkIn) => {
          const originalCheckIn = checkIn.originalCheckIn

          const roomsToCheckout = originalCheckIn.selectedRooms.filter((room) =>
            checkIn.rooms.some((r) => r.roomId === room._id)
          )

          const originalCustomerId = originalCheckIn.customerId?._id

          const isPartialCheckout =
            roomsToCheckout.length < originalCheckIn.selectedRooms.length
          console.log(checkIn?.originalCheckIn?.advanceAmount)
          console.log(checkIn?.originalCheckIn?.bookingId?.advanceAmount)
          return {
            ...originalCheckIn,
            partyId: checkIn.originalCheckIn.customerId.party_master_id,
            customerId: group.customer,
            Totaladvance:
              Number(checkIn?.originalCheckIn?.advanceAmount || 0) +
              Number(checkIn?.originalCheckIn?.bookingId?.advanceAmount || 0),
            selectedRooms: roomsToCheckout,
            isPartialCheckout,
            originalCheckInId: checkIn.checkInId,
            originalCustomerId,
            remainingRooms: originalCheckIn.selectedRooms.filter(
              (room) => !checkIn.rooms.some((r) => r.roomId === room._id)
            )
          }
        })
      })
      checkinids = allCheckouts.map((item) => item._id)
      console.log(allCheckouts)
      setcheckinids(checkinids)
      // 2️⃣ GROUP BY selectedCustomer (customerId._id)
      const grouped = {}
      console.log(allCheckouts)
      allCheckouts.forEach((item) => {
        const custId = item.customerId?._id

        if (!grouped[custId]) {
          grouped[custId] = {
            ...item,
            selectedRooms: [...item.selectedRooms],
            partyArray: [item.partyId],
            advanceTotal: item?.Totaladvance
          }
        } else {
          console.log(grouped[custId].advanceTotal)
          // Merge rooms
          grouped[custId].selectedRooms.push(...item.selectedRooms)
          grouped[custId].partyArray.push(item.partyId)
          // ✅ ADD NEXT TOTAL ADVANCE
          grouped[custId].advanceTotal =
            (grouped[custId].advanceTotal || 0) + (item?.Totaladvance || 0)

          // If ANY one check-in is partial, mark as partial
          if (item.isPartialCheckout) grouped[custId].isPartialCheckout = true

          // OPTIONAL: merge remaining rooms if needed
          grouped[custId].remainingRooms.push(...item.remainingRooms)
        }
      })

      // 3️⃣ Convert grouped object → final array
      checkoutData = Object.values(grouped)
      checkoutData[0].allCheckInIds = checkinids
    }
    console.log(checkoutData)
    const roomAssignmentMap = new Map(
      roomAssignments.map((item) => [
        item._id,
        {
          checkOutDate: item.checkOutDate,
          stayDays: item.stayDays
        }
      ])
    )

    const updatedCheckoutData = checkoutData.map((item) => {
      const roomData = roomAssignmentMap.get(item._id)

      return {
        ...item,

        // 🔹 Root level update
        checkOutDate: roomData?.checkOutDate ?? item.checkOutDate,
        stayDays: roomData?.stayDays ?? item.stayDays,

        // 🔹 selectedRooms stayDays update
        selectedRooms: item.selectedRooms.map((room) => ({
          ...room,
          stayDays: roomData?.stayDays ?? room.stayDays
        }))
      }
    })

    console.log(updatedCheckoutData)

    // checkoutData.forEach((item)=>item.checkoutDate=)

    console.log("Hhhhhhhh")
    navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
      state: {
        selectedCheckOut: updatedCheckoutData,
        customerId: checkoutData[0]?.customerId?._id,
        isForPreview: true,
        checkoutMode,
        checkinIds: checkinids,
        roomAssignments: roomAssignments,
        isPartialCheckout: checkoutData.some((co) => co.isPartialCheckout)
      }
    })
  }
  const calculateTotalPax = (addpax, rooms) => {
    let count = addpax && addpax.length ? addpax.length : 0
    rooms.forEach((it) => (count += it.pax))

    return count
  }

  const isCheckoutList = location.pathname === "/sUsers/checkOutList"

  const getTravelAgentName = (booking) => {
    // Check if there's a separate agentId field (preferred)
    if (booking.agentId?.partyName) {
      return booking.agentId.partyName
    }
    // Fallback: check if customer is hotel agent
    if (
      booking.isHotelAgent === true ||
      booking.customerId?.isHotelAgent === true
    ) {
      return booking.customerId?.partyName || "-"
    }
    return "-"
  }
  const getPaymentStatusDisplay = (paymentDetails) => {
    if (!paymentDetails) return "Unpaid"

    const types = []
    if (parseFloat(paymentDetails.cash || 0) > 0) types.push("Cash")
    if (parseFloat(paymentDetails.bank || 0) > 0) types.push("Bank")
    if (parseFloat(paymentDetails.upi || 0) > 0) types.push("UPI")
    if (parseFloat(paymentDetails.card || 0) > 0) types.push("Card")
    if (parseFloat(paymentDetails.credit || 0) > 0) types.push("Credit")

    return types.length > 0 ? types.join(", ") : "Unpaid"
  }

  const handletoogle = () => {
    if (!selectedCustomer) return
    if (checkoutMode === "multiple") {
      console.log("hhhh")
      const match = parties.find((p) => p._id === selectedCustomer)
      if (!match) return

      setSelectedCheckOut((prev) =>
        prev.map((item) => ({
          ...item,
          selectedCustomer: match
        }))
      )
    } else {
      setSelectedCheckOut((prev) =>
        prev.map((item) => {
          const { selectedCustomer, ...rest } = item
          return rest
        })
      )
    }

    setCheckoutMode(checkoutMode === "single" ? "multiple" : "single")
  }
  console.log(checkoutMode)

  const TableHeader = () => (
    <div className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
      <div className="flex items-center px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider md:hidden">
        <div className="w-18 text-center">SL.NO</div>
        <div className="w-32 text-center">BOOKING DATE</div>
        <div className="w-32 text-center">
          {location.pathname == "/sUsers/checkOutList"
            ? "CHECKOUT NO"
            : location.pathname == "/sUsers/checkInList"
              ? "CHECK-IN NO"
              : "BOOKING NO"}
        </div>
        <div className="w-32 text-center"> ACTIONS</div>
      </div>

      <div className="hidden md:flex items-center px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider">
        <div className="w-10 text-center">SL.NO</div>
        <div className="w-28 text-center">BOOKING DATE</div>
        <div className="w-32 text-center">
          {location.pathname === "/sUsers/checkOutList"
            ? "CHECKOUT NO"
            : location.pathname === "/sUsers/checkInList"
              ? "CHECK-IN NO"
              : "BOOKING NO"}
        </div>
        <div className="w-40 text-center">GUEST NAME</div>
        <div className="w-20 text-center">ROOM NO</div>
        <div className="w-36 text-center">ARRIVAL DATE</div>
        <div className="w-28 text-center">ROOM TARIFF</div>
        <div className="w-20 text-center">PAX</div>
        <div className="w-20 text-center">FOOD PLAN</div>
        <div className="w-28 text-center">FOODPLAN AMOUNT</div>
        <div className="w-28 text-center">TRAVEL AGENT</div>

        {isCheckoutList && (
          <div className="w-28 text-center">PAYMENT STATUS</div>
        )}

        <div className="w-24 text-center">ADVANCE</div>
        <div className="w-28 text-center">TOTAL</div>
        <div className="w-32 text-center">ACTIONS</div>
      </div>
    </div>
  )
  const selectedIds = useMemo(() => {
    return new Set(selectedCheckOut.map((item) => item._id))
  }, [selectedCheckOut])

  const isSelected = (id) => selectedIds.has(id)

  //   const isSelected = (el) => {
  // console.log(selectedCheckOut)
  // console.log(el)
  //     return selectedCheckOut.some((item) => item._id === el._id)
  //   }
  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div
          style={style}
          className="flex items-center px-4 py-3 border-b border-gray-200 bg-white"
        >
          <div className="animate-pulse flex w-full items-center md:hidden ">
            <div className="w-10 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mr-4"></div>
          </div>
          <div className="animate-pulse md:flex w-full items-center">
            <div className="w-10 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-24 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-40 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-20 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-36 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-20 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-24 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      )
    }

    const el = bookings[index]
    if (!el) return null

    const adjustedStyle = {
      ...style,
      height: "56px"
    }

    const isCheckOutSelected = (order) => {
      return selectedCheckOut.find((item) => item._id === order._id)
    }

    const formatDate = (dateString) => {
      if (!dateString) return "-"
      return new Date(dateString).toLocaleDateString("en-GB")
    }
    console.log(el)
    return (
      <div
        key={index}
        style={adjustedStyle}
        className={`
  flex items-center px-4 py-3 text-sm
  border-b border-gray-200 
  cursor-pointer transition-all duration-200 ease-in-out 
 hover:bg-gray-50 
  ${
    isCheckOutSelected(el) && location.pathname === "/sUsers/checkInList"
      ? "bg-blue-100 border-blue-400 ring-2 ring-blue-200"
      : ""
  }${isSelected(el) ? "bg-blue-50 border-blue-100" : "bg-white hover:bg-gray-50"}
`}
        onClick={() => {
          if (el?.checkInId?.status === "checkOut") return
          let findOne = selectedCheckOut.find((item) => item._id === el._id)
          if (selectedCheckOut.length == 0) {
            setSelectedCustomer(el.customerId?._id)
          }
          if (findOne) {
            setSelectedCheckOut((prev) =>
              prev.filter((item) => item._id !== el._id)
            )

            return
          }
          setSelectedCheckOut((prev) => [...prev, el])
          // setShowEnhancedCheckoutModal(!showEnhancedCheckoutModal)
        }}
      >
        <div className="flex justify-between items-center w-full md:hidden text-xs">
          <div className="text-gray-700 font-medium">{index + 1}</div>
          <div className="text-gray-700 font-semibold">
            {el?.voucherNumber || "-"}
          </div>
          <div className="text-gray-700 truncate">
            {el?.customerId?.partyName || "-"}
          </div>
          <div className="w-32 flex items-center justify-center gap-1">
            {((location.pathname === "/sUsers/bookingList" &&
              el?.status != "checkIn" &&
              el?.status != "cancelled") ||
              (el?.status != "checkOut" &&
                location.pathname === "/sUsers/checkInList") ||
              (Number(el?.balanceToPay) > 0 &&
                location.pathname === "/sUsers/checkOutList")) && (
              <button
                onClick={(e) => handleCheckin(e, el)}
                className="bg-black hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
              >
                {location.pathname === "/sUsers/checkInList"
                  ? "Checkout"
                  : location.pathname === "/sUsers/checkOutList"
                    ? "Close"
                    : "CheckIn"}
              </button>
            )}

            {((el?.status === "checkIn" &&
              location.pathname === "/sUsers/bookingList") ||
              (el?.status === "checkOut" &&
                location.pathname === "/sUsers/checkInList") ||
              (Number(el?.balanceToPay) <= 0 &&
                location.pathname === "/sUsers/checkOutList")) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (location.pathname === "/sUsers/checkOutList") {
                    setSelectedCustomer(el.customerId?._id)
                    setSelectedCheckOut([el])
                    navigate("sUsers/BillPrint", {
                      state: {
                        selectedCheckOut: bookings?.filter(
                          (item) => item.voucherNumber === el.voucherNumber
                        ),
                        customerId: el.customerId?._id,
                        isForPreview: false
                      }
                    })
                  }
                }}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
              >
                {location.pathname === "/sUsers/checkInList" ||
                location.pathname === "/sUsers/bookingList"
                  ? "CheckedOut"
                  : "Print"}
              </button>
            )}

            {(el?.status != "checkIn" &&
              location.pathname == "/sUsers/bookingList") ||
            (el?.status != "checkOut" &&
              location.pathname == "/sUsers/checkInList") ? (
              <div className="flex items-center gap-1">
                <FaEdit
                  title="Edit booking details"
                  className="text-blue-500 cursor-pointer hover:text-blue-700 text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (location.pathname === "/sUsers/bookingList") {
                      navigate("/sUsers/editBooking", {
                        state: el
                      })
                    } else if (location.pathname === "/sUsers/checkInList") {
                      navigate("/sUsers/editChecking", {
                        state: el
                      })
                    } else {
                      navigate("/sUsers/editChecking", {
                        state: el
                      })
                    }
                  }}
                />

                <MdDelete
                  title="Delete booking details"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(el._id)
                  }}
                  className="text-red-500 cursor-pointer hover:text-red-700 text-sm"
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="hidden md:flex items-center w-full">
          <div className="w-10 text-center text-gray-700 font-medium">
            {index + 1}
          </div>

          <div className="w-28 text-center text-gray-600 text-xs">
            {formatDate(el?.bookingDate)}
          </div>

          <div className="w-32 text-center text-gray-700 font-semibold text-xs">
            {el?.voucherNumber || "-"}
          </div>

          <div
            className="w-40 text-center text-gray-700 truncate text-xs"
            title={el?.customerId?.partyName}
          >
            {el?.customerId?.partyName || "-"}
          </div>

          <div className="w-24 text-center text-gray-600 font-medium">
            {el?.selectedRooms?.map((r) => r.roomName).join(", ") || "-"}
          </div>

          <div className="w-36 text-center text-gray-600 text-xs">
            {formatDate(el?.arrivalDate)}
            <span>({el.arrivalTime})</span>
          </div>

          <div className="w-28 text-center text-gray-600 text-xs">
            ₹
            {el?.selectedRooms?.map((r) => r.priceLevelRate).join(",") ||
              "0.00"}
          </div>

          <div className="w-20 text-center text-gray-600 font-medium">
            {/* {el?.selectedRooms?.[0]?.pax || 0} */}
            {/*Total pax count indlcuding additionalpax */}
            {calculateTotalPax(el?.additionalPaxDetails, el?.selectedRooms)}
          </div>
          <div className="w-28 text-center text-gray-600 text-xs">
            {el?.foodPlan?.[0]?.foodPlan || "0.00"}
          </div>
          <div className="w-28 text-center text-gray-600 text-xs">
            ₹{el?.selectedRooms?.[0]?.foodPlanAmountWithOutTax || "0.00"}
          </div>
          <div className="w-28 text-center text-gray-600 text-xs font-medium">
            {getTravelAgentName(el) || el?.agentId?.partyName}
          </div>
          {isCheckoutList && (
            <div className="w-28 text-center text-gray-600 text-xs font-medium">
              {getPaymentStatusDisplay(el?.paymenttypeDetails)}
            </div>
          )}
          <div className="w-24 text-center text-gray-600 text-xs">
            ₹
            {el?.advanceAmount
              ? formatCurrency(el.advanceAmount).replace("₹", "")
              : "0.00"}
          </div>

          <div className="w-28 text-center text-gray-800 font-semibold text-xs">
            ₹
            {el?.grandTotal
              ? formatCurrency(el.grandTotal).replace("₹", "")
              : "6,000.00"}
          </div>

          <div className="w-32 flex items-center justify-center gap-1">
            {((location.pathname === "/sUsers/bookingList" &&
              el?.status != "checkIn") ||
              (el?.status != "checkOut" &&
                location.pathname != "/sUsers/checkInList" &&
                location.pathname != "/sUsers/checkOutList")) && (
              <button
                onClick={(e) => handleCheckin(e, el)}
                className="bg-black hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
              >
                CheckIn
              </button>
            )}
            {location.pathname === "/sUsers/checkInList" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate("/sUsers/CheckInPrint", {
                    state: {
                      selectedCheckOut: [el],
                      customerId: el.customerId._id
                    }
                  })
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
                title="Print Registration Card"
              >
                Print
              </button>
            )}
            {el?.status === "checkIn" &&
              location.pathname === "/sUsers/bookingList" && (
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
                >
                  CheckedIn
                </button>
              )}
            {el?.status === "checkOut" &&
              location.pathname === "/sUsers/checkInList" && (
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
                >
                  CheckedOut
                </button>
              )}
            {location.pathname === "/sUsers/checkOutList" && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedCustomer(el.customerId?._id)
                  setSelectedCheckOut([el])
                  const hasPrint1 = configurations[0]?.defaultPrint?.print1

                  navigate(
                    hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint",
                    {
                      state: {
                        selectedCheckOut: bookings?.filter(
                          (item) => item.voucherNumber === el.voucherNumber
                        ),
                        customerId: el.customerId?._id,
                        isForPreview: false
                      }
                    }
                  )
                }}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
              >
                Print
              </button>
            )}
            {(el?.status != "checkIn" &&
              location.pathname == "/sUsers/bookingList") ||
            (el?.status != "checkOut" &&
              location.pathname == "/sUsers/checkInList") ? (
              <div className="flex items-center gap-1">
                <FaEdit
                  title="Edit booking details"
                  className="text-blue-500 cursor-pointer hover:text-blue-700 text-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (location.pathname === "/sUsers/bookingList") {
                      navigate("/sUsers/editBooking", {
                        state: el
                      })
                    } else if (location.pathname === "/sUsers/checkInList") {
                      navigate("/sUsers/editChecking", {
                        state: el
                      })
                    } else {
                      navigate("/sUsers/editChecking", {
                        state: el
                      })
                    }
                  }}
                />

                <MdDelete
                  title="Delete booking details"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(el._id)
                  }}
                  className="text-red-500 cursor-pointer hover:text-red-700 text-sm"
                />
              </div>
            ) : null}
            {location.pathname === "/sUsers/bookingList" &&
              el?.status !== "checkIn" &&
              el?.status !== "cancelled" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancelBooking(el._id, el.voucherNumber)
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1 px-2 rounded text-xs transition duration-300"
                  title="Cancel booking"
                >
                  <MdCancel />
                </button>
              )}{" "}
            {el?.status === "cancelled" && (
              <span className="bg-red-100 text-red-700 font-semibold py-1 px-3 rounded text-xs">
                Cancelled
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
  console.log(selectedCheckOut)
  console.log(selectedOnlinetype)
  console.log(processedCheckoutData)
  const handleCloseBasedOnDate = () => {
    console.log("hh")
    // if (!checkouts) {
    //   setShowCheckOutDateModal(false)
    //   setShowSelectionModal(true)
    //   return
    // }
    // setSaveLoader(true);
    console.log(processedCheckoutData)
    if (processedCheckoutData) {
      console.log("hhhhhhhhh")
      console.log(processedCheckoutData)

      // Transform the processed checkout data with updated stay days
      // const updatedCheckoutData = processedCheckoutData.map((checkout) => {
      //   const updatedData = selectedCheckOut.find((c) => c._id === checkout._id)

      //   // if no update found, return original
      //   if (!updatedData) return checkout

      //   return {
      //     ...checkout,

      //     // 🔹 update checkout level fields
      //     checkOutDate: updatedData.checkOutDate ?? checkout.checkOutDate,
      //     checkOutTime: updatedData.checkOutTime ?? checkout.checkOutTime,
      //     stayDays: updatedData.stayDays ?? checkout.stayDays,

      //     // 🔹 update rooms if modified
      //     selectedRooms: checkout.selectedRooms.map((room) => {
      //       const updatedRoom = updatedData.selectedRooms?.find(
      //         (r) => r._id === room._id
      //       )

      //       return updatedRoom
      //         ? {
      //             ...room,
      //             ...updatedRoom
      //           }
      //         : room
      //     })
      //   }
      // })
      //////
      console.log(dateandstaysdata)

      const updatedCheckoutData = processedCheckoutData.map((group) => ({
        ...group,
        checkIns: group.checkIns.map((checkIn) => {
          const updatedData = dateandstaysdata.find(
            (c) => c._id === checkIn.checkInId
          )

          return {
            ...checkIn,
            originalCheckIn: {
              ...checkIn.originalCheckIn,
              // ✅ ADDED: Update checkout date and stay days
              checkOutDate:
                updatedData?.checkOutDate ||
                checkIn.originalCheckIn.checkOutDate,
              checkOutTime:
                updatedData?.checkOutTime ||
                checkIn.originalCheckIn.checkOutTime,

              stayDays:
                updatedData?.stayDays || checkIn.originalCheckIn.stayDays,
              selectedRooms: checkIn.originalCheckIn.selectedRooms.map(
                (room) => {
                  const updatedRoom = updatedData?.selectedRooms?.find(
                    (r) => r._id === room._id
                  )
                  return updatedRoom ? { ...room, ...updatedRoom } : room
                }
              )
            }
          }
        })
      }))
      console.log(updatedCheckoutData)
      console.log("aaaaaa")
      setProcessedCheckoutData(updatedCheckoutData)
      // setShowPaymentModal(true)
      setIsPartial(true)

      proceedToCheckout(updatedCheckoutData)
      // setProcessedCheckoutData(null)
    } else {
      console.log("hhhhhhddd")
      const hasPrint1 = configurations[0]?.defaultPrint?.print1
      navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
        state: {
          selectedCheckOut:
            checkouts?.length > 0 ? checkouts : selectedCheckOut,
          customerId: selectedCustomer,
          isForPreview: true
        }
      })
    }

    setShowCheckOutDateModal(false) // ✅ ADDED: Close modal
  }

  return (
    <>
      <div className="flex-1 bg-slate-50 h-screen overflow-hidden">
        <div className="sticky top-0 z-20">
          <TitleDiv
            loading={loader}
            title={
              location.pathname === "/sUsers/checkInList"
                ? filterByRoom
                  ? `Check In List - Room ${roomName}`
                  : "Hotel Check In List"
                : location.pathname === "/sUsers/bookingList"
                  ? "Hotel Booking List"
                  : "Hotel Check Out List"
            }
            dropdownContents={[
              {
                title: "Add Booking",
                to:
                  location.pathname === "/sUsers/checkInList"
                    ? "/sUsers/checkInPage"
                    : location.pathname === "/sUsers/bookingList"
                      ? "/sUsers/bookingPage"
                      : "/sUsers/checkInPage"
              }
            ]}
          />
          <SearchBar
            onType={searchData}
            toggle={true}
            from={location.pathname}
          />
        </div>

        {!loader && !isLoading && bookings?.length === 0 && (
          <div className="flex justify-center items-center mt-20 overflow-hidden font-bold text-gray-500">
            {filterByRoom
              ? `No check-ins found for Room ${roomName}`
              : "Oops!!. No Bookings Found"}
          </div>
        )}
        {showEnhancedCheckoutModal && (
          <EnhancedCheckoutModal
            isOpen={showEnhancedCheckoutModal}
            closemodal={setShowEnhancedCheckoutModal}
            customerchange={handleSingleCheckoutformultiplechekin}
            onClose={handleCloseBasedOnDate}
            selectedCheckIns={selectedCheckOut}
            onConfirm={handleEnhancedCheckoutConfirm}
            checkoutMode={checkoutMode}
            search={searchTerm}
            toogle={handletoogle}
            selectedCustomer={selectedCustomer}
          />
        )}
        {selectedCheckOut.length > 0 &&
          location.pathname === "/sUsers/checkInList" && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg px-4 py-3 flex justify-between items-center">
              <div className="text-sm font-medium">
                {selectedCheckOut.length} selected
              </div>

              <button
                onClick={() => setShowEnhancedCheckoutModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
              >
                Proceed to Checkout
              </button>
            </div>
          )}

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-4 max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800">
                  Payment Processing
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentMode("single")
                    setCashAmount(0)
                    setOnlineAmount(0)
                    setPaymentError("")
                    setSelectedCash("")
                    setSelectedBank("")
                    setSelectedCreditor("")
                    setSplitPaymentRows([
                      { customer: "", source: "", sourceType: "", amount: "" }
                    ])
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center text-blue-700">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    Checkout :{" "}
                    {selectedCheckOut?.map((item, index) => (
                      <span
                        key={item?.id || index}
                        className="text-sm font-medium"
                      >
                        {item?.voucherNumber}
                        {","}
                      </span>
                    ))}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Mode
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      setPaymentMode("single")
                      setCashAmount(0)
                      setOnlineAmount(0)
                      setPaymentError("")
                      setSelectedCash("")
                      setSelectedBank("")
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                      paymentMode === "single"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Single Payment
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMode("split")
                      setPaymentError("")
                      setCashAmount(0)
                      setOnlineAmount(0)
                      setSplitPaymentRows([
                        {
                          customer: "",
                          source: "",
                          sourceType: "",
                          amount: ""
                        }
                      ])
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                      paymentMode === "split"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Split Payment
                  </button>
                  <button
                    onClick={() => {
                      setPaymentMode("credit")
                      setCashAmount(0)
                      setOnlineAmount(0)
                      setPaymentError("")
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg border-2 text-xs font-medium transition-colors ${
                      paymentMode === "credit"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    Credit Payment
                  </button>
                </div>
              </div>

              {/* Hide Select Customer in split mode */}
              {paymentMode !== "split" && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Customer
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  >
                    <option value="">Choose a customer...</option>
                    {selectedCheckOut?.map((selected) => (
                      <option
                        key={selected?.customerId?._id}
                        value={selected?.customerId?._id}
                      >
                        {selected?.customerId?.partyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {paymentMode === "single" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === "cash"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Banknote className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                        paymentMethod === "card"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">
                        Online Payment
                      </span>
                    </button>
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Cash
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        // value={selectedCash}
                        onChange={(e) => setSelectedCash(e.target.value)}
                      >
                        {cashOrBank?.cashDetails?.map((cashier) => (
                          <option key={cashier._id} value={cashier._id}>
                            {cashier.partyName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bank/Payment Method
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        value={selectedBank}
                        onChange={(e) => {
                          const selectedOption = e.target.selectedOptions[0]
                          const selectedName =
                            selectedOption?.getAttribute("data-partyName") || ""
                          const selectedPartytype =
                            selectedOption?.getAttribute("data-partyType")

                          setselectedOnlinetype(selectedPartytype)
                          setselectedOnlinepartyName(selectedName)

                          setSelectedBank(e.target.value)
                        }}
                      >
                        <option value="" disabled>
                          Select Payment Method
                        </option>
                        {cashOrBank?.bankDetails?.map((cashier) => (
                          <option
                            key={cashier._id}
                            value={cashier._id}
                            data-partyname={cashier.partyName}
                            data-partyType={cashier.partyType}
                          >
                            {cashier.partyName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* NEW: Split Payment with 3 Columns and Real Sources */}
              {paymentMode === "split" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split Payment Detailss
                  </label>

                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-600">
                    <div className="col-span-5">Customer</div>
                    <div className="col-span-3">Source</div>
                    <div className="col-span-3">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Payment Rows */}
                  <div className="space-y-2">
                    {splitPaymentRows.map((row, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center"
                      >
                        {/* Customer Dropdown */}
                        <div className="col-span-5">
                          <select
                            value={row.customer}
                            onChange={(e) =>
                              updateSplitPaymentRow(
                                index,
                                "customer",
                                e.target.value
                              )
                            }
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          >
                            <option value="">Select Customer</option>
                            {selectedCheckOut?.map((selected) => (
                              <option
                                key={selected?.customerId?._id}
                                value={selected?.customerId?._id}
                              >
                                {selected?.customerId?.partyName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Source Dropdown - Combined Banks and Cash */}
                        <div className="col-span-3">
                          <select
                            value={row.source}
                            onChange={(e) => {
                              console.log("HHHh")
                              updateSplitPaymentRow(
                                index,
                                "source",
                                e.target.value
                              )
                            }}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                          >
                            <option value="">Select Source</option>
                            {combinedSources.map((source) => (
                              <option key={source.id} value={source.id}>
                                {source.name} (
                                {source.type === "cash" ? "Cash" : "Bank"})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount Input */}
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) =>
                                updateSplitPaymentRow(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                              className="w-full pl-5 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        {/* Delete Button */}
                        <div className="col-span-1 flex justify-center">
                          {splitPaymentRows.length > 1 && (
                            <button
                              onClick={() => removeSplitPaymentRow(index)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Remove row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Row Button */}
                  <button
                    onClick={addSplitPaymentRow}
                    className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Payment Row
                  </button>

                  {/* Payment Summary */}
                  <div className="bg-gray-50 p-2 rounded-lg border mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Total Entered:</span>
                      <span>
                        ₹
                        {splitPaymentRows
                          .reduce(
                            (sum, row) => sum + (parseFloat(row.amount) || 0),
                            0
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>Order Total:</span>
                      <span>
                        ₹{" "}
                        {selectedDataForPayment?.total?.toFixed(2) ||
                          Number(selectedCheckOut[0]?.balanceToPay)?.toFixed(2)}
                      </span>
                    </div>
                    {splitPaymentRows.reduce(
                      (sum, row) => sum + (parseFloat(row.amount) || 0),
                      0
                    ) !== selectedDataForPayment?.total && (
                      <div className="flex justify-between text-xs text-amber-600 mt-1">
                        <span>Difference:</span>
                        <span>
                          ₹
                          {(
                            (selectedDataForPayment?.total ||
                              Number(
                                selectedCheckOut[0]?.balanceToPay
                              )?.toFixed(2)) -
                            splitPaymentRows.reduce(
                              (sum, row) => sum + (parseFloat(row.amount) || 0),
                              0
                            )
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMode === "credit" && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creditor
                  </label>
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Creditor
                    </label>
                    <CustomerSearchInputBox
                      onSelect={(party) => {
                        setSelectedCreditor(party)
                        setPaymentError("")
                      }}
                      selectedParty={selectedCreditor}
                      isAgent={false}
                      placeholder="Search creditors..."
                      sendSearchToParent={() => {}}
                    />
                  </div>
                </div>
              )}

              {paymentError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs">{paymentError}</p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-base text-blue-600">
                    ₹
                    {selectedDataForPayment?.total?.toFixed(2) ||
                      Number(selectedCheckOut[0]?.balanceToPay)?.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      handleSavePayment()
                    }}
                    // disabled={saveLoader}
                    className={`flex-1 group px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1 ${
                      saveLoader
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:scale-105"
                    }`}
                  >
                    {saveLoader ? (
                      <>
                        <div className="w-3 h-3 border border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MdVisibility className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                        Process Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {bookings && bookings.length > 0 && (
          <div className="bg-white border border-gray-300 rounded-lg mx-4 mt-4 overflow-hidden shadow-sm">
            <TableHeader />
            <div className="pb-4">
              <InfiniteLoader
                isItemLoaded={isItemLoaded}
                itemCount={hasMore ? bookings?.length + 1 : bookings?.length}
                loadMoreItems={loadMoreItems}
                threshold={10}
              >
                {({ onItemsRendered, ref }) => (
                  <List
                    className="pb-4"
                    height={listHeight - 140}
                    itemCount={
                      hasMore ? bookings?.length + 1 : bookings?.length
                    }
                    itemSize={56}
                    onItemsRendered={onItemsRendered}
                    ref={(listInstance) => {
                      ref(listInstance)
                      listRef.current = listInstance
                    }}
                  >
                    {Row}
                  </List>
                )}
              </InfiniteLoader>
            </div>
          </div>
        )}

        {isLoading && !loader && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </>
  )
}

export default BookingList
