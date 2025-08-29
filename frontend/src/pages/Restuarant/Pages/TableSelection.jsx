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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
          Restaurant Tables
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-blue-500 mx-auto rounded-full"></div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-10">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <FaCircle className="text-emerald-500 text-sm animate-pulse" />
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600 transition-colors">Available</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <FaCircle className="text-rose-500 text-sm animate-pulse" />
                <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-rose-600 transition-colors">Occupied</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <FaCircle className="text-amber-500 text-sm animate-pulse" />
                <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-amber-600 transition-colors">Reserved</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <FaCircle className="text-sky-500 text-sm animate-pulse" />
                <div className="absolute inset-0 bg-sky-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-sky-600 transition-colors">Cleaning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Grid - Centered based on number of items */}
      <div className="flex justify-center mb-8">
        <div 
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(tables.length, 8)}, minmax(0, 1fr))`,
            maxWidth: 'fit-content'
          }}
        >
          {tables.map((table, index) => {
            const getStatusConfig = (status) => {
              switch (status) {
                case "available":
                  return {
                    bgGradient: "from-emerald-50/90 via-green-50/80 to-emerald-100/90",
                    borderColor: "border-emerald-200/60",
                    glowColor: "shadow-emerald-500/20",
                    textColor: "text-emerald-800",
                    iconColor: "text-emerald-600",
                    pulseColor: "bg-emerald-500"
                  };
                case "occupied":
                  return {
                    bgGradient: "from-rose-50/90 via-red-50/80 to-rose-100/90",
                    borderColor: "border-rose-200/60",
                    glowColor: "shadow-rose-500/20",
                    textColor: "text-rose-800",
                    iconColor: "text-rose-600",
                    pulseColor: "bg-rose-500"
                  };
                case "reserved":
                  return {
                    bgGradient: "from-amber-50/90 via-yellow-50/80 to-amber-100/90",
                    borderColor: "border-amber-200/60",
                    glowColor: "shadow-amber-500/20",
                    textColor: "text-amber-800",
                    iconColor: "text-amber-600",
                    pulseColor: "bg-amber-500"
                  };
                case "cleaning":
                  return {
                    bgGradient: "from-sky-50/90 via-blue-50/80 to-sky-100/90",
                    borderColor: "border-sky-200/60",
                    glowColor: "shadow-sky-500/20",
                    textColor: "text-sky-800",
                    iconColor: "text-sky-600",
                    pulseColor: "bg-sky-500"
                  };
                default:
                  return {
                    bgGradient: "from-gray-50/90 via-slate-50/80 to-gray-100/90",
                    borderColor: "border-gray-200/60",
                    glowColor: "shadow-gray-500/20",
                    textColor: "text-gray-800",
                    iconColor: "text-gray-600",
                    pulseColor: "bg-gray-500"
                  };
              }
            };

            const statusConfig = getStatusConfig(table.status);

            return (
              <div
                key={table._id}
                className={`group relative bg-gradient-to-br ${statusConfig.bgGradient} backdrop-blur-sm rounded-2xl border-2 ${statusConfig.borderColor} cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-2 hover:shadow-2xl ${statusConfig.glowColor} w-20 h-20 flex flex-col items-center justify-center overflow-hidden`}
                onClick={() => handleTableClick(table)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Animated background particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="absolute top-3 right-3 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                  <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '400ms'}}></div>
                </div>

                {/* Status pulse indicator */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusConfig.pulseColor} rounded-full animate-ping opacity-75`}></div>
                <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusConfig.pulseColor} rounded-full`}></div>

                {/* Table icon with rotation effect */}
                <div className="relative z-10 mb-1 group-hover:rotate-12 transition-transform duration-300">
                  <img
                    src={dining || "/api/placeholder/24/24"}
                    alt="Dining table"
                    className={`w-6 h-6 object-contain ${statusConfig.iconColor} filter drop-shadow-sm group-hover:drop-shadow-lg transition-all duration-300`}
                  />
                </div>

                {/* Table number with modern typography */}
                <div className={`relative z-10 text-xs font-bold ${statusConfig.textColor} group-hover:scale-110 transition-transform duration-300`}>
                  {table.tableNumber}
                </div>

                {/* Orders count for occupied tables */}
                {table.status === "occupied" && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    {table.currentOrders}
                  </div>
                )}

                {/* Hover effect overlay with glassmorphism */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl border border-white/30"></div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-700"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .grid > div {
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>

      {/* KOT Section with modern styling */}
      {showKOTs && selectedTable && (
        <div className="mt-12 bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="mb-8 text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-2">
              Table No -{selectedTable.tableNumber} Orders
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>

          {kotLoading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <p className="text-lg text-gray-600 mt-6 font-medium">Loading KOTs...</p>
            </div>
          ) : tableKOTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                const currentStatusConfig = statusConfig[kot.status] || statusConfig.pending;

                return (
                  <div
                    key={kot._id}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/40 overflow-hidden h-96 flex flex-col"
                    style={{
                      animationDelay: `${index * 150}ms`,
                      animation: 'fadeInUp 0.8s ease-out forwards'
                    }}
                    onClick={() => {
                      if (showKotNotification && kot._id === selectedKot?._id) {
                        setShowKotNotification(false);
                      }
                      handleKotClick(kot);
                    }}
                  >
                    {/* Status indicator bar with gradient */}
                    <div className={`h-2 w-full bg-gradient-to-r ${currentStatusConfig.bgColor} relative`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                    </div>

                    {/* Invoice Number with modern badge */}
                    <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100/50 flex-shrink-0">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/40">
                          <MdDescription className="w-4 h-4 text-indigo-600" />
                          <span className="text-sm font-bold text-indigo-900">
                            #{kot.voucherNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rest of the KOT content remains the same */}
                    <div className="flex justify-between items-start p-4 pb-2 flex-shrink-0">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-medium shadow-sm">
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

                      <div className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${currentStatusConfig.bgColor} ${currentStatusConfig.textColor} shadow-sm`}>
                        <div className={`w-2 h-2 rounded-full ${currentStatusConfig.iconColor} animate-pulse`} />
                        {currentStatusConfig.label}
                      </div>
                    </div>

                    {/* Order Items with enhanced scrolling */}
                    <div className="flex-1 px-4 overflow-hidden min-h-0">
                      <div className="mb-2">
                        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <MdList className="w-3 h-3 text-gray-400" />
                          Items ({kot.items?.length || 0})
                        </h4>
                      </div>

                      <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-indigo-50 hover:scrollbar-thumb-indigo-400">
                        <div className="space-y-2">
                          {kot.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-gray-100/50 shadow-sm"
                            >
                              <div className="flex-1 min-w-0 pr-3">
                                <div className="text-xs text-gray-800 font-semibold leading-tight">
                                  {item.product_name || item.name}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-gray-500 truncate mt-1">
                                    {item.description}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-center">
                                  <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full min-w-[28px] inline-block shadow-sm">
                                    {item.quantity}
                                  </span>
                                  <div className="text-xs text-gray-400 mt-1 font-medium">
                                    qty
                                  </div>
                                </div>

                                <div className="text-right min-w-[60px]">
                                  <div className="font-bold text-xs text-gray-900">
                                    ₹{(item.price || 0).toFixed(2)}
                                  </div>
                                  <div className="text-xs text-gray-600 font-medium">
                                    ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )) || (
                            <div className="text-center py-8">
                              <MdInbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm text-gray-500 font-medium">
                                No items in this KOT
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Total with gradient */}
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-t border-emerald-100/50 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-emerald-800">
                          Total Amount
                        </span>
                        <span className="text-lg font-bold text-emerald-900">
                          ₹{(kot.total || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-6">🍽️</div>
              <div className="text-2xl text-gray-400 mb-2 font-bold">No KOTs found</div>
              <div className="text-gray-500 text-lg">
                No active KOTs for Table {selectedTable.tableNumber}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/40 p-8 flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-lg text-gray-700 font-semibold">Loading tables...</p>
          </div>
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && tables.length === 0 && (
        <div className="text-center py-20">
          <div className="text-8xl mb-8">🏪</div>
          <div className="text-3xl text-gray-400 mb-4 font-bold">No tables found</div>
          <div className="text-gray-500 text-lg">Add some tables to get started</div>
        </div>
      )}
    </div>
  );
};

export default TableTiles;
