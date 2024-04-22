/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { IoReorderThreeSharp } from "react-icons/io5";
// import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { MdDelete } from "react-icons/md";
// import Swal from "sweetalert2";
import { HashLoader } from "react-spinners";

import { IoIosSearch } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { FixedSizeList as List } from "react-window";
import { useSelector } from "react-redux";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { IoIosArrowRoundBack } from "react-icons/io";

import { useDispatch } from "react-redux";
import { removeAll } from "../../../slices/invoiceSecondary";

function InventorySecondaryUser() {
  const [products, setProducts] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);
  const [ingodowns, setIngodowns] = useState("")
  const [selfgodowns, setSelfGodowms] = useState("")


  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const dispatch = useDispatch()

  console.log(type);

  const handleFilterProduct = async (selectedValue) => {
    setLoader(true);
    try {
      if (selectedValue == "") {
        setRefresh(!refresh)
      } else {
        const res = await api.get(`/api/sUsers/godownProductFilter/${cmp_id}/${selectedValue}`, {
          withCredentials: true,
        });
        setLoader(true);
        console.log(res.data)

        setProducts(res.data);

      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoader(false);
    }

  };
  const handleFilterProductSelf = async (selectedValue) => {
    setLoader(true);
    try {
      if (selectedValue == "") {
        setRefresh(!refresh)
      } else {
        const res = await api.get(`/api/sUsers/godownProductFilterSelf/${cmp_id}/${selectedValue}`, {
          withCredentials: true,
        });
        setLoader(true);
        console.log(res.data)

        setProducts(res.data);

      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoader(false);
    }

  };
  // getting godowns data

  useEffect(() => {
    const fetchgetGodowms = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/sUsers/getGodowns/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);

        setIngodowns(res.data.godowndata);


      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoader(false);
      }
    };
    fetchgetGodowms()
    const fetchgetGodowmsSelf = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/sUsers/getGodownsSelf/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);
        console.log("welocme", res.data.godowndata)

        setSelfGodowms(res.data.godowndata);

      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoader(false);
      }
    };
    fetchgetGodowmsSelf()
  }, [])


  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/sUsers/getProducts/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);
          setProducts(res.data.productData);
     
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
    dispatch(removeAll())

  }, [refresh, cmp_id]);


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
    const adjustedStyle = {
      ...style,
      marginTop: '16px',
      height: '150px',

    };


    return (
      <>
        <div
          key={index}
          style={adjustedStyle}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col mx-2 rounded-sm cursor-pointer hover:bg-slate-100  pr-7 "
        >
          <div className="flex justify-between w-full gap-3 ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>

            </div>
            <div
              className={` ${type !== "self" ? "pointer-events-none " : ""
                }  flex gap-3 mt-2 px-4`}
            >
              <p className="font-semibold text-black">Stock</p>
              <h2 className="font-semibold text-green-500"> {el?.balance_stock}</h2>
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
        <SidebarSec TAB={"product"} showBar={showSidebar} />
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-scroll ">
        <div className="sticky top-0 z-20 h-[117px]">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
            <div className="flex items-center justify-center gap-2">
              <Link to={"/sUsers/dashboard"}>
                <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer "  />
              </Link>
              <p className="text-white text-lg   font-bold ">Inventory</p>
            </div>
            {type !== "self" && (
              <div>
                <Link>
                  <div className="relative">
                    <select
                      className="appearance-none flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm hover:scale-105 duration-100 ease-in-out"
                      onChange={(e) => { handleFilterProduct(e.target.value) }}
                    >

                      <option value="">All</option>
                      {
                        ingodowns && ingodowns?.length > 0 && ingodowns?.map((godown, index) => (
                          <option key={index} value={godown?._id}>
                            <IoIosAddCircle className="text-xl" />
                            {godown?.godown[0]}
                          </option>
                        ))}
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-white pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>
            )}
            {type === "self" && (
              <div>
                <Link>
                  <div className="relative">
                    <select
                      className="appearance-none flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm hover:scale-105 duration-100 ease-in-out"
                      onChange={(e) => handleFilterProductSelf(e.target.value)}
                    >

                      <option value="">All</option>
                      {selfgodowns && selfgodowns.map((godown, index) => (
                        <option key={index} value={godown}>
                          <IoIosAddCircle className="text-xl" />
                          {godown}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-white pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
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
              itemSize={165} // Specify the height of each item
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

        {/* <Link to={"/sUsers/addProduct"} className={`${type!=="self" ? "hidden " : ""}  flex justify-center`}>
          <div className=" px-4 absolute bottom-12 text-white bg-violet-700 rounded-3xl p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer ">
            <IoIosAddCircle className="text-2xl" />
            <p>Create New Product</p>
          </div>
        </Link> */}
      </div>
    </div>
  );
}

export default InventorySecondaryUser
