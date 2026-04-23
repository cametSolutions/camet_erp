import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import api from "../../../api/api";
import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { taxCalculator } from "../Helper/taxCalculator";
import { MdDelete, MdVisibility, MdCancel } from "react-icons/md";
import { motion } from "framer-motion";
import KotBillTransferModal from "../Components/KotBillTransferModal";
import Swal from "sweetalert2";
import EnhancedCheckoutModal from "../Components/EnhancedCheckoutModal";
import HoldModal from "../Components/HoldModal";
import CustomerSearchInputBox from "../Components/CustomerSearchInPutBox";
import {
  setPaymentDetails,
  setSelectedParty,
  setSelectedPaymentMode,
  setSelectedSplitPayment,
  setOnlinepartyName,
  setOnlineType,
  setPrintDetails,
  removeAll,
} from "../../../../slices/hotelSlices/paymentSlice.js";
import { VariableSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { useLocation } from "react-router-dom";
import SearchBar from "@/components/common/SearchBar";
import TitleDiv from "@/components/common/TitleDiv";
import {
  Check,
  CreditCard,
  X,
  Banknote,
  Plus,
  Trash2,
  ArrowLeftRight,
  Pause,
  Play,
} from "lucide-react";
import useFetch from "@/customHook/useFetch";
import PrintModal from "../Components/PrintModal";
import { calculateDiscountValues } from "../Helper/hotelHelper.js";

function BookingList() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [parties, setPartylist] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("pending");
  const [listHeight, setListHeight] = useState(0);
  const [partial, setIsPartial] = useState(false);
  const [selectedCheckOut, setSelectedCheckOut] = useState([]);
  const [roomswithCurrentstatus, setroomswithCurrentStatus] = useState([]);
  const [selectedonlinePartyname, setselectedOnlinepartyName] = useState(null);
  const [selectedOnlinetype, setselectedOnlinetype] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [saveLoader, setSaveLoader] = useState(false);
  const listRef = useRef();
  const searchTimeoutRef = useRef(null);
  const limit = 60;

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedDataForPayment, setSelectedDataForPayment] = useState(null);
  const [checkoutMode, setCheckoutMode] = useState("multiple");
  const [paymentMode, setPaymentMode] = useState("single");
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [selectedCash, setSelectedCash] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [cashOrBank, setCashOrBank] = useState({});
  const [checkinidsarray, setcheckinids] = useState(null);
  const [restaurantBaseSaleData, setRestaurantBaseSaleData] = useState({});
  const [showEnhancedCheckoutModal, setShowEnhancedCheckoutModal] =
    useState(false);
  const [showEnhancedHoldModal, setShowEnhancedHoldModal] = useState(false);
  const [showPrintConfirmModal, setShowPrintConfirmModal] = useState(false);
  const [processedCheckoutData, setProcessedCheckoutData] = useState(null);
  const [selectedCreditor, setSelectedCreditor] = useState("");
  const [dateandstaysdata, setdateandstaysdata] = useState([]);
  const [finalPrintData, setFinalPrintData] = useState([]);
  const [additionalChargeData, setAdditionalChargeData] = useState([]);
  const [selectedAdditionalCharge, setSelectedAdditionalCharge] = useState([]);
  const [discountType, setDiscountType] = useState("amount");
  const [discountValue, setDiscountValue] = useState(0); // user input
  const [
    additionalChargeDataBasedOnSelection,
    setAdditionalChargeDataBasedOnSelection,
  ] = useState([]);
  // NEW: State for split payment rows and sources
  const [splitPaymentRows, setSplitPaymentRows] = useState([
    {
      customer: "",
      customerName: "",
      source: "",
      sourceType: "",
      subsource: "",
      amount: "",
      remarks: "",
      cardNo: "",
      cardHolder: "",
      upiNo: "",
      transactionNo: "",
      refNo: "",
      underCategory: "room", // 👈 add this
    },
  ]);

  console.log(additionalChargeDataBasedOnSelection);

  const [remarks, setRemarks] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");

  const ROOM_COLORS = [
    { bg: "#EEEDFE", border: "#AFA9EC", icon: "#534AB7", text: "#3C3489" },
    { bg: "#E1F5EE", border: "#5DCAA5", icon: "#0F6E56", text: "#085041" },
    { bg: "#FAECE7", border: "#F0997B", icon: "#993C1D", text: "#712B13" },
    { bg: "#E6F1FB", border: "#85B7EB", icon: "#185FA5", text: "#0C447C" },
    { bg: "#FBEAF0", border: "#ED93B1", icon: "#993556", text: "#72243E" },
  ];

  const [combinedSources, setCombinedSources] = useState([]);
  const [restaurantBillTransfer, setShowRestaurantBillTransfer] =
    useState(false);
  const { roomId, roomName, filterByRoom } = location.state || {};
  const paymentDetails = useSelector((state) => state.paymentSlice);
  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );

  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // const listRef = useRef();

  const getRowHeight = (index) => {
    const item = bookings[index];
    if (!item) return 2;

    const roomCount = item?.selectedRooms?.length || 0;

    if (expandedRows[item._id]) {
      return Math.max(100, 2 + roomCount);
    }

    return 56;
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [expandedRows]);
  const getVoucherType = () => {
    const path = location.pathname;
    if (path.includes("Receipt")) return "receipt";
    if (path.includes("Payment")) return "payment";
    return "sale";
  };

  const { data: partylist } = useFetch(
    `/api/sUsers/singlecheckoutpartylist/${cmp_id}`,
    { params: { voucher: getVoucherType() } },
  );

  useEffect(() => {
    const callAdditionalCharge = async () => {
      const response = await api.get(
        `/api/sUsers/additionalcharges/${cmp_id}`,
        {
          withCredentials: true,
        },
      );
      setAdditionalChargeData(response?.data?.additionalCharges);
      let discountCharge = response?.data?.additionalCharges.find(
        (charge) => charge.name.toLowerCase() === "discount" || "DISCOUNT",
      );
      setSelectedAdditionalCharge(
        discountCharge?._id || response?.data?.additionalCharges[0]?._id,
      );
    };
    callAdditionalCharge();
  }, []);

  // ADD THIS FUNCTION: Calculate total from all checkouts
  const calculateTotalAmount = (checkouts) => {
    if (!Array.isArray(checkouts) || checkouts.length === 0) return 0;

    return checkouts.reduce((total, checkout) => {
      const rooms = checkout?.selectedRooms || [];
      if (!rooms.length) return total;

      const advance =
        Number(checkout?.advanceAmount || 0) +
        Number(checkout?.bookingId?.advanceAmount || 0);

      const hasSwapping = rooms.some((r) => r?.swappingDateFrom);

      const checkoutTotal = rooms.reduce((sum, room) => {
        if (!hasSwapping) {
          return sum + Number(room?.amountAfterTax || 0);
        }

        let stayDays = Number(room?.stayDays || 1);

        const normalizeToDate = (d) => {
          const nd = new Date(d);
          nd.setHours(0, 0, 0, 0);
          return nd;
        };
        const swapDate = room?.swappingDateFrom
          ? new Date(room.swappingDateFrom).toISOString().split("T")[0]
          : "";

        // Old room before swap: from arrival to day BEFORE swap
        if (room?.isSwapped && room?.swappingDateFrom) {
          const swappingDate = normalizeToDate(room.swappingDateFrom);
          const arrivalDate = normalizeToDate(checkout?.arrivalDate);

          stayDays = Math.floor(
            (swappingDate - arrivalDate) / (1000 * 60 * 60 * 24) - 1,
          );

          if (stayDays <= 0) {
            if (swapDate == checkout.arrivalDate) {
              stayDays = 0;
            } else {
              stayDays = 1;
            }
          }
        }
        // New room after swap: from swap date to checkout date
        else if (!room?.isSwapped && room?.swappingDateFrom) {
          const swappingDate = normalizeToDate(room.swappingDateFrom);
          const checkoutDate = normalizeToDate(checkout.checkOutDate);

          stayDays = Math.floor(
            (checkoutDate - swappingDate) / (1000 * 60 * 60 * 24),
          );

          if (stayDays <= 0) {
            if (swapDate == checkout.arrivalDate) {
              stayDays = 1;
            } else {
              stayDays = 0;
            }
          }
        }
        // if (stayDays <= 0) stayDays = 1;

        const totalStayDays = Number(room?.stayDays || 1) || 1;
        const priceLevelRate = Number(room?.priceLevelRate || 0);
        const taxPercentage = Number(room?.taxPercentage || 0);

        const baseAmount = stayDays * priceLevelRate;
        let taxAmount = (baseAmount * taxPercentage) / 100;

        // These are already WITH TAX in your data
        const additionalPaxPerDay =
          Number(room?.additionalPaxAmountWithTax || 0) / totalStayDays;

        const foodPlanPerDay =
          Number(room?.foodPlanAmountWithTax || 0) / totalStayDays;

        const additionalPaxAmount = additionalPaxPerDay * stayDays;
        let foodPlanAmount = foodPlanPerDay * stayDays;

        console.log(baseAmount, additionalPaxPerDay, foodPlanAmount);

        taxAmount = configurations[0]?.addRateWithTax?.hotelSale
          ? 0
          : taxAmount;
        foodPlanAmount = configurations[0]?.addRateWithTax?.hotelSale
          ? 0
          : foodPlanAmount;
        console.log(taxAmount);

        return (
          sum + baseAmount + taxAmount + additionalPaxAmount + foodPlanAmount
        );
      }, 0);

      return total + (checkoutTotal - advance);
    }, 0);
  };
  useEffect(() => {
    if (location.pathname === "/sUsers/bookingList") {
      const fetchStatus = async () => {
        try {
          const res = await api.get(
            `/api/sUsers/getallnoncheckoutCheckins/${cmp_id}`,
            {
              withCredentials: true,
            },
          );
          const a = res.data.data.map((item) => {
            return {
              roomId: item._id,
              status: item.status,
            };
          });
          const ids = [];
          res.data.data.forEach((item) => {
            item.selectedRooms?.forEach((room) => {
              if (room.roomId) {
                ids.push(room.roomId);
              }
            });
          });
          setroomswithCurrentStatus(ids);
        } catch (error) {
          console.log(error.message);
        }
      };

      fetchStatus();
    }
  }, [location.pathname, cmp_id]);

  const handleDiscountChange = async (discountValue, discountType) => {
    const selectedDiscount = additionalChargeData.find(
      (d) => d._id === selectedAdditionalCharge,
    );

    if (!selectedDiscount) return;

    console.log(selectedDataForPayment?.total);
    console.log(discountValue);
    console.log(discountType);
    console.log(selectedDiscount.taxPercentage);

    const result = await calculateDiscountValues({
      total: selectedDataForPayment?.total,
      inputValue: discountValue,
      inputType: discountType,
      taxPercentage: selectedDiscount?.taxPercentage,
    });
    console.log(result);
    setSelectedDataForPayment((prev) => ({
      ...prev,
      additionalChargeAmount: result.finalValue,
    }));
    setAdditionalChargeDataBasedOnSelection([
      {
        _id: selectedDiscount._id,
        option: selectedDiscount.name,
        value: result.value,
        action: "sub",
        taxPercentage: Number(selectedDiscount?.taxPercentage || 0),
        taxAmt: result.taxAmt,
        hsn: selectedDiscount.hsn,
        finalValue: result.finalValue,
      },
    ]);

    setDiscountValue(Number(discountValue) || 0);
  };

  console.log(additionalChargeDataBasedOnSelection);
  useEffect(() => {
    if (partylist && partylist.partyList.length) {
      setPartylist(partylist.partyList);
    }
  }, [partylist]);

  useEffect(() => {
    if (location?.state?.directConvertFromDashboard?.length > 0) {
      setSelectedCheckOut(location?.state?.directConvertFromDashboard);
      setSelectedCustomer(
        location?.state?.directConvertFromDashboard[0]?.customerId?._id,
      );
      setShowEnhancedCheckoutModal(true);
    }
  }, [location?.state?.directConvertFromDashboard]);

  useEffect(() => {
    if (
      location?.state?.selectedCheckOut &&
      paymentDetails?.printData?.selectedCheckOut?.length > 0
    ) {
      console.log(location?.state?.selectedCheckOut);
      console.log(paymentDetails);
      setSelectedAdditionalCharge(
        paymentDetails?.paymentDetails?.additionalChargeArray[0]?._id,
      );
      setDiscountValue(
        Number(
          paymentDetails?.paymentDetails?.additionalChargeArray[0]?.finalValue,
        ),
      );
      setDiscountType(
        paymentDetails?.paymentDetails?.additionalChargeArray[0]?.finalValue ==
          paymentDetails?.paymentDetails?.additionalChargeArray[0]?.value
          ? "amount"
          : "percentage",
      );
      setAdditionalChargeDataBasedOnSelection(
        paymentDetails?.paymentDetails?.additionalChargeArray,
      );
      setSelectedCheckOut(location?.state?.selectedCheckOut);
      setSelectedCustomer(location?.state?.selectedCustomer?._id);
      setRestaurantBaseSaleData(location?.state?.kotData);
      setCheckoutMode(location?.state?.checkoutmode);
      setcheckinids(location?.state?.cheinids);
      setPaymentMode(paymentDetails?.paymentMode);
      setRemarks(paymentDetails?.paymentDetails?.remarks);

      if (paymentDetails?.paymentMode === "split") {
        setSplitPaymentRows(paymentDetails?.splitPayment);
      } else if (paymentDetails?.paymentMode === "credit") {
        setSelectedCreditor(paymentDetails?.paymentDetails?.selectedCreditor);
      } else {
        if (paymentDetails?.paymentDetails?.onlineAmount > 0) {
          setPaymentMethod("card");
        } else if (paymentDetails?.paymentMode === "single") {
          setPaymentMethod("cash");
        }
        setSelectedBank(paymentDetails?.paymentDetails?.selectedBank);
        setSelectedCash(paymentDetails?.paymentDetails?.selectedCash);
        setselectedOnlinepartyName(paymentDetails?.onlinePartyName);
        setselectedOnlinetype(paymentDetails?.onlineType);
      }

      // CHANGED: Calculate total from all checkouts' selectedRooms
      const totalAmount = calculateTotalAmount(
        location?.state?.selectedCheckOut,
      );

      setSelectedDataForPayment(
        paymentDetails?.paymentDetails?.selectedDataForPayment,
      );
      if (location?.state?.isForPreview) {
        setShowPaymentModal(true);
      }
    }
  }, [location?.state?.selectedCheckOut]);

  // ADD THIS: Update total whenever selectedCheckOut changes
  useEffect(() => {
    if (selectedCheckOut && selectedCheckOut.length > 0) {
      const totalAmount = calculateTotalAmount(selectedCheckOut);
      console.log(selectedCheckOut.length);
      const advanceAmount = selectedCheckOut.reduce((total, item) => {
        return (
          total +
          (Number(item.advanceAmount || 0) +
            Number(item.bookingId?.advanceAmount || 0))
        );
      }, 0);
      console.log(advanceAmount);

      const restaurantSubTotal = selectedCheckOut.reduce((total, item) => {
        return total + (item.restaurantSubTotal || 0);
      }, 0);
      console.log(restaurantSubTotal);

      setSelectedDataForPayment((prevData) => ({
        ...prevData,
        total: totalAmount,
        advanceAmount: advanceAmount,
        restaurantSubTotal: restaurantSubTotal,
        totalWithRestaurantSubTotal: totalAmount + restaurantSubTotal,
      }));
    }
  }, [selectedCheckOut]);

  const searchData = (data) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(data);
      setPage(1);
      setBookings([]);
      setHasMore(true);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`,
  );

  // NEW: Fetch bank and cash sources
  useEffect(() => {
    const fetchBankAndCashSources = async () => {
      try {
        const response = await api.get(
          `/api/sUsers/getBankAndCashSources/${cmp_id}`,
          { withCredentials: true },
        );

        if (response.data && response.data.data) {
          const { banks, cashs } = response.data.data;

          // Combine banks and cash into a single array for the dropdown
          const combined = [
            ...cashs.map((cash) => ({
              id: cash._id,
              name: cash.cash_ledname,
              type: cash?.under || "cash",
            })),
            ...banks.map((bank) => ({
              id: bank._id,
              name: bank.bank_ledname,
              type: bank?.under || "bank",
            })),
            { id: "credit", name: "credit", type: "credit" },
          ];
          setCombinedSources(combined);
        }
      } catch (error) {
        console.error("Error fetching bank and cash sources:", error);
        toast.error("Failed to fetch payment sources");
      }
    };

    if (cmp_id) {
      fetchBankAndCashSources();
    }
  }, [cmp_id]);

  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData.data;

      setCashOrBank(paymentTypeData?.data);
      if (
        bankDetails &&
        bankDetails.length > 0 &&
        (selectedBank == "" || selectedBank == null)
      ) {
        setSelectedBank(bankDetails[0]._id);
        setselectedOnlinepartyName(bankDetails[0].partyName);
        setselectedOnlinetype(bankDetails[0].partyType);
      }

      if (
        cashDetails &&
        cashDetails.length > 0 &&
        (selectedCash == null || selectedCash == "")
      ) {
        setSelectedCash(cashDetails[0]._id);
      }
    }
  }, [paymentTypeData]);

  const fetchBookings = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      if (isLoading) return;

      setIsLoading(true);
      setLoader(pageNumber === 1);

      try {
        const params = new URLSearchParams({
          page: pageNumber,
          limit,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (filterByRoom && roomId) {
          params.append("roomId", roomId);
        }

        if (location.pathname == "/sUsers/checkInList") {
          params.append("modal", "checkIn");
        } else if (location.pathname == "/sUsers/bookingList") {
          params.append("modal", "booking");
        } else {
          params.append("modal", "checkOut");
        }
        const res = await api.get(
          `/api/sUsers/getBookings/${cmp_id}?${params}`,
          {
            withCredentials: true,
          },
        );

        let bookingData = res?.data?.bookingData || [];

        if (location.pathname === "/sUsers/checkInList") {
          bookingData = bookingData.flatMap((booking) => {
            if (booking.remainingRooms && booking.remainingRooms.length > 0) {
              return booking.remainingRooms.map((room) => ({
                ...booking,
                selectedRooms: [room],
                isPartialCheckout: true,
              }));
            }
            return [booking];
          });
        }

        if (pageNumber === 1) {
          setBookings(bookingData);
        } else {
          setBookings((prev) => [...prev, ...bookingData]);
        }

        setHasMore(res.data.pagination?.hasMore);
        setPage(pageNumber);
      } catch (error) {
        console.log(error);
        setHasMore(false);
        setBookings([]);
      } finally {
        setIsLoading(false);
        setLoader(false);

        // setSelectedCheckOut([]);
      }
    },

    [cmp_id, filterByRoom, roomId, location.pathname],
  );

  useEffect(() => {
    fetchBookings(1, searchTerm);
  }, [fetchBookings, searchTerm]);

  console.log(selectedDataForPayment);
  const handleSingleCheckoutformultiplechekin = (selectcustomer) => {
    console.log(selectedCustomer);
    const match = parties.find((item) => item._id === selectcustomer);
    if (!match) return;
    console.log(match);

    setSelectedCheckOut((prev) =>
      prev.map((item) => ({
        ...item,
        selectedCustomer: match, // <-- set the new party here
      })),
    );

    setSelectedCustomer(selectcustomer);
  };
  console.log(selectedCheckOut);
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
      cancelButtonText: "No, keep it",
    });

    if (confirmation.isConfirmed) {
      setLoader(true);
      try {
        const res = await api.put(
          `/api/sUsers/cancelBooking/${id}`,
          { status: "cancelled" },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          },
        );

        await Swal.fire({
          title: "Cancelled!",
          text: res.data.message || "Booking has been cancelled successfully.",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        fetchBookings(1, searchTerm);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to cancel booking",
        );
        console.log(error);
      } finally {
        setLoader(false);
      }
    }
  };

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirmation.isConfirmed) {
      setLoader(true);
      try {
        const res = await api.delete(`/api/sUsers/deleteBooking/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== id),
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete booking",
        );
        console.log(error);
      } finally {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95;
      setListHeight(newHeight);
    };

    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const isItemLoaded = (index) => index < bookings.length;

  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      return fetchBookings(page + 1, searchTerm);
    }
    return Promise.resolve();
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
    })}`;
  };

  // NEW: Functions for split payment row management
  const addSplitPaymentRow = () => {
    setSplitPaymentRows([
      ...splitPaymentRows,
      {
        customer: "",
        customerName: "",
        source: "",
        sourceType: "",
        subsource: "",
        amount: "",
        remarks: "",
        cardNo: "",
        cardHolder: "",
        upiNo: "",
        transactionNo: "",
        refNo: "",
        underCategory: "room", // 👈 add this
      },
    ]);
  };
  console.log(splitPaymentRows);
  const removeSplitPaymentRow = (index) => {
    if (splitPaymentRows.length > 1) {
      const updatedRows = splitPaymentRows.filter((_, i) => i !== index);
      setSplitPaymentRows(updatedRows);
    }
  };

  const updateSplitPaymentRow = (index, field, value, name) => {
    const updatedRows = [...splitPaymentRows];
    console.log(index);
    console.log(field);
    console.log(value);
    console.log(field);
    console.log(updatedRows);
    if (field === "source") {
      console.log(updatedRows);
      console.log(combinedSources);
      // When source changes, find the source details and update sourceType
      const selectedSource = combinedSources.find((s) => s.id === value);
      console.log(selectedSource);
      updatedRows[index].source = value;
      updatedRows[index].sourceType = selectedSource ? selectedSource.type : "";
      updatedRows[index].subsource = selectedSource.name;
    } else if (field === "customer") {
      console.log(name);
      console.log(field);

      updatedRows[index].customerName = name;
      updatedRows[index][field] = value;
    } else if (field === "underCategory") {
      updatedRows[index][field] = value;
      updatedRows[index].amount =
        selectedDataForPayment?.restaurantSubTotal || 0;
    } else {
      updatedRows[index][field] = value;
    }

    setSplitPaymentRows(updatedRows);

    // Calculate total and validate
    const total = updatedRows.reduce(
      (sum, row) => sum + (parseFloat(row.amount) || 0),
      0,
    );
    if (
      total >
      (selectedDataForPayment?.totalWithRestaurantSubTotal )?.toFixed(2))
     {
      setPaymentError("Total split amount exceeds order total");
    } else {
      setPaymentError("");
    }
  };
  const handleSavePayment = async () => {
    console.log("hddd");
    console.log(selectedCheckOut);
    console.log(selectedCheckOut.length);
    console.log(paymentMode);

    setSaveLoader(true);
    let paymentDetails;

    if (paymentMode === "split") {
      const splitTotal = splitPaymentRows.reduce(
        (sum, row) => sum + Number(row.amount || 0),
        0,
      );

      const restaurantSubTotal = splitPaymentRows.reduce(
        (sum, row) =>
          row.underCategory === "food" ? sum + Number(row.amount || 0) : sum,
        0,
      );

      const expectedSplitTotal = Math.abs(
        Number(selectedDataForPayment?.totalWithRestaurantSubTotal || 0) -
          Number(selectedDataForPayment?.additionalChargeAmount || 0),
      );

      const expectedRestaurantTotal = Number(
        selectedDataForPayment?.restaurantSubTotal || 0,
      );

      console.log(expectedRestaurantTotal);
      console.log(restaurantSubTotal)

      if (
        Number(splitTotal.toFixed(2)) !== Number(expectedSplitTotal.toFixed(2))
      ) {
        setPaymentError("Check split amount with order total");
        setSaveLoader(false);
        return;
      }

      if (
        Number(restaurantSubTotal.toFixed(2)) !==
        Number(expectedRestaurantTotal.toFixed(2))
      ) {
        setPaymentError("Restaurant tag and amount has a difference");
        setSaveLoader(false);
        return;
      }
    }
    if (paymentMode == "single") {
      if (paymentMethod == "cash") {
        const selected = cashOrBank?.cashDetails?.find(
          (c) => c._id === selectedCash,
        );
        const selectedCustomerData = selectedCheckOut?.find(
          (c) =>
            c.customerId._id === selectedCustomer ||
            c.guestId._id === selectedCustomer,
        );
        let isAgent =
          selectedCustomerData?.customerId?._id === selectedCustomer
            ? false
            : true;
        console.log("isAgent", isAgent);
        paymentDetails = {
          selectedDataForPayment: selectedDataForPayment,
          additionalChargeArray: additionalChargeDataBasedOnSelection,
          discountAmount:
            selectedDataForPayment?.additionalChargeAmount > 0
              ? selectedDataForPayment?.additionalChargeAmount
              : 0,
          cashAmount:
            (selectedDataForPayment?.totalWithRestaurantSubTotal) -
            Number(selectedDataForPayment?.additionalChargeAmount || 0),
          onlineAmount: onlineAmount,
          selectedCash: selectedCash,
          selectedBank: "",
          paymentMode: paymentMode,
          splitDetails: [
            {
              customer: isAgent
                ? selectedCustomerData?.guestId?.partyName
                : selectedCustomerData?.customerId?.partyName ||
                  selectedCheckOut[0]?.customerId?.partyName,
              source: selectedCash,
              sourceType: "cash",
              amount:
                (selectedDataForPayment?.totalWithRestaurantSubTotal ) -
                Number(selectedDataForPayment?.additionalChargeAmount || 0),
              customerName: isAgent
                ? selectedCustomerData?.guestId?.partyName
                : selectedCustomerData?.customerId?.partyName ||
                  selectedCheckOut[0]?.customerId?.partyName,
              subsource: selected.partyName,
              remark: remarks,
            },
          ],
          paymenttypeDetails: {
            cash:
              selectedDataForPayment?.totalWithRestaurantSubTotal || 0,
            bank: 0,
            card: 0,
            upi: 0,
            credit: 0,
          },
        };
      } else {
        const selected = cashOrBank?.bankDetails?.find(
          (c) => c._id === selectedBank,
        );
        const selectedCustomerData = selectedCheckOut?.find(
          (c) =>
            c.customerId._id === selectedCustomer ||
            c.guestId._id === selectedCustomer,
        );
        let isAgent =
          selectedCustomerData?.customerId?._id === selectedCustomer
            ? false
            : true;
        console.log(selected);
        paymentDetails = {
          selectedDataForPayment: selectedDataForPayment,
          additionalChargeArray: additionalChargeDataBasedOnSelection,
          discountAmount:
            selectedDataForPayment?.additionalChargeAmount > 0
              ? selectedDataForPayment?.additionalChargeAmount
              : 0,
          cashAmount: cashAmount,
          onlineAmount:
            (selectedDataForPayment?.totalWithRestaurantSubTotal || 0 ) -
            Number(selectedDataForPayment?.additionalChargeAmount || 0),
          selectedCash: "",
          selectedBank: selectedBank,
          paymentMode: paymentMode,
          splitDetails: [
            {
              customer: isAgent
                ? selectedCustomerData?.guestId?.partyName
                : selectedCustomerData?.customerId?.partyName ||
                  selectedCheckOut[0]?.customerId?.partyName,
              source: selectedBank,
              sourceType: "bank",
              amount:
                selectedDataForPayment?.totalWithRestaurantSubTotal  || 0 ,
              customerName: isAgent
                ? selectedCustomerData?.guestId?.partyName
                : selectedCustomerData?.customerId?.partyName ||
                  selectedCheckOut[0]?.customerId?.partyName,
              subsource: selected.partyName,
              remark: remarks,
            },
          ],
          paymenttypeDetails: {
            cash: 0,
            bank:
              selected.under == "bank"
                ? selectedDataForPayment?.totalWithRestaurantSubTotal 
                : 0,
            upi:
              selected.under == "upi"
                ? selectedDataForPayment?.totalWithRestaurantSubTotal 
                : 0,
            card:
              selected.under == "card"
                ? selectedDataForPayment?.totalWithRestaurantSubTotal 
                : 0,
            credit: 0,
          },
        };
      }
    } else if (paymentMode === "credit") {
      if (!selectedCreditor || selectedCreditor === "") {
        setPaymentError("Please select a creditor");
        setSaveLoader(false);
        return;
      }
      console.log(selectedCreditor);
      paymentDetails = {
        additionalChargeArray: additionalChargeDataBasedOnSelection,
        selectedDataForPayment: selectedDataForPayment,
        discountAmount:
          selectedDataForPayment?.additionalChargeAmount > 0
            ? selectedDataForPayment?.additionalChargeAmount
            : 0,
        cashAmount:
          (selectedDataForPayment?.totalWithRestaurantSubTotal) -
          Number(selectedDataForPayment?.additionalChargeAmount || 0),
        selectedCreditor: selectedCreditor,
        remarks: remarks,
        paymentMode: paymentMode,
        paymenttypeDetails: {
          cash: 0,
          bank: 0,
          upi: 0,
          credit:
            (selectedDataForPayment?.totalWithRestaurantSubTotal || 0) -
            Number(selectedDataForPayment?.additionalChargeAmount || 0),
          card: 0,
        },
      };
    } else {
      // NEW: Handle split payment with rows
      const totalSplitAmount = splitPaymentRows.reduce(
        (sum, row) => sum + (parseFloat(row.amount) || 0),
        0,
      );

      let payment = (
        (selectedDataForPayment?.totalWithRestaurantSubTotal ||
          0) - Number(selectedDataForPayment?.additionalChargeAmount || 0)
      ).toFixed(2);
      console.log("Paujsdf", totalSplitAmount, payment);

      if (totalSplitAmount != payment) {
        setPaymentError("Split payment amounts must equal the total amount.");
        setSaveLoader(false);
        return;
      }
      // Validate that all rows have customer, source, and amount
      const hasInvalidRows = splitPaymentRows.some(
        (row) =>
          !row.customer ||
          !row.source ||
          !row.amount ||
          parseFloat(row.amount) <= 0,
      );

      if (hasInvalidRows) {
        setPaymentError("Please fill in all payment details for each row.");
        setSaveLoader(false);
        return;
      }

      // Aggregate cash and online amounts from split rows
      let totalCash = 0;
      let totalOnline = 0;
      let totalbank = 0;
      let totalcard = 0;
      let totalupi = 0;
      let totalcredit = 0;
      console.log(splitPaymentRows);

      splitPaymentRows.forEach((row) => {
        if (row.sourceType === "cash") {
          totalCash += parseFloat(row.amount) || 0;
        } else if (row.sourceType === "bank") {
          totalOnline += parseFloat(row.amount) || 0;
          if (row.subsource === "bank") {
            totalbank += parseFloat(row.amount) || 0;
          } else if (row.subsource === "upi") {
            totalupi += parseFloat(row.amount) || 0;
          } else if (row.subsource === "card") {
            totalcard += parseFloat(row.amount) || 0;
          }
        } else {
          totalcredit += parseFloat(row.amount) || 0;
        }
      });
      console.log(splitPaymentRows);
      paymentDetails = {
        selectedDataForPayment: selectedDataForPayment,
        additionalChargeArray: additionalChargeDataBasedOnSelection,
        discountAmount:
          selectedDataForPayment?.additionalChargeAmount > 0
            ? selectedDataForPayment?.additionalChargeAmount
            : 0,
        cashAmount: totalCash,
        onlineAmount: totalOnline,
        paymentMode: paymentMode,
        splitDetails: splitPaymentRows, // Include split details
        paymenttypeDetails: {
          cash: totalCash,
          bank: totalbank,
          card: totalcard,
          upi: totalupi,
          credit: totalcredit,
        },
      };
    }

    console.log({
      paymentMethod: paymentMode,
      paymentDetails: paymentDetails,
      selectedCheckOut: selectedCheckOut,
      paidBalance: selectedDataForPayment?.totalWithRestaurantSubTotal,
      selectedParty: selectedCustomer,
      restaurantBaseSaleData: restaurantBaseSaleData,
    });

    if (partial) {
      console.log("Hhhh");
      console.log(dateandstaysdata);

      console.log(paymentDetails);
      dispatch(setPaymentDetails(paymentDetails));
      dispatch(setSelectedParty(selectedCustomer));
      dispatch(setSelectedPaymentMode(paymentMode));
      dispatch(setSelectedSplitPayment(splitPaymentRows));
      dispatch(setOnlinepartyName(selectedonlinePartyname));
      dispatch(setOnlineType(selectedOnlinetype));
      setIsPartial(false);
      proceedToCheckout(dateandstaysdata, processedCheckoutData);
    } else {
      try {
        const response = await api.post(
          `/api/sUsers/convertCheckOutToSale/${cmp_id}`,
          {
            paymentMethod: paymentMethod,
            paymentDetails: paymentDetails,
            selectedCheckOut: selectedCheckOut,
            paidBalance: selectedDataForPayment?.totalWithRestaurantSubTotal,
            selectedParty: selectedCustomer,
            restaurantBaseSaleData: restaurantBaseSaleData,
            checkoutMode, //to check if the checkout is single or multiple
            checkinIds: checkinidsarray, //have array of checkinids ,if only its sinle checkout unless its null
          },
          { withCredentials: true },
        );
        console.log(response);
        if (response.status === 200 || response.status === 201) {
          console.log(response);
          toast.success(response?.data?.message);
          console.log(response?.data.data.checkOutAfterSave);
          setFinalPrintData(response?.data.data.checkOutAfterSave);
          handleCloseBasedOnDate();
        }
      } catch (error) {
        console.error(
          "Error updating order status:",
          error.response?.data || error.message,
        );
      } finally {
        setSelectedCheckOut([]);
        setCheckoutMode("multiple");
        setcheckinids(null);
        setSelectedCustomer(null);
        setSaveLoader(false);
        setCashAmount(0);
        setOnlineAmount(0);
        setSelectedCreditor("");
        setPaymentMode("single");
        setSplitPaymentRows([
          { customer: "", source: "", sourceType: "", amount: "" },
        ]); // Reset split rows
        setShowPaymentModal(false);
        fetchBookings(1, searchTerm);
        setShowPrintConfirmModal(true);
      }
    }
  };

  const handleEnhancedCheckoutConfirm = async (roomAssignments, data) => {
    console.log(roomAssignments);
    console.log(data);
    let updatedData = data;

    if (selectedCheckOut !== data) {
      updatedData = await Promise.all(
        data.map(async (checkout) => {
          const updatedRooms = await Promise.all(
            (checkout.selectedRooms || []).map(async (room) => {
              const taxResponse = await taxCalculator(
                (data = room),
                configurations[0]?.addRateWithTax?.hotelSale,
                checkout,
                room.roomId,
                checkout?.addFoodPlanWithRate,
              );

              console.log(room.totalAmount);

              return {
                ...room,
                amountAfterTax: taxResponse?.amountWithTax || room.totalAmount,
                amountWithOutTax: taxResponse?.amountWithOutTax,
                taxPercentage: taxResponse?.taxRate || 0,
                foodPlanTaxRate: taxResponse?.foodPlanTaxRate || 0,
                additionalPaxAmount: taxResponse?.additionalPaxAmount || 0,
                foodPlanAmount: taxResponse?.foodPlanAmount || 0,
                taxAmount: taxResponse?.taxAmount || 0,
                additionalPaxAmountWithTax:
                  taxResponse?.additionalPaxAmountWithTax || 0,
                additionalPaxAmountWithOutTax:
                  taxResponse?.additionalPaxAmountWithOutTax || 0,
                foodPlanAmountWithTax: taxResponse?.foodPlanAmountWithTax || 0,
                foodPlanAmountWithOutTax:
                  taxResponse?.foodPlanAmountWithOutTax || 0,
                baseAmount: taxResponse?.baseAmount || 0,
                baseAmountWithTax: taxResponse?.baseAmountWithTax || 0,
                totalCgstAmt: taxResponse?.totalCgstAmt || 0,
                totalSgstAmt: taxResponse?.totalSgstAmt || 0,
                totalIgstAmt: taxResponse?.totalIgstAmt || 0,
              };
            }),
          );

          return {
            ...checkout,
            selectedRooms: updatedRooms,
          };
        }),
      );
    }
    console.log(updatedData);
    setSelectedCheckOut(updatedData);
    setShowEnhancedCheckoutModal(false);
    setdateandstaysdata(updatedData);
    // ✅ ALWAYS show checkout date modal - no condition
    setProcessedCheckoutData(roomAssignments);
    console.log("hhhh");
    setShowPaymentModal(true);
    setIsPartial(true);
  };
  console.log(console.log(processedCheckoutData));

  const handleCheckin = (e, el) => {
    console.log(el);
    const roomIds = el.selectedRooms.map((item) => item.roomId);
    console.log(roomIds);
    console.log(roomswithCurrentstatus);
    // const allVacant = roomids.every((id) => {
    //   const room = roomswithCurrentstatus.find((r) => r.roomId === id)
    // })
    const anyPresent = roomIds.some((id) =>
      roomswithCurrentstatus.includes(id),
    );

    if (anyPresent) {
      toast.error("Rooms are not vaccant");
      return;
    } else {
      e.stopPropagation();
      if (location.pathname == "/sUsers/bookingList") {
        navigate(`/sUsers/checkInPage`, {
          state: { bookingData: el },
        });
      } else if (location.pathname === "/sUsers/checkOutList" && el.checkInId) {
        navigate(`/sUsers/EditCheckOut`, {
          state: el,
        });
      } else {
        navigate(`/sUsers/CheckOutPage`, {
          state: { bookingData: el },
        });
      }
    }

    console.log("HH");
  };
  console.log(bookings);
  const proceedToCheckout = (roomAssignments, data) => {
    console.log(roomAssignments);
    console.log(data);

    console.log("hhhhhh");
    setSaveLoader(true);
    const hasPrint1 = configurations[0]?.defaultPrint?.print1;
    let checkoutData;
    let checkinids = null;
    if (checkoutMode === "multiple") {
      console.log(data);
      console.log("hhh");
      checkoutData = data.flatMap((group) => {
        return group.checkIns.map((checkIn) => {
          const originalCheckIn = checkIn.originalCheckIn;
          const id = checkIn?.checkInId;
          const roomsToCheckout = originalCheckIn.selectedRooms.filter((room) =>
            checkIn.rooms.some((r) => r.roomId === room._id),
          );
          const originalCustomerId = originalCheckIn.customerId?._id;
          const isPartialCheckout =
            roomsToCheckout.length < originalCheckIn.selectedRooms.length;
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
              (room) => !checkIn.rooms.some((r) => r.roomId === room._id),
            ),
          };
        });
      });
      console.log("Hh");
    } else if (checkoutMode === "single") {
      console.log(roomAssignments);
      console.log(roomAssignments.length);
      let allCheckouts = data.flatMap((group) => {
        return group.checkIns.map((checkIn) => {
          const originalCheckIn = checkIn.originalCheckIn;

          const roomsToCheckout = originalCheckIn.selectedRooms.filter((room) =>
            checkIn.rooms.some((r) => r.roomId === room._id),
          );

          const originalCustomerId = originalCheckIn.customerId?._id;

          const isPartialCheckout =
            roomsToCheckout.length < originalCheckIn.selectedRooms.length;
          console.log(checkIn?.originalCheckIn?.advanceAmount);
          console.log(checkIn?.originalCheckIn?.bookingId?.advanceAmount);
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
              (room) => !checkIn.rooms.some((r) => r.roomId === room._id),
            ),
          };
        });
      });
      checkinids = allCheckouts.map((item) => item._id);
      console.log(allCheckouts);
      setcheckinids(checkinids);
      // 2️⃣ GROUP BY selectedCustomer (customerId._id)
      const grouped = {};
      console.log(allCheckouts);
      allCheckouts.forEach((item) => {
        const custId = item.customerId?._id;

        if (!grouped[custId]) {
          grouped[custId] = {
            ...item,
            selectedRooms: [...item.selectedRooms],
            partyArray: [item.partyId],
            advanceTotal: item?.Totaladvance,
          };
        } else {
          console.log(grouped[custId].advanceTotal);
          // Merge rooms
          grouped[custId].selectedRooms.push(...item.selectedRooms);
          grouped[custId].partyArray.push(item.partyId);
          // ✅ ADD NEXT TOTAL ADVANCE
          grouped[custId].advanceTotal =
            (grouped[custId].advanceTotal || 0) + (item?.Totaladvance || 0);

          // If ANY one check-in is partial, mark as partial
          if (item.isPartialCheckout) grouped[custId].isPartialCheckout = true;

          // OPTIONAL: merge remaining rooms if needed
          grouped[custId].remainingRooms.push(...item.remainingRooms);
        }
      });

      // 3️⃣ Convert grouped object → final array
      checkoutData = Object.values(grouped);
      checkoutData[0].allCheckInIds = checkinids;
    }
    console.log(roomAssignments);
    const roomAssignmentMap = new Map(
      roomAssignments?.map((item) => [
        item._id,
        {
          checkOutDate: item.checkOutDate,
          checkOutTime: item.checkOutTime,
          stayDays: item.stayDays,
        },
      ]),
    );
    console.log(roomAssignmentMap);

    const updatedCheckoutData = checkoutData.map((item) => {
      const roomData = roomAssignmentMap.get(item._id);
      console.log(roomData);
      return {
        ...item,

        // 🔹 Root level update
        checkOutDate: roomData?.checkOutDate ?? item.checkOutDate,
        checkOutTime: roomData?.checkOutTime ?? item.checkOutTime,
        stayDays: roomData?.stayDays ?? item.stayDays,

        // 🔹 selectedRooms stayDays update
        selectedRooms: item.selectedRooms.map((room) => ({
          ...room,
          stayDays: roomData?.stayDays ?? room.stayDays,
        })),
      };
    });

    console.log(updatedCheckoutData);
    console.log(checkoutData[0]);
    console.log(checkoutMode);

    dispatch(
      setPrintDetails({
        selectedCheckOut: roomAssignments,
        customerId: checkoutData[0]?.customerId?._id,
        isForPreview: false,
        checkoutMode,
        checkinIds: checkinids,
        roomAssignments: roomAssignments,
        isPartialCheckout: checkoutData.some((co) => co.isPartialCheckout),
      }),
    );

    console.log("Hhhhhhhh");
    navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
      state: {
        selectedCheckOut: roomAssignments,
        customerId: checkoutData[0]?.customerId?._id,
        isForPreview: true,
        checkoutMode,
        checkinIds: checkinids,
        roomAssignments: roomAssignments,
        isPartialCheckout: checkoutData.some((co) => co.isPartialCheckout),
      },
    });
  };
  const calculateTotalPax = (addpax, rooms) => {
    let count = addpax && addpax.length ? addpax.length : 0;
    rooms.forEach((it) => (count += it.pax));

    return count;
  };

  const isCheckoutList = location.pathname === "/sUsers/checkOutList";

  const getTravelAgentName = (booking) => {
    // Check if there's a separate agentId field (preferred)
    if (booking.agentId?.partyName) {
      return booking.agentId.partyName;
    }
    // Fallback: check if customer is hotel agent
    if (
      booking.isHotelAgent === true ||
      booking.customerId?.isHotelAgent === true
    ) {
      return booking.customerId?.partyName || "-";
    }
    return "-";
  };
  const getPaymentStatusDisplay = (paymentDetails) => {
    if (!paymentDetails) return "Unpaid";

    const types = [];
    if (parseFloat(paymentDetails.cash || 0) > 0) types.push("Cash");
    if (parseFloat(paymentDetails.bank || 0) > 0) types.push("Bank");
    if (parseFloat(paymentDetails.upi || 0) > 0) types.push("UPI");
    if (parseFloat(paymentDetails.card || 0) > 0) types.push("Card");
    if (parseFloat(paymentDetails.credit || 0) > 0) types.push("Credit");

    return types.length > 0 ? types.join(", ") : "Unpaid";
  };

  const handletoogle = () => {
    if (!selectedCustomer) return;
    if (checkoutMode === "multiple") {
      console.log("hhhh");
      const match = parties.find((p) => p._id === selectedCustomer);
      console.log(match);
      if (!match) return;

      setSelectedCheckOut((prev) =>
        prev.map((item) => ({
          ...item,
          selectedCustomer: match,
        })),
      );
    } else {
      setSelectedCheckOut((prev) =>
        prev.map((item) => {
          const { selectedCustomer, ...rest } = item;
          return rest;
        }),
      );
    }

    setCheckoutMode(checkoutMode === "single" ? "multiple" : "single");
  };

  console.log(checkoutMode);
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
  );
  const selectedIds = useMemo(() => {
    return new Set(selectedCheckOut.map((item) => item._id));
  }, [selectedCheckOut]);

  const isSelected = (id) => selectedIds.has(id);

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div
          style={style}
          className="flex items-center px-4 py-3 border-b border-gray-200 bg-white"
        >
          <div className="animate-pulse md:flex w-full items-center">
            <div className="w-10 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-24 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mr-4"></div>
          </div>
        </div>
      );
    }

    const el = bookings[index];
    if (!el) return null;

    const findSwappedRooms = (room) => {
      let specifcSwap = el.roomSwapHistory.find(
        (swap) => swap.fromRoomId === room.roomId,
      );
      let toRoom =
        specifcSwap &&
        el.selectedRooms.find((room) => room.roomId === specifcSwap.toRoomId);
      return toRoom ? toRoom.roomName : "";
    };
    const isCheckOutSelected = (order) => {
      return selectedCheckOut.find((item) => item._id === order._id);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("en-GB");
    };

    return (
      <div style={style} className="border-b border-gray-200 bg-white">
        {/* 🔹 MAIN ROW */}
        <div
          key={index}
          // style={adjustedStyle}
          className={`
  flex items-center px-4 py-3 text-sm
  border-b border-gray-200 
  cursor-pointer transition-all duration-200 ease-in-out  
  ${
    isCheckOutSelected(el) &&
    location.pathname === "/sUsers/checkInList" &&
    el.isHold
      ? "bg-red-400 border-red-400 ring-2 ring-red-400"
      : el.isHold && location.pathname === "/sUsers/checkInList"
        ? "bg-red-100 border-blue-100"
        : isCheckOutSelected(el) && location.pathname === "/sUsers/checkInList"
          ? "bg-blue-100 border-blue-400 ring-2 ring-blue-200"
          : ""
  }${isSelected(el) ? "bg-blue-50 border-blue-100" : "bg-white hover:animate-pulse"}
