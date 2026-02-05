import { useState, useEffect } from "react";
import { MdDelete, MdPlaylistAdd } from "react-icons/md";
import useFetch from "@/customHook/useFetch";
import { toast } from "sonner";

function FoodPlanComponent({
  cmp_id,
  sendDataToParent,
  setDisplayFoodPlan,
  selectedRoomId,
  formData,
}) {
  console.log("formData", formData);
  
  const [foodPlan, setFoodPlan] = useState([
    { foodPlanId: "", foodPlan: "", rate: 0, isComplimentary: false }, // ✅ Added isComplimentary
  ]);
  const [foodPlanData, setFoodPlanData] = useState([]);

  // Fetch available food plans
  const { data, error } = useFetch(`/api/sUsers/getFoodPlan/${cmp_id}`);

  useEffect(() => {
    if (data) {
      setFoodPlanData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }, [error]);

  // Send valid data to parent
  useEffect(() => {
    if (foodPlan.length > 0) {
      let filteredData = foodPlan.filter((item) => item.foodPlanId !== "");
      // console.log(filteredData);
      sendDataToParent(filteredData, selectedRoomId);
    }
  }, [foodPlan, selectedRoomId, sendDataToParent]);

  // Load existing data if editing or reopening
  useEffect(() => {
    if (
      Array.isArray(formData?.foodPlan) &&
      formData.foodPlan.length > 0 &&
      selectedRoomId
    ) {
      let filteredData = formData.foodPlan?.filter(
        (item) => item.roomId === selectedRoomId
      );
      if (filteredData.length > 0) {
        setFoodPlan(filteredData);
      }
    }
  }, [selectedRoomId, formData]);
  


  // Handle Dropdown Selection
  const handlePaxChange = (index, value) => {
  let specificData = foodPlanData?.find((item) => item._id === value);
  if (!specificData) return;

  const updatedRows = [...foodPlan];
  updatedRows[index].foodPlan = specificData.foodPlan;
  updatedRows[index].foodPlanId = specificData._id;
  updatedRows[index].roomId = selectedRoomId;
  
  // ✅ Preserve BOTH original amount AND complimentary status
  updatedRows[index].originalAmount = specificData.amount;  // Keep original price
  updatedRows[index].isComplimentary = specificData.isComplimentary || false;
  updatedRows[index].rate = specificData.isComplimentary ? 0 : specificData.amount;  // Display rate for calculations
  
  setFoodPlan(updatedRows);
};

  const handleRateChange = (index, value) => {
    const updatedRows = [...foodPlan];
    updatedRows[index].rate = value;
    setFoodPlan(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = foodPlan.slice(0, index); // Note: This logic seems to clear subsequent rows? 
    // Usually you want to filter out only the deleted index:
    // const updatedRows = foodPlan.filter((_, i) => i !== index);
    
    // Your original logic:
    if (updatedRows.length === 0) {
      updatedRows.push({ foodPlanId: "", foodPlan: "", rate: 0 });
    }
    setFoodPlan(updatedRows);
  };

  // Improved delete function (Recommended replacement for above)
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
    if (!lastRow?.foodPlan) { // allow rate 0 if complimentary
      toast.error("Please select a Food Plan first");
      return;
    }
    setFoodPlan([...foodPlan, { foodPlanId: "", foodPlan: "", rate: 0, isComplimentary: false }]);
  };

  console.log("foodPlan", foodPlan);

  return (
    <div className="">
      <div className="relative w-full rounded-xl bg-white shadow-lg border">
        {/* Header */}
        <div className="flex justify-start px-8 pt-6 border-b border-blue-200 p-2">
          <button
            type="button"
            className="pb-2 px-4 text-lg font-semibold text-blue-700 border-b-2 border-blue-500"
          >
            Food Plan
          </button>
          <div className="ml-auto flex gap-2">
            <button
              className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 transition-all duration-200"
              onClick={() => setDisplayFoodPlan(false)}
            >
              Save
            </button>
            <button
              className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-gray-800 transition-all duration-200"
              onClick={() => setDisplayFoodPlan(false)}
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Table Content */}
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
                    {/* Dropdown Column */}
                    <td className="px-4 py-2">
                      <select
                        value={row?.foodPlanId}
                        onChange={(e) => handlePaxChange(index, e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Food Plan</option>
                        {foodPlanData?.map((el) => (
                          <option key={el?._id} value={el?._id}>
                            {/* ✅ Show "Plan Name - (Complimentary)" or "Plan Name - (Rate)" */}
                            {el?.foodPlan} 
                            {el?.isComplimentary ? " (Free)" : ""}
                          </option>
                        ))}
                      </select>
                      
                      {/* ✅ Small Badge Indicator */}
                      {row.isComplimentary && (
                         <span className="text-xs text-green-600 font-semibold ml-1">
                           Comp.
                         </span>
                      )}
                    </td>

                    {/* Rate Column */}
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row?.rate}
                        // Disable rate editing if it is complimentary (Optional)
                        // disabled={row.isComplimentary} 
                        onChange={(e) => handleRateChange(index, e.target.value)}
                        className={`w-full px-3 py-1.5 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          row.isComplimentary ? "bg-gray-100 text-gray-500" : ""
                        }`}
                      />
                    </td>

                    {/* Delete Action */}
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDeleteRowImproved(index)} // Changed to improved delete
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

          {/* Footer / Total */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-gray-50 mt-4">
            <div>
              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded shadow transition-all w-full md:w-auto"
              >
                <MdPlaylistAdd className="text-lg" />
                Add Food plan
              </button>
            </div>

            <div className="text-right font-semibold text-gray-700 flex items-center justify-end">
              Total
            </div>

            <div className="text-left text-gray-900 flex items-center font-bold">
              {foodPlan?.reduce(
                (total, row) => total + Number(row?.rate || 0),
                0
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodPlanComponent;
