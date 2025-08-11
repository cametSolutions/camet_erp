import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";
import CustomBarLoader from "@/components/common/CustomBarLoader";

const TableMaster = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id || ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(
        `/api/sUsers/Table/${cmp_id}`,
        { tableNumber },
        { withCredentials: true }
      );

      toast.success("✅ Table Added Successfully");
      setTableNumber("");
    } catch (error) {
      console.error("Failed to add table:", error);
      toast.error(error.response?.data?.message || "❌ Failed to add table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <CustomBarLoader />}
       <TitleDiv
            loading={loading}
            title="Add Table"
            from="/sUsers/TableMaster"
          />
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-10 px-4">
        <div className="max-w-4xl mx-auto">
         

          <div className="bg-white shadow-xl rounded-xl p-8 transition-transform transform hover:scale-[1.01]">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-700 border-b pb-3">
              🪑 Table Master
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Field */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Table Number
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                    transition-all duration-200"
                  placeholder="Enter table number"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-200
                  ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-[#012a4a] hover:bg-blue-700"
                  }`}
              >
                {loading ? "Saving..." : "Save Table"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TableMaster;