`}
          onClick={() => {
            if (el?.checkInId?.status === "checkOut") return;
            let findOne = selectedCheckOut.find((item) => item._id === el._id);
            if (findOne) {
              setSelectedCheckOut((prev) =>
                prev.filter((item) => item._id !== el._id),
              );

              return;
            }
            let findIsHold = selectedCheckOut.find((item) => item.isHold);
            if (selectedCheckOut.length >= 1 && findIsHold && !el.isHold)
              return;
            if (selectedCheckOut.length >= 1 && !findIsHold && el.isHold)
              return;
            if (selectedCheckOut.length == 0) {
              setSelectedCustomer(el.customerId?._id);
            }

            setSelectedCheckOut((prev) => [...prev, el]);
            // setShowEnhancedCheckoutModal(!showEnhancedCheckoutModal)
          }}
        >
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

            {/* 🔹 ROOM CLICK */}
            <div className="w-20 text-center text-gray-600 font-medium">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRowExpand(el._id);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {el?.selectedRooms?.length > 1
                  ? `${el.selectedRooms.length} Room${el.selectedRooms.length > 1 ? "s" : ""}`
                  : `${el.selectedRooms?.[0]?.roomName}`}
              </button>
            </div>

            <div className="w-36 text-center text-gray-600 text-xs">
              {formatDate(el?.arrivalDate)}
              <span>({el.arrivalTime})</span>
            </div>

            <div className="w-28 text-center text-gray-600 text-xs">
              ₹{el?.selectedRooms?.[0]?.priceLevelRate || "0.00"}
              {el.selectedRooms.length > 1 && "....."}
            </div>

            <div className="w-20 text-center text-gray-600 font-medium">
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
                ? formatCurrency(
                    el.bookingId
                      ? Number(el.bookingId?.advanceAmount || 0) +
                          Number(el.advanceAmount)
                      : el.advanceAmount,
                  ).replace("₹", "")
                : "0.00"}
            </div>

            <div className="w-28 text-center text-gray-800 font-semibold text-xs">
              ₹
              {el?.grandTotal
                ? formatCurrency(el.roomTotal).replace("₹", "")
                : "00.00"}
            </div>

            {/* 🔹 ACTION BUTTONS */}
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
                    e.stopPropagation();
                    navigate("/sUsers/CheckInPrint", {
                      state: {
                        selectedCheckOut: [el],
                        customerId: el.customerId._id,
                      },
                    });
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
                    e.stopPropagation();
                    setSelectedCustomer(el.customerId?._id);
                    setSelectedCheckOut([el]);
                    const hasPrint1 = configurations[0]?.defaultPrint?.print1;
                    console.log(hasPrint1);

                    navigate(
                      hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint",
                      {
                        state: {
                          selectedCheckOut: bookings?.filter(
                            (item) => item.voucherNumber === el.voucherNumber,
                          ),
                          customerId: el.customerId?._id,
                          isForPreview: false,
                        },
                      },
                    );
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
                      e.stopPropagation();
                      if (location.pathname === "/sUsers/bookingList") {
                        navigate("/sUsers/editBooking", {
                          state: el,
                        });
                      } else if (location.pathname === "/sUsers/checkInList") {
                        navigate("/sUsers/editChecking", {
                          state: el,
                        });
                      } else {
                        navigate("/sUsers/editChecking", {
                          state: el,
                        });
                      }
                    }}
                  />

                  <MdDelete
                    title="Delete booking details"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(el._id);
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
                      e.stopPropagation();
                      handleCancelBooking(el._id, el.voucherNumber);
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

        {/* 🔹 COMPACT EXPANDED ROW */}
        {expandedRows[el._id] && (
          <div className="px-4 py-1 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {el?.selectedRooms?.map((room, roomIndex) => {
                const c = ROOM_COLORS[roomIndex % ROOM_COLORS.length];
                return (
                  <div
                    key={room._id || roomIndex}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                    style={{
                      background: c.bg,
                      border: `0.5px solid ${c.border}`,
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ flexShrink: 0 }}
                    >
                      <rect
                        x="2"
                        y="7"
                        width="12"
                        height="8"
                        rx="1"
                        stroke={c.icon}
                        strokeWidth="1.4"
                      />
                      <path
                        d="M5 7V5a3 3 0 0 1 6 0v2"
                        stroke={c.icon}
                        strokeWidth="1.4"
                      />
                    </svg>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: c.text }}
                    >
                      {room?.roomName || "—"}
                    </span>
                    {room?.isSwapped && (
                      <span
                        className="text-[11px] font-medium rounded px-1.5 py-0.5"
                        style={{
                          background: "#FAEEDA",
                          color: "#633806",
                          border: "0.5px solid #EF9F27",
                        }}
                      >
                        Swapped to{" "}
                        <span className="text-black animate-pulse">
                          {findSwappedRooms(room)}
                        </span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleCloseBasedOnDate = () => {
    console.log("hh", processedCheckoutData);

    if (processedCheckoutData) {
      const updatedCheckoutData = processedCheckoutData.map((group) => ({
        ...group,
        checkIns: group.checkIns.map((checkIn) => {
          const updatedData = dateandstaysdata.find(
            (c) => c._id === checkIn.checkInId,
          );

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
                    (r) => r._id === room._id,
                  );
                  return updatedRoom ? { ...room, ...updatedRoom } : room;
                },
              ),
            },
          };
        }),
      }));
      console.log(updatedCheckoutData);
      console.log("aaaaaa");
      setProcessedCheckoutData(updatedCheckoutData);
      // setShowPaymentModal(true)
      setIsPartial(true);

      proceedToCheckout(updatedCheckoutData);
      // setProcessedCheckoutData(null)
    }
    // } else {
    //   console.log("hhhhhhddd");
    //   const hasPrint1 = configurations[0]?.defaultPrint?.print1;
    //   navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
    //     state: {
    //       selectedCheckOut: selectedCheckOut,
    //       customerId: selectedCustomer,
    //       isForPreview: true,
    //     },
    //   });
    // }
  };

  console.log(paymentDetails.printData);

  const handlePrintShow = () => {
    const hasPrint1 = configurations[0]?.defaultPrint?.print1;
    dispatch(removeAll());

    navigate(hasPrint1 ? "/sUsers/CheckOutPrint" : "/sUsers/BillPrint", {
      state: {
        selectedCheckOut: finalPrintData,
        customerId: selectedCustomer,
        isForPreview: false,
      },
    });
  };

  const handleProceedToCheckout = async () => {
    let holdCheckInIds = [];
    selectedCheckOut.map((checkout) => {
      holdCheckInIds = [...holdCheckInIds, ...checkout.holdArray];
    });
    if (holdCheckInIds.length > 0) {
      try {
        const res = await api.post(
          `/api/sUsers/getHoldCheckOutData/${cmp_id}`,
          {
            withCredentials: true,
            data: {
              holdCheckInIds,
            },
          },
        );

        if (res.data.holdData) {
          setSelectedCheckOut((prev) => {
            const map = new Map();

            [...prev, ...res.data.holdData].forEach((item) => {
              map.set(item._id, item);
            });

            return Array.from(map.values());
          });
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    setShowEnhancedCheckoutModal(true);
  };

  const handleUnHold = async () => {
    if (selectedCheckOut.length > 0) {
      try {
        const res = await api.post(`/api/sUsers/unHoldCheckOut/${cmp_id}`, {
          withCredentials: true,
          data: {
            selectedCheckOut,
          },
        });

        if (res.data.message) {
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log(error.message);
        toast.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        fetchBookings();
        setSelectedCheckOut([]);
      }
    }
  };

  console.log(selectedCheckOut);

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
                title:
                  location.pathname == "/sUsers/checkInList"
                    ? "Add Checking"
                    : "Add Booking",
                to:
                  location.pathname === "/sUsers/checkInList"
                    ? "/sUsers/checkInPage"
                    : location.pathname === "/sUsers/bookingList"
                      ? "/sUsers/bookingPage"
                      : "/sUsers/checkInPage",
              },
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
            selectedCheckIns={selectedCheckOut}
            onConfirm={handleEnhancedCheckoutConfirm}
            checkoutMode={checkoutMode}
            search={searchTerm}
            toogle={handletoogle}
            selectedCustomer={selectedCustomer}
            setSelectedCheckOut={setSelectedCheckOut}
          />
        )}

        {showEnhancedHoldModal && (
          <HoldModal
            isOpen={showEnhancedHoldModal}
            closeModal={setShowEnhancedHoldModal}
            selectedHolds={selectedCheckOut}
            checkInData={bookings.filter(
              (item) => !selectedCheckOut.some((sel) => sel._id === item._id),
            )}
            cmp_id={cmp_id}
            fetchBookings={fetchBookings}
            setSelectedCheckOut={setSelectedCheckOut}
          />
        )}
        {showPrintConfirmModal && <PrintModal onSubmit={handlePrintShow} />}
        {selectedCheckOut.length > 0 &&
          location.pathname === "/sUsers/checkInList" && (
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#dde1e7] shadow-md px-4 py-3 flex flex-wrap justify-between items-center gap-2">
              {/* Left — count */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-500 font-medium">
                  {selectedCheckOut.length} selected
                </span>
              </div>

              {/* Right — actions */}
              <div className="flex flex-wrap items-center gap-2">
                {selectedCheckOut.some((item) => item.isHold) ? (
                  <button
                    onClick={handleUnHold}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[5px] text-[13px]
                     font-medium text-white bg-yellow-500 border border-yellow-500
                     hover:bg-yellow-600 transition-colors duration-100 active:scale-[0.97]"
                  >
                    <Play size={13} />
                    Unhold
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowEnhancedHoldModal(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[5px] text-[13px]
                       font-medium text-slate-600 bg-white border border-slate-300
                       hover:bg-slate-50 transition-colors duration-100 active:scale-[0.97]"
                    >
                      <Pause size={13} />
                      On Hold
                    </button>

                    <button
                      onClick={() => setShowRestaurantBillTransfer(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[5px] text-[13px]
                       font-medium text-slate-600 bg-white border border-slate-300
                       hover:bg-slate-50 transition-colors duration-100 active:scale-[0.97]"
                    >
                      <ArrowLeftRight size={13} />
                      <span className="hidden sm:inline">
                        Restaurant Bill{" "}
                      </span>{" "}
                      Transfer
                    </button>

                    <div className="w-px h-5 bg-slate-200 mx-1 hidden sm:block" />

                    <button
                      onClick={handleProceedToCheckout}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[5px] text-[13px]
                       font-medium text-white bg-blue-700 border border-blue-700
                       hover:bg-blue-800 transition-colors duration-100 active:scale-[0.97]"
                    >
                      <Check size={13} />
                      Checkout
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto border border-gray-100 dark:border-neutral-800"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white">
                    Payment Processing
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentMode("single");
                    setCashAmount(0);
                    setOnlineAmount(0);
                    setPaymentError("");
                    setSelectedCash("");
                    setSelectedBank("");
                    setSelectedCreditor("");
                    setSplitPaymentRows([
                      { customer: "", source: "", sourceType: "", amount: "" },
                    ]);
                    window.location.reload();
                  }}
                  className="w-7 h-7 rounded-lg border border-gray-200 dark:border-neutral-700 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="px-5 py-4 flex flex-col gap-4">
                {/* Checkout badge */}
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-100 dark:border-blue-900">
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="text-[12px] font-medium text-blue-700 dark:text-blue-300 leading-none">
                    Checkout:{" "}
                    <span className="font-normal opacity-80">
                      {selectedCheckOut?.map((item, index) => (
                        <span key={item?.id || index}>
                          {item?.voucherNumber}
                          {","}
                        </span>
                      ))}
                    </span>
                  </span>
                </div>

                {/* Additional Charge */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 p-4">
                  <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                    Additional Charge{" "}
                    <span className="font-normal text-gray-400">
                      (room amount only)
                    </span>
                  </label>
                  <div className="flex items-center gap-1.5 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType("amount");
                        handleDiscountChange(discountValue, "amount");
                      }}
                      className={`px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                        discountType === "amount"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-300"
                      }`}
                    >
                      Amount
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType("percentage");
                        handleDiscountChange(discountValue, "percentage");
                      }}
                      className={`px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                        discountType === "percentage"
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-gray-300"
                      }`}
                    >
                      %
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">
                        Charge Type
                      </label>
                      <select
                        value={selectedAdditionalCharge}
                        onChange={(e) => {
                          setSelectedAdditionalCharge(e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      >
                        {additionalChargeData?.map((charge) => (
                          <option key={charge._id} value={charge._id}>
                            {charge.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[12px]">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) =>
                            handleDiscountChange(e.target.value, discountType)
                          }
                          className="w-full pl-6 pr-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "single", label: "Single" },
                      { key: "split", label: "Split" },
                      { key: "credit", label: "Credit" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => {
                          if (key === "single") {
                            setPaymentMode("single");
                            setCashAmount(0);
                            setOnlineAmount(0);
                            setPaymentError("");
                            setSelectedCash("");
                            setSelectedBank("");
                          } else if (key === "split") {
                            setPaymentMode("split");
                            setPaymentError("");
                            setCashAmount(0);
                            setOnlineAmount(0);
                            setSplitPaymentRows([
                              {
                                customer: "",
                                source: "",
                                sourceType: "",
                                amount: "",
                                underCategory: "room",
                              },
                            ]);
                          } else {
                            setPaymentMode("credit");
                            setCashAmount(0);
                            setOnlineAmount(0);
                            setPaymentError("");
                          }
                        }}
                        className={`py-2 rounded-xl border text-[12px] font-medium transition-all ${
                          paymentMode === key
                            ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Single Payment */}
                {paymentMode === "single" && (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all text-[12px] font-medium ${
                          paymentMethod === "cash"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : "border-gray-100 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-neutral-600"
                        }`}
                      >
                        <Banknote className="w-5 h-5" />
                        Cash
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all text-[12px] font-medium ${
                          paymentMethod === "card"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                            : "border-gray-100 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-neutral-600"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        Online Payment
                      </button>
                    </div>

                    {paymentMethod === "cash" && (
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">
                          Select Cash
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                          onChange={(e) => setSelectedCash(e.target.value)}
                        >
                          {cashOrBank?.cashDetails?.map((cashier) => (
                            <option key={cashier._id} value={cashier._id}>
                              {cashier.partyName} - {cashier?.under}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div>
                        <label className="block text-[11px] text-gray-500 mb-1">
                          Select Bank / Payment Method
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                          value={selectedBank}
                          onChange={(e) => {
                            const selectedOption = e.target.selectedOptions[0];
                            const selectedName =
                              selectedOption?.getAttribute("data-partyName") ||
                              "";
                            const selectedPartytype =
                              selectedOption?.getAttribute("data-partyType");
                            setselectedOnlinetype(selectedPartytype);
                            setselectedOnlinepartyName(selectedName);
                            setSelectedBank(e.target.value);
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
                              {cashier.partyName} - ({cashier?.under})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Split Payment */}
                {paymentMode === "split" && (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Split Payment Details
                    </label>

                    {/* Compute once for reuse */}
                    {(() => {
                      const orderTotal =
                        (Number(selectedDataForPayment?.total) || 0) +
                        Number(
                          selectedDataForPayment?.restaurantSubTotal || 0,
                        ) -
                        Number(
                          selectedDataForPayment?.additionalChargeAmount || 0,
                        );

                      const totalEntered = splitPaymentRows.reduce(
                        (sum, row) => sum + (parseFloat(row.amount) || 0),
                        0,
                      );

                      const difference = parseFloat(
                        (orderTotal - totalEntered).toFixed(2),
                      );
                      const isFullyPaid = difference <= 0;

                      // Validate last row — all 3 mandatory fields must be filled
                      const lastRow =
                        splitPaymentRows[splitPaymentRows.length - 1];
                      const lastRowValid =
                        lastRow &&
                        lastRow.customer?.trim() !== "" &&
                        lastRow.source?.trim() !== "" &&
                        parseFloat(lastRow.amount) > 0;

                      // Track which rows have validation errors (only shown after an add attempt)
                      // We store this as a derived set of incomplete row indices
                      const incompleteFields = (row) => {
                        const missing = [];
                        if (!row.customer?.trim()) missing.push("customer");
                        if (!row.source?.trim()) missing.push("source");
                        if (!(parseFloat(row.amount) > 0))
                          missing.push("amount");
                        return missing;
                      };

                      return (
                        <>
                          {/* Fully paid banner */}
                          {isFullyPaid && (
                            <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl">
                              <svg
                                className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="text-[12px] font-medium text-green-700 dark:text-green-300">
                                Full amount allocated — no further entries
                                allowed.
                              </span>
                            </div>
                          )}

                          <div className="grid grid-cols-12 gap-2 mb-1.5 px-1">
                            <div className="col-span-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                              Customer
                            </div>
                            <div className="col-span-4 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                              Source
                            </div>
                            <div className="col-span-3 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                              Amount
                            </div>
                            <div className="col-span-1"></div>
                          </div>

                          <div className="space-y-2.5">
                            {splitPaymentRows.map((row, index) => {
                              const sourceObj = combinedSources.find(
                                (s) => s.id === row.source,
                              );
                              const sourceType = sourceObj?.type || "";

                              // Lock all inputs only for non-last rows when fully paid.
                              // The last row stays editable so the user can adjust the amount,
                              // but the amount is clamped to not exceed the remaining difference.
                              const rowLocked =
                                isFullyPaid &&
                                index !== splitPaymentRows.length - 1;

                              // Show field-level errors only on the last row when it's incomplete
                              const isLastRow =
                                index === splitPaymentRows.length - 1;
                              const missing =
                                isLastRow && !lastRowValid
                                  ? incompleteFields(row)
                                  : [];
                              const missingCustomer =
                                missing.includes("customer");
                              const missingSource = missing.includes("source");
                              const missingAmount = missing.includes("amount");

                              return (
                                <div
                                  key={index}
                                  className={`border rounded-xl p-3 transition-colors ${
                                    rowLocked
                                      ? "bg-gray-100 dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 opacity-70"
                                      : "bg-gray-50 dark:bg-neutral-800 border-gray-100 dark:border-neutral-700"
                                  }`}
                                >
                                         {/* Under Tag */}
                                  <div className="flex items-center gap-2 flex-wrap ">
                                    <span className="text-[11px] text-gray-400 font-medium">
                                      Under:
                                    </span>
                                    {["food", "room", "laundry"].map(
                                      (category) => (
                                        <button
                                          key={category}
                                          type="button"
                                          disabled={rowLocked}
                                          onClick={() =>
                                            updateSplitPaymentRow(
                                              index,
                                              "underCategory",
                                              row.underCategory === category
                                                ? ""
                                                : category,
                                            )
                                          }
                                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors capitalize ${
                                            rowLocked
                                              ? "opacity-60 cursor-not-allowed bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-400"
                                              : row.underCategory === category
                                                ? category === "food"
                                                  ? "bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-950 dark:border-orange-700 dark:text-orange-300"
                                                  : category === "room"
                                                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
                                                    : "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-950 dark:border-purple-700 dark:text-purple-300"
                                                : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                                          }`}
                                        >
                                          {category === "food" && "🍽 "}
                                          {category === "room" && "🛏 "}
                                          {category === "laundry" && "👕 "}
                                          {category.charAt(0).toUpperCase() +
                                            category.slice(1)}
                                        </button>
                                      ),
                                    )}
                                    {row.underCategory && (
                                      <span className="text-[11px] text-gray-400 italic">
                                        Selected:{" "}
                                        <span className="font-semibold text-gray-600 dark:text-gray-300 capitalize">
                                          {row.underCategory}
                                        </span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-12 gap-2 items-center mt-2.5">
                                    {/* Customer */}
                                    <div className="col-span-4">
                                      <select
                                        disabled={rowLocked}
                                        value={row.customer}
                                        onChange={(e) => {
                                          const selectedValue = e.target.value;
                                          const customerOptions = [
                                            ...new Map(
                                              (selectedCheckOut || [])
                                                .flatMap((item) => {
                                                  const arr = [];
                                                  const customerId =
                                                    item?.customerId?._id;
                                                  const guestId =
                                                    item?.guestId?._id;
                                                  if (item?.customerId?._id) {
                                                    arr.push({
                                                      id: item.customerId._id,
                                                      name: item.customerId
                                                        .partyName,
                                                      type: "customer",
                                                    });
                                                  }
                                                  if (
                                                    item?.guestId?._id &&
                                                    customerId !== guestId
                                                  ) {
                                                    arr.push({
                                                      id: item.guestId._id,
                                                      name: item.guestId
                                                        .partyName,
                                                      type: "agent",
                                                    });
                                                  }
                                                  return arr;
                                                })
                                                .map((item) => [
                                                  `${item.type}-${item.id}`,
                                                  item,
                                                ]),
                                            ).values(),
                                          ];
                                          const selectedCustomerObj =
                                            customerOptions.find(
                                              (item) =>
                                                item.id === selectedValue,
                                            );
                                          updateSplitPaymentRow(
                                            index,
                                            "customer",
                                            selectedValue,
                                            selectedCustomerObj?.name || "",
                                          );
                                        }}
                                        className={`w-full px-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                          rowLocked
                                            ? "border-gray-200 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed"
                                            : missingCustomer
                                              ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950 text-gray-800 dark:text-gray-200 ring-1 ring-red-300"
                                              : "border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200"
                                        }`}
                                      >
                                        <option value="">Customer</option>
                                        {[
                                          ...new Map(
                                            (selectedCheckOut || [])
                                              .flatMap((item) => {
                                                const arr = [];
                                                if (item?.customerId?._id)
                                                  arr.push({
                                                    id: item.customerId._id,
                                                    name: item.customerId
                                                      .partyName,
                                                    type: "customer",
                                                  });
                                                if (
                                                  item?.guestId?._id &&
                                                  item.customerId._id !==
                                                    item.guestId._id
                                                )
                                                  arr.push({
                                                    id: item.guestId._id,
                                                    name: item.guestId
                                                      .partyName,
                                                    type: "agent",
                                                  });
                                                return arr;
                                              })
                                              .map((item) => [
                                                `${item.type}-${item.id}`,
                                                item,
                                              ]),
                                          ).values(),
                                        ].map((item) => (
                                          <option
                                            key={`${item.type}-${item.id}`}
                                            value={item.id}
                                          >
                                            {item.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Source */}
                                    <div className="col-span-4">
                                      <select
                                        disabled={rowLocked}
                                        value={row.source}
                                        onChange={(e) =>
                                          updateSplitPaymentRow(
                                            index,
                                            "source",
                                            e.target.value,
                                          )
                                        }
                                        className={`w-full px-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                          rowLocked
                                            ? "border-gray-200 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed"
                                            : missingSource
                                              ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950 text-gray-800 dark:text-gray-200 ring-1 ring-red-300"
                                              : "border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200"
                                        }`}
                                      >
                                        <option value="">Source</option>
                                        {combinedSources.map((source) => (
                                          <option
                                            key={source.id}
                                            value={source.id}
                                          >
                                            {source.name}({source?.type})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-3">
                                      <div className="relative">
                                        <span
                                          className={`absolute left-2 top-1/2 -translate-y-1/2 text-[11px] ${rowLocked ? "text-gray-300 dark:text-gray-600" : "text-gray-400"}`}
                                        >
                                          ₹
                                        </span>
                                        <input
                                          type="number"
                                          disabled={rowLocked}
                                          value={row.amount}
                                          onChange={(e) => {
                                            const newVal =
                                              parseFloat(e.target.value) || 0;
                                            // Compute what the total would be after this change
                                            const otherRowsTotal =
                                              splitPaymentRows.reduce(
                                                (sum, r, i) =>
                                                  i === index
                                                    ? sum
                                                    : sum +
                                                      (parseFloat(r.amount) ||
                                                        0),
                                                0,
                                              );
                                            // Clamp: don't allow exceeding the order total
                                            const maxAllowed = parseFloat(
                                              (
                                                orderTotal - otherRowsTotal
                                              ).toFixed(2),
                                            );
                                            const clamped = Math.min(
                                              newVal,
                                              maxAllowed,
                                            );
                                            updateSplitPaymentRow(
                                              index,
                                              "amount",
                                              clamped > 0
                                                ? clamped
                                                : e.target.value,
                                            );
                                          }}
                                          className={`w-full pl-5 pr-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                                            rowLocked
                                              ? "border-gray-200 dark:border-neutral-600 bg-gray-100 dark:bg-neutral-800 text-gray-400 cursor-not-allowed"
                                              : missingAmount
                                                ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950 text-gray-800 dark:text-gray-200 ring-1 ring-red-300"
                                                : "border-gray-200 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200"
                                          }`}
                                          placeholder="0.00"
                                          min="0"
                                          step="0.01"
                                        />
                                      </div>
                                    </div>

                                    {/* Delete — always allowed so user can free up allocation */}
                                    <div className="col-span-1 flex justify-center">
                                      {splitPaymentRows.length > 1 && (
                                        <button
                                          onClick={() =>
                                            removeSplitPaymentRow(index)
                                          }
                                          className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                                          title="Remove row"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Under Tag
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[11px] text-gray-400 font-medium">
                                      Under:
                                    </span>
                                    {["food", "room", "laundry"].map(
                                      (category) => (
                                        <button
                                          key={category}
                                          type="button"
                                          disabled={rowLocked}
                                          onClick={() =>
                                            updateSplitPaymentRow(
                                              index,
                                              "underCategory",
                                              row.underCategory === category
                                                ? ""
                                                : category,
                                            )
                                          }
                                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors capitalize ${
                                            rowLocked
                                              ? "opacity-60 cursor-not-allowed bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-400"
                                              : row.underCategory === category
                                                ? category === "food"
                                                  ? "bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-950 dark:border-orange-700 dark:text-orange-300"
                                                  : category === "room"
                                                    ? "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
                                                    : "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-950 dark:border-purple-700 dark:text-purple-300"
                                                : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                                          }`}
                                        >
                                          {category === "food" && "🍽 "}
                                          {category === "room" && "🛏 "}
                                          {category === "laundry" && "👕 "}
                                          {category.charAt(0).toUpperCase() +
                                            category.slice(1)}
                                        </button>
                                      ),
                                    )}
                                    {row.underCategory && (
                                      <span className="text-[11px] text-gray-400 italic">
                                        Selected:{" "}
                                        <span className="font-semibold text-gray-600 dark:text-gray-300 capitalize">
                                          {row.underCategory}
                                        </span>
                                      </span>
                                    )}
                                  </div> */}

                                  {/* Dynamic Extra Fields — all disabled when locked */}
                                  {sourceType === "cash" && (
                                    <div className="mt-2.5">
                                      <label className="block text-[11px] text-gray-500 mb-1">
                                        Remarks
                                      </label>
                                      <input
                                        type="text"
                                        disabled={rowLocked}
                                        value={row.remarks || ""}
                                        onChange={(e) =>
                                          updateSplitPaymentRow(
                                            index,
                                            "remarks",
                                            e.target.value,
                                          )
                                        }
                                        className={`w-full px-3 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rowLocked ? "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-600 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200"}`}
                                        placeholder="Remarks"
                                      />
                                    </div>
                                  )}

                                  {(sourceType === "card" ||
                                    sourceType === "bank") && (
                                    <div className="grid grid-cols-3 gap-2 mt-2.5">
                                      {["cardNo", "cardHolder", "remarks"].map(
                                        (field) => (
                                          <div key={field}>
                                            <label className="block text-[11px] text-gray-500 mb-1 capitalize">
                                              {field === "cardNo"
                                                ? "Card No."
                                                : field === "cardHolder"
                                                  ? "Card Holder"
                                                  : "Remarks"}
                                            </label>
                                            <input
                                              type="text"
                                              disabled={rowLocked}
                                              value={row[field] || ""}
                                              onChange={(e) =>
                                                updateSplitPaymentRow(
                                                  index,
                                                  field,
                                                  e.target.value,
                                                )
                                              }
                                              className={`w-full px-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rowLocked ? "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-600 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200"}`}
                                              placeholder={
                                                field === "cardNo"
                                                  ? "Card No."
                                                  : field === "cardHolder"
                                                    ? "Card Holder"
                                                    : "Remarks"
                                              }
                                            />
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}

                                  {sourceType === "upi" && (
                                    <div className="grid grid-cols-3 gap-2 mt-2.5">
                                      {[
                                        "upiNo",
                                        "transactionNo",
                                        "remarks",
                                      ].map((field) => (
                                        <div key={field}>
                                          <label className="block text-[11px] text-gray-500 mb-1">
                                            {field === "upiNo"
                                              ? "UPI No."
                                              : field === "transactionNo"
                                                ? "Transaction No."
                                                : "Remarks"}
                                          </label>
                                          <input
                                            type="text"
                                            disabled={rowLocked}
                                            value={row[field] || ""}
                                            onChange={(e) =>
                                              updateSplitPaymentRow(
                                                index,
                                                field,
                                                e.target.value,
                                              )
                                            }
                                            className={`w-full px-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rowLocked ? "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-600 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200"}`}
                                            placeholder={
                                              field === "upiNo"
                                                ? "UPI No."
                                                : field === "transactionNo"
                                                  ? "Transaction No."
                                                  : "Remarks"
                                            }
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {sourceType === "credit" && (
                                    <div className="grid grid-cols-2 gap-2 mt-2.5">
                                      {["refNo", "remarks"].map((field) => (
                                        <div key={field}>
                                          <label className="block text-[11px] text-gray-500 mb-1">
                                            {field === "refNo"
                                              ? "Ref. No"
                                              : "Remarks"}
                                          </label>
                                          <input
                                            type="text"
                                            disabled={rowLocked}
                                            value={row[field] || ""}
                                            onChange={(e) =>
                                              updateSplitPaymentRow(
                                                index,
                                                field,
                                                e.target.value,
                                              )
                                            }
                                            className={`w-full px-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rowLocked ? "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-600 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200"}`}
                                            placeholder={
                                              field === "refNo"
                                                ? "Ref. No"
                                                : "Remarks"
                                            }
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {sourceType !== "" &&
                                    ![
                                      "cash",
                                      "card",
                                      "bank",
                                      "upi",
                                      "credit",
                                    ].includes(sourceType) && (
                                      <div className="mt-2.5">
                                        <label className="block text-[11px] text-gray-500 mb-1">
                                          Remarks
                                        </label>
                                        <input
                                          type="text"
                                          disabled={rowLocked}
                                          value={row.remarks || ""}
                                          onChange={(e) =>
                                            updateSplitPaymentRow(
                                              index,
                                              "remarks",
                                              e.target.value,
                                            )
                                          }
                                          className={`w-full px-2 py-1.5 border rounded-lg text-[11px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${rowLocked ? "bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-600 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-600 text-gray-800 dark:text-gray-200"}`}
                                          placeholder="Remarks"
                                        />
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Row — hidden when fully paid, disabled with error when last row incomplete */}
                          {!isFullyPaid && (
                            <div className="mt-2">
                              <button
                                onClick={() => {
                                  if (lastRowValid) {
                                    addSplitPaymentRow();
                                  }
                                  // If not valid, the missing fields will highlight (lastRowValid=false triggers missingX flags)
                                  // Force a re-render by calling a no-op state update trick via a dummy interaction
                                  // Since missingX flags are derived live from state, they will show automatically
                                }}
                                className={`flex items-center gap-1.5 text-[12px] font-medium transition-colors ${
                                  lastRowValid
                                    ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  !lastRowValid
                                    ? "Fill all required fields in the current row first"
                                    : ""
                                }
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Add Payment Row
                              </button>
                              {!lastRowValid && (
                                <p className="mt-1 text-[11px] text-red-500 dark:text-red-400 flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3 shrink-0"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                  </svg>
                                  Customer, Source and Amount are required
                                  before adding a new row.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Payment Summary */}
                          <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl p-3 mt-3 space-y-1.5">
                            <div className="flex justify-between text-[12px] text-gray-500 dark:text-gray-400">
                              <span>Total Entered</span>
                              <span>₹{totalEntered.toFixed(2)}</span>
                            </div>
                            {Number(
                              selectedDataForPayment?.additionalChargeAmount ||
                                0,
                            ) > 0 && (
                              <div className="flex justify-between text-[12px] text-gray-500 dark:text-gray-400">
                                <span>Discount Total</span>
                                <span>
                                  ₹ -
                                  {Number(
                                    selectedDataForPayment?.additionalChargeAmount ||
                                      0,
                                  )?.toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-[12px] font-medium text-gray-700 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-neutral-700">
                              <span>Order Total</span>
                              <span>₹ {orderTotal.toFixed(2)}</span>
                            </div>
                            <div
                              className={`flex justify-between text-[12px] font-semibold pt-1 border-t border-gray-200 dark:border-neutral-700 ${
                                isFullyPaid
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <span>Difference</span>
                              <span className="flex items-center gap-1">
                                {isFullyPaid && (
                                  <svg
                                    className="w-3.5 h-3.5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                  >
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                                ₹{difference.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
                {/* Credit Payment */}
                {paymentMode === "credit" && (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Select Creditor
                    </label>
                    <CustomerSearchInputBox
                      onSelect={(party) => {
                        setSelectedCreditor(party);
                        setPaymentError("");
                      }}
                      selectedParty={selectedCreditor}
                      isAgent={false}
                      placeholder="Search creditors..."
                      sendSearchToParent={() => {}}
                    />
                  </div>
                )}

                {/* Remarks */}
                {paymentMode !== "split" && (
                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Remarks
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>
                )}

                {/* Transaction Number */}
                {["card"].includes(paymentMethod) &&
                  paymentMode !== "credit" &&
                  selectedBank && (
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Card / UPI / Transaction / Cheque Number
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200 text-[12px] focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                      />
                    </div>
                  )}

                {/* Error */}
                {paymentError && (
                  <div className="px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-[12px]">
                      {paymentError}
                    </p>
                  </div>
                )}

                {/* Summary & Submit */}
                <div className="bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[12px] text-gray-500 dark:text-gray-400">
                      <span>Total Amount</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        ₹
                        {(
                          Number(selectedDataForPayment?.total) +
                          Number(selectedDataForPayment?.advanceAmount)
                        )?.toFixed(2) ||
                          (
                            Number(selectedCheckOut[0]?.balanceToPay) +
                            Number(selectedCheckOut[0]?.advance)
                          ).toFixed(2)}
                      </span>
                    </div>

                    {(() => {
                      const advance = Number(
                        selectedDataForPayment?.advanceAmount ??
                          selectedCheckOut[0]?.advanceAmount ??
                          0,
                      );
                      return (
                        advance > 0 && (
                          <div className="flex justify-between text-[12px] text-gray-500 dark:text-gray-400">
                            <span>Total Advance</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              (-) ₹ {advance.toFixed(2)}
                            </span>
                          </div>
                        )
                      );
                    })()}

                    {(() => {
                      const restaurantTotal = Number(
                        selectedDataForPayment?.restaurantSubTotal ??
                          selectedCheckOut?.[0]?.restaurantSubTotal ??
                          0,
                      );
                      return (
                        restaurantTotal > 0 && (
                          <div className="flex justify-between text-[12px] text-gray-500 dark:text-gray-400">
                            <span>Restaurant Total</span>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              (+) ₹ {restaurantTotal.toFixed(2)}
                            </span>
                          </div>
                        )
                      );
                    })()}

                    {Number(
                      selectedDataForPayment?.additionalChargeAmount || 0,
                    ) > 0 && (
                      <div className="flex justify-between text-[12px] text-gray-500 dark:text-gray-400">
                        <span>Discount Amount</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          (-) ₹{" "}
                          {Number(
                            selectedDataForPayment?.additionalChargeAmount || 0,
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 mt-1 border-t border-gray-200 dark:border-neutral-700 flex justify-between items-center">
                      <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-100">
                        Amount To Pay
                      </span>
                      <span className="text-[15px] font-bold text-blue-600 dark:text-blue-400">
                        ₹
                        {(
                          selectedDataForPayment?.total +
                          Number(selectedDataForPayment?.restaurantSubTotal) -
                          Number(
                            selectedDataForPayment?.additionalChargeAmount || 0,
                          )
                        ).toFixed(2) ||
                          (
                            Number(selectedCheckOut[0]?.balanceToPay) +
                            Number(selectedCheckOut[0]?.advance) +
                            Number(
                              selectedDataForPayment?.additionalChargeAmount ||
                                0,
                            )
                          ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleSavePayment();
                    }}
                    className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                      saveLoader
                        ? "bg-gray-100 dark:bg-neutral-700 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-sm shadow-blue-200 dark:shadow-blue-900"
                    }`}
                  >
                    {saveLoader ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <MdVisibility className="w-4 h-4" />
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
                    ref={listRef}
                    height={listHeight}
                    itemCount={hasMore ? bookings.length + 1 : bookings.length}
                    itemSize={getRowHeight}
                    width="100%"
                  >
                    {Row}
                  </List>
                )}
              </InfiniteLoader>
            </div>
          </div>
        )}
        {restaurantBillTransfer && (
          <KotBillTransferModal
            selectedCheckIns={selectedCheckOut}
            onClose={setShowRestaurantBillTransfer}
            cmp_id={cmp_id}
          />
        )}

        {isLoading && !loader && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </>
  );
}

export default BookingList;
