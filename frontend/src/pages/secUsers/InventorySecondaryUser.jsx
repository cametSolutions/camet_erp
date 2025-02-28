/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../api/api";
import { Link } from "react-router-dom";

import { HashLoader } from "react-spinners";

import { VariableSizeList as List } from "react-window";
import { useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";

import { useDispatch } from "react-redux";
import { removeAll } from "../../../slices/invoiceSecondary";
import SearchBar from "../../components/common/SearchBar";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import ProductDetails from "../../components/common/ProductDetails";

function InventorySecondaryUser() {
  const [products, setProducts] = useState([]);

  const [loader, setLoader] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [listHeight, setListHeight] = useState(0);

  const [heights, setHeights] = useState({});

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const dispatch = useDispatch();
  const listRef = useRef(null);

  const searchData = (data) => {
    setSearch(data);
  };

  console.log(type);

  // getting godowns data

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      try {
        const res = await api.get(`/api/sUsers/getProducts/${cmp_id}`, {
          params: { stockTransfer: true },
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
  }, [cmp_id]);

  useEffect(() => {
    if (search === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((el) =>
        el.product_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

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

  const getItemSize = (index) => {
    const product = filteredProducts[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded ? heights[index] || 250 : 195; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 230 : 0; // Extra height for expanded items

    return baseHeight + extraHeight;
    // return
  };

  const truncateToNDecimals = (num, n) => {
    const parts = num.toString().split(".");
    if (parts.length === 1) return num; // No decimal part
    parts[1] = parts[1].substring(0, n);
    console.log(parseFloat(parts.join("."))); // Truncate the decimal part
    return parseFloat(parts.join("."));
  };

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
          className={`bg-white  pb-6 mt-4 flex flex-col  rounded-sm cursor-pointer  py-4 border-t ${
            !el?.hasGodownOrBatch ? "shadow-lg" : ""
          }  `}
        >
          <div className=" w-full gap-3   px-5  ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>
            </div>
          </div>

          

          <div className=" text-sm  px-5 flex justify-between items-center mt-3   ">
            <div className="flex-col font-semibold text-sm">
              <div className="flex gap-2 text-nowrap">
                <p className=" text-gray-400  ">Hsn :</p>
                <p className=" text-gray-400"> {el?.hsn_code}</p>
              </div>
              <div className="flex gap-2    ">
                <p className=" text-gray-400">Tax :</p>
                <p className=" text-gray-400"> {`${el?.igst} %`}</p>
              </div>

              {el?.item_mrp && (
                <div className="flex gap-2    ">
                  <p className=" text-gray-400">MRP :</p>
                  <p className=" text-gray-400"> {`${el?.item_mrp}`}</p>
                </div>
              )}
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
                      (acc, curr) => acc + (Number(curr?.balance_stock) || 0),
                      0
                    ) || 0}
                  </h2>
                </div>
                <div className="flex items-center justify-end">
                  <p className=" text-xs md:text-sm font-semibold text-gray-500">
                    Saleable Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1">
                    {" "}
                    {el?.balance_stock || 0}
                  </h2>
                </div>
                <div className="flex items-center justify-end">
                  <p className=" text-xs md:text-sm font-semibold text-gray-500">
                    Order Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1">
                    {" "}
                    {truncateToNDecimals(
                      (el?.GodownList?.reduce(
                        (acc, curr) => acc + (Number(curr?.balance_stock) || 0),
                        0
                      ) || 0) - (Number(el?.balance_stock) || 0),
                      3
                    )}
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
    <div className="flex-1   ">
      <div className="sticky top-0 z-20 h-[117px]">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
          <div className="flex items-center justify-center gap-2">
            <Link to={"/sUsers/reports"}>
              <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer " />
            </Link>
            <p className="text-white text-lg   font-bold ">Stock Register</p>
          </div>
        </div>

        <SearchBar onType={searchData} />
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
  );
}

export default InventorySecondaryUser;
