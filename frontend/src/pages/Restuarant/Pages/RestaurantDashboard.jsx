import { useState, useEffect, useRef, useCallback } from "react";
import { useReactToPrint } from "react-to-print";

import VoucherThreeInchPdf from "@/pages/voucher/voucherPdf/threeInchPdf/VoucherThreeInchPdf";

import {
  Plus,
  Minus,
  ShoppingCart,
  Search,
  Clock,
  Users,
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
import { FaArrowLeft } from "react-icons/fa6";
import { useQueryClient } from "@tanstack/react-query";
const RestaurantPOS = () => {
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [salePrintData, setSalePrintData] = useState(null);
  const [showVoucherPdf, setShowVoucherPdf] = useState(false);
  const contentToPrint = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showFullTableSelection, setShowFullTableSelection] = useState(false);
  const [selectedDataForPayment, setSelectedDataForPayment] = useState({});
  // Mobile responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [searchTerms, setSearchTerms] = useState("");
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

  // Add these states near the other state declarations
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentMode, setPaymentMode] = useState("single");
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [saveLoader, setSaveLoader] = useState(false);
  const [selectedCash, setSelectedCash] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [cashOrBank, setCashOrBank] = useState({});


  const [currentPage, setCurrentPage] = useState(1);
const observerTarget = useRef(null);

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

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const queryClient = useQueryClient();
  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false;
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
        _id: kotDataForEdit?.roomId?._id || "",
        guestName: kotDataForEdit?.customer?.name || "",
        CheckInNumber: kotDataForEdit?.checkInNumber || "",
      });
    }
  }, [kotDataForEdit]);
  // Add this useFetch hook with other data fetching
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

  console.log(roomDetails, "roomDetails");

  const companyName = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?.name
  );
  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

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

  useEffect(() => {
    if (salePrintData) {
      navigate(`/sUsers/sharesalesThreeInch/${salePrintData._id}`);
    }
  }, [salePrintData, navigate]);
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

  //

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Filter rooms based on search
  const filteredRooms = Array.isArray(roomData)
    ? roomData.filter(
        (room) =>
          room.roomName?.toLowerCase().includes(searchTerms?.toLowerCase()) ||
          room.customerName
            ?.toLowerCase()
            .includes(searchTerms?.toLowerCase()) ||
          room.voucherNumber?.toLowerCase().includes(searchTerms?.toLowerCase())
      )
    : [];

  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    onAfterPrint: () => {
      setShowVoucherPdf(false);
      setSalePrintData(null);
    },
  });

  const handlePrintData = async (saleId) => {
    try {
      let res = await api.get(
        `/api/sUsers/getSalePrintData/${cmp_id}/${saleId}`,
        {
          withCredentials: true,
        }
      );
      setSalePrintData(res?.data?.data); // triggers navigation useEffect
      setShowVoucherPdf(true);
      console.log(res?.data?.data);
      setTimeout(() => {
        handlePrint();
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load sale print data!");
    }
  };
  const handleSelectRoom = (room) => {
    setRoomDetails({
      ...roomDetails,
      _id: room?.roomId || "",
      roomno: room?.roomName || "",
      guestName: room?.customerName || "",
      CheckInNumber: room?.voucherNumber || "",
    });
    setSearch(
      `${room.roomName} - ${room.customerName} - ${room.voucherNumber}`
    );
    setShowResults(false);
  };

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

const fetchAllItems = useCallback(async (page = 1, append = false) => {
  if (!append) {
    setLoader(true);
  }
  setIsLoading(true);
  
  try {
    const params = new URLSearchParams();
    params.append("under", "restaurant");
    params.append("page", page);
    params.append("limit", "100");
 

    const res = await api.get(`/api/sUsers/getAllItems/${cmp_id}?${params}`, {
      withCredentials: true,
    });

    const fetchedItems = res?.data?.items || [];
    const hasMoreData = res?.data?.pagination?.hasMore ?? false;

    if (append) {
        // ✅ Prevent duplicates by filtering out existing items
        setAllItems((prev) => {
          const existingIds = new Set(prev.map(item => item._id));
          const newItems = fetchedItems.filter(item => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
        setItems((prev) => {
          const existingIds = new Set(prev.map(item => item._id));
          const newItems = fetchedItems.filter(item => !existingIds.has(item._id));
          return [...prev, ...newItems];
        });
      } else {
        setAllItems(fetchedItems);
        setItems(fetchedItems);
      }
    
    setHasMore(hasMoreData);
  } catch (error) {
    console.log("Error fetching items:", error);
    setHasMore(false);
    if (!append) {
      setAllItems([]);
      setItems([]);
    }
  } finally {
    setIsLoading(false);
    setLoader(false);
  }
}, [cmp_id]);





  useEffect(() => {
    if (!observerTarget.current || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          fetchAllItems(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerTarget.current);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, currentPage,searchTerm, fetchAllItems]);

  // Initial load only
  useEffect(() => {
    fetchAllItems(1, false);
  }, [fetchAllItems]);

  const {
    data: roomBookingData,
    // loading: roomLoading,
    error,
  } = useFetch(`/api/sUsers/getRoomBasedOnBooking/${cmp_id}`);

  useEffect(() => {
    if (roomBookingData) {
      const getRooms = roomBookingData?.data?.flatMap((room) => {
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
      const searchLower = searchTerm?.toLowerCase().trim();
      filteredItems = filteredItems.filter(
        (item) =>
          item.product_name?.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description?.toLowerCase().includes(searchLower)) ||
          (item.tags &&
            item.tags.some((tag) => tag?.toLowerCase().includes(searchLower)))
      );
    }

    setItems(filteredItems);
  }, [allItems, selectedSubcategory, searchTerm]);

  const searchTimeoutRef = useRef(null);

  const handleProcessDirectSalePayment = async () => {
    setSaveLoader(true);

    try {
      // Step 1: Prepare paymentDetails
      let paymentDetails;
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

      // Step 2: Make API call
      const response = await api.post(
        `/api/sUsers/directSale/${cmp_id}`,
        {
          paymentMethod: paymentMethod,
          paymentDetails: paymentDetails,
          selectedKotData: selectedDataForPayment,
          isDirectSale: true,
        },
        { withCredentials: true }
      );

      // Step 3: Handle success and PRINT
      if (response.status === 200 || response.status === 201) {
        console.log("=== FULL RESPONSE ===");
        console.log("response.data:", response.data);
        console.log("response.data.data:", response.data.data);
        console.log(
          "response.data.data.salesRecord:",
          response.data.data.salesRecord
        );

        toast.success(
          response?.data?.message || "Direct sale completed successfully!"
        );

        // ✅ Get sale ID from response
        const salesRecord = response?.data?.data?.salesRecord;

        if (salesRecord && salesRecord._id) {
          console.log("📄 Sale ID:", salesRecord._id);
          console.log("📄 Full Sale Data:", salesRecord);

          setSalePrintData(salesRecord);
          setShowVoucherPdf(true);

          setTimeout(() => {
            handlePrint();
          }, 500);
        } else {
          console.error("❌ NO SALE ID FOUND IN RESPONSE");
          toast.error("Sale saved but couldn't generate print");
        }

        // Clear state
        setOrderItems([]);
        setSelectedDataForPayment(null);
        setPaymentMethod("cash");
        setPaymentMode("single");
        setShowPaymentModal(false);

        // setTimeout(() => {
        //   navigate("/sUsers/RestaurantDashboard");
        // }, 1000);
      } else {
        toast.error(response?.data?.message || "Failed to process payment");
      }
    } catch (error) {
      console.error("=== ERROR ===", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to process payment");
    } finally {
      setSaveLoader(false);
    }
  };


    const searchItems = useCallback(async (searchQuery) => {
  setLoader(true);
  setIsLoading(true);
  
  try {
    const params = new URLSearchParams();
    params.append("cmp_id", cmp_id);          // ✅ FIX: Add cmp_id here
    params.append("under", "restaurant");
    params.append("search", searchQuery.trim());

    const res = await api.get(`/api/sUsers/searchItems?${params.toString()}`, {
      withCredentials: true,
    });

    const searchResults = res?.data?.items || [];
    setAllItems(searchResults);
    setItems(searchResults);
    setHasMore(false);
  } catch (error) {
    console.log("Error searching items:", error);
    setAllItems([]);
    setItems([]);
    setHasMore(false);
  } finally {
    setIsLoading(false);
    setLoader(false);
  }
}, [cmp_id]);

  

const handleSearchChange = (value) => {
    setSearchTerm(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      // If search is cleared, reload normal items
      setCurrentPage(1);
      setHasMore(true);
      fetchAllItems(1, false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Call separate search endpoint
      searchItems(value);
    }, 500);
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
    if (orderType === "direct-sale") {
      // Skip KOT generation and go directly to payment
      handleDirectSale();
      return;
    } else if (orderType === "dine-in") {
      setShowFullTableSelection(true); // show full-page table selection
    } else {
      setShowKOTModal(true); // keep normal KOT flow for others
    }
    setShowOrderSummary(false);
  };

  const handleDirectSale = async () => {
    let updatedItems = orderItems.map((item) => {
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
      configurations[0]?.addRateWithTax?.restaurantSale
    );

    let newSaleObject = {
      Date: new Date(),
      voucherType: "sales",
      serialNumber: orderNumber,
      userLevelSerialNumber: orderNumber,
      salesNumber: `SALE-${orderNumber}`,
      partyAccount: "Cash-in-Hand",
      items: finalProductData,
      finalAmount: getTotalAmount(),
      total: getTotalAmount(),
      isDirectSale: true,
    };

    setSelectedDataForPayment(newSaleObject);
    setPaymentMode("single");
    setPaymentMethod("cash");
    setShowPaymentModal(true);
  };
  const generateKOT = async (selectedTableNumber, tableStatus) => {
    console.log("hi");
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
      configurations[0]?.addRateWithTax?.restaurantSale
    );

    // console.log(finalProductData);
    

    if (orderType === "dine-in") {
      if (roomDetails && Object.keys(roomDetails).length > 0) {
        orderCustomerDetails = {
          roomId: roomDetails?._id,
          checkInNumber: roomDetails?.CheckInNumber,
          name: roomDetails?.guestName,
          tableNumber: selectedTableNumber,
          tableStatus,
        };
      } else {
        orderCustomerDetails = {
          tableNumber: selectedTableNumber,
          tableStatus,
        };
      }
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

    // console.log("orderCustomerDetails", orderItems);
    // console.log(orderType);
    // console.log("orderCustomerDetails", finalProductData);

    const newOrder = {
      id: orderNumber,
      items: [...finalProductData],
      type: orderType,
      customer: orderCustomerDetails,
      total: getTotalAmount(),
      timestamp: new Date(),
      status: kotDataForEdit?.status || "pending",
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

        queryClient.invalidateQueries({
          queryKey: ["todaysTransaction", cmp_id, isAdmin],
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }

    setOrders([...orders, newOrder]);
    setOrderItems([]);
    setOrderNumber(orderNumber + 1);
    setShowKOTModal(false);
    setIsEdit(false);
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



// ✅ Handle search with debounce
  


   const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    setHasMore(true);
    fetchAllItems(1, false);
  };








  useEffect(() => {
    let filteredItems = [...allItems];

    if (selectedSubcategory) {
      filteredItems = filteredItems.filter(
        (item) => item.sub_category === selectedSubcategory
      );
    }

    setItems(filteredItems);
  }, [allItems, selectedSubcategory]);

  // Cleanup
  
  

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
    console.log(data);
    console.log(data.type);
    const orderData = {
      kotNo: data?.voucherNumber,
      tableNo: data?.tableNumber,
      type: data.type,
      items: data?.items,
      createdAt: new Date(),
    };

    generateAndPrintKOT(orderData, true, false, companyName);
  };

  const handleSelectedPriceLevel = (value) => {
    setShowPriceLevelSelect(false);
    setSelectedPriceLevel(value);
  };

  const findOneCount = (id) => {
    return orderItems.find((item) => item._id === id)?.quantity || 0;
  };

  return (
    <>
      {showPriceLevelSelect && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white/95 backdrop-blur-xl p-4 md:p-6 rounded-xl shadow-2xl w-80 md:w-96 border border-white/20 animate-in zoom-in-95 duration-200">
            <label className="text-gray-800 mb-3 block font-semibold text-base md:text-lg">
              Select Price Level
            </label>
            <select
              className="w-full bg-white/90 text-gray-800 border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 text-white p-2 md:p-3 shadow-2xl border-b border-gray-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={() => navigate("/sUsers/dashboard")}
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <button
                className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <MenuIcon className="w-5 h-5" />
              </button>
              <h1 className="text-lg md:text-xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                🍽️{" "}
                <span className="hidden sm:inline">
                  Restaurant Management System
                </span>
                <span className="sm:hidden">RMS</span>
              </h1>
            </div>
            <div className="hidden md:block  backdrop-blur-sm border-b border-gray-200/50 shadow-lg">
  <div className="px-3 py-2.5">
    <div className="flex items-center gap-2">
     
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {priceLevelData.map((level) => (
          <button
            key={level._id}
            onClick={() => {
              setSelectedPriceLevel(level._id);
              // Clear cart when changing price level
              setOrderItems([]);
            }}
            className={`
              flex items-center gap-2 px-2 py-2 rounded-xl
              font-semibold text-xs transition-all duration-300
              whitespace-nowrap flex-shrink-0 min-w-max
              border hover:scale-105 active:scale-95 transform
              ${
                selectedPriceLevel === level._id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg shadow-purple-500/25"
                  : "bg-white/15 text-white border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-md"
              }
            `}
          >
            <span className="text-base">{level.icon || "💰"}</span>
            <span>{level.pricelevel}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex md:hidden items-center space-x-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/10">
                <CiCircleList className="w-3.5 h-3.5" />
                <button
                  className="text-xs font-medium hover:text-gray-200 transition-colors"
                  onClick={() => setShowPriceLevelSelect(true)}
                >
                  Price Level
                </button>
              </div>
              <div className="hidden sm:flex items-center space-x-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/10">
                <Users className="w-3.5 h-3.5" />
                <span
                  className="text-xs font-medium cursor-pointer text-gray-200 underline hover:text-white transition-colors"
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
                className="flex items-center space-x-1.5 hover:cursor-pointer bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-white/10 hover:bg-white/20 transition-all duration-200"
                onClick={() => navigate("/sUsers/KotPage")}
              >
                <Receipt className="w-4 h-4" />
                <span className="text-xs font-medium">
                  <span className="hidden sm:inline">Orders: </span>
                  {orders.length}
                </span>
              </div>
              <button
                className="md:hidden bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1.5 flex items-center space-x-1.5 border border-white/10 hover:bg-white/20 transition-all duration-200"
                onClick={() => setShowOrderSummary(true)}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-semibold">{getTotalItems()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact Cuisine Categories */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-lg">
          <div className="flex justify-between items-center px-3 py-2.5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine._id}
                  onClick={() =>
                    handleCategorySelect(cuisine._id, cuisine.name)
                  }
                  className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl
            font-semibold text-xs transition-all duration-300
            whitespace-nowrap flex-shrink-0 min-w-max
            border hover:scale-105 active:scale-95 transform
            ${
              selectedCuisine?.categoryName === cuisine.name
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                : "bg-white/80 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:shadow-md"
            }
          `}
                >
                  <span className="text-sm">{cuisine.icon}</span>
                  <span>{cuisine.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => navigate("/sUsers/BillSummary?type=restaurant")}
              className="hidden md:flex
        flex items-center gap-2 px-4 py-1.5 rounded-xl
        font-semibold text-xs transition-all duration-300
        whitespace-nowrap flex-shrink-0
        bg-gradient-to-r from-green-600 to-emerald-600 text-white 
        border-transparent shadow-lg shadow-emerald-500/25
        hover:scale-105 active:scale-95 transform
        hover:from-green-700 hover:to-emerald-700
      "
            >
              <span className="text-sm">📊</span>
              <span>Daily Restaurant Sales</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 relative">
          {/* Mobile Sidebar Overlay */}
          {isMobile && showSidebar && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowSidebar(false)}
            />
          )}

          {/* Compact Left Sidebar */}
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
            w-56 md:w-48 bg-white/95 backdrop-blur-xl shadow-2xl h-full flex flex-col min-h-0 border-r border-gray-200/50
          `}
          >
            <div className="p-3 border-b border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  {selectedSubcategory ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                      Items
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                      Subcategories
                    </>
                  )}
                </h2>
                <div className="flex items-center gap-1">
                  {selectedSubcategory && (
                    <button
                      onClick={handleBackToCategories}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors p-0.5 rounded-md hover:bg-indigo-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  {isMobile && (
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="text-gray-500 hover:text-gray-700 p-0.5 rounded-md hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {selectedCuisine && (
                <div className="text-xs text-indigo-600 mt-1.5 font-medium bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                  {selectedCuisine?.categoryName}
                </div>
              )}
            </div>

            <div className="p-3 flex-1 overflow-y-auto">
              {!selectedCuisine ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-lg">🍽️</span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Please select a category above
                  </p>
                </div>
              ) : filteredSubcategories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Filter className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xs">
                    No subcategories available
                  </p>
                </div>
              ) : (
                filteredSubcategories.map((subcategory, index) => {
                  const icon =
                    subcategoryIcons[subcategory.name] ||
                    subcategoryIcons.Default;

                  return (
                    <button
                      key={subcategory._id}
                      onClick={() => handleSubcategorySelect(subcategory.name)}
                      className={`w-full text-left px-3 py-2.5 mb-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border hover:scale-[1.02] hover:translate-x-1 transform group text-xs
                    ${
                      selectedSubcategory === subcategory.name
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/25"
                        : "bg-white/80 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 hover:shadow-md"
                    }
                  `}
                    >
                      <span className="text-sm group-hover:scale-110 transition-transform duration-200">
                        {icon}
                      </span>
                      <span className="capitalize tracking-wide">
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
            {/* Compact Search Bar */}
            <div className="p-3 bg-white/90 backdrop-blur-sm border-b border-gray-200/50">
           <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-10 py-2.5 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm transition-all duration-200"
          />
           {searchTerm && (
    <button
      onClick={clearSearch}
       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
    >
     <X className="w-4 h-4" />
    </button>
  )}
          {searchTerm && (
          <div className="mb-4 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg inline-block">
            {items.length > 0
              ? `Found ${items.length} item${items.length !== 1 ? "s" : ""} for "${searchTerm}"`
              : `No items found for "${searchTerm}"`}
          </div>
        )}
        </div>

              {/* {searchTerm && (
                <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                  {menuItems.length > 0
                    ? `Found ${menuItems.length} item${
                        menuItems.length !== 1 ? "s" : ""
                      } for "${searchTerm}"`
                    : `No items found for "${searchTerm}"`}
                </div>
              )} */}
            </div>

            {/* Menu Items Grid */}
            <div className="flex-1 p-3 overflow-y-auto">
              {loader ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium">Loading items...</p>
            </div>
          </div>
        ) : (
                <>
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></span>
                      {selectedSubcategory
                        ? `${selectedCuisine?.categoryName} - ${selectedSubcategory} (${menuItems.length})`
                        : searchTerm
                        ? `Search Results (${menuItems.length})`
                        : `All Items (${menuItems.length})`}
                    </h3>
                  </div>

                  {menuItems.length === 0 ? (
                    <div className="flex items-center justify-center h-48">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-600">
                          No Items Found
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {searchTerm
                            ? `No items found matching "${searchTerm}"`
                            : selectedSubcategory
                            ? `No items available in ${selectedSubcategory}`
                            : "No items available"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
                      {menuItems.map((item, index) => {
                        const count = findOneCount(item._id);

                        return (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group relative bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:border-indigo-200 hover:bg-white transition-all duration-500 cursor-pointer transform hover:scale-105 active:scale-95"
                            onClick={() => addToOrder(item)}
                          >
                            <div className="p-3 flex flex-col items-center justify-center text-center h-full min-h-[120px] relative">
                              {/* ✅ Always show count badge if count > 0 */}
                              {count > 0 && (
                                <div
                                  className="absolute inset-0 flex 
                            bg-gradient-to-br from-indigo-100/60 via-indigo-200/40 to-indigo-300/30
                            transition-opacity duration-500 rounded-xl p-2"
                                >
                                  <span className="text-lg sm:text-md md:text-md font-bold text-indigo-700 ">
                                    {count}
                                  </span>
                                </div>
                              )}

                              {/* Food Image */}
                              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-gray-200 shadow-md mb-2 group-hover:border-indigo-300 transition-all duration-500 relative z-10">
                                <img
                                  src={
                                    item.product_image ||
                                    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&h=150&fit=crop"
                                  }
                                  alt={item.product_name}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&h=150&fit=crop";
                                  }}
                                />
                              </div>

                              {/* Product Name */}
                              <h3 className="font-bold text-gray-800 text-xs mb-1.5 line-clamp-2 relative z-10 group-hover:text-indigo-700 transition-colors duration-300">
                                {item.product_name.toUpperCase()}
                              </h3>

                              {/* Price */}
                              <span className="text-gray-700 font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent relative z-10">
                                ₹
                                {selectedPriceLevel
                                  ? item.Priceleveles?.find(
                                      (pl) =>
                                        pl.pricelevel == selectedPriceLevel
                                    )?.pricerate || 0
                                  : item.Priceleveles?.[0]?.pricerate}
                              </span>

                              {/* Add to cart icon */}
                              <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                <Plus className="w-3 h-3 text-white" />
                              </div>
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

          {/* Compact Order Summary Sidebar */}
          {isMobile && showOrderSummary && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
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
            w-full sm:w-80 md:w-72 bg-white/95 backdrop-blur-xl border-l border-gray-200/50 flex flex-col min-h-0 h-full shadow-2xl
          `}
          >
            <div className="p-3 border-b border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="hidden sm:inline">Order Summary</span>
                    <span className="sm:hidden">Cart</span>
                    <div className="text-xs font-normal text-gray-600">
                      {getTotalItems()} items
                    </div>
                  </div>
                </h3>
                {isMobile && (
                  <button
                    onClick={() => setShowOrderSummary(false)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 p-3">
              {orderItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Add some items!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div
                      key={item._id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 rounded-xl p-3 flex justify-between items-start hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-2 mb-1">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-600">₹</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => {
                                const newPrice = parseFloat(e.target.value);
                                setOrderItems(
                                  orderItems.map((orderItem) =>
                                    orderItem._id === item._id
                                      ? { ...orderItem, price: newPrice }
                                      : orderItem
                                  )
                                );
                              }}
                              className="w-16 text-xs text-gray-600 bg-transparent border-none focus:outline-none focus:bg-white focus:border focus:border-indigo-300 focus:rounded px-1 py-0.5"
                              step="0.01"
                              min="0"
                            />
                            <span className="text-xs text-gray-600">
                              × {item.quantity}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white flex items-center justify-center rounded-full hover:from-red-600 hover:to-pink-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold min-w-[24px] text-center bg-white px-2 py-1 rounded-lg border border-gray-200 shadow-sm">
                          {item.quantity}
                        </span>
                        <button
                          className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center rounded-full hover:from-green-600 hover:to-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compact Total and Order Buttons */}
            <div className="p-3 border-t border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex justify-between items-center mb-3 p-2.5 bg-white rounded-xl shadow-lg border border-gray-100">
                <span className="text-sm font-bold text-gray-700">
                  Total Amount
                </span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ₹{getTotalAmount()}
                </span>
              </div>

              {/* Compact Order Type Selection */}
              <div className="mb-3">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setOrderType("dine-in")}
                    className={`flex flex-col items-center justify-center h-12 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                      orderType === "dine-in"
                        ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50"
                    }`}
                  >
                    <Home className="w-4 h-4 mb-0.5" />
                    <span className="font-semibold text-xs">Dine In</span>
                  </button>
                  <button
                    onClick={() => setOrderType("takeaway")}
                    className={`flex flex-col items-center justify-center h-12 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                      orderType === "takeaway"
                        ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50"
                    }`}
                  >
                    <Package className="w-4 h-4 mb-0.5" />
                    <span className="font-semibold text-xs">Takeaway</span>
                  </button>
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`flex flex-col items-center justify-center h-12 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                      orderType === "delivery"
                        ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50"
                    }`}
                  >
                    <Car className="w-4 h-4 mb-0.5" />
                    <span className="font-semibold text-xs">Delivery</span>
                  </button>
                  <button
                    onClick={() => setOrderType("roomService")}
                    className={`flex flex-col items-center justify-center h-12 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
                      orderType === "roomService"
                        ? "border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50"
                    }`}
                  >
                    <Bed className="w-4 h-4 mb-0.5" />
                    <span className="font-semibold text-xs">Room Service</span>
                  </button>
                  <button
                    onClick={() => {
                      console.log("Direct Sale button clicked"); // Debug log
                      setOrderType("direct-sale");
                    }}
                    className={`flex flex-col items-center justify-center h-12 rounded-xl border transition-all duration-300 transform hover:scale-105 col-span-2 ${
                      orderType === "direct-sale"
                        ? "border-transparent bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                        : "border-gray-200 bg-white/80 text-gray-700 hover:border-green-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50"
                    }`}
                  >
                    <Receipt className="w-4 h-4 mb-0.5" />
                    <span className="font-semibold text-xs">Direct Sale</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex space-x-2">
                <button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:scale-105 active:scale-95 transform shadow-lg shadow-indigo-500/25"
                  disabled={orderItems.length === 0}
                  onClick={handlePlaceOrder}
                >
                  {isEdit
                    ? "Update Kot"
                    : orderType === "direct-sale"
                    ? "Generate Bill"
                    : " Kot"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFullTableSelection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto relative border border-white/20 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowFullTableSelection(false);
                if (
                  !kotDataForEdit &&
                  Object.keys(kotDataForEdit).length <= 0
                ) {
                  setRoomDetails({});
                }
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
            >
              <button
                onClick={() => {
                  setShowFullTableSelection(false);
                  if (
                    !kotDataForEdit &&
                    Object.keys(kotDataForEdit).length <= 0
                  ) {
                    setRoomDetails({});
                  }
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
                aria-label="Close modal"
              >
                &times;
              </button>
            </button>
            <div>
              <TableSelection
                showKOTs={false}
                onTableSelect={(table) => {
                  generateKOT(table.tableNumber, table.status);
                  setShowFullTableSelection(false);
                }}
                roomData={roomData}
                setRoomDetails={setRoomDetails}
                roomDetails={roomDetails}
              />
            </div>
          </div>
        </div>
      )}

      {/* Compact KOT Modal */}
      {showKOTModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 max-w-sm w-full mx-2 transform transition-all duration-300 scale-100 max-h-[85vh] overflow-y-auto border border-white/20 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                KOT Details
              </h2>
              <button
                onClick={() => setShowKOTModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order Type Display */}
            <div className="mb-4">
              <div className="flex items-center justify-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                {orderType === "dine-in" && (
                  <Home className="w-5 h-5 mr-2 text-indigo-600" />
                )}
                {orderType === "takeaway" && (
                  <Package className="w-5 h-5 mr-2 text-indigo-600" />
                )}
                {orderType === "delivery" && (
                  <Car className="w-5 h-5 mr-2 text-indigo-600" />
                )}
                {orderType === "roomService" && (
                  <Bed className="w-5 h-5 mr-2 text-indigo-600" />
                )}
                <span className="text-sm font-bold text-gray-700">
                  {getOrderTypeDisplay(orderType)} Order
                </span>
              </div>
            </div>

            {/* Customer Details Input */}
            <div className="space-y-3 mb-6">
              {(orderType === "roomService" || orderType === "dine-in") && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Room Number
                    </label>
                    <div className="relative ">
                      <input
                        type="text"
                        placeholder="Search room..."
                        className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-violet-500"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setShowResults(true);
                        }}
                      />

                      {/* Dropdown results */}
                      {showResults && search && (
                        <ul className="absolute z-10 w-full bg-white border rounded-lg shadow max-h-60 overflow-y-auto">
                          {filteredRooms.length > 0 ? (
                            filteredRooms.map((room) => (
                              <li
                                key={room.roomId}
                                className="px-4 py-2 hover:bg-violet-100 cursor-pointer"
                                onClick={() => handleSelectRoom(room)}
                              >
                                {room.roomName} - {room.customerName} -{" "}
                                {room.voucherNumber}
                              </li>
                            ))
                          ) : (
                            <li className="px-4 py-2 text-gray-500">
                              No results found
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                    {/* <select
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm bg-white transition-all duration-200"
                    >
                      <option value="">Select a room</option>
                      {roomData?.map((room) => (
                        <option value={room.roomId} key={room.roomId}>
                          {room?.roomName} - {room?.customerName} -{" "}
                          {room?.voucherNumber}
                        </option>
                      ))}
                    </select> */}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm bg-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-In Number
                    </label>
                    <input
                      type="text"
                      value={roomDetails.CheckInNumber || ""}
                      readOnly
                      className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 text-sm"
                    />
                  </div>
                </>
              )}

              {(orderType === "delivery" || orderType === "takeaway") && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm bg-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm bg-white transition-all duration-200"
                    />
                  </div>
                  {orderType === "delivery" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Delivery Address
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
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 text-sm resize-none bg-white transition-all duration-200"
                      ></textarea>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowKOTModal(false);
                  setRoomDetails({});
                }}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={generateKOT}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
              >
                Confirm KOT
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Direct Sale Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-4 max-w-lg w-full mx-4 max-h-[95vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                Direct Sale Payment
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMode("single");
                  setCashAmount(0);
                  setOnlineAmount(0);
                  setPaymentError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Order Summary */}
            <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-700">
                  Total Items:
                </span>
                <span className="text-sm font-bold text-blue-900">
                  {getTotalItems()}
                </span>
              </div>
            </div>

            {/* Single Payment Method Selection */}
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
                  <span className="text-2xl mb-1">💵</span>
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
                  <span className="text-2xl mb-1">💳</span>
                  <span className="text-xs font-medium">Online Payment</span>
                </button>
              </div>

              {/* Cash Payment Dropdown */}
              {paymentMethod === "cash" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Cash Account
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="" disabled>
                      Select Payment Method
                    </option>
                    {cashOrBank?.bankDetails?.map((bank) => (
                      <option key={bank._id} value={bank._id}>
                        {bank.partyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-xs">{paymentError}</p>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item._id} className="flex justify-between text-xs">
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold text-gray-800">
                <span className="text-sm">Total Amount</span>
                <span className="text-base text-blue-600">
                  ₹{getTotalAmount()}
                </span>
              </div>

              <button
                onClick={handleProcessDirectSalePayment}
                disabled={saveLoader}
                className={`w-full mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  saveLoader
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                }`}
              >
                {saveLoader ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Process Payment"
                )}
              </button>

              {showVoucherPdf && salePrintData && (
                <div style={{ display: "none" }}>
                  <VoucherThreeInchPdf
                    ref={contentToPrint}
                    data={salePrintData}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* {showVoucherPdf && salePrintData && (
      <div style={{ display: 'none' }}>
        <VoucherThreeInchPdf
          contentToPrint={contentToPrint}
          data={salePrintData}
          org={org}
          tab="sale"
          isPreview={false}
          handlePrintData={handlePrint}
        />
      </div>
    )} */}

      {/* Optimized CSS */}
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

        /* Reduced animations for better performance */
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-float {
          animation: float 2s ease-in-out infinite;
        }

        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus styles - blue theme */
        input:focus,
        select:focus,
        textarea:focus {
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1),
            0 4px 15px rgba(99, 102, 241, 0.1);
        }
      `}</style>
       <div ref={observerTarget} style={{ height: 1 }} />
      {isLoading && <div>Loading...</div>}
      {!hasMore && <div>No more items</div>}
    
    </>
     
  );
};

export default RestaurantPOS;
