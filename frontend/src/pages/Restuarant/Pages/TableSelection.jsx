import React, { useState, useEffect } from "react";
import { FaUtensils, FaCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dining from "../../../assets/images/dining.png";
import api from "@/api/api";
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
// import api from "../../../utils/api"; // Uncomment if you have axios instance
// import { toast } from "react-hot-toast"; // Uncomment if using toast notifications

const TableTiles = ({ onTableSelect,showKOTs = true  }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
const [tableKOTs, setTableKOTs] = useState([]);
const [kotLoading, setKotLoading] = useState(false);
const navigate = useNavigate();
const location = useLocation();
const [showKotNotification, setShowKotNotification] = useState(location.state?.fromTable);

const selectedKot = location.state?.selectedKot;
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  ); // Replace with your actual ID or prop

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
      // toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);



  const handleKotClick = (kot) => {
  // redirect with kot id and/or give data as state
  navigate(`/sUsers/KotPage?tab=completed`, { state: { selectedKot: kot, fromTable: true } });

};
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "from-green-400 to-green-600";
      case "occupied":
        return "from-red-400 to-red-600";
      case "reserved":
        return "from-yellow-400 to-yellow-600";
      case "cleaning":
        return "from-blue-400 to-blue-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <FaCircle className="text-green-300 text-xs animate-pulse" />;
      case "occupied":
        return <FaCircle className="text-red-300 text-xs animate-pulse" />;
      case "reserved":
        return <FaCircle className="text-yellow-300 text-xs animate-pulse" />;
      case "cleaning":
        return <FaCircle className="text-blue-300 text-xs animate-pulse" />;
      default:
        return <FaCircle className="text-gray-300 text-xs" />;
    }
  };

const handleTableClick = async (table) => {
  // Call parent callback if provided
  if (onTableSelect) {
    onTableSelect(table);
  }

  // Only fetch KOTs if showKOTs is true
  if (showKOTs) {
    setSelectedTable(table);
    setKotLoading(true);

    try {
      const res = await api.get(`/api/sUsers/getKotDataByTable/${cmp_id}`, {
        withCredentials: true,
        params: {
          tableNumber: table.tableNumber,
          status: "completed"
        }
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


console.log(tables)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-4">
        Restaurant Tables
      </h1>

      {/* Status Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FaCircle className="text-green-500 text-xs" />
          <span className="text-sm text-gray-700">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCircle className="text-red-500 text-xs" />
          <span className="text-sm text-gray-700">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCircle className="text-yellow-500 text-xs" />
          <span className="text-sm text-gray-700">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCircle className="text-blue-500 text-xs" />
          <span className="text-sm text-gray-700">Cleaning</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-3">
  {tables.map((table) => (
    <div
      key={table._id}
      className={`bg-gradient-to-br ${getStatusColor(
        table.status
      )} rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer aspect-square flex flex-col items-center justify-center text-white p-2`}
      onClick={() => handleTableClick(table)}
    >
      {/* Status Icon */}
      {getStatusIcon(table.status)}

      {/* Dining Image */}
      <img
        src={dining}
        alt="Dining table"
        className="w-10 h-10 object-contain my-1"
      />

      {/* Table Number */}
      <h2 className="text-sm font-bold">{table.tableNumber}</h2>

      {/* Orders if Occupied */}
      {table.status === "occupied" && (
        <span className="text-[10px] font-semibold">
          {table.currentOrders}
        </span>
      )}
    </div>
  ))}
</div>
{showKOTs && selectedTable && (
  <div className="mt-6">
    <div className="mb-4">
      <h2 className="text-xl font-bold text-black">
       All KOT'S ON TABLE NUMBER {selectedTable.tableNumber}
      </h2>
    </div>

    {kotLoading ? (
      <div className="flex justify-center items-center py-8">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          Loading KOTs...
        </div>
      </div>
    ) : tableKOTs.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tableKOTs.map((kot) => {
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

          const currentStatusConfig = statusConfig[kot.status] || statusConfig.pending;

          return (
            <div
              key={kot._id}
                onClick={() =>{ if (showKotNotification && kot._id === selectedKot._id) {
      setShowKotNotification(false);
                }
                   handleKotClick(kot)}}
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
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {kot.type || 'dine-in'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MdAccessTime className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {new Date(kot.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        {new Date(kot.createdAt).toLocaleTimeString([], {
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
                    Items ({kot.items?.length || 0})
                  </h4>
                </div>

                {/* Scrollable Items Container */}
                <div className="h-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  <div className="space-y-1.5">
                    {kot.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
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
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] inline-block">
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
                              ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4">
                        <MdInbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">
                          No items in this KOT
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Total */}
              <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-green-800">
                    Total Amount
                  </span>
                  <span className="text-sm font-bold text-green-900">
                    ₹{(kot.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className="p-3 pt-2 flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    // Handle payment/print action
                    if (kot?.paymentCompleted) {
                      // handlePrintData(kot._id);
                      console.log('Print KOT:', kot._id);
                    } else {
                      // Open payment modal
                      console.log('Process payment for KOT:', kot._id);
                    }
                  }}
                  className="flex-1 group px-3 py-1.5 bg-white text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                >
                  <MdVisibility className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                  {!kot?.paymentCompleted ? "Pay" : "Print"}
                </button>
                <button
                  className="flex-1 group px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                  onClick={() => {
                    // Handle KOT print
                    console.log('Print KOT:', kot);
                    // handleKotPrint(kot)
                  }}
                >
                  <MdPrint className="w-3 h-3 group-hover:rotate-12 transition-transform duration-200" />
                  KOT Print
                </button>
              </div> */}
            </div>
          );
        })}
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 text-lg mb-2">No KOTs found</div>
        <div className="text-gray-500 text-sm">
          No active KOTs for Table {selectedTable.tableNumber}
        </div>
      </div>
    )}
  </div>
)}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center">
            <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
            <p className="text-sm text-gray-700">Loading tables…</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && tables.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No tables found.
        </div>
      )}
    </div>
  );
};

export default TableTiles;
