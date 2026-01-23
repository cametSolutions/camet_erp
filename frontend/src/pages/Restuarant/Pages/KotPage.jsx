import { useState, useEffect, useCallback, useRef } from "react";
import dayjs from "dayjs";
import useFetch from "@/customHook/useFetch";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import {
  MdDescription,
  MdAccessTime,
  MdList,
  MdAdd,
  MdInbox,
  MdRefresh,
  MdVisibility,
  MdPrint,
  MdCheckCircle,
  MdPayment,
  MdCancel,
  MdClose,
} from "react-icons/md";
import api from "@/api/api";

import { motion, AnimatePresence } from "framer-motion";

import { Check, CreditCard, X, Banknote,Plus } from "lucide-react";
import { generateAndPrintKOT } from "@/pages/Restuarant/Helper/kotPrintHelper";
import { useNavigate } from "react-router-dom";
// import VoucherPdf from "@/pages/voucher/voucherPdf/indian/VoucherPdf";
import { toast } from "react-toastify";
import { FaRegEdit } from "react-icons/fa";
import VoucherThreeInchPdf from "@/pages/voucher/voucherPdf/threeInchPdf/VoucherThreeInchPdf";
import { useReactToPrint } from "react-to-print";
import CustomerSearchInputBox from "@/pages/Hotel/Components/CustomerSearchInPutBox";

