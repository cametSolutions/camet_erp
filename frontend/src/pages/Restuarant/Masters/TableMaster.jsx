import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";
import CustomBarLoader from "@/components/common/CustomBarLoader";

const TableMaster = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [edit, setEdit] = useState({ enabled: false, id: null });

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?._id || ""
  );

  // Fetch tables on component mount
  useEffect(() => {
    if (cmp_id) {
      fetchTables();
    }
  }, [cmp_id]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/sUsers/getTable/${cmp_id}`, {
        withCredentials: true,
      });
      setTables(response.data.tables || []);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
      toast.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (value) => {
    if (!value || !value.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/api/sUsers/Table/${cmp_id}`,
        { tableNumber: value },
        { withCredentials: true }
      );

      toast.success("Table Added Successfully");
      setTableNumber("");
      fetchTables(); // Refresh the list
    } catch (error) {
      console.error("Failed to add table:", error);
      toast.error(error.response?.data?.message || "Failed to add table");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id, currentTableNumber) => {
    setEdit({ enabled: true, id });
    setTableNumber(currentTableNumber);
  };

  const editSubDetails = async (id, value) => {
    if (!value || !value.trim()) {
      toast.error("Please enter a table number");
      return;
    }

    setLoading(true);
    try {
      await api.put(
        `/api/sUsers/updateTable/${id}`,
        { tableNumber: value },
        { withCredentials: true }
      );

      toast.success("Table Updated Successfully");
      setTableNumber("");
      setEdit({ enabled: false, id: null });
      fetchTables(); // Refresh the list
    } catch (error) {
      console.error("Failed to update table:", error);
      toast.error(error.response?.data?.message || "Failed to update table");
    } finally {
      setLoading(false);
    }
  };

  const deleteSubDetails = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/api/sUsers/deleteTable/${id}`, {
        withCredentials: true,
      });

      toast.success("Table Deleted Successfully");
      fetchTables(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete table:", error);
      toast.error(error.response?.data?.message || "Failed to delete table");
    } finally {
      setLoading(false);
    }
  };
console.log(tables)
  return (
    <>
      {loading && <CustomBarLoader />}
      
      <div className={`${loading ? "opacity-50 animate-pulse" : ""}`}>
        <div className="flex flex-col justify-center sticky top-0 z-10">
          <div className="flex justify-center items-center flex-col bg-[#457b9d] py-14">
            <h2 className="font-bold uppercase text-white">
              ADD YOUR DESIRED TABLE
            </h2>
            <input
              type="text"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (edit?.enabled) {
                    editSubDetails(edit.id, tableNumber);
                  } else {
                    handleSubmit(tableNumber);
                  }
                }
              }}
              placeholder="Enter your table number"
              className="w-4/6 sm:w-2/6 p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />

            <button
              onClick={
                edit?.enabled
                  ? () => editSubDetails(edit.id, tableNumber)
                  : () => handleSubmit(tableNumber)
              }
              className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold"
            >
              {edit?.enabled ? "Update" : "Submit"}
            </button>
          </div>
          <div className="h-3 bg-gray-100"></div>
        </div>

        <section className="overflow-y-scroll h-[calc(100vh-273px)] px-4 pb-14 scrollbar-thin">
          <div className="mt-2 w-full">
            {tables?.length > 0 && !loading ? (
              tables.map((el, index) => {
                console.log("Rendering table", index, el);
                return (
                  <div
                    key={el._id}
                    className="flex items-center justify-between border-t-0 align-middle whitespace-nowrap p-4 mb-2 border-b cursor-pointer hover:bg-slate-100 hover:translate-y-[1px]"
                  >
                    <div className="px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500 w-2/3">
                      {el.tableNumber}
                    </div>
                    <div className="flex items-end gap-12 text-xs w-1/3 justify-end">
                      <div className="cursor-pointer text-center flex justify-center">
                        <p
                          onClick={() => handleEdit(el._id, el.tableNumber)}
                          className="text-blue-500"
                        >
                          <FaEdit size={15} />
                        </p>
                      </div>
                      <div className="cursor-pointer text-right">
                        <p
                          onClick={() => deleteSubDetails(el._id)}
                          className="flex justify-end mr-4 text-red-500"
                        >
                          <FaTrash />
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 font-bold whitespace-nowrap p-4">
                {!loading && <p>Data not found</p>}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default TableMaster;