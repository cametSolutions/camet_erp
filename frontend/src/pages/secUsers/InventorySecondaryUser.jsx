/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";

import { HashLoader } from "react-spinners";

import { IoIosSearch } from "react-icons/io";
import { IoIosAddCircle } from "react-icons/io";
import { FixedSizeList as List } from "react-window";
import { useSelector } from "react-redux";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { IoIosArrowRoundBack } from "react-icons/io";

import { useDispatch } from "react-redux";
import { removeAll } from "../../../slices/invoiceSecondary";
import {  Modal } from "flowbite-react";
import SearchBar from "../../components/common/SearchBar";



function InventorySecondaryUser() {
  const [products, setProducts] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);
  const [ingodowns, setIngodowns] = useState("");
  const [selfgodowns, setSelfGodowms] = useState("");
  const [godown, setGodown] = useState([]);
  const [openModal, setOpenModal] = useState(false);



  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const dispatch = useDispatch();
  const searchData = (data) => {
    setSearch(data);
  };

  console.log(type);

  const handleFilterProduct = async (selectedValue) => {
    setLoader(true);
    try {
      if (selectedValue == "") {
        setRefresh(!refresh);
      } else {
        const res = await api.get(
          `/api/sUsers/godownProductFilter/${cmp_id}/${selectedValue}`,
          {
            withCredentials: true,
          }
        );

        console.log(res.data);

        setProducts(res.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };
  const handleFilterProductSelf = async (selectedValue) => {
    setLoader(true);
    try {
      if (selectedValue == "") {
        setRefresh(!refresh);
      } else {
        const res = await api.get(
          `/api/sUsers/godownProductFilterSelf/${cmp_id}/${selectedValue}`,
          {
            withCredentials: true,
          }
        );
        setLoader(true);
        console.log(res.data);

        setProducts(res.data);
      }
    } catch (error) {
      console.log(error);
      // toast.error(error.response.data.message);
    } finally {
      setLoader(false);
    }
  };

  function onCloseModal() {
    setOpenModal(false);
  }
  // getting godowns data

  useEffect(() => {
    if (type == "self") {
      const fetchgetGodowmsSelf = async () => {
        try {
          const res = await api.get(`/api/sUsers/getGodownsSelf/${cmp_id}`, {
            withCredentials: true,
          });
          console.log("welocme", res.data.godowndata);

          setSelfGodowms(res.data.godowndata);
        } catch (error) {
          console.log(error);
          // toast.error(error.response.data.message);
        }
      };
      fetchgetGodowmsSelf();
    } else {
      const fetchgetGodowms = async () => {
        try {
          const res = await api.get(`/api/sUsers/getGodowns/${cmp_id}`, {
            withCredentials: true,
          });
          console.log(res);
          setIngodowns(res.data.godowndata);
        } catch (error) {
          console.log(error);
          // toast.error(error.response.data.message);
        }
      };
      fetchgetGodowms();
    }
  }, []);

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
        // toast.error(error.response.data.message);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
    dispatch(removeAll());
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
      marginTop: "16px",
      height: "150px",
    };

    return (
      <>
        <div
          key={index}
          onClick={() => {
            setGodown(el?.GodownList);
            setOpenModal(true);
          }}
          style={adjustedStyle}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col mx-2 rounded-sm cursor-pointer hover:bg-slate-100  pr-7 "
        >
          <div className="flex justify-between w-full gap-3 ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>
            </div>
            <div
              className={` ${
                type !== "self" ? "pointer-events-none " : ""
              }  flex gap-3 mt-2 px-4`}
            >
              <p className="font-semibold text-black">Stock</p>
              <h2 className="font-semibold text-green-500">
                {" "}
                {el?.balance_stock}
              </h2>
            </div>
          </div>

          <div className=" flex   gap-2 text-sm mt-4">
            <div className="flex gap-2 text-nowrap">
              <p className="font-bold text-gray-400 uppercase ">Hsn :</p>
              <p className="font-semibold text-gray-400"> {el?.hsn_code}</p>
            </div>
            <div className="flex gap-2 ">
              <p className="font-bold text-gray-400">Tax :</p>
              <p className=" text-gray-400"> {`${el?.igst} %`}</p>
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
                <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer " />
              </Link>
              <p className="text-white text-lg   font-bold ">Inventory</p>
            </div>
            {type !== "self" && (
              <div>
                <Link>
                  <div className="relative">
                    <select
                      className="appearance-none flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm hover:scale-105 duration-100 ease-in-out"
                      onChange={(e) => {
                        handleFilterProduct(e.target.value);
                      }}
                    >
                      <option value="">All</option>
                      {ingodowns &&
                        ingodowns?.length > 0 &&
                        ingodowns?.map((godown, index) => (
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
                      {selfgodowns &&
                        selfgodowns.map((godown, index) => (
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
              <SearchBar onType={searchData} />


              {/* search bar */}
            </div>
          </div>
        </div>

        {/* adding party */}

        {loader ? (
          // Show loader while data is being fetched
          <div className="flex justify-center items-center h-screen">
            <HashLoader color="#363ad6" />
          </div>
        ) : filteredProducts.length > 0 ? (
          // Show product list if products are available
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
          // Show message if no products are available
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Products !!!
          </div>
        )}
      </div>

      <div className="h-screen flex justify-center items-center ">
        <Modal
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}
          show={openModal}
          size="md"
          onClose={onCloseModal}
          popup
          className="modal-dialog"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
              {/* Existing sign-in form */}
              <div>
                <div className="flex justify-between  bg-[#579BB1] p-2 rounded-sm items-center">
                  <h3 className=" text-base md:text-xl  font-medium text-gray-900 dark:text-white ">
                    Godown List
                  </h3>
                </div>
                <div className="table-container overflow-y-auto max-h-[250px]">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Godown Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {godown?.length > 0 ? (
                        godown.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 ">
                              <div className="text-sm text-gray-900">
                                {item.godown}
                              </div>
                            </td>

                            <td className=" px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center  ">
                              <div className="flex gap-3 items-center justify-center">
                                {item.balance_stock}
                                <div></div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className=" flex justify-center items-center">
                          <td
                            colSpan={2}
                            className="font-bold  mt-12 text-gray-500 w-full  text-center"
                          >
                            No Godowns!!!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full"></div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default InventorySecondaryUser;