const OrdersDashboard = () => {
  const contentToPrint = useRef(null);
  const [activeFilter, setActiveFilter] = useState("ON PROCESS");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("reception");
  const [orders, setOrders] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const [isComplimentary, setIsComplimentary] = useState(false);
  const [allAdditionalChargesFromRedux, setAllAdditionalChargesFromRedux] =
    useState([]);
  const [additionalCharges, setAdditionalCharges] = useState([]);
  const [selectedDiscountCharge, setSelectedDiscountCharge] = useState(null);

  const [note, setNote] = useState("");

  const [saveLoader, setSaveLoader] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedDataForPayment, setSelectedDataForPayment] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [paymentMode, setPaymentMode] = useState("single"); // "single" or "split"
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [selectedCash, setSelectedCash] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedCreditor, setSelectedCreditor] = useState("");
  const [cashOrBank, setCashOrBank] = useState({});
  const [selectedKot, setSelectedKot] = useState([]);
  const [saleVoucherData, setSaleVoucherData] = useState();
  const [showVoucherPdf, setShowVoucherPdf] = useState(false);
  const [previewForSales, setPreviewForSales] = useState(null);
  const [conformationModal, setConformationModal] = useState(false);
  const [isPostToRoom, setIsPostToRooms] = useState(false);

  const location = useLocation();
  const selectedKotFromRedirect = location.state?.selectedKot;
  const fromTable = location.state?.fromTable ?? false;
  const [showKotNotification, setShowKotNotification] = useState(fromTable);
  // state used for showing pdf print

  const [salePrintData, setSalePrintData] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelledKots, setCancelledKots] = useState([]);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");

  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountCharge, setDiscountCharge] = useState(null);

  const [discountType, setDiscountType] = useState("amount"); // "amount" or "percentage"
  const [discountValue, setDiscountValue] = useState(0);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { _id: cmp_id, name: companyName } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const { data, refreshHook } = useFetch(
    `/api/sUsers/getKotData/${cmp_id}?date=${selectedDate}`
  );

  const fetchData = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // ✅ FIXED - Safe array handling
      let additionalChargesResponse = Array.isArray(
        allAdditionalChargesFromRedux
      )
        ? allAdditionalChargesFromRedux
        : [];

      if (additionalChargesResponse.length === 0) {
        const response = await api.get(
          `/api/sUsers/additionalcharges/${cmp_id}`,
          {
            withCredentials: true,
          }
        );
        additionalChargesResponse = Array.isArray(
          response.data.additionalCharges
        )
          ? response.data.additionalCharges
          : Array.isArray(response.data)
          ? response.data
          : [];

        setAllAdditionalChargesFromRedux(additionalChargesResponse);
      }

      // ✅ Now SAFE to filter
      const discountCharges = additionalChargesResponse.filter((charge) =>
        charge.name.toLowerCase().includes("discount")
      );
      setAdditionalCharges(discountCharges);

      // 3. Existing Series fetch logic
      const seriesResponse = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=sales`,
        { withCredentials: true }
      );
      if (seriesResponse.data) {
        const specificSeries = seriesResponse.data.series?.find(
          (item) => item.under === "restaurant"
        );
        if (specificSeries) {
          const {
            prefix = "",
            currentNumber = 0,
            suffix = "",
            width = 3,
          } = specificSeries;
          const paddedNumber = String(currentNumber).padStart(width, "0");
          const specificNumber = `${prefix}${paddedNumber}${suffix}`;
          setSaleVoucherData({
            series: specificSeries,
            number: specificNumber,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Error fetching data");
      setAdditionalCharges([]); // ✅ Fallback to empty array
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id, allAdditionalChargesFromRedux, isLoading]);
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data) {
      console.log(data?.data[23]);
      setOrders(data?.data);
    }
  }, [data, selectedDate]);

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  );
  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData?.data;

      setCashOrBank(paymentTypeData?.data);
      console.log(paymentTypeData?.data);
      if (bankDetails && bankDetails.length > 0) {
        setSelectedBank(bankDetails[0]._id);
      }
      if (cashDetails && cashDetails.length > 0) {
        setSelectedCash(cashDetails[0]._id);
      }
    }
  }, [paymentTypeData]);

  // const fetchData = useCallback(async () => {
  //   try {
  //     const response = await api.get(
  //       `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=sales`,
  //       { withCredentials: true }
  //     );
  //     if (response.data) {
  //       const specificSeries = response.data.series?.find(
  //         (item) => item.under === "restaurant"
  //       );
  //       if (specificSeries) {
  //         const {
  //           prefix = "",
  //           currentNumber = 0,
  //           suffix = "",
  //           width = 3,
  //         } = specificSeries;

  //         const paddedNumber = String(currentNumber).padStart(width, "0");
  //         const specificNumber = `${prefix}${paddedNumber}${suffix}`;
  //         let newSaleOjbect = {
  //           series: specificSeries,
  //           number: specificNumber,
  //         };

  //         setSaleVoucherData(newSaleOjbect);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.response?.data?.message || "Error fetching data");
  //   } finally {
  //     setLoader(false);
  //   }
  // }, [cmp_id]);
  // useEffect(() => {
  //   fetchData();
  // }, [fetchData]);
  // Status configuration

  useEffect(() => {
  const shouldOpenPaymentModal = sessionStorage.getItem('returnToPaymentModal');
  const savedModalData = sessionStorage.getItem('paymentModalData');
  
  if (shouldOpenPaymentModal === 'true' && savedModalData) {
    try {
      const modalData = JSON.parse(savedModalData);
      
      // Restore modal state
      setSelectedDataForPayment(modalData.selectedDataForPayment);
      setPaymentMode(modalData.paymentMode);
      setShowPaymentModal(true); // ✅ This is correct
      
      // Restore other relevant states
      if (modalData.selectedKot) {
        setSelectedKot(modalData.selectedKot);
      }
      if (modalData.discountAmount) {
        setDiscountAmount(modalData.discountAmount);
      }
      if (modalData.note) {
        setNote(modalData.note);
      }
      
      // Clear session storage
      sessionStorage.removeItem('returnToPaymentModal');
      sessionStorage.removeItem('paymentModalData');
    } catch (error) {
      console.error('Error restoring payment modal:', error);
      sessionStorage.removeItem('returnToPaymentModal');
      sessionStorage.removeItem('paymentModalData');
    }
  }
}, []);



  const statusConfig = {
    pending: {
      label: "Pending",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      iconColor: "bg-blue-600",
      order: 1,
    },
    cooking: {
      label: "Cooking",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      iconColor: "bg-yellow-600",
      order: 2,
    },
    ready_to_serve: {
      label: "Ready to Serve",
      bgColor: "bg-gray-100",
      textColor: "text-green-800",
      iconColor: "bg-green-600",
      order: 3,
    },
    completed: {
      label: "Completed",
      bgColor: "bg-green-200",
      textColor: "text-gray-800",
      iconColor: "bg-gray-600",
      order: 4,
    },
  };

  useEffect(() => {
    if (previewForSales) {
      setShowVoucherPdf(true);
    }
  }, [previewForSales]);

  const handleKotClick = () => {
    if (showKotNotification) {
      setShowKotNotification(false);
    }
  };

  // Available status transitions for kitchen
  const getAvailableStatuses = (currentStatus) => {
    const transitions = {
      pending: ["cooking"], // forward only from pending
      cooking: ["pending", "ready_to_serve"], // backward to pending, forward to ready_to_serve
      ready_to_serve: ["cooking", "completed"], // backward to cooking, forward to completed
      completed: ["ready_to_serve"], // only backward
    };
    return transitions[currentStatus] || [];
  };

  // Filter orders based on active filter
  // Updated getFilteredOrders function with proper kitchen filtering
  const getFilteredOrders = () => {
    let filtered = orders;

    filtered = filtered.filter(
      (order) => !cancelledKots.some((cancelled) => cancelled.id === order._id)
    );
    // Filter by status based on user role and active filter
    // if (userRole === "kitchen") {
    //   if (activeFilter === "All") {
    //     // Kitchen - All: Show all statuses
    //     filtered = filtered.filter((order) =>
    //       ["pending", "cooking", "ready_to_serve"].includes(order.status)
    //     );
    //   } else if (activeFilter === "On Process") {
    //     // Kitchen - On Process: Show pending, cooking, and ready_to_serve
    //     filtered = filtered.filter((order) =>
    //       ["pending", "cooking", "ready_to_serve"].includes(order.status)
    //     );
    //   }
    // } else if (userRole === "reception") {
    if (activeFilter === "All") {
      // Reception - All: Show all statuses
      filtered = filtered.filter((order) =>
        ["pending", "cooking", "ready_to_serve", "completed"].includes(
          order.status
        )
      );
    } else if (activeFilter === "ON PROCESS") {
      // Reception - On Process: Show pending, cooking, and ready_to_serve
      filtered = filtered.filter((order) =>
        ["pending", "cooking", "ready_to_serve"].includes(order.status)
      );
    } else if (activeFilter === "KOT BILL PENDING") {
      // Reception - Completed: Show only completed orders
      filtered = filtered.filter(
        (order) => order.status === "completed" && !order.paymentCompleted
      );
    } else if (activeFilter === "COMPLETED") {
      // Reception - Completed: Show only completed orders
      filtered = filtered.filter(
        (order) => order.status === "completed" && order.paymentCompleted
      );
    }
    // }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id?.toString().includes(searchQuery) ||
          order.items.some(
            (item) =>
              item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.product_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered;
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setSaveLoader(true);

    try {
      const response = await api.put(
        `/api/sUsers/updateKotStatus/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId
              ? { ...order, status: newStatus, statusType: newStatus }
              : order
          )
        );
      } else {
        console.error("Failed to update backend:", response.data || response);
      }
    } catch (error) {
      console.error(
        "Error updating order status:",
        error.response?.data || error.message
      );
    } finally {
      setSaveLoader(false);
    }
  };

  // function used to perform print  with kot
  const handleKotPrint = (data) => {
    console.log(data);
    const orderData = {
      kotNo: data?.voucherNumber,
      tableNo: data?.tableNumber,
      items: data?.items,
      createdAt: data?.createdAt,
      customerName: data?.customer?.name,
      type: data?.type,
    };
    console.log(orderData);

    generateAndPrintKOT(orderData, true, false, companyName);
  };

  const handleKotCancel = async () => {
    try {
      if (!selectedOrderForCancel) return;

      const response = await api.put(
        `/api/kot/cancel/${selectedOrderForCancel._id}`,
        { reason: cancelReason }
      );

      if (response.data.success) {
        // ✅ Remove the cancelled order from UI immediately
        setOrders((prevOrders) =>
          prevOrders.filter((kot) => kot._id !== selectedOrderForCancel._id)
        );

        setShowCancelModal(false);
        setCancelReason(""); // clear reason field
        setSelectedOrderForCancel(null);
      } else {
        console.error("Cancel failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error cancelling KOT:", error);
    }
  };

  const MenuIcon = () => (
    <svg
      className="w-4 h-4 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 6h16M4 12h16M4 18h16"
      ></path>
    </svg>
  );

  const SearchIcon = () => (
    <svg
      className="w-4 h-4 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      ></path>
    </svg>
  );

  // Simulate receiving role from props or URL params
  useEffect(() => {
    // In real implementation, get this from props, context, or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get("role") || "reception";
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (salePrintData) {
      navigate(`/sUsers/sharesalesThreeInch/${salePrintData._id}`);
    }
  }, [salePrintData, navigate]);

  const filteredOrders = getFilteredOrders();

  console.log("filteredOrders", filteredOrders);

  const handleSavePayment = async (id) => {
    setSaveLoader(true);
    

    try {
      // Credit validation
      if (paymentMode === "credit") {
        if (!selectedCreditor || !selectedCreditor._id) {
          setPaymentError("Please select a creditor");
          return;
        }
      }

      let paymentDetails;
      let selectedKotData;

      // ================= DIRECT SALE =================
      if (selectedDataForPayment?.isDirectSale) {
        if (paymentMethod === "cash") {
          paymentDetails = {
            cashAmount: selectedDataForPayment?.total,
            onlineAmount: 0,
            selectedCash,
            selectedBank,
            paymentMode: "single",
          };
        } else {
          paymentDetails = {
            cashAmount: 0,
            onlineAmount: selectedDataForPayment?.total,
            selectedCash,
            selectedBank,
            paymentMode: "single",
          };
        }

        selectedKotData = selectedDataForPayment;
      }

      // ================= NORMAL SALE =================
      else {
        const hasRoomService =
          selectedDataForPayment?.roomService &&
          Object.keys(selectedDataForPayment.roomService).length > 0;

        // ---------- WITH ROOM SERVICE ----------
        if (hasRoomService) {
          if (paymentMode === "single") {
            if (paymentMethod === "cash") {
              paymentDetails = {
                cashAmount: selectedDataForPayment?.total,
                onlineAmount: 0,
                selectedCash,
                selectedBank,
                paymentMode,
              };
            } else {
              paymentDetails = {
                cashAmount: 0,
                onlineAmount: selectedDataForPayment?.total,
                selectedCash,
                selectedBank,
                paymentMode,
              };
            }
          } else if (paymentMode === "credit") {
            paymentDetails = {
              cashAmount: selectedDataForPayment?.total,
              selectedCreditor,
              paymentMode,
            };
          } else {
            if (
              Number(cashAmount) + Number(onlineAmount) !==
              Number(selectedDataForPayment?.total)
            ) {
              setPaymentError(
                "Cash and online amounts together must equal total amount"
              );
              return;
            }

            paymentDetails = {
              cashAmount,
              onlineAmount,
              selectedCash,
              selectedBank,
              paymentMode,
            };
          }

          selectedKotData = selectedDataForPayment;
        }

        // ---------- WITHOUT ROOM SERVICE ----------
        else {
          if (paymentMode === "single") {
            if (paymentMethod === "cash") {
              paymentDetails = {
                cashAmount: selectedDataForPayment?.total,
                onlineAmount: 0,
                selectedCash,
                selectedBank,
                paymentMode,
              };
            } else {
              paymentDetails = {
                cashAmount: 0,
                onlineAmount: selectedDataForPayment?.total,
                selectedCash,
                selectedBank,
                paymentMode,
              };
            }
          } else if (paymentMode === "credit") {
            paymentDetails = {
              cashAmount: selectedDataForPayment?.total,
              selectedCreditor,
              paymentMode,
            };
          } else {
            if (
              Number(cashAmount) + Number(onlineAmount) !==
              Number(selectedDataForPayment?.total)
            ) {
              setPaymentError(
                "Cash and online amounts together must equal total amount"
              );
              return;
            }

            paymentDetails = {
              cashAmount,
              onlineAmount,
              selectedCash,
              selectedBank,
              paymentMode,
            };
          }

          selectedKotData = previewForSales || selectedDataForPayment;
        }
      }
      // const previewDiscount = previewForSales?.discount || discountAmount;
      // const previewDiscountCharge = previewForSales?.discountCharge || discountCharge;
      let additionalCharges = [];

      if (previewForSales && previewForSales.additionalCharges) {
        // ✅ Use EXACTLY what's in preview - don't rebuild
        additionalCharges = previewForSales.additionalCharges;
      }

       const hasAutoComplimentary = selectedKot.some((kot) => {
      const order = filteredOrders.find((o) => o._id === kot.id);
      return order?.foodPlanDetails?.isComplimentary === true;
    });

    const isManuallyComplimentary = isComplimentary && !hasAutoComplimentary;

    console.log("=== PAYMENT SUBMISSION ===");
    console.log("Is Complimentary:", isComplimentary);
    console.log("Has Auto Complimentary (from Food Plan):", hasAutoComplimentary);
    console.log("Is Manually Complimentary:", isManuallyComplimentary);

    // Show appropriate toast message
    if (isComplimentary) {
      if (hasAutoComplimentary) {
        toast.info("Processing complimentary order (Food Plan)");
      } else {
        toast.info("Processing manually marked complimentary order");
      }
    }
      // ================= FINAL PAYMENT OBJECT =================
      const payment = {
        paymentMethod,
        paymentDetails: {
          ...paymentDetails,
          cashAmount: Number(paymentDetails.cashAmount),
        },
        selectedKotData,
        isPostToRoom,
        isDirectSale: selectedDataForPayment?.isDirectSale || false,
        additionalCharges: additionalCharges,
          isComplimentary: isComplimentary, // ✅ ADD THIS
             isManuallyComplimentary: isManuallyComplimentary, 
        //  discountCharge: previewDiscountCharge,
        // discountAmount: previewDiscount,
        note,
      };

      console.log("=== PAYMENT OBJECT BEING SENT ===");
      console.log(JSON.stringify(payment, null, 2));

      const response = await api.put(
        `/api/sUsers/updateKotPayment/${cmp_id}`,
        payment,
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        setOrders((prev) =>
          prev.map((order) =>
            order._id === id ? { ...order, paymentCompleted: true } : order
          )
        );

         toast.success(
        isComplimentary 
          ? "Complimentary order processed successfully!" 
          : response?.data?.message
      );
        setShowPaymentModal(false);
        setSelectedDiscountCharge(null);
        setDiscountAmount(0);
        setDiscountType("amount");
        setDiscountValue(0);
        setNote("");
               setIsComplimentary(false); // 
        setPreviewForSales(null);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setSaveLoader(false);
      setCashAmount(0);
      setOnlineAmount(0);
      refreshHook();
      setPaymentMode("single");
      setSelectedCreditor("");
      setSelectedKot([]);
      setShowVoucherPdf(false);
    }
  };

  const handlePrintData = async (kotId) => {
    try {
      let saleData = await api.get(
        `/api/sUsers/getSalePrintData/${cmp_id}/${kotId}`,
        { withCredentials: true }
      );
      setSalePrintData(saleData?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  // function used to select multiple kot
  const handleSelectMultipleKots = (order) => {
    if (userRole == "kitchen") return;
    if (order && !order?.paymentCompleted) {
      console.log(order?.roomId?._id);
      const findOne = selectedKot.find((item) => item.id === order._id);
      const firstSelected = selectedKot[0];
      console.log(firstSelected); // take the first selection

      if (firstSelected) {
        // ✅ only allow roomService with same roomId
        if (firstSelected.roomId !== order?.roomId?._id) {
          toast.error("You can only select room  KOTs from the same room");
          return;
        }
      }

      if (findOne) {
        // remove if already selected
        setSelectedKot((prevSelected) =>
          prevSelected.filter((item) => item.id !== order._id)
        );
      } else {
        // add new selection
        setSelectedKot((prevSelected) => [
          ...prevSelected,
          {
            id: order._id,
            type: order.type,
            voucherNumber: order.voucherNumber,
            roomId: order?.roomId?._id, // keep roomId for validation
            checkInNumber: order?.checkInNumber,
            customer: order?.customer,
          },
        ]);
      }
    }
  };

  const handleSalesPreview = (postToRoom) => {
    setIsPostToRooms(postToRoom);
    let kotVoucherNumberArray = [];
    let itemList = selectedKot.flatMap((item) => {
      let findOne = filteredOrders.find((order) => order._id == item.id);
      if (findOne) {
        kotVoucherNumberArray.push({
          voucherNumber: findOne.voucherNumber,
          id: findOne._id,
          checkInNumber: findOne?.checkInNumber,
          tableNumber: findOne?.tableNumber,
        });
      }
      return findOne?.items || []; // return empty array if not found
    });

    let subtotal = itemList
      .reduce((acc, item) => acc + Number(item.total), 0)
      .toFixed(2);
    let finalAmount = (subtotal - (discountAmount || 0)).toFixed(2);

    let additionalChargesArray = [];

    if (discountAmount > 0 && selectedDiscountCharge) {
      const discountName =
        selectedDiscountCharge.name ||
        `Discount (${
          discountType === "percentage"
            ? discountValue + "%"
            : "₹" + discountValue
        })`;

      additionalChargesArray.push({
        _id: selectedDiscountCharge._id || null,
        name: discountName, // ✅ Add name
        amount: Number(discountAmount), // ✅ Calculated discount amount
        type: "subtract",
        value: Number(discountValue), // ✅ Original input value
        discountType: discountType,
        note: note || "",
        isDiscount: true,
      });
    }

    let newObject = {
      Date: new Date(),
      voucherType: "sales",
      serialNumber: saleVoucherData?.series?.currentNumber,
      userLevelSerialNumber: saleVoucherData?.series?.currentNumber,
      salesNumber: saleVoucherData?.number,
      series_id: saleVoucherData?.series?._id,
      usedSeriesNumber: saleVoucherData?.series?.currentNumber,
      partyAccount: "Cash-in-Hand",
      items: itemList,
      subtotal: subtotal, // Original total before discount
      discount: discountAmount || 0, // Discount amount
      discountCharge: selectedDiscountCharge,
      additionalCharges: additionalChargesArray, // Discount type details
      finalAmount: finalAmount,
      note: note || "",
        isComplimentary: isComplimentary, // ✅ ADD THIS - Independent flag // After discount
      total: finalAmount,
      voucherNumber: kotVoucherNumberArray,
      party: {
        partyName: selectedKot[0]?.customer?.name,
        address: selectedKot[0]?.customer?.address,
        mobile: selectedKot[0]?.customer?.phone,
      },
    };
    console.log("Preview Object Created:", newObject);
    setPreviewForSales(newObject);
  };

  const handleSaveSales = (status) => {
    setConformationModal(false);
    if (isPostToRoom && status) {
      handleSavePayment();
      return;
    }

    if (!status) {
      setShowVoucherPdf(false);
      setPreviewForSales(null);
      return;
    }
    

    // setDiscountAmount(0);
    // setDiscountCharge(null)

    setShowPaymentModal(true);
    setSelectedDataForPayment(previewForSales);
  };

  const handleEditKot = (kotData) => {
    console.log(kotData);
    if (kotData?.paymentCompleted) {
      toast.error("Kot Payment is completed so you can't edit");
      return;
    }
    // else if (kotData?.status === "completed") {
    //   toast.error("Kot is already completed so you can't edit");
    //   return;
    // }
    navigate("/sUsers/RestaurantDashboard", { state: { kotData } });
  };

  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
  });

  console.log(additionalCharges);
useEffect(() => {
  if (showPaymentModal && selectedKot.length > 0) {
    console.log("=== PAYMENT MODAL OPENED ===");
    
    // Check if any KOT has complimentary food plan
    const hasComplimentaryFoodPlan = selectedKot.some((kot) => {
      const order = filteredOrders.find((o) => o._id === kot.id);
      
      console.log("Checking KOT:", kot.voucherNumber);
      console.log("Food Plan Details:", order?.foodPlanDetails);
      console.log("Is Complimentary:", order?.foodPlanDetails?.isComplimentary);
      
      return order?.foodPlanDetails?.isComplimentary === true;
    });

    console.log("Has Complimentary Food Plan:", hasComplimentaryFoodPlan);

    // ✅ Auto-tick checkbox if complimentary
    setIsComplimentary(hasComplimentaryFoodPlan);
  }
}, [showPaymentModal, selectedKot, filteredOrders]);

  return (
    <>
      {showVoucherPdf && (
        <div>
          {/* <VoucherPdf
            data={previewForSales}
            org={org}
            userType="secondaryUser"
            tab="sales"
            isPreview={true}

            sendToParent={handleSaveSales}
          /> */}
          <VoucherThreeInchPdf
            contentToPrint={contentToPrint}
            data={previewForSales}
            org={org}
            tab="sale"
            isPreview={true}
            sendToParent={handleSaveSales}
            handlePrintData={handlePrint}
          />
        </div>
      )}
      {!showVoucherPdf && (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              {/* First Row - Title */}
              <div className="mb-3">
                <h1 className="text-lg font-semibold text-black text-center">
                  {userRole === "kitchen"
                    ? "Kitchen Orders"
                    : "Reception Orders"}{" "}
                  Display
                </h1>
              </div>

              {/* Second Row - Role and Date */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-500">Role:</span>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      setUserRole(e.target.value);
                      setActiveFilter("ON PROCESS");
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="reception">Reception</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="text-gray-600 text-sm">
                    {dayjs(selectedDate).format("dddd, D MMMM YYYY")}
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1 border rounded text-sm w-full max-w-[200px]"
                    max={dayjs().format("YYYY-MM-DD")}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout (unchanged) */}
            <div className="hidden sm:flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold text-black">
                  {userRole === "kitchen"
                    ? "Kitchen Orders"
                    : "Reception Orders"}{" "}
                  Display
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Role:</span>
                  <select
                    value={userRole}
                    onChange={(e) => {
                      setUserRole(e.target.value);
                      setActiveFilter("ON PROCESS");
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="reception">Reception</option>
                    <option value="kitchen">Kitchen</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-gray-600 text-sm">
                  {dayjs(selectedDate).format("dddd, D MMMM YYYY")}
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1 border rounded text-sm"
                  max={dayjs().format("YYYY-MM-DD")}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <div className="flex gap-2">
              {(userRole === "reception"
                ? ["All", "ON PROCESS", "KOT BILL PENDING", "COMPLETED"]
                : ["ON PROCESS"]
              ).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? "bg-green-800 text-white border-green-800"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {showKotNotification && selectedKotFromRedirect && (
              <div
                className="fixed top-6 inset-x-0 flex justify-center z-50 cursor-pointer"
                onClick={() => setShowKotNotification(false)}
              >
                <div className="bg-yellow-100 border border-yellow-400 px-6 py-2 rounded-lg shadow text-yellow-900 font-medium">
                  KOT #{selectedKotFromRedirect.voucherNumber} was selected from
                  table. Click to close this notice.
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MenuIcon />
              <input
                type="text"
                className="px-3 py-1.5 border border-gray-300 rounded-md w-64 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Search name, order ID, or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <SearchIcon />
            </div>
          </div>

          {/* Orders Grid */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <>
              {/* Orders List */}
              {filteredOrders.map((order) => {
                const currentStatusConfig = statusConfig[order.status];
                const availableStatuses = getAvailableStatuses(order.status);
                const isOrderSelected = (order) => {
                  return selectedKot.find((item) => item.id === order._id);
                };

                return (
                  <div
                    key={order.id}
                    className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border overflow-hidden h-96 flex flex-col cursor-pointer ${
                      isOrderSelected(order)
                        ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                        : "border-gray-100 hover:border-blue-200"
                    }`}
                    onClick={() => {
                      if (
                        showKotNotification &&
                        order._id === selectedKotFromRedirect._id
                      ) {
                        setShowKotNotification(false);
                      }
                      handleSelectMultipleKots(order);
                    }}
                  >
                    {/* Selection indicator - Tick mark */}
                    {isOrderSelected(order) && (
                      <div className="absolute top-2 right-2 z-10 bg-blue-500 rounded-full p-1 shadow-lg animate-bounce">
                        <MdCheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Status indicator bar */}
                    <div
                      className={`h-1 w-full ${currentStatusConfig.bgColor}`}
                    />

                    {/* Invoice Number - Independent Display */}
                    <div
                      className={`px-3 py-2 bg-gradient-to-r border-b flex-shrink-0 ${
                        isOrderSelected(order)
                          ? "from-blue-100 to-indigo-100 border-blue-200"
                          : "from-blue-50 to-indigo-50 border-blue-100"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-4">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm border ${
                            isOrderSelected(order)
                              ? "bg-blue-100 border-blue-300"
                              : "bg-white border-blue-200"
                          }`}
                        >
                          <MdDescription className="w-4 h-4 text-blue-600" />
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              isOrderSelected(order)
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {order.type} - {order?.tableNumber}
                            <span>
                              {order.roomId?.roomName && order?.tableNumber
                                ? ","
                                : " "}
                              {order.roomId?.roomName}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaRegEdit
                            className="w-4 h-4 text-blue-600"
                            onClick={() => handleEditKot(order)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Header */}
                    <div className="flex justify-between items-start p-3 pb-2 flex-shrink-0">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        {/* Order type and timestamp */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-blue-900">
                              #{order.voucherNumber}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MdAccessTime className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}{" "}
                              {new Date(order.createdAt).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status badge */}
                      <div
                        className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${currentStatusConfig.bgColor} ${currentStatusConfig.textColor}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${currentStatusConfig.iconColor} animate-pulse`}
                        />
                        {currentStatusConfig.label}
                      </div>
                    </div>

                    {/* Order Items - Scrollable Section */}
                    <div className="flex-1 px-3 overflow-hidden min-h-0">
                      <div className="mb-2">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <MdList className="w-3 h-3 text-gray-400" />
                          Items ({order.items.length}
                          {order.moreItems ? `+${order.moreItems}` : ""})
                        </h4>
                      </div>

                      {/* Scrollable Items Container */}
                      <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                        <div className="space-y-1.5">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                                isOrderSelected(order)
                                  ? "bg-blue-50 hover:bg-blue-100 border-blue-200"
                                  : "bg-gray-50 hover:bg-gray-100 border-gray-100"
                              }`}
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <div className="text-xs text-gray-800 font-medium leading-tight">
                                  {item?.product_name}
                                </div>
                                {item?.description && (
                                  <div className="text-xs text-gray-500 truncate mt-0.5">
                                    {item?.description}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-center">
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] inline-block ${
                                      isOrderSelected(order)
                                        ? "bg-blue-200 text-blue-900"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {item?.quantity}
                                  </span>
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    qty
                                  </div>
                                </div>

                                {userRole === "reception" && (
                                  <div className="text-right min-w-[50px]">
                                    <div className="font-bold text-xs text-gray-900">
                                      ₹{item?.price?.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ₹{item?.total?.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Additional items indicator */}
                          {order.moreItems && (
                            <div className="text-center py-2">
                              <div
                                className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                                  isOrderSelected(order)
                                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
                                    : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
                                }`}
                              >
                                <MdAdd className="w-3 h-3" />
                                {order.moreItems} more items
                              </div>
                            </div>
                          )}

                          {/* Empty state */}
                          {order.items.length === 0 && (
                            <div className="text-center py-4">
                              <MdInbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">
                                No items in this order
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Total - Reception */}
                    {userRole === "reception" && (
                      <div
                        className={`px-3 py-2 bg-gradient-to-r border-t flex-shrink-0 ${
                          isOrderSelected(order)
                            ? "from-blue-100 to-emerald-100 border-blue-200"
                            : "from-green-50 to-emerald-50 border-green-100"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={`text-xs font-semibold ${
                              isOrderSelected(order)
                                ? "text-blue-800"
                                : "text-green-800"
                            }`}
                          >
                            Total Amount
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              isOrderSelected(order)
                                ? "text-blue-900"
                                : "text-green-900"
                            }`}
                          >
                            ₹{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Kitchen Status Update */}
                    {userRole === "kitchen" && (
                      <div className="mx-3 mb-2 p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100 flex-shrink-0">
                        <div className="flex items-center gap-1 mb-2">
                          <MdRefresh
                            className={`w-3 h-3 text-orange-600 ${
                              loader ? "animate-spin" : ""
                            }`}
                          />
                          <span className="text-xs font-semibold text-orange-800">
                            Update Status
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {availableStatuses.length > 0 ? (
                            availableStatuses.map((status) => (
                              <button
                                key={status}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card selection when clicking status button
                                  handleStatusChange(order._id, status);
                                }}
                                className="flex-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                              >
                                {statusConfig[status].label}
                              </button>
                            ))
                          ) : (
                            <div className="w-full text-center py-1">
                              <span className="text-xs text-gray-500 italic">
                                No updates available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {userRole === "reception" && (
                      <div className="p-3 pt-2 flex gap-2 flex-shrink-0">
                        {order?.paymentCompleted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card selection when clicking action button
                              handlePrintData(order._id);
                            }}
                            className="flex-1 group px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                          >
                            <MdVisibility className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                            Print
                          </button>
                        )}
                        <button
                          className="flex-1 group px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card selection when clicking action button
                            handleKotPrint(order);
                          }}
                        >
                          <MdPrint className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                          Kot Print
                        </button>
                        {!order?.paymentCompleted && (
                          <button
                            className="flex-1 group px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log(
                                "Cancel button clicked for order:",
                                order
                              );
                              setSelectedOrderForCancel(order);
                              setShowCancelModal(true);
                              console.log("Modal should open now");
                            }}
                          >
                            <MdCancel className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                            Cancel
                          </button>
                        )}
                      </div>
                    )}

                    {/* Click indicator overlay */}
                    <div
                      className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
                        isOrderSelected(order)
                          ? "bg-blue-500 bg-opacity-5"
                          : "group-hover:bg-gray-500 group-hover:bg-opacity-5"
                      }`}
                    />
                  </div>
                );
              })}

              {/* Floating Pay Button - Show when items are selected */}
              {selectedKot.length > 0 && (
                <div className="fixed bottom-6 right-6 z-50 max-h-screen  animate-slideUp">
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
                    {/* Selected Items Count */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <MdCheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {selectedKot.length} item
                            {selectedKot.length > 1 ? "s" : ""} selected
                          </p>
                          <p className="text-xs text-gray-500">
                            Ready for payment
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedKot([])}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Selected Items List */}
                    <div className="max-h-32 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="space-y-2">
                        {selectedKot.map((item, index) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg"
                          >
                            <span className="font-medium text-gray-700">
                              #{item.voucherNumber}
                            </span>
                            <span className="text-gray-500 capitalize">
                              {item.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Amount Display */}
                    {userRole === "reception" && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg mb-2 border border-green-200
                       ">
                        {/* Subtotal */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-green-800">
                            Subtotal
                          </span>
                          <span className="font-semibold text-green-900">
                            ₹
                            {selectedKot
                              .reduce((total, kot) => {
                                const order = filteredOrders.find(
                                  (o) => o._id === kot.id
                                );
                                return total + (order?.total || 0);
                              }, 0)
                              .toFixed(2)}
                          </span>
                        </div>

                        {/* Discount Selection */}
                        {/* Discount Selection */}
                        <div className="border border-red-200 rounded-lg p-3 mb-2 bg-red-50">
                          <label className="block text-xs font-semibold text-red-700 mb-2">
                            Discount
                          </label>

                          <div className="flex flex-col gap-2">
                           
                            <select
                            value={additionalCharges[0]?._id}
                            >
                              <option value="">Select Discount</option>
                              {additionalCharges.map((charge) => (
                                <option key={charge._id} value={charge._id}>
                                  {charge.name}
                                </option>
                              ))}
                            </select>

                            {/* Toggle and Input */}
                            <div className="flex gap-2">
                              {/* Toggle Buttons */}
                              <div className="flex bg-gray-200 rounded-lg p-1">
                                <button
                                  onClick={() => {
                                    setDiscountType("amount");
                                    if (discountValue > 0) {
                                      setDiscountAmount(discountValue);
                                    }
                                  }}
                                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    discountType === "amount"
                                      ? "bg-white text-red-600 shadow-sm"
                                      : "text-gray-600"
                                  }`}
                                >
                                  ₹
                                </button>
                                <button
                                  onClick={() => {
                                    setDiscountType("percentage");
                                    if (discountValue > 0) {
                                      const subtotal = selectedKot.reduce(
                                        (total, kot) => {
                                          const order = filteredOrders.find(
                                            (o) => o._id === kot.id
                                          );
                                          return total + (order?.total || 0);
                                        },
                                        0
                                      );
                                      setDiscountAmount(
                                        (subtotal * discountValue) / 100
                                      );
                                    }
                                  }}
                                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                                    discountType === "percentage"
                                      ? "bg-white text-red-600 shadow-sm"
                                      : "text-gray-600"
                                  }`}
                                >
                                  %
                                </button>
                              </div>

                              {/* Input Field */}
                              <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                                  {discountType === "percentage" ? "%" : "₹"}
                                </span>
                                <input
                                  type="number"
                                  value={discountValue || ""}
                                  onChange={(e) => {
                                    const value =
                                      parseFloat(e.target.value) || 0;
                                    setDiscountValue(value);

                                    const subtotal = selectedKot.reduce(
                                      (total, kot) => {
                                        const order = filteredOrders.find(
                                          (o) => o._id === kot.id
                                        );
                                        return total + (order?.total || 0);
                                      },
                                      0
                                    );

                                    const calculatedAmount =
                                      discountType === "percentage"
                                        ? (subtotal * value) / 100
                                        : value;

                                    setDiscountAmount(calculatedAmount);

                                    if (value > 0) {
                                      setSelectedDiscountCharge({
                                        name: `Manual Discount (${
                                          discountType === "percentage"
                                            ? `${value}%`
                                            : `₹${value}`
                                        })`,
                                        amount: value,
                                        type: discountType,
                                      });
                                    }
                                  }}
                                  placeholder={
                                    discountType === "percentage" ? "0" : "0.00"
                                  }
                                  className="w-full pl-7 pr-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 text-sm"
                                  min="0"
                                  max={
                                    discountType === "percentage"
                                      ? "100"
                                      : undefined
                                  }
                                  step={
                                    discountType === "percentage" ? "1" : "0.01"
                                  }
                                />
                              </div>
                            </div>

                            {/* Calculated Discount Display */}
                            {discountValue > 0 && (
                              <div className="p-2 bg-red-100 rounded-lg">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-red-700">
                                    {discountType === "percentage"
                                      ? `${discountValue}% discount`
                                      : "Discount"}
                                  </span>
                                  <span className="font-semibold text-red-800">
                                    - ₹{discountAmount.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Remarks/Note */}
                        <div>
                          <label className="block text-xs font-semibold text-green-800 mb-1">
                            Remarks
                          </label>
                          <input
                            type="text"
                            placeholder="Enter note (optional)"
                            className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
  <label className="flex items-center gap-2 cursor-pointer">
     <input
      type="checkbox"
      checked={isComplimentary}
      onChange={(e) => {
        const isChecked = e.target.checked;
        setIsComplimentary(isChecked);
        
        // Check if auto-complimentary
        const hasAutoComplimentary = selectedKot.some((kot) => {
          const order = filteredOrders.find((o) => o._id === kot.id);
          return order?.foodPlanDetails?.isComplimentary === true;
        });

        if (!hasAutoComplimentary && isChecked) {
          toast.info("Marking order as complimentary");
        } else if (hasAutoComplimentary && !isChecked) {
          toast.warning("This order has a complimentary food plan");
        }
      }}
      className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
    />
    
    <div className="flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-green-700">
          Mark as Complimentary
        </span>
        
        {/* Show badge if auto-selected */}
        {selectedKot.some((kot) => {
          const order = filteredOrders.find((o) => o._id === kot.id);
          return order?.foodPlanDetails?.isComplimentary === true;
        }) && (
          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            ✓ Auto-selected (Food Plan)
          </span>
        )}
      </div>
      
      {/* Show details when checked */}
      {isComplimentary && (
        <div className="mt-2 p-2 bg-white rounded border border-green-200">
          {selectedKot.some((kot) => {
            const order = filteredOrders.find((o) => o._id === kot.id);
            return order?.foodPlanDetails?.isComplimentary === true;
          }) ? (
            <div className="space-y-1.5">
              <p className="text-xs text-green-700 font-medium">
                ✓ Complimentary Food Plans:
              </p>
              
              {/* List each KOT */}
              {selectedKot.map((kot) => {
                const order = filteredOrders.find((o) => o._id === kot.id);
                if (order?.foodPlanDetails?.planName) {
                  return (
                    <div key={kot.id} className="flex items-center justify-between text-xs bg-green-50 px-2 py-1 rounded">
                      <span className="text-gray-700">
                        KOT #{kot.voucherNumber}
                      </span>
                      <span className="font-medium text-green-700">
                        {order.foodPlanDetails.planName}
                        {order.foodPlanDetails.isComplimentary && " (Free)"}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <p className="text-xs text-amber-700">
              ⚠ Manually marked as complimentary (free service)
            </p>
          )}
        </div>
      )}
    </div>
  </label>
</div>

                        {/* Final Total */}
                        <div className="border-t border-green-300 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-green-800">
                              Total Amount
                            </span>
                            <span className="text-lg font-bold text-green-900">
                              ₹
                              {(
                                selectedKot.reduce((total, kot) => {
                                  const order = filteredOrders.find(
                                    (o) => o._id === kot.id
                                  );
                                  return total + (order?.total || 0);
                                }, 0) - (discountAmount || 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="text-xs text-green-700 text-right mt-1">
                              (After ₹{discountAmount.toFixed(2)} discount)
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {conformationModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl shadow-lg w-96 p-6 space-y-4">
                          <h2 className="text-lg font-semibold text-gray-800">
                            How would you like to proceed?
                          </h2>
                          <p className="text-sm text-gray-600">
                            Choose to continue with payment or post the bill to
                            the room.
                          </p>

                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => {
                                handleSalesPreview(false);
                              }}
                              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
                            >
                              Continue to Payment
                            </button>
                            <button
                              onClick={() => {
                                handleSalesPreview(true);
                              }}
                              className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-all duration-200"
                            >
                              Post to Room
                            </button>
                            <button
                              onClick={() => setConformationModal(false)}
                              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedKot([])}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                      >
                        Clear All
                      </button>
                      <button
                        className="flex-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                        onClick={() => {
                          let findOneWithNoRoomService = selectedKot.find(
                            (kot) => !kot.roomId
                          );
                          console.log(findOneWithNoRoomService);
                          if (findOneWithNoRoomService) {
                            handleSalesPreview();
                            toast.warning(
                              "Continue to room option only for room service"
                            );
                          } else {
                            setConformationModal(true);
                          }
                        }}
                      >
                        <MdPayment className="w-4 h-4" />
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom CSS for animations */}
              <style jsx>{`
                @keyframes slideUp {
                  from {
                    transform: translateY(100px);
                    opacity: 0;
                  }
                  to {
                    transform: translateY(0);
                    opacity: 1;
                  }
                }

                .animate-slideUp {
                  animation: slideUp 0.3s ease-out;
                }
              `}</style>
            </>
          </div>
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
                      setShowPaymentModal(false);
                      setPaymentMode("single");
                      setCashAmount(0);
                      setOnlineAmount(0);
                      setPaymentError("");
                      // Reset split payment selections
                      setSelectedCash("");
                      setSelectedBank("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* KOT Section */}
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-700">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      KOT :{" "}
                      {selectedDataForPayment?.voucherNumber?.map(
                        (item, index) => (
                          <span
                            key={item?.id || index}
                            className="text-sm font-medium"
                          >
                            {item?.voucherNumber}
                            {","}
                          </span>
                        )
                      )}
                    </span>
                  </div>
                </div>

                {/* Payment Mode Selection */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Mode
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => {
                        setPaymentMode("single");
                        setCashAmount(0);
                        setOnlineAmount(0);
                        setPaymentError("");
                        // Reset split payment selections
                        // setSelectedCash("");
                        // setSelectedBank("");
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
                        setPaymentMode("split");
                        setPaymentError("");
                        setCashAmount(0);
                        setOnlineAmount(0);
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
                        setPaymentMode("credit");
                        setCashAmount(0);
                        setOnlineAmount(0);
                        setPaymentError("");
                        // Reset split payment selections
                        // setSelectedCash("");
                        // setSelectedBank("");
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

                {/* Single Payment Method Selection */}
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
                        onClick={() => {
                          setPaymentMethod("card");
                        }}
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

                    {/* Cash Payment Dropdown */}
                    {paymentMethod === "cash" && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Cash
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={selectedCash}
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

                    {/* Online Payment Dropdown */}
                    {paymentMethod === "card" && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Bank/Payment Method
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={selectedBank}
                          onChange={(e) => {
                            setSelectedBank(e.target.value);
                          }}
                        >
                          <option value="" disabled>
                            Select Payment Method
                          </option>
                          {cashOrBank?.bankDetails?.map((cashier) => (
                            <option key={cashier._id} value={cashier._id}>
                              {cashier.partyName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Split Payment Amount Inputs */}
                {paymentMode === "split" && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Split Payment Amounts
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-16">
                          <Banknote className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium">Cash:</span>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={cashAmount}
                              onChange={(e) => {
                                if (
                                  Number(e.target.value) +
                                    Number(onlineAmount || 0) <=
                                  Number(selectedDataForPayment?.total)
                                ) {
                                  setCashAmount(e.target.value);
                                  setPaymentError("");
                                  return;
                                } else {
                                  setPaymentError(
                                    "Sum of cash and online amount should be less than or equal to order total."
                                  );
                                }
                              }}
                              className="w-full pl-6 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Cash Payment Dropdown - Show when cash amount > 0 */}
                      {cashAmount > 0 && (
                        <div className="ml-20">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Select Cash
                          </label>
                          <select
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            value={selectedCash}
                            onChange={(e) => setSelectedCash(e.target.value)}
                          >
                            <option value="" disabled>
                              Select Cash
                            </option>
                            {cashOrBank?.cashDetails?.map((cashier) => (
                              <option key={cashier._id} value={cashier._id}>
                                {cashier.partyName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 w-16">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium">Gpay:</span>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={onlineAmount}
                              onChange={(e) => {
                                if (
                                  Number(e.target.value) + Number(cashAmount) <=
                                  Number(selectedDataForPayment?.total)
                                ) {
                                  setOnlineAmount(e.target.value);
                                  setPaymentError("");
                                  return;
                                } else {
                                  setPaymentError(
                                    "Sum of cash and online amount should be less than or equal to order total."
                                  );
                                }
                              }}
                              className="w-full pl-6 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Online Payment Dropdown - Show when online amount > 0 */}
                      {onlineAmount > 0 && (
                        <div className="ml-20">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Select Bank
                          </label>
                          <select
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                          >
                            <option value="" disabled>
                              Select Bank
                            </option>
                            {cashOrBank?.bankDetails?.map((cashier) => (
                              <option key={cashier._id} value={cashier._id}>
                                {cashier.partyName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Payment Summary for Split */}
                      <div className="bg-gray-50 p-2 rounded-lg border">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Total Entered:</span>
                          <span>
                            ₹
                            {(
                              parseFloat(cashAmount || 0) +
                              parseFloat(onlineAmount || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                          <span>Order Total:</span>
                          <span>₹{selectedDataForPayment?.total}</span>
                        </div>
                        {parseFloat(cashAmount || 0) +
                          parseFloat(onlineAmount || 0) !==
                          selectedDataForPayment?.total && (
                          <div className="flex justify-between text-xs text-amber-600 mt-1">
                            <span>Difference:</span>
                            <span>
                              ₹
                              {(
                                selectedDataForPayment?.total -
                                (parseFloat(cashAmount || 0) +
                                  parseFloat(onlineAmount || 0))
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
{paymentMode === "credit" && (
  <div className="mb-3">
    <div className="flex items-center justify-between mb-3">
      <label className="block text-sm font-medium text-gray-700">
        Creditor
      </label>
    <button
  onClick={() => {
    sessionStorage.setItem('returnToPaymentModal', 'true');
    sessionStorage.setItem('paymentModalData', JSON.stringify({
      selectedDataForPayment,
      paymentMode,
      selectedKot,
      discountAmount,
      note
    }));
    
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.open(`/sUsers/addParty?returnUrl=${returnUrl}`, '_blank');
  }}
  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
>
  <Plus className="w-3.5 h-3.5" />
  <span>New Creditor</span>
</button>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Creditor
      </label>
      <CustomerSearchInputBox
        onSelect={(party) => {
          setSelectedCreditor(party);
        }}
        selectedParty={{}}
        isAgent={false}
        placeholder="Search customers..."
        sendSearchToParent={() => {}}
      />
      <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
        Can't find customer? Click "New Creditor" to add one
      </p>
    </div>
  </div>
)}

                {/* Error Message */}
                {paymentError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-xs">{paymentError}</p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-1">
                    {selectedDataForPayment?.type === "dine-in" && (
                      <div className="flex justify-between text-xs">
                        <span>Table Number:</span>
                        <span className="font-medium">
                          {selectedDataForPayment?.tableNumber}
                        </span>
                      </div>
                    )}
                    {selectedDataForPayment?.type !== "roomService" &&
                      selectedDataForPayment?.type !== "dine-in" && (
                        <>
                          <div className="flex justify-between text-xs">
                            <span>Customer:</span>
                            <span className="font-medium">
                              {selectedDataForPayment?.customer?.name}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Phone:</span>
                            <span className="font-medium">
                              {selectedDataForPayment?.customer?.phone}
                            </span>
                          </div>
                        </>
                      )}
                    {selectedDataForPayment?.type === "delivery" && (
                      <div className="flex justify-between text-xs">
                        <span>Address:</span>
                        <span className="font-medium text-right max-w-48">
                          {selectedDataForPayment?.customer?.address}
                        </span>
                      </div>
                    )}
                    {selectedDataForPayment?.type === "roomService" && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span>Room No:</span>
                          <span className="font-medium text-right max-w-48">
                            {selectedDataForPayment?.roomDetails?.roomno}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Guest Name:</span>
                          <span className="font-medium text-right max-w-48">
                            {selectedDataForPayment?.roomDetails?.guestName}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                    <span className="text-sm">Total Amount </span>
                    <span className="text-base text-blue-600">
                      ₹{selectedDataForPayment?.total}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => {
                        handleSavePayment(selectedDataForPayment?._id);
                      }}
                      disabled={saveLoader}
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

          {/* Empty State */}
          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-lg mb-2">No orders found</div>
              <div className="text-gray-500 text-sm">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "No orders match the current filter"}
              </div>
            </div>
          )}
          <AnimatePresence>
            {showCancelModal && selectedOrderForCancel && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">
                      Cancel KOT #{selectedOrderForCancel.voucherNumber}
                    </h2>
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        setSelectedOrderForCancel(null);
                        setCancelReason("");
                        setCancelError("");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MdClose className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Cancellation{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => {
                        setCancelReason(e.target.value);
                        setCancelError("");
                      }}
                      placeholder="Please provide a reason for cancelling this KOT..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                    {cancelError && (
                      <p className="text-red-500 text-xs mt-1">{cancelError}</p>
                    )}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-yellow-800">
                      <strong>Note:</strong> This will cancel the KOT from the
                      report only. The data will remain in the database.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCancelModal(false);
                        setSelectedOrderForCancel(null);
                        setCancelReason("");
                        setCancelError("");
                      }}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleKotCancel}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <MdCancel className="w-4 h-4" />
                      Confirm Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};

export default OrdersDashboard;
