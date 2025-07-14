import { useState, useEffect } from "react";
import { MdDelete, MdPlaylistAdd } from "react-icons/md";
import useFetch from "@/customHook/useFetch";
import { toast } from "react-toastify";
import { TiTick } from "react-icons/ti";
function FoodPlanComponent({
  cmp_id,
  sendDataToParent,
  setDisplayFoodPlan,
  selectedRoomId,
  
}) {
  const [foodPlan, setFoodPlan] = useState([
    { foodPlanId: "", foodPlan: "", rate: 0 },
  ]);
  const [foodPlanData, setFoodPlanData] = useState([]);

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

  // function used to send data to the parent
  useEffect(() => {
    if (foodPlan.length > 0) {
      let filteredData = foodPlan.filter((item) => item.foodPlanId !== "");
      sendDataToParent(filteredData);
    }
  }, [foodPlan]);
  const handlePaxChange = (index, value) => {
    let specificData = foodPlanData?.find((item) => item._id === value);
    console.log(selectedRoomId);
    const updatedRows = [...foodPlan];
    updatedRows[index].foodPlan = specificData.foodPlan;
    updatedRows[index].foodPlanId = specificData._id;
    updatedRows[index].rate = specificData.amount;
    updatedRows[index].roomId = selectedRoomId;
    setFoodPlan(updatedRows);
  };
  const handleRateChange = (index, value) => {
    const updatedRows = [...foodPlan];
    updatedRows[index].rate = value;
    setFoodPlan(updatedRows);
  };
  const handleDeleteRow = (index) => {
    const updatedRows = foodPlan.slice(0, index);
    if (updatedRows.length === 0) {
      updatedRows.push({ foodPlanId: "", foodPlan: "", rate: 0 });
    }
    setFoodPlan(updatedRows);
  };
  const handleAddRow = () => {
    const lastRow = foodPlan[foodPlan.length - 1];
    // Check if fields are filled
    if (!lastRow?.foodPlan || !lastRow?.rate) {
      toast.error("Add Level name and Rate");
      return;
    }
    // Add new row if everything is valid
    setFoodPlan([...foodPlan, { foodPlanId: "", foodPlan: "", rate: 0 }]);
  };


  return (
    <div className="">
      <div className="relative w-full rounded-xl bg-white shadow-lg border">
        <div className="flex justify-start px-8 pt-6 border-b border-blue-200 p-2">
          <button
            type="button"
            className="pb-2 px-4 text-lg font-semibold text-blue-700 border-b-2 border-blue-500"
          >
            Food Plan
          </button>
          <button
            className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 transition-all duration-200"
            onClick={() => setDisplayFoodPlan(false)}
          >
          Save
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full table-auto border-collapse rounded-md">
              <thead className="bg-blue-50 text-blue-800 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-2 text-left border-b">
                    Select Food Plan
                  </th>
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
                        className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Pax</option>
                        {foodPlanData?.map((el) => (
                          <option key={el?._id} value={el?._id}>
                            {el?.foodPlan}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={row?.rate}
                        onChange={(e) =>
                          handleRateChange(index, e.target.value)
                        }
                        className="w-full px-3 py-1.5 rounded border border-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </td>

                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(index)}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-gray-50">
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

            <div className="text-left text-gray-900 flex items-center">
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
