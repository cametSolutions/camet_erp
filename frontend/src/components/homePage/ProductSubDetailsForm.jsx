/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import api from "../../api/api";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../../components/common/Pagination";
import { useLocation } from "react-router-dom";
import { setSecSelectedOrganization } from "../../../slices/secSelectedOrgSlice";

const ProductSubDetailsForm = ({
  tab,
  handleLoader,
  isHotel,
  isRestaurants = false,
  categoriesData = [],
}) => {
  const [value, setValue] = useState("");
  const [price, setPrice] = useState("");
  const [data, setData] = useState([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [edit, setEdit] = useState({
    id: "",
    enabled: false,
  });

  const location = useLocation();
  const dispatch = useDispatch();

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
    setPrice("");
    setCategories("");
    setEdit({ id: "", enabled: false });
  }, [reload]);

  useEffect(() => {
    if (value === "") {
      setEdit(false);
    }
  }, [value]);
  console.log(tab);
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
  console.log(categories)
  console.log(data);
  const handleSubmit = async (value) => {
    const formData = {
      [tab]: value,
      ...(isHotel && { price }),
      ...(isRestaurants && { under: "restaurant" }),
      ...(tab === "foodItems" && { category_id: categories , under: "restaurant"}),
    };

    console.log(formData);
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

      if (tab === "godown") {
        const companyUpdate = res.data.companyUpdate;
        if (companyUpdate) {
          dispatch(setSecSelectedOrganization(companyUpdate));
        }
      }

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

  const handleEdit = async (id, value, data, categoriesData) => {
    console.log(tab)
    console.log(value)
    if (tab === "bedType") {
      setValue(data?.category);
    } else if (tab === "roomFloor") {
      setValue(data?.subcategory);
    } else if (isHotel && tab === "roomType") {
      setPrice(data?.roomRent);
      setValue(data?.brand);
    } else if(tab == "Regional Food Category"){
      setValue(data?.category);
    }else if(tab == "foodItems"){
      setValue(data?.subcategory);
      setCategories(data?.category_id);
    } else {
      setValue(value);
    }
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
    setEdit({
      id,
      enabled: true,
    });
  };

  // Edit subdetails
  const editSubDetails = async (id, data) => {
    const formData = {
      [tab]: value,
      ...(isHotel && { price }),
      ...(tab === "foodItems" && { category_id: categories }),
    };

    try {
      setLoading(true);
      handleLoader(true);
      console.log(tab);
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
  console.log(data);
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
                if (edit?.enabled) {
                  editSubDetails(edit.id, value);
                } else {
                  handleSubmit(value);
                }
              }
            }}
            placeholder={`Enter your ${tab} name `}
            className=" w-4/6  sm:w-2/6   p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {isHotel && (
            <input
              type="number"
              placeholder={`Enter your ${tab} price `}
              className=" w-4/6  sm:w-2/6   p-1 text-black border border-gray-300 rounded-full mt-3 text-center"
              value={price}
              onKeyDown={(e) => {
                // Prevent invalid keys like e, E, +, -, .
                if (
                  !/[0-9]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight" &&
                  e.key !== "Tab"
                ) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}
          {tab === "foodItems" && (
            <select
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-4/6 sm:w-2/6 p-1 border border-gray-300 rounded-full mt-3 text-center  "
            >
              <option value="" className="">Select Category</option>
              {categoriesData.map((cat) => (
                <option className="text-black" key={cat._id} value={cat._id}>
                  {cat.category}
                </option>
              ))}
            </select>
          )}

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

    <section className="overflow-y-scroll h-[calc(100vh-273px)] px-4 pb-14 scrollbar-thin">
        <div className="mt-2 w-full">
          {data?.length > 0 && !loading ? (
            data.map((el,index) => {
               console.log("Rendering item", index, el);
              return (
              <div
                key={el._id}
                className="flex items-center justify-between border-t-0 align-middle  whitespace-nowrap p-4 mb-2 border-b cursor-pointer hover:bg-slate-100 hover:translate-y-[1px]"
              >
                <div className=" px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500 w-1/3">
                  {el[tab]
                    ? el[tab]
                    : el?.brand
                    ? el?.brand
                    : el?.category
                    ? el?.category
                    : el.subcategory}
                </div>
                {el?.roomRent && (
                  <div className=" px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500 w-1/3">
                    {el?.roomRent}
                  </div>
                )}
                  {(el?.category_id && categoriesData.length > 0) && (
                  <div className=" px-6 text-left text-wrap text-blueGray-700 text-sm font-bold text-gray-500 w-1/3">
                    {categoriesData?.find((cat) => cat._id === el?.category_id)?.category}
                  </div>
                )}
                <div className="flex items-end gap-12 text-xs w-1/3 justify-end">
                  <div className=" cursor-pointer text-center flex justify-center ">
                    <p
                      onClick={() => handleEdit(el._id, el[tab], el)}
                      className="text-blue-500"
                    >
                      <FaEdit size={15} />
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
            )})
          
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
