/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api/api";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import Pagination from "../../components/common/Pagination";

const ProductSubDetailsForm = ({ tab }) => {
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);
  const [reload, setReload] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(5);
  const [edit, setEdit] = useState({
    id: "",
    enabled: false,
  });

  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

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
      const res = await api.get(
        `/api/pUsers/getProductSubDetails/${orgId}?type=${tab}`,
        {
          withCredentials: true,
        }
      );
      setData(res?.data?.data);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleSubmit = async (value) => {
    const formData = {
      [tab]: value,
    };
    console.log(formData);
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
      const res = await api.post(
        `/api/pUsers/addProductSubDetails/${orgId}`,
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
    }
  };

  const deleteSubDetails = async (id, type) => {
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
        const res = await api.delete(
          `/api/pUsers/deleteProductSubDetails/${orgId}/${id}?type=${tab}`,
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
    }
  };

  const handleEdit = async (id, value) => {
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
      const res = await api.put(
        `/api/pUsers/editProductSubDetails/${orgId}/${id}?type=${tab}`,
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
    }
  };

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const finalData = data.slice(firstPostIndex, lastPostIndex);

  return (
    <div className=" mb-6   ">
      <h1 className="text-sm font-bold mb-6  text-gray-800 px-6 pt-6  uppercase">
        ADD YOUR DESIRED {tab}
      </h1>
      <div className="flex items-center gap-1 w-full px-6  ">
        <input
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit(value);
            }
          }}
          placeholder="Enter your brand name"
          className="w-full md:w-1/2  p-1  border border-gray-300 rounded"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex justify-between">
          <button
            onClick={
              edit?.enabled
                ? () => editSubDetails(edit.id, value)
                : () => handleSubmit(value)
            }
            className="bg-gray-800 text-white px-4 py-1 rounded "
          >
            {edit ? "Update" : "Submit"}
          </button>
        </div>
      </div>
      <section className="py-1 bg-blueGray-50 px-1">
        <div className="w-full   xl:mb-0  mt-12">
          <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
            {/* <div className="rounded-t mb-0 px-4 py-3 border-0">
              <div className="flex flex-wrap items-center">
                <div className="relative w-full px-4 max-w-full flex-grow flex-1 text-right">
                  <button
                    className="bg-indigo-500 text-white active:bg-indigo-600 text-xs font-bold uppercase px-3 py-1 rounded outline-none focus:outline-none  mb-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    See all
                  </button>
                </div>
              </div>
            </div> */}

            <div className="block w-full overflow-x-auto">
              <table className="items-center bg-transparent w-full border-collapse">
                <thead>
                  <tr>
                    <th className=" w-4/6  px-6 text-left bg-blueGray-50 text-blueGray-500 border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold">
                      Name
                    </th>
                    <th className="px-6 w-1/6 text-center bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold">
                      Edit
                    </th>
                    <th className="px-6 w-1/6 text-right bg-blueGray-50 text-blueGray-500 align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold">
                      Delete
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {finalData?.map((el) => (
                    <tr key={el._id}>
                      <th className="px-6 text-left col-span-2 text-wrap border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-blueGray-700">
                        {el[tab]}
                      </th>
                      <td className="cursor-pointer text-center flex justify-center px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <p
                          onClick={() => {
                            handleEdit(el._id, el[tab]);
                          }}
                          className="text-blue-500"
                        >
                          <FaEdit size={15} />
                        </p>
                      </td>
                      <td className=" cursor-pointer text-right  px-6 border-t-0 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4">
                        <p
                          onClick={() => deleteSubDetails(el._id)}
                          className="flex justify-end mr-4 text-red-500"
                        >
                          <FaTrash />
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-1">
        <Pagination
          postPerPage={postPerPage}
          totalPosts={data.length}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

export default ProductSubDetailsForm;
