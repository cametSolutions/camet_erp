import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaUtensils, FaCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import dining from "../../../assets/images/dining.png";
import api from "@/api/api";
import useFetch from "@/customHook/useFetch";
import { motion } from "framer-motion";
import { Check, CreditCard, X, Banknote } from "lucide-react";
import { generateAndPrintKOT } from "@/pages/Restuarant/Helper/kotPrintHelper";
import VoucherPdf from "@/pages/voucher/voucherPdf/indian/VoucherPdf";
import { toast } from "react-toastify";
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
} from "react-icons/md";

const TableTiles = ({
  onTableSelect,
  showKOTs = true,
  roomData,
  setRoomDetails,
  roomDetails,
}) => {
  const sectionRef = useRef(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableKOTs, setTableKOTs] = useState([]);
  const [kotLoading, setKotLoading] = useState(false);
  const [tableAvailable, setTableAvailable] = useState(false);
  // Payment and print states
  const [selectedKot, setSelectedKot] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentMode, setPaymentMode] = useState("single");
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [paymentError, setPaymentError] = useState("");
  const [selectedCash, setSelectedCash] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [cashOrBank, setCashOrBank] = useState({});
  const [saveLoader, setSaveLoader] = useState(false);
  const [saleVoucherData, setSaleVoucherData] = useState();
  const [showVoucherPdf, setShowVoucherPdf] = useState(false);
  const [previewForSales, setPreviewForSales] = useState(null);
  const [conformationModal, setConformationModal] = useState(false);
  const [isPostToRoom, setIsPostToRooms] = useState(false);
  const [salePrintData, setSalePrintData] = useState(null);
  const [selectedDataForPayment, setSelectedDataForPayment] = useState({});

  const navigate = useNavigate();
  const location = useLocation();
  const [showKotNotification, setShowKotNotification] = useState(
    location.state?.fromTable
  );
  const selectedKotFromRedirect = location.state?.selectedKot;

  const { _id: cmp_id, name: companyName } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // Fetch payment type data
  const { data: paymentTypeData } = useFetch(
    `/api/sUsers/getPaymentType/${cmp_id}`
  );

  useEffect(() => {
    if (paymentTypeData) {
      const { bankDetails, cashDetails } = paymentTypeData?.data;
      setCashOrBank(paymentTypeData?.data);
      if (bankDetails && bankDetails.length > 0) {
        setSelectedBank(bankDetails[0]?._id);
      }
      if (cashDetails && cashDetails.length > 0) {
        setSelectedCash(cashDetails[0]?._id);
      }
    }
  }, [paymentTypeData]);

  // Fetch sales voucher data
  const fetchSalesVoucherData = useCallback(async () => {
    try {
      const response = await api.get(
        `/api/sUsers/getSeriesByVoucher/${cmp_id}?voucherType=sales`,
        { withCredentials: true }
      );
      if (response.data) {
        const specificSeries = response.data.series?.find(
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
          let newSaleObject = {
            series: specificSeries,
            number: specificNumber,
          };
          setSaleVoucherData(newSaleObject);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching data");
    }
  }, [cmp_id]);

  useEffect(() => {
    fetchSalesVoucherData();
  }, [fetchSalesVoucherData]);

  // Navigate to print page when salePrintData is set
  useEffect(() => {
    if (salePrintData) {
      navigate(`/sUsers/sharesalesThreeInch/${salePrintData._id}`);
    }
  }, [salePrintData, navigate]);

  // Show voucher PDF when preview data is ready
  useEffect(() => {
    if (previewForSales) {
      setShowVoucherPdf(true);
    }
  }, [previewForSales]);

  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Filter rooms based on search
  const filteredRooms = roomData?.filter(
    (room) =>
      room.roomName.toLowerCase().includes(search.toLowerCase()) ||
      room.customerName.toLowerCase().includes(search.toLowerCase()) ||
      room.voucherNumber.toLowerCase().includes(search.toLowerCase())
  );

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

  // Fetch Tables from API
  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sUsers/getTable/${cmp_id}`, {
        withCredentials: true,
      });
      setTables(response.data.tables || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, [tableAvailable]);

  // Handle KOT click
  const handleKotClick = (kot) => {
    navigate(`/sUsers/KotPage?tab=completed`, {
      state: { selectedKot: kot, fromTable: true },
    });
  };

  // Handle table click and fetch KOTs
  const handleTableClick = async (table) => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
    if (onTableSelect) {
      onTableSelect(table);
    }

    if (showKOTs) {
      setSelectedTable(table);
      setKotLoading(true);

      try {
        const res = await api.get(`/api/sUsers/getKotDataByTable/${cmp_id}`, {
          withCredentials: true,
          params: {
            tableNumber: table.tableNumber,
            status: "pending",
          },
        });
        setTableKOTs(res.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch KOTs for this table", error);
        setTableKOTs([]);
      } finally {
        setKotLoading(false);
      }
    }
  };

  // Handle multiple KOT selection
  const handleSelectMultipleKots = (order) => {
    if (order && !order?.paymentCompleted) {
      let findOne = selectedKot.find((item) => item.id == order._id);
      if (findOne) {
        setSelectedKot((prevSelected) =>
          prevSelected.filter((item) => item.id !== order._id)
        );
      } else {
        setSelectedKot((prevSelected) => [
          ...prevSelected,
          {
            id: order._id,
            type: "kot",
            voucherNumber: order.voucherNumber,
            serviceWorker: order.type,
          },
        ]);
      }
    }
  };

  // Handle KOT print
  const handleKotPrint = (data) => {
    const orderData = {
      kotNo: data?.voucherNumber,
      tableNo: data?.tableNumber,
      items: data?.items,
      createdAt: data?.createdAt,
      customerName: data?.customer?.name,
      type: data?.type,
    };
    generateAndPrintKOT(orderData, true, false, companyName);
  };

  // Handle print data
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

  // Handle sales preview
  const handleSalesPreview = (postToRoom = false) => {
    console.log(selectedKot);
    console.log(tableKOTs);

    setIsPostToRooms(postToRoom);
    let kotVoucherNumberArray = [];
    let itemList = selectedKot.flatMap((item) => {
      let findOne = tableKOTs.find((order) => order._id == item.id);
      if (findOne) {
        kotVoucherNumberArray.push({
          voucherNumber: findOne.voucherNumber,
          id: findOne._id,
        });
      }
      return findOne?.items || [];
    });

    let totalAmount = itemList.reduce(
      (acc, item) => acc + Number(item.total),
      0
    );

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
      finalAmount: totalAmount,
      total: totalAmount,
      voucherNumber: kotVoucherNumberArray,
      tableNumber: tableKOTs[0]?.customer?.tableNumber,
    };
    setPreviewForSales(newObject);
  };

  // Handle save sales
  const handleSaveSales = (status) => {
    setConformationModal(false);
    if (!status) {
      setShowVoucherPdf(false);
      setPreviewForSales(null);
      return;
    }
    setShowVoucherPdf(false);
    setShowPaymentModal(true);
    setSelectedDataForPayment(previewForSales);
  };

  // Handle save payment
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
      const response = await api.put(
        `/api/sUsers/updateKotPayment/${cmp_id}`,
        {
          paymentMethod: paymentMethod,
          paymentDetails: paymentDetails,
          selectedKotData: selectedDataForPayment,
          isPostToRoom: isPostToRoom,
        },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
        setTableKOTs((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, paymentCompleted: true } : order
          )
        );
        console.log(response.data.tableAvailable);
        setTableAvailable(response.data.tableAvailable);
        setSelectedKot([]);
        setShowVoucherPdf(false);
        toast.success(response?.data?.message);

        // Refresh the KOTs for the selected table
        if (selectedTable) {
          handleTableClick(selectedTable);
        }
      }
    } catch (error) {
      console.error(
        "Error updating payment:",
        error.response?.data || error.message
      );
      toast.error("Payment processing failed");
    } finally {
      setSaveLoader(false);
      setCashAmount(0);
      setOnlineAmount(0);
      setShowPaymentModal(false);
      setPaymentError("");
    }
  };
  console.log(roomDetails);
  const isOrderSelected = (order) => {
    return selectedKot.find((item) => item.id === order._id);
  };
  console.log(roomData);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      {/* Voucher PDF Modal */}
      {showVoucherPdf && (
        <div>
          <VoucherPdf
            data={previewForSales}
            org={org}
            userType="secondaryUser"
            tab="sales"
            isPreview={true}
            sendToParent={handleSaveSales}
          />
        </div>
      )}

      {!showVoucherPdf && (
        <>
          {/* Header */}
          <div className=" md:flex items-center  justify-center gap-6 mb-4">
            {/* Title */}
            <div className="text-center mb-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
                Restaurant Tables
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 mx-auto rounded-full"></div>
            </div>
            
            {/* Dropdown */}
            {roomData?.length > 0 && (
              <div className="relative mb-2">
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
            )}
       
            <>
              <div className="mb-3">
                <div className="flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl px-2 py-2 shadow-lg border border-white/30">
                    <div className="flex flex-wrap justify-center gap-4">
                      <div className="flex items-center gap-2 group">
                        <div className="relative">
                          <FaCircle className="text-emerald-500 text-sm animate-pulse" />
                          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                          Available
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="relative">
                          <FaCircle className="text-rose-500 text-sm animate-pulse" />
                          <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-rose-600 transition-colors">
                          Occupied
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="relative">
                          <FaCircle className="text-amber-500 text-sm animate-pulse" />
                          <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">
                          Reserved
                        </span>
                      </div>
                      <div className="flex items-center gap-2 group">
                        <div className="relative">
                          <FaCircle className="text-sky-500 text-sm animate-pulse" />
                          <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-sky-600 transition-colors">
                          Cleaning
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          </div>
          {/* Status Legend */}

          {/* KOT Notification */}

          {/* Tables Grid */}
          <div className="container mx-auto px-4">
            {/* Tables Grid - Main Section */}
            <div className="flex justify-center w-full">
              <div
                className="grid gap-4 grid-cols-3 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20"
                style={{ maxWidth: "fit-content" }}
              >
                {tables.map((table, index) => {
                  const getStatusConfig = (status) => {
                    switch (status) {
                      case "available":
                        return {
                          bgGradient:
                            "from-emerald-50/90 via-green-50/80 to-emerald-100/90",
                          borderColor: "border-emerald-200/60",
                          glowColor: "shadow-emerald-500/20",
                          textColor: "text-emerald-800",
                          iconColor: "text-emerald-600",
                          pulseColor: "bg-emerald-500",
                        };
                      case "occupied":
                        return {
                          bgGradient:
                            "from-rose-50/90 via-red-50/80 to-rose-100/90",
                          borderColor: "border-rose-200/60",
                          glowColor: "shadow-rose-500/20",
                          textColor: "text-rose-800",
                          iconColor: "text-rose-600",
                          pulseColor: "bg-rose-500",
                        };
                      case "reserved":
                        return {
                          bgGradient:
                            "from-amber-50/90 via-yellow-50/80 to-amber-100/90",
                          borderColor: "border-amber-200/60",
                          glowColor: "shadow-amber-500/20",
                          textColor: "text-amber-800",
                          iconColor: "text-amber-600",
                          pulseColor: "bg-amber-500",
                        };
                      case "cleaning":
                        return {
                          bgGradient:
                            "from-sky-50/90 via-blue-50/80 to-sky-100/90",
                          borderColor: "border-sky-200/60",
                          glowColor: "shadow-sky-500/20",
                          textColor: "text-sky-800",
                          iconColor: "text-sky-600",
                          pulseColor: "bg-sky-500",
                        };
                      default:
                        return {
                          bgGradient:
                            "from-gray-50/90 via-slate-50/80 to-gray-100/90",
                          borderColor: "border-gray-200/60",
                          glowColor: "shadow-gray-500/20",
                          textColor: "text-gray-800",
                          iconColor: "text-gray-600",
                          pulseColor: "bg-gray-500",
                        };
                    }
                  };

                  const statusConfig = getStatusConfig(table.status);

                  return (
                    <div
                      key={table?._id}
                      className={`group relative bg-gradient-to-br ${statusConfig.bgGradient}
                       backdrop-blur-sm rounded-2xl border-2 ${statusConfig.borderColor} cursor-pointer
                        transition-all duration-500 hover:scale-105 hover:rotate-1 hover:${statusConfig.glowColor} hover:shadow-xl
              w-15 h-15 
              flex flex-col items-center justify-center overflow-hidden`}
                      onClick={() => handleTableClick(table)}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: "fadeInUp 0.6s ease-out forwards",
                      }}
                    >
                      {/* Decorative particles on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div
                          className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="absolute top-0 right-1 w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "200ms" }}
                        ></div>
                        <div
                          className="absolute bottom-0 left-1 w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "400ms" }}
                        ></div>
                      </div>

                      {/* Status indicator dot */}
                      <div
                        className={`absolute top-0 left-0 w-3 h-3 ${statusConfig.pulseColor} rounded-full animate-ping opacity-75`}
                      ></div>
                      <div
                        className={`absolute top-2 left-2 w-3 h-3 ${statusConfig.pulseColor} rounded-full`}
                      ></div>

                      {/* Table icon */}
                      <div className="relative z-10 mb-2 group-hover:rotate-6 transition-transform duration-300">
                        <img
                          src={dining || "/api/placeholder/32/32"}
                          alt="Dining table"
                          className={`w-8 h-8 object-contain ${statusConfig.iconColor} filter drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300`}
                        />
                      </div>

                      {/* Table number */}
                      <div
                        className={`relative z-10 text-sm font-bold ${statusConfig.textColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        {table.tableNumber}
                      </div>

                      {/* Order count badge for occupied tables */}
                      {table.status === "occupied" && table.currentOrders && (
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          {table.currentOrders}
                        </div>
                      )}

                      {/* Hover overlay effects */}
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl border border-white/30"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KOT Section */}
          {showKOTs && selectedTable && (
            <div className="mt-4 bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-2">
              <div className="mb-2 text-center">
                <h2 className="text-md font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
                  Table No -{selectedTable.tableNumber} Orders
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
              </div>

              {kotLoading ? (
                <div className="flex flex-col justify-center items-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div
                      className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"
                      style={{
                        animationDirection: "reverse",
                        animationDuration: "1.5s",
                      }}
                    ></div>
                  </div>
                  <p className="text-lg text-gray-600 mt-6 font-medium">
                    Loading KOTs...
                  </p>
                </div>
              ) : tableKOTs.length > 0 ? (
                <>
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    ref={sectionRef}
                  >
                    {tableKOTs.map((kot, index) => {
                      const statusConfig = {
                        pending: {
                          label: "Pending",
                          bgColor: "bg-blue-100",
                          textColor: "text-blue-800",
                          iconColor: "bg-blue-600",
                        },
                        cooking: {
                          label: "Cooking",
                          bgColor: "bg-yellow-100",
                          textColor: "text-yellow-800",
                          iconColor: "bg-yellow-600",
                        },
                        ready_to_serve: {
                          label: "Ready to Serve",
                          bgColor: "bg-gray-100",
                          textColor: "text-green-800",
                          iconColor: "bg-green-600",
                        },
                        completed: {
                          label: "Completed",
                          bgColor: "bg-green-200",
                          textColor: "text-gray-800",
                          iconColor: "bg-gray-600",
                        },
                      };

                      const currentStatusConfig =
                        statusConfig[kot.status] || statusConfig.pending;

                      return (
                        <div
                          key={kot?._id}
                          className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border overflow-hidden h-96 flex flex-col cursor-pointer ${
                            isOrderSelected(kot)
                              ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50"
                              : "border-gray-100 hover:border-blue-200"
                          }`}
                          onClick={() => {
                            if (
                              showKotNotification &&
                              kot._id === selectedKotFromRedirect?._id
                            ) {
                              setShowKotNotification(false);
                            }
                            handleSelectMultipleKots(kot);
                          }}
                        >
                          {/* Selection indicator */}
                          {isOrderSelected(kot) && (
                            <div className="absolute top-2 right-2 z-10 bg-blue-500 rounded-full p-1 shadow-lg animate-bounce">
                              <MdCheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Status indicator bar */}
                          <div
                            className={`h-1 w-full ${currentStatusConfig.bgColor}`}
                          />

                          {/* Invoice Number */}
                          <div
                            className={`px-3 py-2 bg-gradient-to-r border-b flex-shrink-0 ${
                              isOrderSelected(kot)
                                ? "from-blue-100 to-indigo-100 border-blue-200"
                                : "from-blue-50 to-indigo-50 border-blue-100"
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <div
                                className={`flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm border ${
                                  isOrderSelected(kot)
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-white border-blue-200"
                                }`}
                              >
                                <MdDescription className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold text-blue-900">
                                  #{kot.voucherNumber}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Order Header */}
                          <div className="flex justify-between items-start p-3 pb-2 flex-shrink-0">
                            <div className="flex items-start gap-2 min-w-0 flex-1">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      isOrderSelected(kot)
                                        ? "bg-blue-200 text-blue-800"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {kot.type} -{" "}
                                    <span>{kot.roomId?.roomName}</span>
                                  </span>
                                </div>

                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <MdAccessTime className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    {new Date(kot.createdAt).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}{" "}
                                    {new Date(kot.createdAt).toLocaleTimeString(
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
                                Items ({kot.items?.length || 0})
                              </h4>
                            </div>

                            <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                              <div className="space-y-1.5">
                                {kot.items?.map((item, itemIndex) => (
                                  <div
                                    key={itemIndex}
                                    className={`flex items-center justify-between p-2 rounded-lg transition-colors border ${
                                      isOrderSelected(kot)
                                        ? "bg-blue-50 hover:bg-blue-100 border-blue-200"
                                        : "bg-gray-50 hover:bg-gray-100 border-gray-100"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0 pr-3">
                                      <div className="text-xs text-gray-800 font-medium leading-tight">
                                        {item.product_name || item.name}
                                      </div>
                                      {item.description && (
                                        <div className="text-xs text-gray-500 truncate mt-0.5">
                                          {item.description}
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <div className="text-center">
                                        <span
                                          className={`text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] inline-block ${
                                            isOrderSelected(kot)
                                              ? "bg-blue-200 text-blue-900"
                                              : "bg-blue-100 text-blue-800"
                                          }`}
                                        >
                                          {item.quantity}
                                        </span>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                          qty
                                        </div>
                                      </div>

                                      <div className="text-right min-w-[50px]">
                                        <div className="font-bold text-xs text-gray-900">
                                          ₹{(item.price || 0).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          ₹
                                          {(
                                            (item.price || 0) *
                                            (item.quantity || 0)
                                          ).toFixed(2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )) || (
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

                          {/* Order Total */}
                          <div
                            className={`px-3 py-2 bg-gradient-to-r border-t flex-shrink-0 ${
                              isOrderSelected(kot)
                                ? "from-blue-100 to-emerald-100 border-blue-200"
                                : "from-green-50 to-emerald-50 border-green-100"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span
                                className={`text-xs font-semibold ${
                                  isOrderSelected(kot)
                                    ? "text-blue-800"
                                    : "text-green-800"
                                }`}
                              >
                                Total Amount
                              </span>
                              <span
                                className={`text-sm font-bold ${
                                  isOrderSelected(kot)
                                    ? "text-blue-900"
                                    : "text-green-900"
                                }`}
                              >
                                ₹{(kot.total || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="p-3 pt-2 flex gap-2 flex-shrink-0">
                            {kot?.paymentCompleted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrintData(kot._id);
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
                                e.stopPropagation();
                                handleKotPrint(kot);
                              }}
                            >
                              <MdPrint className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                              KOT Print
                            </button>
                          </div>

                          {/* Click indicator overlay */}
                          <div
                            className={`absolute inset-0 pointer-events-none transition-all duration-200 ${
                              isOrderSelected(kot)
                                ? "bg-blue-500 bg-opacity-5"
                                : "group-hover:bg-gray-500 group-hover:bg-opacity-5"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Floating Pay Button */}
                  {selectedKot.length > 0 && (
                    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
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
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg mb-4 border border-green-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-green-800">
                              Total Amount
                            </span>
                            <span className="text-lg font-bold text-green-900">
                              ₹
                              {selectedKot
                                .reduce((total, kot) => {
                                  const order = tableKOTs.find(
                                    (o) => o._id === kot.id
                                  );
                                  return total + (order?.total || 0);
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Confirmation Modal */}
                        {conformationModal && (
                          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-lg w-96 p-6 space-y-4">
                              <h2 className="text-lg font-semibold text-gray-800">
                                How would you like to proceed?
                              </h2>
                              <p className="text-sm text-gray-600">
                                Choose to continue with payment or post the bill
                                to the room.
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
                                (kot) => kot?.serviceWorker !== "roomService"
                              );
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-6xl mb-6">🍽️</div>
                  <div className="text-2xl text-gray-400 mb-2 font-bold">
                    No KOTs found
                  </div>
                  <div className="text-gray-500 text-lg">
                    No active KOTs for Table {selectedTable.tableNumber}
                  </div>
                </div>
              )}
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
                    Table Payment Processing
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

                {/* KOT Section for Dine-In */}
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center text-blue-700">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">
                      KOT:{" "}
                      {selectedDataForPayment?.voucherNumber?.map(
                        (item, index) => (
                          <span
                            key={item?.id || index}
                            className="text-sm font-medium"
                          >
                            {item?.voucherNumber}
                            {index <
                            selectedDataForPayment.voucherNumber.length - 1
                              ? ", "
                              : ""}
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
                          Select Cash Register
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={selectedCash}
                          onChange={(e) => setSelectedCash(e.target.value)}
                        >
                          <option value="" disabled>
                            Select Cash Register
                          </option>
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
                          Select Payment Method
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                                const newCashAmount =
                                  parseFloat(e.target.value) || 0;
                                const currentOnlineAmount =
                                  parseFloat(onlineAmount) || 0;
                                const totalAmount =
                                  parseFloat(selectedDataForPayment?.total) ||
                                  0;

                                if (
                                  newCashAmount + currentOnlineAmount <=
                                  totalAmount
                                ) {
                                  setCashAmount(e.target.value);
                                  setPaymentError("");
                                } else {
                                  setPaymentError(
                                    "Sum of cash and online amount cannot exceed order total."
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
                            Select Cash Register
                          </label>
                          <select
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            value={selectedCash}
                            onChange={(e) => setSelectedCash(e.target.value)}
                          >
                            <option value="" disabled>
                              Select Cash Register
                            </option>
                            {cashOrBank?.cashDetails?.map((cashier) => (
                              <option key={cashier?._id} value={cashier?._id}>
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
                                const newOnlineAmount =
                                  parseFloat(e.target.value) || 0;
                                const currentCashAmount =
                                  parseFloat(cashAmount) || 0;
                                const totalAmount =
                                  parseFloat(selectedDataForPayment?.total) ||
                                  0;

                                if (
                                  newOnlineAmount + currentCashAmount <=
                                  totalAmount
                                ) {
                                  setOnlineAmount(e.target.value);
                                  setPaymentError("");
                                } else {
                                  setPaymentError(
                                    "Sum of cash and online amount cannot exceed order total."
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
                            Select Payment Method
                          </label>
                          <select
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                          >
                            <option value="" disabled>
                              Select Payment Method
                            </option>
                            {cashOrBank?.bankDetails?.map((bank) => (
                              <option key={bank?._id} value={bank?._id}>
                                {bank.partyName}
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
                          parseFloat(selectedDataForPayment?.total || 0) && (
                          <div className="flex justify-between text-xs text-amber-600 mt-1">
                            <span>Remaining:</span>
                            <span>
                              ₹
                              {(
                                parseFloat(selectedDataForPayment?.total || 0) -
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

                {/* Dine-In Order Summary */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="space-y-2">
                    {/* Table Information */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Table Number:
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {selectedDataForPayment?.tableNumber}
                      </span>
                    </div>

                    {/* Order Type Badge */}
                    <div className="flex justify-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Dine-In Order
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-3 flex justify-between font-semibold text-gray-800">
                    <span className="text-sm">Total Amount</span>
                    <span className="text-lg text-blue-600">
                      ₹{selectedDataForPayment?.total}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        // Validation for payment completion
                        if (paymentMode === "single") {
                          if (!paymentMethod) {
                            setPaymentError("Please select a payment method");
                            return;
                          }
                          if (paymentMethod === "cash" && !selectedCash) {
                            setPaymentError("Please select a cash register");
                            return;
                          }
                          if (paymentMethod === "card" && !selectedBank) {
                            setPaymentError("Please select a payment method");
                            return;
                          }
                        } else if (paymentMode === "split") {
                          const totalEntered =
                            parseFloat(cashAmount || 0) +
                            parseFloat(onlineAmount || 0);
                          const orderTotal = parseFloat(
                            selectedDataForPayment?.total || 0
                          );

                          if (totalEntered !== orderTotal) {
                            setPaymentError(
                              "Split payment amounts must equal the order total"
                            );
                            return;
                          }
                          if (cashAmount > 0 && !selectedCash) {
                            setPaymentError(
                              "Please select a cash register for cash payment"
                            );
                            return;
                          }
                          if (onlineAmount > 0 && !selectedBank) {
                            setPaymentError(
                              "Please select a payment method for online payment"
                            );
                            return;
                          }
                        }

                        handleSavePayment(
                          selectedDataForPayment?._id,
                          selectedDataForPayment?.tableNumber
                        );
                      }}
                      disabled={saveLoader}
                      className={`flex-1 group px-4 py-2 border rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                        saveLoader
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:scale-105"
                      }`}
                    >
                      {saveLoader ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <MdVisibility className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                          Complete Table Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default TableTiles;
