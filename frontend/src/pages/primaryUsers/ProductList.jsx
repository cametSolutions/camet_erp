/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { FixedSizeList as List } from "react-window";
import { useSelector } from "react-redux";
import { removeAll } from "../../../slices/invoice";

import { useDispatch } from "react-redux";

function ProductList() {
  const [products, setProducts] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);

  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  const type = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg.type
  );

  const dispatch = useDispatch();

  console.log(type);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/pUsers/getProducts/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);

        setTimeout(() => {
          setProducts(res.data.productData);
        }, 1000);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
    dispatch(removeAll());
  }, [refresh, cmp_id]);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  console.log(products);

  useEffect(() => {
    if (search === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((el) =>
        el.product_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products, refresh]);

  const handleDelete = async (id) => {
    // Show confirmation dialog
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If user confirms deletion
    if (confirmation.isConfirmed) {
      try {
        const res = await api.delete(`/api/pUsers/deleteProduct/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Display success message
        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000, // Auto close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh the page
        setRefresh(!refresh);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      }
    }
  };

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 117;
      setListHeight(newHeight);
    };

    console.log(window.innerHeight);

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  console.log(listHeight);

  const Row = ({ index, style }) => {
    const el = filteredProducts[index];
    return (
      <>
        <div
          key={index}
          style={style}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col mx-2 rounded-sm cursor-pointer hover:bg-slate-100  pr-7 "
        >
          <div className="flex justify-between w-full gap-3 ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>
              {/* {el.product_code && (
                <div className="flex">
                  <p className="mt-2 font-bold text-sm">
                    code :
                  </p>
                  <p className="font-medium mt-2 text-gray-500 text-sm">
                    {el?.product_code}
                  </p>
                </div>
              )} */}
            </div>
            <div
              className={` ${
                type !== "self" ? "pointer-events-none opacity-50" : ""
              }  flex gap-3 mt-2 px-4`}
            >
              <Link to={`/pUsers/editProduct/${el._id}`}>
                <FaEdit className="text-blue-500" />
              </Link>

              <MdDelete
                onClick={() => {
                  handleDelete(el._id);
                }}
                className="text-red-500"
              />
            </div>
          </div>

          <div className=" flex flex-col justify-center gap-2 text-sm">
            <div className="flex gap-2 text-nowrap">
              <p className="font-bold">Hsn :</p>
              <p className="font-semibold text-gray-500"> {el?.hsn_code}</p>
            </div>
            <div className="flex gap-2 ">
              <p className="font-bold">Igst :</p>
              <p className="font-bold text-green-500"> {`${el?.igst} %`}</p>
            </div>
          </div>
          <hr className="mt-6" style={{ borderWidth: "1px" }} />
        </div>
      </>
    );
  };

  return (
    <div className="flex relative h-screen ">
      <div>
        <Sidebar TAB={"product"} showBar={showSidebar} />
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-scroll ">
        <div className="sticky top-0 z-20 h-[117px]">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
            <div className="flex items-center justify-center gap-2">
              <IoReorderThreeSharp
                onClick={handleToggleSidebar}
                className="text-3xl text-white cursor-pointer md:hidden"
              />
              <p className="text-white text-lg   font-bold ">Your Products</p>
            </div>
            {type === "self" && (
              <div>
                <Link to={"/pUsers/addProduct"}>
                  <button className="flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out ">
                    <IoIosAddCircle className="text-xl" />
                    Add Products
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* invoiec date */}
          <div className=" p-4  bg-white drop-shadow-lg">
            <div className="flex justify-between  items-center">
              {/* <div className=" flex flex-col gap-1 justify-center">
            <p className="text-md font-semibold text-violet-400">
              Search Parties
            </p>
          </div>
          <div className="flex items-center hover_scale cursor-pointer">
            <p className="text-pink-500 m-2 cursor-pointer  ">Cancel</p>
            <MdCancel className="text-pink-500" />
          </div> */}
            </div>
            <div className=" md:w-1/2 ">
              {/* search bar */}
              <div className="relative  ">
                <div className="absolute inset-y-0 start-0 flex items-center  pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <div class="relative">
                  <input
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    type="search"
                    id="default-search"
                    class="block w-full p-2  text-sm text-gray-900 border  rounded-lg border-gray-300  bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search party by name..."
                    required
                  />
                  <button
                    type="submit"
                    class="text-white absolute end-[10px] top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-2 py-1"
                  >
                    <IoIosSearch />
                  </button>
                </div>
              </div>

              {/* search bar */}
            </div>
          </div>
        </div>

        {/* adding party */}

        {loader ? (
          <div className="flex justify-center items-center h-screen">
            <HashLoader color="#363ad6" />
          </div>
        ) : products.length > 0 ? (
          <div
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
            }}
          >
            <List
              className=""
              height={listHeight} // Specify the height of your list
              itemCount={filteredProducts.length} // Specify the total number of items
              itemSize={150} // Specify the height of each item
              width="100%" // Specify the width of your list
            >
              {Row}
            </List>
          </div>
        ) : (
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Products !!!
          </div>
        )}

        {/* <Link to={"/pUsers/addProduct"} className={`${type!=="self" ? "hidden " : ""}  flex justify-center`}>
          <div className=" px-4 absolute bottom-12 text-white bg-violet-700 rounded-3xl p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer ">
            <IoIosAddCircle className="text-2xl" />
            <p>Create New Product</p>
          </div>
        </Link> */}
      </div>
    </div>
  );
}

export default ProductList;
