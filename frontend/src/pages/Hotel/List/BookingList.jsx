import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../api/api";
import { toast } from "sonner";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  MdDelete,
  MdCheckCircle,
  MdPayment,
  MdVisibility,
} from "react-icons/md";
import { motion } from "framer-motion";

import Swal from "sweetalert2";

import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import SearchBar from "@/components/common/SearchBar";
import TitleDiv from "@/components/common/TitleDiv";
import { Check, CreditCard, X, Banknote } from "lucide-react";
import useFetch from "@/customHook/useFetch";
function BookingList() {
  const location = useLocation();

  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("pending");
  const [listHeight, setListHeight] = useState(0);
  const [activeTab, setActiveTab] = useState("pending"); // Default to pending
  const [selectedCheckOut, setSelectedCheckOut] = useState(
    location?.state?.selectedCheckOut || []
  );
  const [conformationModal, setConformationModal] = useState(false);
  const [paymentType, setPaymentType] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [splitCustomerName, setSplitCustomerName] = useState([]);
  const [checkOutModal, setCheckOutModal] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const listRef = useRef();
  const searchTimeoutRef = useRef(null);
  const limit = 60; // Number of bookings per page

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedDataForPayment, setSelectedDataForPayment] = useState(null);

  const [paymentMode, setPaymentMode] = useState("single"); // "single" or "split" setPaymentMode("single");
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [paymentError, setPaymentError] = useState(null);
  const [selectedCash, setSelectedCash] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [cashOrBank, setCashOrBank] = useState({});
  const [restaurantBaseSaleData, setRestaurantBaseSaleData] = useState({});
  const { _id: cmp_id, configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  useEffect(() => {
    if (location?.state?.selectedCheckOut) {
      setSelectedCheckOut(location?.state?.selectedCheckOut);
      setSelectedCustomer(location?.state?.selectedCustomer?._id);
      setRestaurantBaseSaleData(location?.state?.kotData);
      setSelectedDataForPayment((prevData) => ({
        ...prevData,
        total: location?.state?.balanceToPay,
      }));
      setShowPaymentModal(true);
    }
  }, [location?.state?.selectedCheckOut]);

  // Debounced search function
  const searchData = (data) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to update the search term after 500ms
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(data);
      // Reset pagination when searching
      setPage(1);
      setBookings([]);
      setHasMore(true);
    }, 500);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  );

  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData?.data;

      setCashOrBank(paymentTypeData?.data);
      if (bankDetails && bankDetails.length > 0) {
        setSelectedBank(bankDetails[0]._id);
      }
      if (cashDetails && cashDetails.length > 0) {
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
          }
        );

        if (pageNumber === 1) {
          setBookings(res?.data?.bookingData);
        } else if (res.data.bookingData) {
          setBookings((prevBookings) => [
            ...prevBookings,
            ...res.data.bookingData,
          ]);
        }

        setHasMore(res.data.pagination?.hasMore);
        setPage(pageNumber);
      } catch (error) {
        console.log(error);
        setHasMore(false);
        setBookings([]);
        // toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id, activeTab]
  );

  useEffect(() => {
    // Fetch bookings whenever searchTerm changes (debounced)
    fetchBookings(1, searchTerm);
  }, [fetchBookings, searchTerm, activeTab]);

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

  const handleDelete = async (id) => {
    // Show confirmation dialog
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

    // If user confirms deletion
    if (confirmation.isConfirmed) {
      setLoader(true);
      try {
        const res = await api.delete(`/api/sUsers/deleteBooking/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Display success message
        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000, // Auto close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh the bookings list
        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== id)
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete booking"
        );
        console.log(error);
      } finally {
        setLoader(false);
      }
    }
  };

  // Calculate the height of the list
  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // Items loaded status for InfiniteLoader
  const isItemLoaded = (index) => index < bookings.length;

  // Load more items when reaching the end
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

  // const handleCheckOutData = async () => {
  //   setSaveLoader(true);
  //   try {
  //     let response = await api.put(
  //       `/api/sUsers/checkOutWithArray/${cmp_id}`,
  //       { data: selectedCheckOut },
  //       { withCredentials: true }
  //     );
  //     if (response?.data?.success) {
  //       toast.success(response?.data?.message);
  //       fetchBookings(1, searchTerm);
  //     }
  //   } catch (error) {
  //     toast.error(error?.response?.data?.message);
  //     console.log(error);
  //   } finally {
  //     setSaveLoader(false);
  //     setCheckOutModal(false);
  //     setSelectedCheckOut([]);
  //   }
  // };

  const handleSavePayment = async () => {
    setSaveLoader(true);
    let paymentDetails;
    if (paymentMode == "single") {
      if (paymentMethod == "cash") {
        paymentDetails = {
          cashAmount: selectedDataForPayment?.total,
          onlineAmount: onlineAmount,
          selectedCash: selectedCash,
          selectedBank: selectedBank,
          paymentMode: paymentMode,
        };
      } else {
        paymentDetails = {
          cashAmount: cashAmount,
          onlineAmount: selectedDataForPayment?.total,
          selectedCash: selectedCash,
          selectedBank: selectedBank,
          paymentMode: paymentMode,
        };
      }
    } else {
      if (
        Number(cashAmount) + Number(onlineAmount) !=
        selectedDataForPayment?.total
      ) {
        setPaymentError(
          "Cash and online amounts together equal the total amount."
        );
        setSaveLoader(false);
        return;
      }
      paymentDetails = {
        cashAmount: cashAmount,
        onlineAmount: onlineAmount,
        selectedCash: selectedCash,
        selectedBank: selectedBank,
        paymentMode: paymentMode,
      };
    }

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
        },
        { withCredentials: true }
      );
      console.log(response);
      // Check if the response was successful
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message);
      }
    } catch (error) {
      console.error(
        "Error updating order status:",
        error.response?.data || error.message
      );
    } finally {
      setSelectedCheckOut([]);
      setSelectedCustomer(null);
      setSaveLoader(false);
      setCashAmount(0);
      setOnlineAmount(0);
      setShowPaymentModal(false);
      fetchBookings(1, searchTerm);
    }
  };

  const TableHeader = () => (
    <div className="bg-gray-100 border-b border-gray-300 sticky top-0 z-10">
      {/* Mobile Header */}
      <div className="flex items-center px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider md:hidden">
        <div className="w-18 text-center">SL.NO</div>
        <div className="w-32 text-center">BOOKING DATE</div>
        <div className="w-32 text-center">BOOKING NO</div>
        <div className="w-32 text-center"> ACTIONS</div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center px-4 py-3 text-xs font-bold text-gray-800 uppercase tracking-wider">
        <div className="w-10 text-center">SL.NO</div>
        <div className="w-28 text-center">BOOKING DATE</div>
        <div className="w-32 text-center">BOOKING NO</div>
        <div className="w-40 text-center">GUEST NAME</div>
        <div className="w-24 text-center">ROOM NO</div>
        <div className="w-36 text-center">ARRIVAL DATE</div>
        <div className="w-28 text-center">ROOM TARIFF</div>
        <div className="w-20 text-center">PAX</div>
        <div className="w-28 text-center">FOODPLAN AMOUNT</div>
        <div className="w-24 text-center">ADVANCE</div>
        <div className="w-28 text-center">TOTAL</div>
        <div className="w-32 text-center">ACTIONS</div>
      </div>
    </div>
  );

  const Row = ({ index, style }) => {
    // Return a loading placeholder if the item is not loaded yet
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
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-40 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-24 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-36 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-20 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-24 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-28 h-4 bg-gray-200 rounded mr-4"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    const el = bookings[index];
    if (!el) return null;

    const adjustedStyle = {
      ...style,
      height: "56px",
    };

    const isCheckOutSelected = (order) => {
      return selectedCheckOut.find((item) => item._id === order._id);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("en-GB");
    };

   
    return (
      <div
        key={index}
        style={adjustedStyle}
        className={`
  flex items-center px-4 py-3 text-sm
  border-b border-gray-200 
  cursor-pointer transition-all duration-200 ease-in-out 
  bg-white hover:bg-gray-50 
  ${
    isCheckOutSelected(el) &&
    (location.pathname === "/sUsers/checkInList" )
      ? "bg-blue-400 border-blue-400 ring-2 ring-blue-200"
      : ""
  }
`}
        onClick={() => {
          console.log(el?.checkInId?.status);
          if (el?.checkInId?.status === "checkOut") return;
          let findOne = selectedCheckOut.find((item) => item._id === el._id);
          if (selectedCheckOut.length == 0) {
            setSelectedCustomer(el.customerId?._id);
          }
          if (findOne) {
            setSelectedCheckOut((prev) =>
              prev.filter((item) => item._id !== el._id)
            );
            return;
          }
          setSelectedCheckOut((prev) => [...prev, el]);
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
            {/* Primary Action Button */}
            {((location.pathname === "/sUsers/bookingList" &&
              el?.status != "checkIn") ||
              (el?.status != "checkOut" &&
                location.pathname === "/sUsers/checkInList") ||
              (Number(el?.balanceToPay) > 0 &&
                location.pathname === "/sUsers/checkOutList")) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (location.pathname == "/sUsers/bookingList") {
                    navigate(`/sUsers/checkInPage`, {
                      state: { bookingData: el },
                    });
                  } else if (
                    location.pathname === "/sUsers/checkOutList" &&
                    el.checkInId
                  ) {
                    navigate(`/sUsers/EditCheckOut`, {
                      state: el,
                    });
                  } else {
                    navigate(`/sUsers/CheckOutPage`, {
                      state: { bookingData: el },
                    });
                  }
                }}
                className="bg-black hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
              >
                {location.pathname === "/sUsers/checkInList"
                  ? "Checkout"
                  : location.pathname === "/sUsers/checkOutList"
                  ? "Close"
                  : "CheckIn"}
              </button>
            )}

            {/* Status Button */}
            {((el?.status === "checkIn" &&
              location.pathname === "/sUsers/bookingList") ||
              (el?.status === "checkOut" &&
                location.pathname === "/sUsers/checkInList") ||
              (Number(el?.balanceToPay) <= 0 &&
                location.pathname === "/sUsers/checkOutList")) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (location.pathname === "/sUsers/checkOutList") {
                    setSelectedCustomer(el.customerId?._id);
                    setSelectedCheckOut([el]);
                    navigate("sUsers/BillPrint", {
                      state: {
                        selectedCheckOut: bookings?.filter(
                          (item) => item.voucherNumber === el.voucherNumber
                        ),
                        customerId: el.customerId?._id,
                        isForPreview: false,
                      },
                    });
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

            {/* Edit and Delete Actions */}
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
          </div>
        </div>
        <div className="hidden md:flex items-center w-full">
          {/* SL.NO */}
          <div className="w-10 text-center text-gray-700 font-medium">
            {index + 1}
          </div>

          {/* BOOKING DATE */}
          <div className="w-28 text-center text-gray-600 text-xs">
            {formatDate(el?.bookingDate)}
          </div>

          {/* BOOKING NO */}
          <div className="w-32 text-center text-gray-700 font-semibold text-xs">
            {el?.voucherNumber || "-"}
          </div>

          {/* GUEST NAME */}
          <div
            className="w-40 text-center text-gray-700 truncate text-xs"
            title={el?.customerId?.partyName}
          >
            {el?.customerId?.partyName || "-"}
          </div>

          {/* ROOM NO */}
          <div className="w-24 text-center text-gray-600 font-medium">
            {el?.selectedRooms?.map((r) => r.roomName).join(", ") || "-"}
          </div>

          {/* ARRIVAL DATE/TIME */}
          <div className="w-36 text-center text-gray-600 text-xs">
            {formatDate(el?.arrivalDate)}
            <span>({el.arrivalTime})</span>
          </div>

          {/* ROOM TARIFF */}
          <div className="w-28 text-center text-gray-600 text-xs">
            ₹{el?.selectedRooms?.[0]?.priceLevelRate || "0.00"}
          </div>

          {/* ADD. PAX */}
          <div className="w-20 text-center text-gray-600 font-medium">
            {el?.selectedRooms?.[0]?.pax || 0}
          </div>

          {/* FOOD PLAN */}
          <div className="w-28 text-center text-gray-600 text-xs">
            ₹{el?.selectedRooms?.[0]?.foodPlanAmount || "0.00"}
          </div>

          {/* ADVANCE */}
          <div className="w-24 text-center text-gray-600 text-xs">
            ₹
            {el?.advanceAmount
              ? formatCurrency(el.advanceAmount).replace("₹", "")
              : "0.00"}
          </div>

          {/* TOTAL */}
          <div className="w-28 text-center text-gray-800 font-semibold text-xs">
            ₹
            {el?.grandTotal
              ? formatCurrency(el.grandTotal).replace("₹", "")
              : "6,000.00"}
          </div>

          {/* ACTIONS */}
          <div className="w-32 flex items-center justify-center gap-1">
            {/* Primary Action Button */}
            {((location.pathname === "/sUsers/bookingList" && el?.status != "checkIn") ||
              (el?.status != "checkOut" && location.pathname != "/sUsers/checkInList") && location.pathname != "/sUsers/checkOutList" ) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (location.pathname == "/sUsers/bookingList") {
                    navigate(`/sUsers/checkInPage`, {
                      state: { bookingData: el },
                    });
                  } else if (
                    location.pathname === "/sUsers/checkOutList" &&
                    el.checkInId
                  ) {
                    // navigate(`/sUsers/EditCheckOut`, {
                    //   state: el,
                    // });
                  } else {
                    navigate(`/sUsers/CheckOutPage`, {
                      state: { bookingData: el },
                    });
                  }
                }}
                className="bg-black hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded text-xs transition duration-300"
              >
                CheckIn
              </button>
            )}

            {/* Status Button */}
            {((el?.status === "checkIn" &&
              location.pathname === "/sUsers/bookingList") ||
              (el?.status === "checkOut" &&
                location.pathname === "/sUsers/checkInList") ||
              (Number(el?.balanceToPay) <= 0 &&
                location.pathname === "/sUsers/checkOutList")) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (location.pathname === "/sUsers/checkOutList") {
                    setSelectedCustomer(el.customerId?._id);
                    setSelectedCheckOut([el]);
                    const hasPrint1 = configurations[0]?.defaultPrint?.print1;

                      navigate(
                        hasPrint1
                          ? "/sUsers/CheckOutPrint"
                          : "/sUsers/BillPrint",
                   {
                      state: {
                        selectedCheckOut: bookings?.filter(
                          (item) => item.voucherNumber === el.voucherNumber
                        ),
                        customerId: el.customerId?._id,
                        isForPreview: false,
                      },
                    });
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

            {/* Edit and Delete Actions */}
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
          </div>
        </div>
      </div>
    );
  };

  // Main Component
  // const BookingListComponent = () => {
  return (
    <>
      <div className="flex-1 bg-slate-50 h-screen overflow-hidden">
        <div className="sticky top-0 z-20">
          <TitleDiv
            loading={loader}
            title={
              location.pathname === "/sUsers/checkInList"
                ? "Hotel Check In List "
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
            Oops!!. No Bookings Found
          </div>
        )}

        {/* Confirmation Modal */}
        {selectedCheckOut.length > 0 &&
          (location.pathname === "/sUsers/checkInList" ||
            location.pathname === "/sUsers/checkOutList") && (
            <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[280px]">
                {/* Selected Items Count */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <MdCheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div></div>
                  </div>
                  <button
                    onClick={() => setSelectedCheckOut([])}
                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-all"
                  >
                    ✕
                  </button>
                </div>

                {/* Selected Items List */}
  <div className="max-h-32 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="space-y-2">
                    {selectedCheckOut.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg"
                      >
                        <span className="font-medium text-gray-700">
                          #{item.voucherNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>              
                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Select Customer
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCheckOut([])}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Clear All
                  </button>
                  <button
                    className="flex-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                    onClick={() => {
                      console.log(configurations[0]?.defaultPrint?.print1);
                      const hasPrint1 = configurations[0]?.defaultPrint?.print1;

                      navigate(
                        hasPrint1
                          ? "/sUsers/CheckOutPrint"
                          : "/sUsers/BillPrint",
                        {
                          state: {
                            selectedCheckOut,
                            customerId: selectedCustomer,
                            isForPreview: true,
                          },
                        }
                      );
                    }}
                  >
                    <MdPayment className="w-4 h-4" />
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Payment Modal */}
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
                      setSelectedCash("");
                      setSelectedBank("");
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
                </div>
              </div>

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

                  {/* Cash Payment Dropdown */}
                  {paymentMethod === "cash" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Cash
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                        <span className="text-xs font-medium">Online:</span>
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

              {/* Error Message */}
              {paymentError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-xs">{paymentError}</p>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-base text-blue-600">
                    ₹{selectedDataForPayment?.total}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      handleSavePayment();
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

        {/* Table Structure */}
        {bookings?.length && bookings.length > 0 && (
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
                    height={listHeight - 140} // Adjust for header
                    itemCount={
                      hasMore ? bookings?.length + 1 : bookings?.length
                    }
                    itemSize={56} // Height for table rows
                    onItemsRendered={onItemsRendered}
                    ref={(listInstance) => {
                      ref(listInstance);
                      listRef.current = listInstance;
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
  );
}

export default BookingList;
