import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Star,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Menu,
  X,
  Receipt,
  Home,
  Package,
  Car,
  Printer,
  Check,
  CreditCard,
  Banknote,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  Bed,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import api from "@/api/api";
import { motion } from "framer-motion";

const RestaurantPOS = () => {
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
const[hoveredCuisine,setHoveredCuisine] = useState("");
  const [orderItems, setOrderItems] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showKOTModal, setShowKOTModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderType, setOrderType] = useState("dine-in");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [optionData, setOptionsData] = useState({});
 
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const gradientClasses = [
  "bg-gradient-to-r from-pink-400 to-red-500",
  "bg-gradient-to-r from-green-400 to-blue-500",
  "bg-gradient-to-r from-yellow-400 to-orange-500",
  "bg-gradient-to-r from-purple-400 to-pink-500",
  "bg-gradient-to-r from-cyan-400 to-teal-500",
  "bg-gradient-to-r from-indigo-400 to-blue-600",
];

const subcategoryIcons = {
  Pizza: "🍕",
  noodles: "🍜",
  Burger: "🍔",
  Salad: "🥗",
  Dessert: "🍰",
  Drinks: "🥤",
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
  });
  const [orders, setOrders] = useState([]);
  const [orderNumber, setOrderNumber] = useState(1001);

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

      // Set the first category as default if available
      if (categories && categories.length > 0) {
        setSelectedCuisine(categories[0].name);
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

  // Fetch ALL items first, then filter on frontend
  const fetchAllItems = useCallback(
    async (searchTerm = "") => {
      setIsLoading(true);
      setLoader(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        params.append("under", "restaurant");

        console.log("Fetching all items with params:", params.toString());

        const res = await api.get(`/api/sUsers/getAllItems/${cmp_id}?${params}`, {
          withCredentials: true,
        });

        console.log("Items API Response:", res.data);
        
        // Store all items
        const allItems = res?.data?.items || [];
        
        // Filter items based on selected subcategory
        if (selectedSubcategory && !searchTerm) {
          const selectedSubcatId = getSelectedSubcategoryId();
          const filteredItems = allItems.filter(item => 
            item.sub_category === selectedSubcatId
          );
          console.log("Filtered items for subcategory:", selectedSubcategory, filteredItems);
          setItems(filteredItems);
        } else {
          setItems(allItems);
        }
        
        setHasMore(false);
       
      } catch (error) {
        console.log("Error fetching items:", error);
        setHasMore(false);
        setItems([]);
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id, selectedSubcategory]
  );

  // Fetch items when subcategory or search term changes
  useEffect(() => {
    if (selectedSubcategory || searchTerm) {
      fetchAllItems(searchTerm);
    } else {
      setItems([]);
    }
  }, [fetchAllItems, selectedSubcategory, searchTerm]);

  console.log("Items:", items);
  console.log("Option Data:", optionData);

  const cuisines = optionData?.category || [];
  const subcategories = optionData?.subcategory || [];

  // Get selected category ID
  const getSelectedCategoryId = () => {
    const selectedCat = cuisines.find(cat => cat.name === selectedCuisine);
    return selectedCat?._id || '';
  };

  // Get selected subcategory ID  
  const getSelectedSubcategoryId = () => {
    const selectedSubcat = subcategories.find(subcat => subcat.name === selectedSubcategory);
    return selectedSubcat?._id || '';
  };

  // Filter subcategories based on selected category
  const getFilteredSubcategories = () => {
    if (!selectedCuisine) return [];
    
    // For now, show all subcategories since we don't have category relationship in subcategories
    // You can implement category-specific filtering based on your business logic later
    return subcategories;
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
      // Add price from Priceleveles array
      const price = item.Priceleveles?.[0]?.pricerate || item.price || 0;
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

  const handleCategorySelect = (categoryName) => {
    setSelectedCuisine(categoryName);
    setSelectedCategory("");
    setSelectedSubcategory("");
    setItems([]);
    setSearchTerm("");
  };

  const handleSubcategorySelect = (subcategoryName) => {
    setSelectedSubcategory(subcategoryName);
    setSelectedCategory(subcategoryName);
  };

  const handleBackToCategories = () => {
    setSelectedSubcategory("");
    setSelectedCategory("");
    setItems([]);
    setSearchTerm("");
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) return;
    setShowKOTModal(true);
  };

  const handleProceedToPay = () => {
    if (orderItems.length === 0) return;
    setShowPaymentModal(true);
  };

  const generateKOT = () => {
    let orderCustomerDetails = {};

    if (orderType === "dine-in") {
      orderCustomerDetails = { tableNumber: customerDetails.tableNumber };
    } else if (orderType === "roomService") {
      orderCustomerDetails = {
        roomNumber: roomDetails.roomno,
        guestName: roomDetails.guestName,
      };
    } else {
      orderCustomerDetails = { ...customerDetails };
    }

    const newOrder = {
      id: orderNumber,
      items: [...orderItems],
      type: orderType,
      customer: orderCustomerDetails,
      total: getTotalAmount(),
      timestamp: new Date(),
      status: "pending",
      paymentMethod: orderType === "dine-in" ? null : paymentMethod,
    };

    setOrders([...orders, newOrder]);
    setOrderItems([]);
    setOrderNumber(orderNumber + 1);
    setShowKOTModal(false);

    if (orderType === "dine-in") {
      alert(`KOT #${orderNumber} generated and sent to kitchen!`);
      setCustomerDetails({
        name: "",
        phone: "",
        address: "",
        tableNumber: "10",
      });
    } else {
      alert(
        `KOT #${orderNumber} generated and sent to kitchen! Please proceed to payment.`
      );
      setShowPaymentModal(true);
    }
  };

  const processPayment = () => {
    const updatedOrders = orders.map((order) =>
      order.id === orderNumber - 1
        ? { ...order, status: "paid", paymentMethod: paymentMethod }
        : order
    );

    setOrders(updatedOrders);
    setShowPaymentModal(false);

    if (orderType === "roomService") {
      setRoomDetails({
        roomno: "",
        guestName: "",
      });
    } else {
      setCustomerDetails({
        name: "",
        phone: "",
        address: "",
        tableNumber: customerDetails.tableNumber,
      });
    }

    alert(
      `Payment of ₹${
        orders.find((order) => order.id === orderNumber - 1)?.total || 0
      } processed successfully via ${paymentMethod}!`
    );
  };

  const getOrderTypeDisplay = (type) => {
    const typeMap = {
      "dine-in": "Dine In",
      takeaway: "Takeaway",
      delivery: "Delivery",
      roomService: "Room Service",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#0b1d34] text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            🍽️ Restaurant Management System
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">
                {orderType === "dine-in"
                  ? `Table ${customerDetails.tableNumber}`
                  : orderType === "roomService"
                  ? `Room ${roomDetails.roomno || "---"}`
                  : getOrderTypeDisplay(orderType)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span className="text-sm">Orders: {orders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cuisine Categories */}
    <div className="bg-white border-b border-gray-200 p-4">
  <div className="flex flex-wrap gap-2 text-xs">
    {cuisines.map((cuisine) => (
      <button
        key={cuisine._id}
        onClick={() => handleCategorySelect(cuisine.name)}
        onMouseEnter={() => setHoveredCuisine(cuisine.name)}
        onMouseLeave={() => setHoveredCuisine(null)}
        style={{
          background: hoveredCuisine === cuisine.name
            ? "linear-gradient(135deg, #a7f3d0, #10b981)"
            : "linear-gradient(135deg, #34d399, #059669)",
          color: selectedCuisine === cuisine.name ? "#1F2937" : "#ffffff",
          transform: selectedCuisine === cuisine.name ? "translateY(-2px)" : "none",
          boxShadow: selectedCuisine === cuisine.name
            ? "0 4px 14px rgba(0, 0, 0, 0.2)"
            : "0 2px 6px rgba(0, 0, 0, 0.1)",
          transition: "all 0.25s ease-in-out",
        }}
        className={`
          group relative flex items-center gap-2 px-4 py-2 rounded-xl font-medium 
          hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-400 
          active:scale-95 cursor-pointer duration-300 transform
          backdrop-blur-sm bg-opacity-90
        `}
      >
        <span className="text-lg drop-shadow-sm">{cuisine.icon}</span>
        <span className="text-sm tracking-wide select-none">{cuisine.name}</span>
      </button>
    ))}
  </div>
</div>


      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Categories/Subcategories */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-800">
                {selectedSubcategory ? "Items" : "Subcategories"}
              </h2>
              {selectedSubcategory && (
                <button
                  onClick={handleBackToCategories}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
            {selectedCuisine && (
              <div className="text-xs text-gray-500 mt-1">
                Category: {selectedCuisine}
              </div>
            )}
          </div>

<div className="p-4">
  {!selectedCuisine ? (
    <div className="text-sm text-gray-400 text-center py-4 italic">
      🍽️ Please select a category above
    </div>
  ) : filteredSubcategories.length === 0 ? (
    <div className="text-sm text-gray-400 text-center py-4 italic">
      🚫 No subcategories available
    </div>
  ) : (
    filteredSubcategories.map((subcategory, index) => {
      const icon = subcategoryIcons[subcategory.name] || subcategoryIcons.Default;
      const gradient = gradientClasses[index % gradientClasses.length];

      return (
        <button
          key={subcategory._id}
          onClick={() => handleSubcategorySelect(subcategory.name)}
          className={`w-full text-left px-3 py-1.5 mb-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] hover:translate-x-1 
            ${selectedSubcategory === subcategory.name ? "text-white" : "text-white/90"}
            ${gradient}`}
        >
          <span className="text-base">{icon}</span>
          <span className="text-xs capitalize tracking-wide">{subcategory.name}</span>
        </button>
      );
    })
  )}
</div>


        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search items...${selectedSubcategory ? ` in ${selectedSubcategory}` : ''}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>  
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 p-4">
            {!selectedCuisine ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a Category</h3>
                  <p className="text-sm">Choose a category above to view subcategories</p>
                </div>
              </div>
            ) : !selectedSubcategory && !searchTerm ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Filter className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a Subcategory</h3>
                  <p className="text-sm">Choose a subcategory from the sidebar to view items</p>
                </div>
              </div>
            ) : loader ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading items...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-800">
                    {selectedCuisine} - {selectedSubcategory || 'Search Results'} ({menuItems.length} items)
                  </h3>
                </div>
                
                {menuItems.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No Items Found</h3>
                      <p className="text-sm">
                        {searchTerm 
                          ? `No items found matching "${searchTerm}"`
                          : `No items available in ${selectedSubcategory}`
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4">
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] active:scale-95"
                        onClick={() => addToOrder(item)}
                      >
                        {/* Image Container with Overlay Effects */}
                        <div className="relative h-40 overflow-hidden">
                          <img 
                            src={item.product_image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop'} 
                            alt={item.product_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop';
                            }}
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Quick Add Button */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:scale-110 transition-all duration-200">
                              <Plus className="w-4 h-4 text-green-600" />
                            </div>
                          </div>

                          {/* Stock Status Badge */}
                          <div className="absolute top-3 left-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.balance_stock > 0 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {item.balance_stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </div>
                          </div>

                          {/* Popular Badge */}
                          {(item.rating > 4.3 || Math.random() > 0.7) && (
                            <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>Popular</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-4">
                          {/* Title and Rating */}
                          <div className="mb-3">
                            <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-green-700 transition-colors duration-200">
                              {item.product_name}
                            </h3>
                            
                            {/* Rating and Time */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                             
                              <div className="flex items-center space-x-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span>{item.time || '15-20 min'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Category Badge */}
                        

                          {/* Price Section */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-lg font-bold text-green-600">
                                ₹{item.Priceleveles?.[0]?.pricerate || item.price || 0}
                              </span>
                              {item.Priceleveles?.[0]?.priceDisc > 0 && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{(item.Priceleveles[0].pricerate + item.Priceleveles[0].priceDisc)}
                                </span>
                              )}
                            </div>

                            {/* Add to Cart Button */}
                           
                          </div>
                        </div>

                        {/* Hover Border Effect */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-200 rounded-xl transition-colors duration-300 pointer-events-none"></div>
                        
                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
              Order Summary ({getTotalItems()})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {orderItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No items in order
              </p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-100 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        ₹{item.price || item.selling_price} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>

                      <span className="text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        className="bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-transform"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total and Order Buttons */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold text-gray-700">Total</span>
              <span className="text-xl font-bold text-green-600">
                ₹{getTotalAmount()}
              </span>
            </div>

            {/* Order Type Selection */}
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOrderType("dine-in")}
                  className={`flex flex-col items-center p-2 rounded-md border transition-colors text-xs ${
                    orderType === "dine-in"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Home className="w-4 h-4 mb-1" />
                  <span>Dine In</span>
                </button>
                <button
                  onClick={() => setOrderType("takeaway")}
                  className={`flex flex-col items-center p-2 rounded-md border transition-colors text-xs ${
                    orderType === "takeaway"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Package className="w-4 h-4 mb-1" />
                  <span>Takeaway</span>
                </button>
                <button
                  onClick={() => setOrderType("delivery")}
                  className={`flex flex-col items-center p-2 rounded-md border transition-colors text-xs ${
                    orderType === "delivery"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Car className="w-4 h-4 mb-1" />
                  <span>Delivery</span>
                </button>
                <button
                  onClick={() => setOrderType("roomService")}
                  className={`flex flex-col items-center p-2 rounded-md border transition-colors text-xs ${
                    orderType === "roomService"
                      ? "border-green-500 bg-green-50 text-green-700"
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
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 disabled:opacity-50 text-sm hover:scale-105 active:scale-95"
                disabled={orderItems.length === 0}
                onClick={handlePlaceOrder}
              >
                {orderType === "dine-in" ? "Place Order" : "Place Order"}
              </button>

              {orderType !== "dine-in" && (
                <button
                  className="bg-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-800 transition-all duration-200 disabled:opacity-50 flex items-center hover:scale-105 active:scale-95"
                  disabled={orderItems.length === 0}
                  onClick={handleProceedToPay}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KOT Modal */}
      {showKOTModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">KOT Details</h2>
              <button
                onClick={() => setShowKOTModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Order Type Display */}
            <div className="mb-4">
              <div className="flex items-center justify-center p-3 bg-gray-100 rounded-lg">
                {orderType === "dine-in" && (
                  <Home className="w-5 h-5 mr-2 text-green-600" />
                )}
                {orderType === "takeaway" && (
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                )}
                {orderType === "delivery" && (
                  <Car className="w-5 h-5 mr-2 text-orange-600" />
                )}
                {orderType === "roomService" && (
                  <Bed className="w-5 h-5 mr-2 text-purple-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {getOrderTypeDisplay(orderType)} Order
                </span>
              </div>
            </div>

            {/* Customer Details Input */}
            <div className="space-y-3 mb-4">
              {orderType === "dine-in" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number
                  </label>
                  <input
                    type="text"
                    value={customerDetails.tableNumber}
                    onChange={(e) =>
                      setCustomerDetails({
                        ...customerDetails,
                        tableNumber: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              )}

              {orderType === "roomService" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={roomDetails.roomno}
                      onChange={(e) =>
                        setRoomDetails({
                          ...roomDetails,
                          roomno: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </>
              )}

              {(orderType === "delivery" || orderType === "takeaway") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  {orderType === "delivery" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        rows={2}
                        value={customerDetails.address}
                        onChange={(e) =>
                          setCustomerDetails({
                            ...customerDetails,
                            address: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      ></textarea>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end">
              <button
                onClick={generateKOT}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Confirm KOT
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
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Payment Processing
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center text-green-700">
                <Check className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  KOT #{orderNumber - 1} has been sent to kitchen!
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === "cash"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Banknote className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === "card"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Card</span>
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Order Summary - KOT #{orderNumber - 1}
              </h3>
              <div className="space-y-2">
                {orderType !== "roomService" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Customer:</span>
                      <span className="font-medium">
                        {customerDetails.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Phone:</span>
                      <span className="font-medium">
                        {customerDetails.phone}
                      </span>
                    </div>
                  </>
                )}
                {orderType === "delivery" && (
                  <div className="flex justify-between text-sm">
                    <span>Address:</span>
                    <span className="font-medium text-right max-w-48">
                      {customerDetails.address}
                    </span>
                  </div>
                )}
                {orderType === "roomService" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Room No:</span>
                      <span className="font-medium text-right max-w-48">
                        {roomDetails.roomno}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Guest Name:</span>
                      <span className="font-medium text-right max-w-48">
                        {roomDetails.guestName}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-semibold text-gray-800">
                <span>Total Amount</span>
                <span className="text-lg">
                  ₹
                  {orders.find((order) => order.id === orderNumber - 1)
                    ?.total || 0}
                </span>
              </div>

              {/* Process Payment Button */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-700">
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-sm font-medium text-white flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Process Payment</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RestaurantPOS;