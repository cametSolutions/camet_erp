import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../api/api";
import { toast } from "react-toastify";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [listHeight, setListHeight] = useState(0);
  console.log(location?.state?.selectedCustomer);
  console.log(location?.state?.balanceToPay);
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
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  useEffect(() => {
    if (location?.state?.selectedCheckOut) {
      setSelectedCheckOut(location?.state?.selectedCheckOut);
      setSelectedCustomer(location?.state?.selectedCustomer?._id);
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
        // toast.error("Failed to load bookings");
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id]
  );

  useEffect(() => {
    // Fetch bookings whenever searchTerm changes (debounced)
    fetchBookings(1, searchTerm);
  }, [fetchBookings, searchTerm]);

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

  const handleCheckOutData = async () => {
    setSaveLoader(true);
    try {
      let response = await api.put(
        `/api/sUsers/checkOutWithArray/${cmp_id}`,
        { data: selectedCheckOut },
        { withCredentials: true }
      );
      if (response?.data?.success) {
        toast.success(response?.data?.message);
        fetchBookings(1, searchTerm);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    } finally {
      setSaveLoader(false);
      setCheckOutModal(false);
      setSelectedCheckOut([]);
    }
  };

  const handleSavePayment = async (id) => {
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
        },
        { withCredentials: true }
      );
      // Check if the response was successful
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message);
        fetchBookings(1, searchTerm);
      }
    } catch (error) {
      console.error(
        "Error updating order status:",
        error.response?.data || error.message
      );
    } finally {
      setSaveLoader(false);
      setCashAmount(0);
      setOnlineAmount(0);
      setShowPaymentModal(false);
    }
  };

  const Row = ({ index, style }) => {
    // Return a loading placeholder if the item is not loaded yet
    if (!isItemLoaded(index)) {
      return (
        <div
          style={style}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col rounded-sm "
        >
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    const el = bookings[index];
    if (!el) return null;

    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "128px",
    };

    const isCheckOutSelected = (order) => {
      return selectedCheckOut.find((item) => item._id === order._id);
    };

    return (
      <div
        key={index}
        style={adjustedStyle}
        className={`bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col rounded-sm cursor-pointer transition-all duration-200 ease-in-out
    ${
      isCheckOutSelected(el) &&
      (location.pathname === "/sUsers/checkInList" ||
        location.pathname === "/sUsers/checkOutList")
        ? "border-2 border-blue-500 ring-2 ring-blue-200 bg-blue-50 shadow-lg scale-[1.02] transform"
        : "border border-gray-200 hover:border-blue-300 hover:bg-slate-50 hover:shadow-xl"
    }`}
        onClick={() => {
          if (el.status === "checkOut") return;
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
        <div className="flex">
          <p className="font-bold text-sm">{el?.voucherNumber}</p>
          {((location.pathname === "/sUsers/bookingList" &&
            el?.status != "checkIn") ||
            (el?.status != "checkOut" &&
              location.pathname === "/sUsers/checkInList") ||
            (Number(el?.balanceToPay) > 0 &&
              location.pathname === "/sUsers/checkOutList")) && (
            <button
              onClick={() => {
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
              className="bg-black hover:bg-blue-400 text-white font-semibold py-1 px-2 rounded shadow-md transition duration-300 ml-auto"
            >
              {location.pathname === "/sUsers/checkInList"
                ? "Checkout"
                : location.pathname === "/sUsers/checkOutList"
                ? "Close"
                : "Check-In"}
            </button>
          )}
          {((el?.status === "checkIn" &&
            location.pathname === "/sUsers/bookingList") ||
            (el?.status === "checkOut" &&
              location.pathname === "/sUsers/checkInList") ||
            (Number(el?.balanceToPay) <= 0 &&
              location.pathname === "/sUsers/checkOutList")) && (
            <button
              onClick={() => {
                if (location.pathname === "/sUsers/checkOutList") {
                  setSelectedCustomer(el.customerId?._id);
                  setSelectedCheckOut([el]);
                  console.log(bookings?.filter((item) => item.voucherNumber === el.voucherNumber))
                  navigate("/sUsers/CheckOutPrint", {
                    state: {
                      selectedCheckOut:bookings?.filter((item) => item.voucherNumber === el.voucherNumber),
                      customerId: el.customerId?._id,
                      isForPreview: false,
                    },
                  });
                }
              }}
              className="bg-green-600 hover:bg-green-400 text-white font-semibold py-1 px-2 rounded shadow-md transition duration-300 ml-auto"
            >
              {location.pathname === "/sUsers/checkInList"
                ? "CheckedOut"
                : "Print"}
            </button>
          )}
        </div>
        <hr className="mt-4" />
        <div className="flex justify-between items-center w-full gap-3 mt-4 text-sm">
          <div className="flex flex-col">
            <div className="flex gap-2 text-sm">
              <div className="flex gap-2 text-nowrap">
                <p className="text-gray-500 uppercase">Customer :</p>
                <p className="text-gray-500">{el?.customerId?.partyName}</p>
              </div>
              <div className="flex gap-2">
                <p className="text-gray-500">Total :</p>
                <p className="text-gray-500">
                  {formatCurrency(el?.grandTotal)}
                </p>
              </div>
            </div>
          </div>
          {(el?.status != "checkIn" &&
            location.pathname == "/sUsers/bookingList") ||
          (el?.status != "checkOut" &&
            location.pathname == "/sUsers/checkInList") ? (
            <div className="flex items-center">
              <div
                className={` 
                flex gap-3 px-4`}
              >
                {/* <FaSignInAlt
                    title="Check In"
                    onClick={() =>
                      navigate("/sUsers/EditBooking", {
                        state: el,
                      })
                    }
                  /> */}
                <FaEdit
                  title="Edit booking details"
                  className="text-blue-500"
                  onClick={() => {
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
                  onClick={() => {
                    handleDelete(el._id);
                  }}
                  className="text-red-500"
                />
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
  };

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

          <SearchBar onType={searchData} />
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
                    {/* Replace with your actual customer list */}
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
                      navigate("/sUsers/CheckOutPrint", {
                        state: {
                          selectedCheckOut: selectedCheckOut,
                          customerId: selectedCustomer,
                          isForPreview: true,
                        },
                      });
                      // setCheckOutModal(true);
                    }}
                  >
                    <MdPayment className="w-4 h-4" />
                    Checkout
                  </button>
                </div>
              </div>
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
                      // Reset split payment selections
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
                  {/* Replace with your actual customer list */}
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
                        // value={selectedCash}
                        onChange={(e) => setSelectedCash(e.target.value)}
                      >
                        {cashOrBank?.cashDetails?.map((cashier) => (
                          <option key={cashier._id} value={cashier._id}>
                            {cashier.cash_ledname}
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
                        // value={selectedBank}
                        onChange={(e) => {
                          setSelectedBank(e.target.value);
                          // setSelectedCash
                        }}
                      >
                        <option value="" disabled>
                          Select Payment Method
                        </option>
                        {cashOrBank?.bankDetails?.map((cashier) => (
                          <option key={cashier._id} value={cashier._id}>
                            {cashier.bank_ledname}
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
                              {cashier.cash_ledname}
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
                              {cashier.bank_ledname}
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

        {/* {checkOutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-4 max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-gray-800">
                  Confirm Before CheckOut
                </h2>
                <button
                  onClick={() => {
                    setCheckOutModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* KOT Section */}
        {/* <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center text-blue-700">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">
                    Check-in List :{" "}
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
              </div> */}
        {/* Order Summary */}
        {/* <div className="bg-gray-50 p-3 rounded-lg">
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                  <span className="text-sm">Total Amount</span>
                  <span className="text-base text-blue-600">
                    ₹{selectedDataForPayment?.total}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      handleCheckOutData();
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
                        Confirm
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div> */}
        {/* </div> */}
        {/* )} */}

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
                height={listHeight}
                itemCount={hasMore ? bookings?.length + 1 : bookings?.length}
                itemSize={140}
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
