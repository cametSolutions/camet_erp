import { useState, useEffect } from "react";
import { MdDelete, MdPlaylistAdd } from "react-icons/md";
import useFetch from "@/customHook/useFetch";
import { toast } from "sonner";
import { useSelector } from "react-redux";

function FoodPlanComponent({
  cmp_id,
  sendDataToParent,
  setDisplayFoodPlan,
  selectedRoomId,
  formData,
  includeFoodRateWithRoom, 
  setIncludeFoodRateWithRoom
}) {

console.log("selectedRoomId", selectedRoomId);
  const [foodPlan, setFoodPlan] = useState([
    { foodPlanId: "", foodPlan: "", rate: 0, isComplimentary: false },
  ]);
  const [foodPlanData, setFoodPlanData] = useState([]);

  const { data, error } = useFetch(`/api/sUsers/getFoodPlan/${cmp_id}`);

  useEffect(() => {
    if (data) setFoodPlanData(data?.data);
  }, [data]);

  useEffect(() => {
    if (error) toast.error(error.response?.data?.message || "An error occurred");
  }, [error]);

  useEffect(() => {
    if (foodPlan.length > 0) {
      let filteredData = foodPlan.filter((item) => item.foodPlanId !== "");
      sendDataToParent(filteredData, selectedRoomId);
    }
  }, [foodPlanData]);

  useEffect(() => {
    if (
      Array.isArray(formData?.foodPlan) &&
      formData.foodPlan.length > 0 &&
      selectedRoomId
    ) {
      let filteredData = formData.foodPlan?.filter(
        (item) => item.roomId === selectedRoomId
      );
      if (filteredData.length > 0) setFoodPlan(filteredData);
    }
  }, [selectedRoomId, formData]);

  const handlePaxChange = (index, value) => {
    let specificData = foodPlanData?.find((item) => item._id === value);
    if (!specificData) return;

    const updatedRows = [...foodPlan];
    updatedRows[index].foodPlan = specificData.foodPlan;
    updatedRows[index].foodPlanId = specificData._id;
    updatedRows[index].roomId = selectedRoomId;
    updatedRows[index].originalAmount = specificData.amount;
    updatedRows[index].isComplimentary = specificData.isComplimentary || false;
    updatedRows[index].rate = specificData.isComplimentary ? 0 : specificData.amount;

    setFoodPlan(updatedRows);
  };

  const handleRateChange = (index, value) => {
    const updatedRows = [...foodPlan];
    updatedRows[index].rate = value;
    setFoodPlan(updatedRows);
  };

  const handleDeleteRowImproved = (index) => {
    const updatedRows = foodPlan.filter((_, i) => i !== index);
    if (updatedRows.length === 0) {
      setFoodPlan([{ foodPlanId: "", foodPlan: "", rate: 0, isComplimentary: false }]);
    } else {
      setFoodPlan(updatedRows);
    }
  };

  const handleAddRow = () => {
    const lastRow = foodPlan[foodPlan.length - 1];
    if (!lastRow?.foodPlan) {
      toast.error("Please select a Food Plan first");
      return;
    }
    setFoodPlan([
      ...foodPlan,
      { foodPlanId: "", foodPlan: "", rate: 0, isComplimentary: false },
    ]);
  };

  const handleSave = () => {
    setDisplayFoodPlan(false);
    if (foodPlan.length > 0) {
      let filteredData = foodPlan.filter((item) => item.foodPlanId !== "");
       console.log(filteredData);
      sendDataToParent(filteredData, selectedRoomId);
    }
  };

  const total = foodPlan.reduce((sum, row) => sum + Number(row?.rate || 0), 0);

  return (
    <div className="">
      <div className="relative w-full rounded-xl bg-white shadow-lg border">

        {/* Header */}
        <div className="flex items-center px-6 pt-5 pb-3 border-b border-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-blue-700 tracking-tight">
              Food Plan
            </span>
            {/* ── Toggle: Add with Rate ── */}
            <button
              type="button"
              onClick={() => setIncludeFoodRateWithRoom((p) => !p)}
              className={`relative inline-flex items-center h-5 w-9 rounded-full 
                          transition-colors duration-200 focus:outline-none flex-shrink-0
                          ${includeFoodRateWithRoom ? "bg-blue-500" : "bg-gray-300"}`}
            >
              <span
                className={`inline-block w-3.5 h-3.5 bg-white rounded-full shadow 
                            transition-transform duration-200
                            ${includeFoodRateWithRoom ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
            <span className="text-xs font-medium text-gray-500 select-none">
              {includeFoodRateWithRoom ? (
                <span className="text-blue-600 font-semibold">With Rate</span>
              ) : (
                "With Rate"
              )}
            </span>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              className="px-4 py-1.5 text-sm font-semibold text-white bg-black 
                         rounded-md hover:bg-gray-800 transition-all duration-200"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-4 py-1.5 text-sm font-semibold text-white bg-yellow-500 
                         rounded-md hover:bg-yellow-600 transition-all duration-200"
              onClick={() => setDisplayFoodPlan(false)}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-6 py-4">
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full table-auto border-collapse rounded-md">
              <thead className="bg-blue-50 text-blue-800 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-2 text-left border-b">Select Food Plan</th>
                    <th className="px-4 py-2 text-left border-b">Rate</th>
                  <th className="px-4 py-2 text-center border-b">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {foodPlan?.map((row, index) => (
                  <tr
                    key={row?.id || index}
                    className="hover:bg-blue-50 transition-all border-b"
                  >
                    <td className="px-4 py-2">
                      <select
                        value={row?.foodPlanId}
                        onChange={(e) => handlePaxChange(index, e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 
                                   focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Food Plan</option>
                        {foodPlanData?.map((el) => (
                          <option key={el?._id} value={el?._id}>
                            {el?.foodPlan}
                            {el?.isComplimentary ? " (Free)" : ""}
                          </option>
                        ))}
                      </select>
                      {row.isComplimentary && (
                        <span className="text-xs text-green-600 font-semibold ml-1">
                          Comp.
                        </span>
                      )}
                    </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={row?.rate}
                          onChange={(e) => handleRateChange(index, e.target.value)}
                          className={`w-full px-3 py-1.5 rounded border border-gray-300 
                                      text-center focus:outline-none focus:ring-2 
                                      focus:ring-blue-400
                                      ${row.isComplimentary ? "bg-gray-100 text-gray-500" : ""}`}
                        />
                      </td>

                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDeleteRowImproved(index)}
                        className="text-red-500 hover:text-red-700 transition-colors text-lg"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-gray-50 mt-4">
            <div>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 
                           hover:bg-green-700 text-white text-sm font-medium 
                           rounded shadow transition-all w-full md:w-auto"
              >
                <MdPlaylistAdd className="text-lg" />
                Add Food Plan
              </button>
            </div>

             <>
                <div className="text-right font-semibold text-gray-700 flex items-center justify-end">
                  Total
                </div>
                <div className="text-left text-gray-900 flex items-center font-bold">
                  {total}
                </div>
              </>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodPlanComponent;