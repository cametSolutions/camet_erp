import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Clock,
  Users,
  TrendingUp,
  Filter,
  X,
  MenuIcon,
  Receipt,
  Home,
  Package,
  Car,
  Bed,
  ArrowLeft,
} from "lucide-react";
import { CiCircleList } from "react-icons/ci";
import TableSelection from "../Pages/TableSelection";

import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "@/api/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useFetch from "@/customHook/useFetch";
import { generateAndPrintKOT } from "../Helper/kotPrintHelper";
import { taxCalculatorForRestaurant } from "@/pages/Hotel/Helper/taxCalculator";
import { useLocation } from "react-router-dom";
const RestaurantPOS = () => {
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullTableSelection, setShowFullTableSelection] = useState(false);

  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showKOTModal, setShowKOTModal] = useState(false);
  const [orderType, setOrderType] = useState("dine-in");
  const [loading, setLoading] = useState(false);
  const [optionData, setOptionsData] = useState({});
  const [roomData, setRoomData] = useState({});
  const [showPriceLevelSelect, setShowPriceLevelSelect] = useState(false);
  const [priceLevelData, setPriceLevelData] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState(null);
  const kotDataForEdit = location.state?.kotData;

  useEffect(() => {
    if (kotDataForEdit) {
      setIsEdit(true);
      setOrderItems(kotDataForEdit.items);
      setOrderType(kotDataForEdit.type);
      setCustomerDetails({
        name: kotDataForEdit?.customer?.name,
        phone: kotDataForEdit?.customer?.phone,
        address: kotDataForEdit?.customer?.address,
        tableNumber: kotDataForEdit?.tableNumber,
      });
      setRoomDetails({
        ...roomDetails,
        _id: kotDataForEdit?.roomId || "",
        guestName: kotDataForEdit?.customer?.name || "",
        CheckInNumber: kotDataForEdit?.checkInNumber || "",
      });
    }
  }, [kotDataForEdit]);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const companyName = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?.name
  );
  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const gradientClasses = ["bg-gradient-to-r from-blue-400 to-blue-600"];

  const subcategoryIcons = {
    Pizza: "🍕",
    noodles: "🍜",
    Burger: "🍔",
    Salad: "🥗",
    Dessert: "🍰",
    Drinks: "🥤",
    Snacks: "🍟",
    Biriyani: "🍲",
    Default: "🍽️",
  };

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    address: "",
    tableNumber: "10",
  });
  const [roomDetails, setRoomDetails] = useState({
    roomno: "",
    guestName: "",
    CheckInNumber: "",
  });
  const [orders, setOrders] = useState([]);
  const [orderNumber, setOrderNumber] = useState(1001);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetchPriceList();
  }, []);

  const fetchPriceList = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/sUsers/getProductSubDetails/${cmp_id}?type=${"pricelevel"}`,
        {
          withCredentials: true,
        }
      );
      setPriceLevelData(res?.data?.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const subDetailsPromise = api.get(
        `/api/sUsers/getAllSubDetailsBasedUnder/${cmp_id}`,
        {
          withCredentials: true,
          params: {
            under: "restaurant",
          },
        }
      );
      const hsnResPromise = api.get(`/api/sUsers/fetchHsn/${cmp_id}`, {
        withCredentials: true,
      });

      const [subDetailsRes, hsnRes] = await Promise.all([
        subDetailsPromise,
        hsnResPromise,
      ]);

      const { categories, subcategories, priceLevels } =
        subDetailsRes.data.data;
      setOptionsData((prev) => ({
        ...prev,
        category: categories,
        subcategory: subcategories,
        priceLevel: priceLevels,
        hsn: hsnRes.data.data,
      }));

      if (categories && categories.length > 0) {
        setSelectedCuisine({
          categoryId: categories[0]._id,
          categoryName: categories[0].name,
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [cmp_id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchAllItems = useCallback(async () => {
    setIsLoading(true);
    setLoader(true);
    try {
      const params = new URLSearchParams();
      params.append("under", "restaurant");

      const res = await api.get(`/api/sUsers/getAllItems/${cmp_id}?${params}`, {
        withCredentials: true,
      });

      const fetchedItems = res?.data?.items || [];
      setAllItems(fetchedItems);
      setItems(fetchedItems);
      setHasMore(false);
    } catch (error) {
      console.log("Error fetching items:", error);
      setHasMore(false);
      setAllItems([]);
      setItems([]);
    } finally {
      setIsLoading(false);
      setLoader(false);
    }
  }, [cmp_id]);

  useEffect(() => {
    fetchAllItems();
  }, [fetchAllItems]);

  const {
    data: roomBookingData,
    // loading: roomLoading,
    error,
  } = useFetch(`/api/sUsers/getRoomBasedOnBooking/${cmp_id}`);

  useEffect(() => {
    if (roomBookingData) {
      const getRooms = roomBookingData?.data?.flatMap((room) => {
        console.log(roomBookingData);
        return (
          room?.selectedRooms?.map((selectedRoom) => ({
            ...selectedRoom,
            customerName: room?.customerName,
            mobileNumber: room?.mobileNumber,
            voucherNumber: room?.voucherNumber,
          })) || []
        );
      });
      setRoomData(getRooms);
    }
  }, [roomBookingData]);

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "Failed to load data");
    }
  }, [error]);

  useEffect(() => {
    let filteredItems = [...allItems];

    if (selectedSubcategory) {
      const selectedSubcatId = getSelectedSubcategoryId();
      filteredItems = filteredItems.filter(
        (item) => item.sub_category === selectedSubcatId
      );
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        (item) =>
          item.product_name.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower)) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    setItems(filteredItems);
  }, [allItems, selectedSubcategory, searchTerm]);

  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (value) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      console.log("Search term:", value);
    }, 300);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const cuisines = optionData?.category || [];
  const subcategories = optionData?.subcategory || [];

  const getSelectedSubcategoryId = () => {
    const selectedSubcat = subcategories.find(
      (subcat) => subcat.name === selectedSubcategory
    );
    return selectedSubcat?._id || "";
  };

  const getFilteredSubcategories = () => {
    if (!selectedCuisine) return [];
    return subcategories.filter(
      (item) => item.category === selectedCuisine?.categoryId
    );
  };

  const filteredSubcategories = getFilteredSubcategories();
  const menuItems = items || [];

  const addToOrder = (item) => {
    const existingItem = orderItems.find(
      (orderItem) => orderItem._id === item._id
    );
    if (existingItem) {
      setOrderItems(
        orderItems.map((orderItem) =>
          orderItem._id === item._id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        )
      );
    } else {
      const price = selectedPriceLevel
        ? Number(
            item.Priceleveles?.find((pl) => pl.pricelevel == selectedPriceLevel)
              ?.pricerate || 0
          )
        : Number(item.Priceleveles?.[0]?.pricerate);
      console.log("price", price);
      setOrderItems([...orderItems, { ...item, quantity: 1, price: price }]);
    }
  };

  const removeFromOrder = (itemId) => {
    setOrderItems(orderItems.filter((item) => item._id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromOrder(itemId);
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalAmount = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCategorySelect = (category, name) => {
    let newObject = {
      categoryId: category,
      categoryName: name,
    };
    setSelectedCuisine(newObject);
    setSelectedSubcategory("");
    setSearchTerm("");
    if (isMobile) setShowSidebar(true);
  };

  const handleSubcategorySelect = (subcategoryName) => {
    setSelectedSubcategory(subcategoryName);
    setSearchTerm("");
    if (isMobile) setShowSidebar(false);
  };

  const handleBackToCategories = () => {
    setSelectedSubcategory("");
    setSearchTerm("");
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) return;

    if (orderType === "dine-in") {
      setShowFullTableSelection(true); // show full-page table selection
    } else {
      setShowKOTModal(true); // keep normal KOT flow for others
    }
  };

  const generateKOT = async (selectedTableNumber, tableStatus) => {
    let updatedItems = [];
    let orderCustomerDetails = {
      ...customerDetails,
      tableNumber: selectedTableNumber,
      tableStatus,
    };
    updatedItems = orderItems.map((item) => {
      return {
        ...item,
        GodownList: item.GodownList.map((g, index) =>
          index === 0
            ? {
                ...g,
                selectedPriceRate: item?.price,
                godown_id: g?._id,
                defaultGodown: true,
                mfgdt: new Date(),
                expdt: new Date(),
                warrantyCard: g?.warrantyCard,
                added: true,
                count: item?.quantity,
                actualCount: item?.quantity,
              }
            : g
        ),
        hasGodownOrBatch: false,
        totalCount: item?.quantity,
        totalActualCount: item?.quantity,
      };
    });
    let finalProductData = await taxCalculatorForRestaurant(
      updatedItems,
      configurations[0]?.addRateWithTax?.sale
    );
    if (orderType === "dine-in") {
      orderCustomerDetails = {
        tableNumber: selectedTableNumber,
        tableStatus,
      };
    } else if (orderType === "roomService") {
      console.log(roomDetails);
      orderCustomerDetails = {
        roomId: roomDetails?._id,
        checkInNumber: roomDetails?.CheckInNumber,
        name: roomDetails?.guestName,
      };
    } else {
      orderCustomerDetails = { ...customerDetails, tableStatus };
    }

    console.log("orderCustomerDetails", orderItems);

    console.log("orderCustomerDetails", finalProductData);

    const newOrder = {
      id: orderNumber,
      items: [...finalProductData],
      type: orderType,
      customer: orderCustomerDetails,
      total: getTotalAmount(),
      timestamp: new Date(),
      status: "pending",
      paymentMethod: orderType === "dine-in" ? null : "cash",
    };
    let url = isEdit
      ? `/api/sUsers/editKOT/${cmp_id}/${kotDataForEdit._id}`
      : `/api/sUsers/generateKOT/${cmp_id}`;
    try {
      let response = await api.post(url, newOrder, {
        withCredentials: true,
      });
      if (response.data?.success) {
        handleKotPrint(response.data?.data);
        if (orderType === "dine-in") {
          await api.put(
            `/api/sUsers/updateTableStatus/${cmp_id}`,
            {
              tableNumber: selectedTableNumber,
              status: "occupied",
            },
            { withCredentials: true }
          );
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }

    setOrders([...orders, newOrder]);
    setOrderItems([]);
    setOrderNumber(orderNumber + 1);
    setShowKOTModal(false);
    setCustomerDetails({
      name: "",
      phone: "",
      address: "",
      tableNumber: "10",
    });
    toast.success(
      kotDataForEdit
        ? "KOT updated successfully!"
        : "KOT generated successfully!"
    );
  };

  // const processPayment = () => {
  //   const updatedOrders = orders.map((order) =>
  //     order.id === orderNumber - 1
  //       ? { ...order, status: "paid", paymentMethod: paymentMethod }
  //       : order
  //   );

  //   setOrders(updatedOrders);
  //   setShowPaymentModal(false);

  //   if (orderType === "roomService") {
  //     setRoomDetails({
  //       roomno: "",
  //       guestName: "",
  //       CheckInNumber: "",
  //     });
  //   } else {
  //     setCustomerDetails({
  //       name: "",
  //       phone: "",
  //       address: "",
  //       tableNumber: customerDetails.tableNumber,
  //     });
  //   }

  //   alert(
  //     `Payment of ₹${
  //       orders.find((order) => order.id === orderNumber - 1)?.total || 0
  //     } processed successfully via ${paymentMethod}!`
  //   );
  // };

  const getOrderTypeDisplay = (type) => {
    const typeMap = {
      "dine-in": "Dine In",
      takeaway: "Takeaway",
      delivery: "Delivery",
      roomService: "Room Service",
    };
    return typeMap[type] || type;
  };

  const handleKotPrint = (data) => {
    const orderData = {
      kotNo: data?.voucherNumber,
      tableNo: data?.tableNumber,
      items: data?.items,
      createdAt: new Date(),
    };
    generateAndPrintKOT(orderData, true, false, companyName);
  };

  const handleSelectedPriceLevel = (value) => {
    setShowPriceLevelSelect(false);
    setSelectedPriceLevel(value);
  };

  return (
    <>
      {showPriceLevelSelect && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-80">
            <label className="text-gray-300 mb-2 block">Select Action:</label>
            <select
              className="w-full bg-slate-700 text-white border border-gray-600 rounded px-2 py-1 mb-4"
              onChange={(e) => handleSelectedPriceLevel(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>
                Choose...
              </option>
              {priceLevelData.map((level) => (
                <option key={level._id} value={level._id}>
                  {level.pricelevel}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowPriceLevelSelect(false)}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-2 md:p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile menu button */}
              <button
                className="md:hidden p-1 hover:bg-white/10 rounded"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                🍽️{" "}
                <span className="hidden sm:inline">
                  Restaurant Management System
                </span>
                <span className="sm:hidden">RMS</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-6">
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 rounded-lg px-2 md:px-3 py-1">
                <CiCircleList className="w-3 h-3 md:w-4 md:h-4" />
                <button
                  className="text-xs font-medium"
                  onClick={() => setShowPriceLevelSelect(true)}
                >
                  {" "}
                  PriceLevel
                </button>
              </div>
              <div className="hidden sm:flex items-center space-x-2 bg-white/10 rounded-lg px-2 md:px-3 py-1">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs font-medium">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-2 md:px-3 py-1">
                <Users className="w-3 h-3 md:w-4 md:h-4" />
                <span
                  className="text-xs font-medium cursor-pointer text-blue-600 underline"
                  onClick={() => navigate("/sUsers/TableSelection")}
                >
                  {orderType === "dine-in"
                    ? `Table ${customerDetails.tableNumber}`
                    : orderType === "roomService"
                    ? `Room ${roomDetails.roomno || "---"}`
                    : getOrderTypeDisplay(orderType)}
                </span>
              </div>
              <div
                className="flex items-center space-x-2 hover:cursor-pointer"
                onClick={() => navigate("/sUsers/KotPage")}
              >
                <Receipt className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm">
                  <span className="hidden sm:inline">Orders: </span>
                  {orders.length}
                </span>
              </div>
              {/* Mobile cart button */}
              <button
                className="md:hidden bg-white/10 rounded-lg px-2 py-1 flex items-center space-x-1"
                onClick={() => setShowOrderSummary(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs">{getTotalItems()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cuisine Categories - Horizontal scroll on mobile */}

        <div className="bg-white border-b border-gray-200 p-2 shadow-sm">
          <div className="flex gap-3 text-xs overflow-x-auto scrollbar-hide p-2">
            {cuisines.map((cuisine, index) => (
              <button
                key={cuisine._id}
                onClick={() => handleCategorySelect(cuisine._id, cuisine.name)}
                className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
          transition-all duration-200 transform active:scale-95
          whitespace-nowrap flex-shrink-0 min-w-max
          ${gradientClasses[index % gradientClasses.length]}
          text-white shadow-md
          ${
            selectedCuisine?.categoryName === cuisine.name
              ? "ring-2 ring-white/70 shadow-lg scale-105"
              : "hover:shadow-md hover:scale-105"
          }
        `}
              >
                <span className="text-sm">{cuisine.icon}</span>
                <span className="text-sm tracking-wide">{cuisine.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Mobile Sidebar Overlay */}
          {isMobile && showSidebar && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Left Sidebar - Categories/Subcategories */}
          <div
            className={`
          ${
            isMobile
              ? "fixed left-0 top-0 bottom-0 z-50 transform transition-transform duration-300"
              : "relative"
          } 
          ${
            isMobile && showSidebar
              ? "translate-x-0"
              : isMobile
              ? "-translate-x-full"
              : "translate-x-0"
          }
          w-72 md:w-48 bg-white shadow-lg h-full flex flex-col min-h-0 border-r
        `}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-sm font-bold text-gray-800">
                  {selectedSubcategory ? "Items" : "Subcategories"}
                </h2>
                <div className="flex items-center gap-2">
                  {selectedSubcategory && (
                    <button
                      onClick={handleBackToCategories}
                      className="text-[#10b981] hover:text-blue-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  {isMobile && (
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              {selectedCuisine && (
                <div className="text-xs text-gray-500 mt-1 font-medium">
                  Category: {selectedCuisine?.categoryName}
                </div>
              )}
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {!selectedCuisine ? (
                <div className="text-sm text-gray-400 text-center py-4 italic">
                  🍽️ Please select a category above
                </div>
              ) : filteredSubcategories.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-4 italic">
                  <Filter className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  🚫 No subcategories available
                </div>
              ) : (
                filteredSubcategories.map((subcategory, index) => {
                  const icon =
                    subcategoryIcons[subcategory.name] ||
                    subcategoryIcons.Default;
                  const gradient =
                    gradientClasses[index % gradientClasses.length];

                  return (
                    <button
                      key={subcategory._id}
                      onClick={() => handleSubcategorySelect(subcategory.name)}
                      className={`w-full text-left px-1  py-2 mb-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] hover:translate-x-1 
                      ${
                        selectedSubcategory === subcategory.name
                          ? "text-white"
                          : "text-white"
                      }
                    ${gradient} `}
                    >
                      <span className="text-base">{icon}</span>
                      <span className="text-sm capitalize tracking-wide">
                        {subcategory.name}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Enhanced Search Bar */}
            <div className="p-3 md:p-4 bg-white border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search items...${
                    selectedSubcategory ? ` in ${selectedSubcategory}` : ""
                  }`}
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Results Info */}
              {searchTerm && (
                <div className="mt-2 text-xs text-gray-500">
                  {menuItems.length > 0
                    ? `Found ${menuItems.length} item${
                        menuItems.length !== 1 ? "s" : ""
                      } for "${searchTerm}"`
                    : `No items found for "${searchTerm}"`}
                </div>
              )}
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 p-3 md:p-4 overflow-y-auto">
              {loader ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading items...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#4688f3]">
                      {selectedSubcategory
                        ? `${selectedCuisine?.categoryName} - ${selectedSubcategory} (${menuItems.length} items)`
                        : searchTerm
                        ? `Search Results (${menuItems.length} items)`
                        : `All Items (${menuItems.length} items)`}
                    </h3>
                  </div>

                  {menuItems.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center text-gray-500">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium mb-2">
                          No Items Found
                        </h3>
                        <p className="text-sm">
                          {searchTerm
                            ? `No items found matching "${searchTerm}"`
                            : selectedSubcategory
                            ? `No items available in ${selectedSubcategory}`
                            : "No items available"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-4">
                      {menuItems.map((item, index) => {
                        // Light gradient backgrounds matching the reference image
                        const lightGradients = [
                          "bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400",
                          "bg-gradient-to-br from-pink-200 via-pink-300 to-pink-400",
                          "bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400",
                          "bg-gradient-to-br from-indigo-200 via-indigo-300 to-indigo-400",
                          "bg-gradient-to-br from-violet-200 via-violet-300 to-violet-400",
                          "bg-gradient-to-br from-cyan-200 via-cyan-300 to-cyan-400",
                          "bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400",
                          "bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400",
                        ];

                        const currentGradient =
                          lightGradients[index % lightGradients.length];

                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`group relative ${currentGradient} rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer`}
                            onClick={() => addToOrder(item)}
                          >
                            <div className="p-2 flex flex-col items-center justify-center text-center h-full min-h-[100px] relative">
                              {/* Food Image */}
                              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 shadow-lg mb-3">
                                <img
                                  src={
                                    item.product_image ||
                                    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&h=150&fit=crop"
                                  }
                                  alt={item.product_name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&h=150&fit=crop";
                                  }}
                                />
                              </div>

                              {/* Product Name */}
                              <h3 className="font-bold text-gray-800 text-sm sm:text-base md:text-sm mb-2">
                                {item.product_name.toUpperCase()}
                              </h3>

                              {/* Price */}
                              <span className="text-gray-900 font-bold text-xl sm:text-xl">
                                ₹
                                {selectedPriceLevel
                                  ? item.Priceleveles?.find(
                                      (pl) =>
                                        pl.pricelevel == selectedPriceLevel
                                    )?.pricerate || 0
                                  : item.Priceleveles?.[0]?.pricerate}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar - Desktop always visible, Mobile modal */}
          {isMobile && showOrderSummary && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowOrderSummary(false)}
            />
          )}

          <div
            className={`
          ${
            isMobile
              ? "fixed right-0 top-0 bottom-0 z-50 transform transition-transform duration-300"
              : "relative"
          }
          ${
            isMobile && showOrderSummary
              ? "translate-x-0"
              : isMobile
              ? "translate-x-full"
              : "translate-x-0"
          }
          w-full sm:w-80 md:w-80 lg:w-80 bg-white border-l border-gray-200 flex flex-col min-h-0 h-full shadow-lg
        `}
          >
            <div className="p-3 md:p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-bold text-[#4688f3] flex items-center">
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#4688f3]" />
                  <span className="hidden sm:inline">Order Summary</span>
                  <span className="sm:hidden">Cart</span> ({getTotalItems()})
                </h3>
                {isMobile && (
                  <button
                    onClick={() => setShowOrderSummary(false)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-3 md:p-4">
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-sm">No items in cart</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-start"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          ₹{item.price} x {item.quantity}
                        </p>
                        <p className="text-sm font-bold text-[#4688f3]">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <button
                          className="bg-[#4688f3] text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        <span className="text-sm font-medium min-w-[24px] text-center bg-white px-2 py-1 rounded border">
                          {item.quantity}
                        </span>

                        <button
                          className="bg-[#4688f3] text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-200"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total and Order Buttons */}
            <div className="p-3 md:p-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-700">
                  Total
                </span>
                <span className="text-xl font-bold text-[#4688f3]">
                  ₹{getTotalAmount()}
                </span>
              </div>

              {/* Order Type Selection - Grid responsive */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderType("dine-in")}
                    className={`flex flex-col items-center justify-center h-14 md:h-12 rounded-md border transition-colors text-xs ${
                      orderType === "dine-in"
                        ? "border-[#4688f3] bg-blue-50 text-[#4688f3]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Home className="w-4 h-4 mb-1" />
                    <span>Dine In</span>
                  </button>
                  <button
                    onClick={() => setOrderType("takeaway")}
                    className={`flex flex-col items-center justify-center h-14 md:h-12 rounded-md border transition-colors text-xs ${
                      orderType === "takeaway"
                        ? "border-[#4688f3] bg-blue-50 text-[#4688f3]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Package className="w-4 h-4 mb-1" />
                    <span>Takeaway</span>
                  </button>
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`flex flex-col items-center justify-center h-14 md:h-12 rounded-md border transition-colors text-xs ${
                      orderType === "delivery"
                        ? "border-[#4688f3] bg-blue-50 text-[#4688f3]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Car className="w-4 h-4 mb-1" />
                    <span>Delivery</span>
                  </button>
                  <button
                    onClick={() => setOrderType("roomService")}
                    className={`flex flex-col items-center justify-center h-14 md:h-12 rounded-md border transition-colors text-xs ${
                      orderType === "roomService"
                        ? "border-[#4688f3] bg-blue-50 text-[#4688f3]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Bed className="w-4 h-4 mb-1" />
                    <span>Room Service</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-[#4688f3] text-white py-3 rounded-lg font-semibold hover:bg-[#0f8f6b] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:scale-105 active:scale-95"
                  disabled={orderItems.length === 0}
                  onClick={handlePlaceOrder}
                >
                  {isEdit ? "Update Order" : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showFullTableSelection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
          {/* Modal Box */}
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowFullTableSelection(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>

            {/* Modal Content */}
            <div className="p-4 ">
              <TableSelection
                showKOTs={false}
                onTableSelect={(table) => {
                  generateKOT(table.tableNumber, table.status);
                  setShowFullTableSelection(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* KOT Modal - Enhanced for mobile */}
      {showKOTModal && orderType === "dine-in" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                KOT Details
              </h2>
              <button
                onClick={() => setShowFullTableSelection(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>

              {/* Modal Content */}
              <div className="p-4 ">
                <TableSelection
                  showKOTs={false}
                  onTableSelect={(table) => {
                    generateKOT(table.tableNumber, table.status);
                    setShowFullTableSelection(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KOT Modal - Enhanced for mobile */}
      {showKOTModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                KOT Details
              </h2>
              <button
                onClick={() => setShowKOTModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Order Type Display */}
            <div className="mb-4">
              <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                {orderType === "dine-in" && (
                  <Home className="w-5 h-5 mr-2 text-[#4688f3]" />
                )}
                {orderType === "takeaway" && (
                  <Package className="w-5 h-5 mr-2 text-[#4688f3]" />
                )}
                {orderType === "delivery" && (
                  <Car className="w-5 h-5 mr-2 text-[#4688f3]" />
                )}
                {orderType === "roomService" && (
                  <Bed className="w-5 h-5 mr-2 text-[#4688f3]" />
                )}
                <span className="text-sm font-medium text-[#4688f3]">
                  {getOrderTypeDisplay(orderType)} Order
                </span>
              </div>
            </div>

            {/* Customer Details Input */}
            <div className="space-y-4 mb-6">
              {orderType === "roomService" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <select
                      value={roomDetails._id}
                      onChange={(e) => {
                        const selectedRoom = roomData.find(
                          (room) => room.roomId === e.target.value
                        );
                      
                        setRoomDetails({
                          ...roomDetails,
                          _id: selectedRoom?.roomId || "",
                          roomno: selectedRoom?.roomName || "",
                          guestName: selectedRoom?.customerName || "",
                          CheckInNumber: selectedRoom?.voucherNumber || "",
                        });
                      }}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select a room</option>
                      {roomData?.map((room) => (
                        <option value={room.roomId} key={room._id}>
                          {room?.roomName} - {room?.customerName} -{" "}
                          {room?.voucherNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      value={roomDetails.guestName}
                      onChange={(e) =>
                        setRoomDetails({
                          ...roomDetails,
                          guestName: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-In Number
                    </label>
                    <input
                      type="text"
                      value={roomDetails.CheckInNumber || ""}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-black text-sm"
                    />
                  </div>
                </>
              )}

              {(orderType === "delivery" || orderType === "takeaway") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={customerDetails.phone}
                      onChange={(e) =>
                        setCustomerDetails({
                          ...customerDetails,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  {orderType === "delivery" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={customerDetails.address}
                        onChange={(e) =>
                          setCustomerDetails({
                            ...customerDetails,
                            address: e.target.value,
                          })
                        }
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      ></textarea>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowKOTModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={generateKOT}
                className="flex-1 bg-[#10b981] hover:bg-[#0f8f6b] text-white px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Confirm KOT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for better mobile experience */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Enhanced hover effects */
        .group:hover .food-image {
          transform: scale(1.1);
          transition: transform 0.5s ease;
        }

        /* Soft shadow variations */
        .shadow-soft {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .shadow-soft-hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
        }

        /* Border radius consistency */
        .border-3 {
          border-width: 3px;
        }

        /* Custom gradient animations for smooth transitions */
        @keyframes gentle-pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default RestaurantPOS;
