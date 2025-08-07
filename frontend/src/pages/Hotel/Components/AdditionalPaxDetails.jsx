import { useState, useEffect } from "react";
import { MdDelete, MdPlaylistAdd } from "react-icons/md";
import useFetch from "@/customHook/useFetch";
import { toast } from "react-toastify";
import { TiTick } from "react-icons/ti";
function AdditionalPaxDetails({
  cmp_id,
  sendDataToParent,
  setDisplayAdditionalPax,
  selectedRoomId,
  formData,
}) {
  const [additionalPax, setAdditionalPax] = useState([
    { paxID: "", paxName: 0, rate: "" },
  ]);
  const [additionalPaxData, setAdditionalPaxData] = useState([]);
  const { data, error } = useFetch(`/api/sUsers/getAdditionalPax/${cmp_id}`);
  useEffect(() => {
    if (data) {
      setAdditionalPaxData(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  }, [error]);

  // useEffect used to manage the already selected values
  // useEffect(() => {
  //   console.log(formData);
  //   if (
  //     formData?.additionalPaxDetails?.length > 0 &&
  //     selectedRoomId &&
  //     formData.additionalPaxDetails !== []
  //   ) {
  //     let filteredData = formData.additionalPaxDetails?.filter(
  //       (item) => item.roomId == selectedRoomId
  //     );
  //     if (filteredData.length > 0 && filteredData !== []) {
  //       setAdditionalPax(filteredData);
  //     }
  //   }
  // }, [selectedRoomId]);

  useEffect(() => {
    if (additionalPax.length > 0) {
      let filteredData = additionalPax.filter((item) => item.paxID !== "");
      sendDataToParent(filteredData);
    }
  }, [additionalPax]);

  const handlePaxChange = (index, value) => {
    let specificData = additionalPaxData?.find((item) => item._id === value);
    const updatedRows = [...additionalPax];
    updatedRows[index].paxID = specificData._id;
    updatedRows[index].paxName = specificData.additionalPaxName;
    updatedRows[index].rate = specificData.amount;
    updatedRows[index].roomId = selectedRoomId;
    setAdditionalPax(updatedRows);
  };
  const handleRateChange = (index, value) => {
    const updatedRows = [...additionalPax];
    updatedRows[index].rate = value;
    setAdditionalPax(updatedRows);
  };
  const handleDeleteRow = (index) => {
    const updatedRows = additionalPax.slice(0, index);
    if (updatedRows.length === 0) {
      updatedRows.push({ paxID: "", paxName: 0, rate: "" });
    }
    setAdditionalPax(updatedRows);
  };
  const handleAddRow = () => {
    const lastRow = additionalPax[additionalPax.length - 1];
    console.log(lastRow);

    // Check if fields are filled
    if (!lastRow?.paxName || !lastRow?.rate) {
      toast.error("Add Level name and Rate");
      return;
    }
    // Add new row if everything is valid
    setAdditionalPax([...additionalPax, { paxName: "", rate: 0, paxID: "" }]);
  };

  console.log(additionalPax);

  return (
    <div className="">
      <div className="relative w-full rounded-xl bg-white shadow-lg border">
        <div className="flex justify-start px-8 pt-6 border-b border-blue-200 p-2">
          <button
            type="button"
            className="pb-2 px-4 text-lg font-semibold text-blue-700 border-b-2 border-blue-500"
          >
            Pax
          </button>
          <div className="ml-auto flex gap-2">
            <button
              className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-black rounded-md hover:bg-gray-800 transition-all duration-200"
              onClick={() => setDisplayAdditionalPax(false)}
            >
              Save
            </button>
            <button
              className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-gray-800 transition-all duration-200"
              onClick={() => setDisplayAdditionalPax(false)}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full table-auto border-collapse rounded-md">
              <thead className="bg-blue-50 text-blue-800 text-sm font-semibold">
                <tr>
                  <th className="px-4 py-2 text-left border-b">Select Pax</th>
                  <th className="px-4 py-2 text-left border-b">Rate</th>
                  <th className="px-4 py-2 text-center border-b">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {additionalPax?.map((row, index) => (
                  <tr
                    key={row?.id || index}
                    className="hover:bg-blue-50 transition-all border-b"
                  >
                    <td className="px-4 py-2">
                      <select
                        value={row?.paxID}
                        onChange={(e) => handlePaxChange(index, e.target.value)}
                        className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Pax</option>
                        {additionalPaxData?.map((el) => (
                          <option key={el?._id} value={el?._id}>
                            {el?.additionalPaxName}
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
                        <MdDelete className="text-lg text-red" />
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
                Add Additional Pax
              </button>
            </div>

            <div className="text-right font-semibold text-gray-700 flex items-center justify-end">
              Total
            </div>

            <div className="text-left text-gray-900 flex items-center">
              {additionalPax?.reduce(
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

export default AdditionalPaxDetails;
