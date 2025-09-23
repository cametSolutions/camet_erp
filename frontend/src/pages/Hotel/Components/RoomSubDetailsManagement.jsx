/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import api from "@/api/api";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { SelectRangeProviderInternal } from "react-day-picker";

const RoomSubDetailsManagement = ({
  tab,
  handleLoader,
  sendToParent,
  displayData,
  loading,
  handleDelete,
}) => {
  const [value, setValue] = useState("");
  const [price, setPrice] = useState("");
  const [edit, setEdit] = useState({ id: "", enabled: false });

  useEffect(() => {
    if (value === "") {
      setEdit({ id: "", enabled: false });
    }
  }, [value]);

  const handleSubmit = async () => {
    if (!value.trim()) return toast.error("Please enter a value");
    sendToParent(false, value, price);
    setValue("");
    setPrice("");
  };

  const deleteSubDetails = async (id) => {
    handleDelete(id);
  };

  const handleEdit = (data) => {
    setValue(
      data.additionalPaxName ? data.additionalPaxName : data.visitOfPurpose ? data.visitOfPurpose : data.idProof ? data.idProof : data.foodPlan
    );
    setPrice(data.amount);
    setEdit({ id: data._id, enabled: true });
  };

  const editSubDetails = async (id) => {
    sendToParent(true, value, price, edit.id);
    setValue("");
    setPrice("");
    setEdit({ id: "", enabled: false });
  };
  console.log(tab);
  return (
    <div className={`${loading ? "opacity-50 animate-pulse" : ""}`}>
      <div className="flex flex-col justify-center sticky top-0 z-10">
        <div className="flex flex-col items-center bg-[#457b9d] py-14">
          <h2 className="font-bold uppercase text-white">
            ADD YOUR DESIRED {tab}
          </h2>
          <input
            type="text"
            placeholder={`Enter your ${tab}`}
            className="w-4/6 sm:w-2/6 p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {(tab == "Additional pax" || tab == "Food Plan") && (
            <input
              type="number"
              placeholder={`Enter your ${tab} price`}
              className="w-4/6 sm:w-2/6 p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
              value={price}
              onKeyDown={(e) => {
                if (
                  !/[0-9]/.test(e.key) &&
                  ![
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
          <button
            onClick={edit.enabled ? editSubDetails : handleSubmit}
            className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold"
          >
            {edit.enabled ? "Update" : "Submit"}
          </button>
        </div>
        <div className="h-3 bg-gray-100"></div>
      </div>

      <section className="overflow-y-scroll h-[calc(100vh-273px)] px-4 scrollbar-thin">
        <div className="mt-2">
          {displayData && displayData?.length > 0 && !loading ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {tab}
                  </th>
                  {(tab == "Additional pax" || tab == "Food Plan") && (
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  )}
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData &&
                  displayData?.length > 0 &&
                  displayData.map((el) => (
                    <tr
                      key={el._id}
                      className="hover:bg-slate-100 cursor-pointer hover:translate-y-[1px]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                        {el?.additionalPaxName
                          ? el?.additionalPaxName
                          : el?.visitOfPurpose ? el?.visitOfPurpose : el.idProof ? el.idProof : el?.foodPlan}
                      </td>
                      {(tab == "Additional pax" || tab == "Food Plan") && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {el?.amount}
                        </td>
                      )}

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        <div className="flex justify-center gap-6">
                          <button
                            onClick={() => handleEdit(el)}
                            className="text-blue-500"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => deleteSubDetails(el._id)}
                            className="text-red-500"
                          >
                            <FaTrash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            !loading && (
              <div className="text-center text-gray-500 font-bold p-4">
                Data not found
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default RoomSubDetailsManagement;
