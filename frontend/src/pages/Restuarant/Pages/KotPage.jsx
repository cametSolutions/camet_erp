import React, { useState, useEffect } from "react";
import useFetch from "@/customHook/useFetch";
import { useSelector } from "react-redux";
import {
  MdDescription,
  MdAccessTime,
  MdList,
  MdAdd,
  MdInbox,
  MdRefresh,
  MdVisibility,
  MdPrint,
} from "react-icons/md";
import api from "@/api/api";
import { motion } from "framer-motion";
import { Check, CreditCard, X, Banknote } from "lucide-react";
import { generateAndPrintKOT } from "@/pages/Restuarant/Helper/kotPrintHelper";

const OrdersDashboard = () => {
  const [activeFilter, setActiveFilter] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState("kitchen");
  const [orders, setOrders] = useState([]);
  const [loader, setLoader] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedDataForPayment, setSelectedDataForPayment] = useState({});

  const [paymentMode, setPaymentMode] = useState("single"); // "single" or "split"
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [selectedCash, setSelectedCash] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [cashOrBank, setCashOrBank] = useState({});

const { _id: cmp_id, name: companyName } = useSelector(
  (state) => state.secSelectedOrganization.secSelectedOrg
);


  const { data, loading } = useFetch(`/api/sUsers/getKotData/${cmp_id}`);

  useEffect(() => {
    if (data) {
      setOrders(data?.data);
    }
  }, [data]);

  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  );
  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData?.data;
      setCashOrBank(paymentTypeData?.data);
      if (bankDetails && bankDetails.length > 0) {
        setSelectedBank(bankDetails[0]);
      }
      if (cashDetails && cashDetails.length > 0) {
        setSelectedCash(cashDetails[0]);
      }
    }
  }, [paymentTypeData]);

  // Status configuration
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
  const getFilteredOrders = () => {
    let filtered = orders;
    // Filter by status
    if (activeFilter == "pending" && userRole !== "kitchen") {
      filtered = filtered.filter((order) =>
        ["pending", "cooking", "ready_to_serve", "completed"].includes(
          order.status
        )
      );
    } else if (activeFilter == "pending") {
      filtered = filtered.filter((order) =>
        ["pending", "cooking", "ready_to_serve"].includes(order.status)
      );
    } else if (activeFilter === "completed") {
      filtered = filtered.filter((order) => order.status === "completed");
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toString().includes(searchQuery) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered;
  };

 const handleStatusChange = async (orderId, newStatus) => {
  setLoader(true);

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
    setLoader(false);
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
    };

    generateAndPrintKOT(orderData, true, false, companyName);
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
    const role = urlParams.get("role") || "kitchen";
    setUserRole(role);
  }, []);

  const filteredOrders = getFilteredOrders();

  const handleSavePayment = async (id) => {
    let paymentDetails = {
      cashAmount: cashAmount,
      onlineAmount: onlineAmount,
      selectedCash: selectedCash,
      selectedBank: selectedBank,
    };
    console.log(paymentDetails);
    try {
      const response = await api.put(
        `/api/sUsers/updateKotPayment/${cmp_id}/${id}`,
        { paymentMethod: paymentMethod, paymentDetails: paymentDetails },
        { withCredentials: true }
      );
      // Check if the response was successful
      if (response.status === 200 || response.status === 201) {
        // Update the local state with the new status
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id
              ? { ...order, paymentMethod: data.paymentMethod }
              : order
          )
        );
        setLoader(false);
      } else {
        console.error("Failed to update backend:", response.data || response);
      }
    } catch (error) {
      console.error(
        "Error updating order status:",
        error.response?.data || error.message
      );
    }
    handlePrint(id);
    // Add your logic to save the payment details here
    setShowPaymentModal(false);
  };

  const handlePrint = () => {};

  console.log(cashOrBank);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-black">
            {userRole === "kitchen" ? "Kitchen Orders" : "Reception Orders"}{" "}
            Display
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="kitchen">Kitchen</option>
              <option value="reception">Reception</option>
            </select>
          </div>
        </div>
        <div className="text-gray-600 text-sm">Wednesday, 12 July 2023</div>
      </div>

      {/* Controls */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex gap-2">
          {["All", "On Process", "Completed"].map((filter) => (
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
        {filteredOrders.map((order) => {
          const currentStatusConfig = statusConfig[order.status];
          const availableStatuses = getAvailableStatuses(order.status);

          return (
            <div
              key={order.id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden h-96 flex flex-col"
            >
              {/* Status indicator bar */}
              <div className={`h-1 w-full ${currentStatusConfig.bgColor}`} />

              {/* Invoice Number - Independent Display */}
              <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex-shrink-0">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg shadow-sm border border-blue-200">
                    <MdDescription className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-900">
                      #{order.voucherNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Header */}
              <div className="flex justify-between items-start p-3 pb-2 flex-shrink-0">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  {/* Order type and timestamp */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {order.type}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MdAccessTime className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
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
                        className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="text-xs text-gray-800 font-medium leading-tight">
                            {item.product_name}
                          </div>
                          {item.description && (
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {item.description}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-center">
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] inline-block">
                              {item.quantity}
                            </span>
                            <div className="text-xs text-gray-400 mt-0.5">
                              qty
                            </div>
                          </div>

                          {userRole === "reception" && (
                            <div className="text-right min-w-[50px]">
                              <div className="font-bold text-xs text-gray-900">
                                ₹{item.price.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Additional items indicator */}
                    {order.moreItems && (
                      <div className="text-center py-2">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-200">
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
                <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-green-800">
                      Total Amount
                    </span>
                    <span className="text-sm font-bold text-green-900">
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
                      }`}userRole 
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
                          onClick={() => handleStatusChange(order._id, status)}
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
                <div className="p-3 pt-2 flex gap-2 flex-shrink-0 ">
                  <button
                    onClick={() => {
                      setShowPaymentModal(true);
                      setSelectedDataForPayment(order);
                    }}
                    className="flex-1 group px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                  >
                    <MdVisibility className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                    Pay
                  </button>
                  <button
                    className="flex-1 group px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                    onClick={() => handleKotPrint(order)}
                  >
                    <MdPrint className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                    Kot Print
                  </button>
                </div>
              )}
            </div>
          );
        })}
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
                  KOT #{selectedDataForPayment?.voucherNumber}
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
                    <span className="text-xs font-medium">Online Payment</span>
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
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
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
                        <option value="hdfc">HDFC Bank</option>
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
              <h3 className="text-xs font-semibold text-gray-700 mb-2">
                Order No - {selectedDataForPayment?.voucherNumber}
              </h3>
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
                          {selectedDataForPayment?.customer.name}
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
                <span className="text-sm">Total Amount</span>
                <span className="text-base text-blue-600">
                  ₹{selectedDataForPayment?.total}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    handleSavePayment(selectedDataForPayment?._id);
                  }}
                  className="flex-1 group px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                >
                  <MdVisibility className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                  Process Payment
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
    </div>
  );
};

export default OrdersDashboard;
