import React, { useState, useEffect } from "react";
import { FaUtensils, FaCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import dining from "../../../assets/images/dining.png";
import api from "@/api/api";
// import api from "../../../utils/api"; // Uncomment if you have axios instance
// import { toast } from "react-hot-toast"; // Uncomment if using toast notifications

const TableTiles = ({ onTableSelect }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const handleTableClick = (table) => {
    if (onTableSelect) {
      onTableSelect(table); // Pass the clicked table up
    }
  };

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
