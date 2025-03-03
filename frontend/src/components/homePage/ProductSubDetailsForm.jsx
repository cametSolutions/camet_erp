/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/api";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import Pagination from "../../components/common/Pagination";
import { useLocation } from "react-router-dom";

const ProductSubDetailsForm = ({ tab, handleLoader }) => {
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);


  const [edit, setEdit] = useState({
    id: "",
    enabled: false,
  });

  const location = useLocation();

  // Call useSelector hooks unconditionally
  const selectedOrgId = useSelector(
    (state) => state?.setSelectedOrganization?.selectedOrg?._id
  );
  const secSelectedOrgId = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?._id
  );

  let user;
  let orgId;

  if (location?.pathname?.startsWith("/pUsers")) {
    user = "pUsers";
    orgId = selectedOrgId;
  } else {
    user = "sUsers";
    orgId = secSelectedOrgId;
  }

  useEffect(() => {
    getSubDetails();
    setValue("");
  }, [reload]);

  useEffect(() => {
    if (value === "") {
      setEdit(false);
    }
  }, [value]);

  const getSubDetails = async (data) => {
    try {
      setLoading(true);
      handleLoader(true);
      const res = await api.get(
        `/api/${user}/getProductSubDetails/${orgId}?type=${tab}`,
        {
          withCredentials: true,
        }
      );
      setData(res?.data?.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      handleLoader(false);
    }
  };

  const handleSubmit = async (value) => {
    const formData = {
      [tab]: value,
    };
    if (tab === "godown" && data.length === 0) {
      const result = await Swal.fire({
        title: "Adding First Godown",
        text: "Adding your first godown will automatically create a Default godown. This default will be included in your GodownList and applied across all products.",
        icon: "info",
        confirmButtonText: "Proceed",
        showCancelButton: true,
      });

      if (result.isDismissed) {
        return; // Exit if the user cancels the action
      }
    }

    try {
      setLoading(true);
      handleLoader(true);
      const res = await api.post(
        `/api/${user}/addProductSubDetails/${orgId}`,
        formData,
        {
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      setReload(!reload);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
      handleLoader(false);
    }
  };

    const deleteSubDetails = async (id, type) => {
      if (tab === "godown") {
        const isDefaultGodown = data.find((d) => d._id === id)?.defaultGodown;

        if (isDefaultGodown) {
          const result = await Swal.fire({
            title: "Cannot Delete",
            text: "Cannot delete default godown",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
      }
      try {
        // Show a confirmation dialog
        const result = await Swal.fire({
          title: "Are you sure?",
          text: `You are about to delete this ${tab}. This action cannot be undone!`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        });

        // If the user confirms the deletion
        if (result.isConfirmed) {
          setLoading(true);
          handleLoader(true);
          const res = await api.delete(
            `/api/${user}/deleteProductSubDetails/${orgId}/${id}?type=${tab}`,
            {
              withCredentials: true,
            }
          );

          setReload(!reload);
          // Show a success message
          Swal.fire("Deleted!", `The ${tab} has been deleted.`, "success");

          // You might want to update your local state here
        }
      } catch (error) {
        console.log(error);

        // Show an error message
        Swal.fire(
          "Error",
          error.response?.data?.message || "An error occurred while deleting",
          "error"
        );
      } finally {
        setLoading(false);
        handleLoader(false);
      }
    };

  const handleEdit = async (id, value) => {
    if (tab === "godown") {
      const isDefaultGodown = data.find((d) => d._id === id)?.defaultGodown;

      if (isDefaultGodown) {
        const result = await Swal.fire({
          title: "Cannot Edit",
          text: "Cannot edit default godown",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }
    }
    setValue(value);
    setEdit({
      id,

      enabled: true,
    });
  };

  // Edit subdetails
  const editSubDetails = async (id, data) => {
    const formData = {
      [tab]: value,
    };
    try {
      setLoading(true);
      handleLoader(true);
      const res = await api.put(
        `/api/${user}/editProductSubDetails/${orgId}/${id}?type=${tab}`,
        formData,
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      setValue("");
      setReload(!reload);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
      handleLoader(false);
    }
  };

  return (
    <div className={`${loading ? "opacity-50 animate-pulse" : ""} `}>
      <div className="flex flex-col justify-center  sticky top-0 z-10 ">
        <div className=" flex justify-center items-center flex-col bg-[#457b9d] py-14">
          <h2 className="font-bold uppercase text-white">
            ADD YOUR DESIRED {tab}
          </h2>
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit(value);
              }
            }}
            placeholder={`Enter your ${tab} name `}
            className=" w-4/6  sm:w-2/6   p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            onClick={
              edit?.enabled
                ? () => editSubDetails(edit.id, value)
                : () => handleSubmit(value)
            }
            className="bg-gray-800 text-white px-6 py-1 rounded-full mt-3 text-sm font-bold "
          >
            {edit ? "Update" : "Submit"}
          </button>
        </div>
        <div className="h-3 bg-gray-100 "></div>
      </div>
      
      <section className="overflow-y-scroll h-[calc(100vh-273px)] px-4 scrollbar-thin ">
        <div className="mt-2">
          {data?.length > 0 && !loading ? (
            data.map((el) => (
              <div
                key={el._id}
                className="flex items-center justify-between border-t-0 align-middle  whitespace-nowrap p-4 mb-2 border-b cursor-pointer hover:bg-slate-100 hover:translate-y-[1px]"
              >
                <div className=" px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500">
                  {el[tab]}
                </div>

                <div className="flex items-center gap-12 text-xs">
                  <div className=" cursor-pointer text-center flex justify-center ">
                    <p
                      onClick={() => handleEdit(el._id, el[tab])}
                      className="text-blue-500"
                    >
                      <FaEdit size={15}  />
                    </p>
                  </div>
                  <div className=" cursor-pointer text-right ">
                    <p
                      onClick={() => deleteSubDetails(el._id)}
                      className="flex justify-end mr-4 text-red-500"
                    >
                      <FaTrash />
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 font-bold  whitespace-nowrap p-4 ">
              {!loading && <p>Data not found</p>}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductSubDetailsForm;
