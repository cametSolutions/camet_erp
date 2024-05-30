/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState,useCallback,useRef } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Sidebar from "../../components/homePage/Sidebar";
// import { FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { MdDelete } from "react-icons/md";
import { HashLoader } from "react-spinners";
import { VariableSizeList as List } from "react-window";
import { useSelector } from "react-redux";
import { removeAll } from "../../../slices/invoice";
import { IoIosArrowRoundBack } from "react-icons/io";
import SearchBar from "../../components/common/SearchBar";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";


import { useDispatch } from "react-redux";
import ProductDetails from "../../components/common/ProductDetails";

function InventoryPrimaryUser() {
  const [products, setProducts] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);


  const [heights, setHeights] = useState({});


  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  // const type = useSelector(
  //   (state) => state.setSelectedOrganization.selectedOrg.type
  // );

  const dispatch = useDispatch();
  const listRef = useRef(null);

  


  const searchData = (data) => {
    setSearch(data);
  };


  // filter Concept  of seclect box

  // const handleFilterProduct = async (selectedValue) => {
  //   setLoader(true);
  //   try {
  //     if (selectedValue == "") {
  //       setRefresh(!refresh);
  //     } else {
  //       const res = await api.get(
  //         `/api/pUsers/godownProductFilter/${cmp_id}/${selectedValue}`,
  //         {
  //           withCredentials: true,
  //         }
  //       );

  //       console.log(res.data);

  //       setProducts(res.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoader(false);
  //   }
  // };
  // const handleFilterProductSelf = async (selectedValue) => {
  //   setLoader(true);
  //   try {
  //     if (selectedValue == "") {
  //       setRefresh(!refresh);
  //     } else {
  //       const res = await api.get(
  //         `/api/pUsers/godownProductFilterSelf/${cmp_id}/${selectedValue}`,
  //         {
  //           withCredentials: true,
  //         }
  //       );
  //       setLoader(true);

  //       console.log(res.data);

  //       setProducts(res.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.response.data.message);
  //   } finally {
  //     setLoader(false);
  //   }
  // };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get(`/api/pUsers/getProducts/${cmp_id}`, {
          withCredentials: true,
        });
        setLoader(true);

        setProducts(res.data.productData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setTimeout(() => {
          setLoader(false);
        }, 2000);
      }
    };
    fetchProducts();
    dispatch(removeAll());
  }, [refresh, cmp_id]);


  // getting godowns data

  // useEffect(() => {
  //   if (type == "self") {
  //     const fetchgetGodowmsSelf = async () => {
  //       try {
  //         const res = await api.get(`/api/pUsers/getGodownsSelf/${cmp_id}`, {
  //           withCredentials: true,
  //         });
  //         setLoader(true);

  //         console.log(res.data.godowndata.locations);
  //         setSelfGodowms(res.data.godowndata.locations);
  //       } catch (error) {
  //         console.log(error);
  //         toast.error(error.response.data.message);
  //       }
  //     };
  //     fetchgetGodowmsSelf();
  //   } else {
  //     const fetchgetGodowms = async () => {
  //       try {
  //         const res = await api.get(`/api/pUsers/getGodowns/${cmp_id}`, {
  //           withCredentials: true,
  //         });
  //         setLoader(true);

  //         setIngodowns(res.data.godowndata);
  //       } catch (error) {
  //         console.log(error);
  //         toast.error(error.response.data.message);
  //       }
  //     };
  //     fetchgetGodowms();
  //   }
  // }, []);

  useEffect(() => {
    if (search === "") {
      setFilteredProducts(products);
    } else {
      console.log(products);
      if (products && products.length > 0) {
        const filtered = products?.filter((el) =>
          el.product_name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
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

  const handleExpansion = (id) => {
    const updatedItems = [...filteredProducts];
    const index = updatedItems.findIndex((item) => item._id === id);

    const itemToUpdate = { ...updatedItems[index] };

    if (itemToUpdate) {
      itemToUpdate.isExpanded = !itemToUpdate.isExpanded;

      updatedItems[index] = itemToUpdate;
    }
    setFilteredProducts(updatedItems);
    setTimeout(() => listRef.current.resetAfterIndex(index), 0);
  };

  const setHeight = useCallback((index, height) => {
    setHeights((prevHeights) => {
      if (prevHeights[index] !== height) {
        return {
          ...prevHeights,
          [index]: height,
        };
      }
      return prevHeights;
    });
  }, []);
  console.log(heights);

  const getItemSize = (index) => {
    const product = filteredProducts[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded ? heights[index] || 250 : 190; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 200 : 0; // Extra height for expanded items

    return baseHeight + extraHeight;
    // return
  };

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
          style={adjustedStyle}
          className={`bg-white  pb-6 mt-4 flex flex-col  rounded-sm cursor-pointer  py-4 border-t ${!el?.hasGodownOrBatch?"shadow-lg":""}  `}
        >
          <div className="flex justify-between w-full gap-3   px-5  ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>
            </div>
          </div>

          <div className=" text-sm  px-5 flex justify-between mt-3  ">
            <div className="flex-col">
              <div className="flex gap-2 text-nowrap">
                <p className="font-bold text-gray-400 uppercase ">Hsn :</p>
                <p className="font-semibold text-gray-400"> {el?.hsn_code}</p>
              </div>
              <div className="flex gap-2    ">
                <p className="font-bold text-gray-400">Tax :</p>
                <p className=" text-gray-400"> {`${el?.igst} %`}</p>
              </div>
            </div>
            <div>
              <div className="flex flex-col gap-1 ">
                <div className="flex items-center justify-end">
                  <p className="  text-xs   md:text-sm font-semibold text-gray-500  ">
                    Actual Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1 ">
                    {" "}
                    {el?.GodownList?.reduce(
                      (acc, curr) => acc + (curr?.balance_stock || 0),
                      0
                    ) || 0}
                  </h2>
                </div>
                <div className="flex items-center">
                  <p className=" text-xs md:text-sm font-semibold text-gray-500">
                    Saleable Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1">
                    {" "}
                    {el?.balance_stock || 0}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {el?.hasGodownOrBatch && (
            <div className="px-4 shadow-lg pb-3 ">
              <div
                onClick={() => {
                  handleExpansion(el?._id);
                  setTimeout(() => listRef.current.resetAfterIndex(index), 0);
                }}
                className="p-2  border-gray-300 border rounded-md w-full text-violet-500 mt-4 font-semibold flex items-center justify-center gap-3"
              >
                {el?.isExpanded ? "Hide Details" : "Show Details"}

                {el?.isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </div>
            </div>
          )}

          {el?.isExpanded && (
            <ProductDetails
              details={el}
              tab={"inventory"}
              setHeight={(height) => setHeight(index, height)}
            />
          )}

          {!el?.hasGodownOrBatch && (
            <hr className="mt-5  border-t-2 border-slate-300 mx-4" />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex relative h-screen ">
      <div>
        <Sidebar TAB={"product"} showBar={showSidebar} />
      </div>

      <div className="flex-1  overflow-y-scroll ">
        <div className="sticky top-0 z-20 h-[117px]">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
            <div className="flex items-center justify-center gap-2">
              <Link to={"/sUsers/dashboard"}>
                <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer " />
              </Link>
              <p className="text-white text-lg   font-bold ">Inventory</p>
            </div>
            {/* {type !== "self" && (
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
            )} */}
          </div>

          {/* invoiec date */}
          <div className=" p-4  bg-white drop-shadow-lg">
            <div className="flex justify-between  items-center"></div>
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
              ref={listRef}
              className=""
              height={listHeight} // Specify the height of your list
              itemCount={filteredProducts.length} // Specify the total number of items
              itemSize={getItemSize} // Specify the height of each item
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

      <div className="h-screen flex justify-center items-center "></div>
    </div>
  );
}

export default InventoryPrimaryUser;
