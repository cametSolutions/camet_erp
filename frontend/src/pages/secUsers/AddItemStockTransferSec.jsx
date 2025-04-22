/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import {
  // setBrandInRedux,
  // setCategoryInRedux,
  // setSubCategoryInRedux,
  addAllProducts,
  updateItem,
  addItem,
  removeItem,
} from "../../../slices/stockTransferSecondary";

import { HashLoader } from "react-spinners";
import { VariableSizeList as List } from "react-window";
import { Decimal } from "decimal.js";
import SearchBar from "../../components/common/SearchBar";
import ProductDetails from "../../components/common/ProductDetails";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

function AddItemStockTransferSec() {
  const [item, setItem] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setseleCtedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loader, setLoader] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  // const [refresh, setRefresh] = useState(false);

  // const [godownname, setGodownname] = useState("");
  const [heights, setHeights] = useState({});

  ///////////////////////////cpm_id///////////////////////////////////

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  ///////////////////////////selected Godown///////////////////////////////////

  const selectedGodownId = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown_id
  );

  useEffect(() => {
    if (!selectedGodownId || selectedGodownId === "") {
      navigate(-1);
    }
  });

  ///////////////////////////get height from redux///////////////////////////////////

  ///////////////////////////itemsFromRedux///////////////////////////////////

  const itemsFromRedux = useSelector(
    (state) => state.stockTransferSecondary.items
  );

  ///////////////////////////priceLevelFromRedux///////////////////////////////////

  const allProductsFromRedux =
    useSelector((state) => state.stockTransferSecondary.products) || [];

  ///////////////////////////filters FromRedux///////////////////////////////////

  const brandFromRedux =
    useSelector((state) => state.stockTransferSecondary.brand) || "";
  const categoryFromRedux =
    useSelector((state) => state.stockTransferSecondary.category) || "";
  const subCategoryFromRedux =
    useSelector((state) => state.stockTransferSecondary.subcategory) || "";

  ///////////////////////////navigate dispatch///////////////////////////////////

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listRef = useRef(null);
  // const location = useLocation();


  const searchData = (data) => {
    setSearch(data);
  };

  ///////////////////////////fetchProducts///////////////////////////////////

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      let productData;

      try {
        if (allProductsFromRedux.length === 0) {
          const res = await api.get(`/api/sUsers/getProducts/${cpm_id}`, {
            params: { vanSale: false, excludeGodownId: selectedGodownId,stockTransfer:true },
            withCredentials: true,
          });
          productData = res.data.productData;
          dispatch(addAllProducts(res.data.productData));
        } else {
          productData = allProductsFromRedux;
        }

        if (itemsFromRedux.length > 0) {
          const reduxItemIds = itemsFromRedux.map((el) => el?._id);
          const updatedItems = productData.map((product) => {
            if (reduxItemIds.includes(product._id)) {
              // If the product ID exists in Redux, replace it with the corresponding Redux item
              const reduxItem = itemsFromRedux.find(
                (item) => item._id === product._id
              );

              if (reduxItem.hasGodownOrBatch) {
                const updatedGodownList = reduxItem?.GodownList?.map(
                  (godown) => {
                    let matchedGodown;
                    if (godown.batch && !godown.godown_id) {
                      matchedGodown = product?.GodownList?.find(
                        (god) => god?.batch === godown?.batch
                      );
                    } else if (godown.godown_id && !godown.batch) {
                      matchedGodown = product?.GodownList?.find(
                        (god) => god?.godown_id === godown?.godown_id
                      );
                    } else if (godown.godown_id && godown.batch) {
                      matchedGodown = product?.GodownList?.find(
                        (god) =>
                          god?.godown_id === godown?.godown_id &&
                          god?.batch === godown?.batch
                      );
                    }
                    if (matchedGodown) {
                      return {
                        ...godown,
                        balance_stock: matchedGodown.balance_stock,
                      };
                    } else {
                      return godown;
                    }
                  }
                );

                const updaTedReduxItem = {
                  ...reduxItem,
                  GodownList: updatedGodownList,
                };

                return updaTedReduxItem;
              } else {
                const matchedGodown = product?.GodownList?.[0];
                const newBalanceStock = matchedGodown?.balance_stock;

                const updatedGodownList = reduxItem.GodownList.map((godown) => {
                  return {
                    ...godown,
                    balance_stock: newBalanceStock,
                  };
                });
                const updaTedReduxItem = {
                  ...reduxItem,
                  GodownList: updatedGodownList,
                };
                return updaTedReduxItem;
              }
            } else {
              return product;
            }
          });
          setItem(updatedItems);
          // if (updatedItems.length > 0) {
          //   fetchFilters();
          // }

          // setRefresh((prevRefresh) => !prevRefresh);
        } else {
          setItem(productData);
          // if (productData.length > 0) {
          //   fetchFilters();
          // }
          // setRefresh((prevRefresh) => !prevRefresh);
        }

        if (brandFromRedux) {
          setSelectedBrand(brandFromRedux);
        }
        if (categoryFromRedux) {
          setseleCtedCategory(categoryFromRedux);
        }
        if (subCategoryFromRedux) {
          setSelectedSubCategory(subCategoryFromRedux);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
    const scrollPosition = parseInt(localStorage.getItem("scrollPosition"));
    // restoreScrollPosition(scrollPosition);

    if (scrollPosition) {
      // listRef?.current?.scrollTo(parseInt(scrollPosition, 10));\
      window.scrollTo(0, scrollPosition);
    }
  }, [cpm_id, selectedGodownId]);

  /////////////////////////scroll////////////////////////////

  useEffect(() => {
    const storedScrollPosition = localStorage.getItem(
      "scrollPositionAddItemSales"
    );
    if (storedScrollPosition) {
      setScrollPosition(parseInt(storedScrollPosition, 10));
    }
  }, []);





  ///////////////////////////filter items///////////////////////////////////

  const filterItems = (items, brand, category, subCategory, searchTerm) => {
    return items?.filter((item) => {
      // Check if the item matches the brand filter
      const brandMatch = !brand || item.brand === brand;

      // Check if the item matches the category filter
      const categoryMatch = !category || item.category === category;

      // Check if the item matches the subcategory filter
      const subCategoryMatch =
        !subCategory || item.sub_category === subCategory;

      // Check if the item matches the search term
      const searchMatch =
        !searchTerm ||
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Return true if all conditions are met
      return brandMatch && categoryMatch && subCategoryMatch && searchMatch;
    });
  };

  ///////////////////////////filter items call ///////////////////////////////////

  const filteredItems = useMemo(() => {
    return filterItems(
      item,
      selectedBrand,
      selectedCategory,
      selectedSubCategory,
      search
    );
  }, [item, selectedBrand, selectedCategory, selectedSubCategory, search]);

  //////////////////////////////////////////addSelectedRate initially not in redux/////////////////////////////////////////////


  console.log(item);  
  ///////////////////////////handleAddClick///////////////////////////////////

  const handleAddClick = (_id, idx) => {
    const updatedItems = item.map((item) => {
      if (item._id === _id) {
        const itemToUpdate = { ...item, GodownList: [...item.GodownList] };

        if (itemToUpdate.GodownList[idx]) {
          const currentBatchOrGodown = { ...itemToUpdate.GodownList[idx] };

          currentBatchOrGodown.added = currentBatchOrGodown.added
            ? !currentBatchOrGodown.added
            : true;
          currentBatchOrGodown.count = 1;
          // currentBatchOrGodown.IndividualTotal = totalData?.individualSubtotal;

          itemToUpdate.GodownList[idx] = currentBatchOrGodown;
        }
        itemToUpdate.count =
          new Decimal(itemToUpdate.count || 0).add(1).toNumber() || 1;

        // const totalData = calculateTotal(itemToUpdate, selectedPriceLevel);
        // const updatedGodownListWithTotals = itemToUpdate.GodownList.map(
        //   (godown, index) => ({
        //     ...godown,
        //     individualTotal:
        //       totalData.individualTotals.find(({ index: i }) => i === index)
        //         ?.individualTotal || 0,
        //   })
        // );
        // itemToUpdate.GodownList = updatedGodownListWithTotals;

        // itemToUpdate.total = totalData?.total || 0;
        itemToUpdate.added = true;

        dispatch(addItem(itemToUpdate));

        return itemToUpdate;
      }
      return item;
    });

    setItem(updatedItems);
  };

  ///////////////////////////handleIncrement///////////////////////////////////

  const handleIncrement = (_id, godownIndex = null) => {
    const updatedItems = item.map((item) => {
      if (item._id !== _id) return item; // Keep items unchanged if _id doesn't match
      const currentItem = structuredClone(item);

      if (currentItem?.hasGodownOrBatch && godownIndex !== null) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };

        // If godownOrBatch.count is undefined, set it to 1, otherwise increment by 1
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .add(1)
          .toNumber();

        // Update the specific godown/batch in the GodownList array
        const updatedGodownList = currentItem.GodownList.map((godown, index) =>
          index === godownIndex ? godownOrBatch : godown
        );
        currentItem.GodownList = updatedGodownList;

        // Calculate the sum of counts in the GodownList array
        const sumOfCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.count || 0),
          0
        );
        currentItem.count = sumOfCounts; // Update currentItem.count with the sum

        // Calculate totals and update individual batch totals
        // const totalData = calculateTotal(currentItem, selectedPriceLevel);
        // const updatedGodownListWithTotals = updatedGodownList.map(
        //   (godown, index) => ({
        //     ...godown,
        //     individualTotal:
        //       totalData.individualTotals.find(({ index: i }) => i === index)
        //         ?.individualTotal || 0,
        //   })
        // );
        // currentItem.GodownList = updatedGodownListWithTotals;
        // currentItem.total = totalData.total; // Update the overall total
      } else {
        // Increment the count of the currentItem by 1
        currentItem.count = new Decimal(currentItem.count).add(1).toNumber();

        // // Calculate totals and update individual total
        // const totalData = calculateTotal(currentItem, selectedPriceLevel);
        // currentItem.total = totalData.total;
        // currentItem.GodownList[0].individualTotal = totalData?.total; // Update the overall total
      }

      dispatch(updateItem(currentItem)); // Log the updated currentItem
      return currentItem; // Return the updated currentItem
    });

    setItem(updatedItems); // Update the state with the updated items
  };

  ///////////////////////////handleDecrement///////////////////////////////////
  const handleDecrement = (_id, godownIndex = null) => {
    const updatedItems = item.map((item) => {
      if (item._id !== _id) return item; // Keep items unchanged if _id doesn't match
      const currentItem = structuredClone(item);
      if (godownIndex !== null && currentItem.hasGodownOrBatch) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .sub(1)
          .toNumber();

        // Ensure count does not go below 0
        if (godownOrBatch.count <= 0) godownOrBatch.added = false;

        const updatedGodownList = currentItem.GodownList.map((godown, index) =>
          index === godownIndex ? godownOrBatch : godown
        );

        // Calculate the sum of counts in GodownList
        const sumOfCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.count || 0),
          0
        );
        currentItem.count = sumOfCounts;
        currentItem.GodownList = updatedGodownList;
        const allAddedFalse = currentItem.GodownList.every(
          (item) => item.added === false || item.added == undefined
        );
        if (allAddedFalse) {
          dispatch(removeItem(currentItem._id));
        }

        // Calculate totals and update individual batch totals
        // const totalData = calculateTotal(currentItem, selectedPriceLevel);
        // const updatedGodownListWithTotals = updatedGodownList.map(
        //   (godown, index) => ({
        //     ...godown,
        //     individualTotal:
        //       totalData.individualTotals.find(({ index: i }) => i === index)
        //         ?.individualTotal || 0,
        //   })
        // );
        // currentItem.GodownList = updatedGodownListWithTotals;
        // currentItem.total = totalData.total; // Update the overall total
      } else {
        currentItem.count = new Decimal(currentItem.count).sub(1).toNumber();

        // Ensure count does not go below 0
        if (currentItem.count <= 0) currentItem.added = false;


      }

      dispatch(updateItem(currentItem)); // Log the updated currentItem
      // Log the updated currentItem
      return currentItem; // Return the updated currentItem
    });

    setItem(updatedItems); // Update the state with the updated items
  };


  /////////////////////////// calculateHeight ///////////////////////////////////

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 170;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const continueHandler = () => {
    navigate(-1);
  };

  const backHandler = () => {
    navigate(-1);
  };

  /////////////////////expansion panel////////////////////

  const handleExpansion = (id) => {

    const currentItems = [...item];
  
    const updatedItems = structuredClone(currentItems);
    const index = updatedItems.findIndex((item) => item._id === id);
  
    if (index !== -1) {
      updatedItems[index].isExpanded = !updatedItems[index].isExpanded;
    }
  
    // Log the updated items for debugging
    console.log(updatedItems.length);
    console.log(updatedItems);
  
    // Update state with the new items array
    setItem(updatedItems);
  
    // Optionally update refresh state or other operations
    // setRefresh((prevRefresh) => !prevRefresh);
  
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [heights]);

  const getItemSize = (index) => {
    const product = filteredItems[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded ? heights[index] || 250 : 220; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 230 : 0; // Extra height for expanded items

    return baseHeight + extraHeight;
    // return
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

  const Row = ({ index, style }) => {
    const el = filteredItems[index];
    // const isExpanded = expandedProductId === el?._id;
    const adjustedStyle = {
      ...style,
      marginTop: "6px",
      height: "200px",
    };
    return (
      <div
        style={adjustedStyle}
        key={index}
        className="bg-white  py-2 pb-6  mt-0  rounded-sm cursor-pointer  z-0 shadow-lg  "
      >
        <div className=" flex justify-between items-center p-4">
          <div className="flex items-start gap-3 md:gap-4  ">
            <div
              className={`w-10 ${
                el?.hasGodownOrBatch ? "mt-1" : "mt-4"
              }  uppercase h-10 rounded-lg bg-violet-200 flex items-center justify-center font-semibold text-gray-400`}
            >
              {el?.product_name?.slice(0, 1)}
            </div>
            <div
              className={` flex flex-col font-bold text-sm md:text-sm  gap-1 leading-normal`}
            >
              <p
                className={`${
                  el?.hasGodownOrBatch ? "mt-1" : "mt-4"
                } max-w-1/2`}
              >
                {el.hasGodownOrBatch
                  ? el?.product_name.length < 30
                    ? el?.product_name
                    : el?.product_name.slice(0, 50) + "..."
                  : el?.product_name.length < 30
                  ? el?.product_name
                  : el?.product_name.slice(0, 30) + "..."}
                {/* {el?.product_name} */}
              </p>
              {el?.hasGodownOrBatch && (
                <div className="flex flex-col">
                  <div className="flex">
                    <span>Net Amount : ₹ </span>
                    <span>{el?.total || 0}</span>
                  </div>
                  <span className="text-gray-500 text-xs md:text-sm  ">
                    Stock :
                    <span>
                      {" "}
                      {el?.GodownList.reduce(
                        (acc, curr) => (acc += Number(curr.balance_stock)),
                        0
                      ) || 0}
                    </span>
                  </span>
                </div>
              )}

              {!el?.hasGodownOrBatch && (
                <>
                  <div className="flex gap-1 items-center">
                    <p>
                      ₹{" "}
                      {
                        // el?.Priceleveles?.find(
                        //   (item) => item.pricelevel === selectedPriceLevel
                        // )?.pricerate
                        el?.GodownList[0]?.selectedPriceRate
                      }{" "}
                      /
                    </p>{" "}
                    <span className="text-[10px] mt-1">{el?.unit}</span>
                  </div>
                  <div className="flex">
                    <p className="text-red-500">STOCK : </p>
                    <span>{el?.GodownList[0]?.balance_stock}</span>
                  </div>
                  <div>
                    <span>Total : ₹ </span>
                    <span>{el?.GodownList[0]?.individualTotal || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
        {el?.hasGodownOrBatch && (
          <div className="px-6">
            <div
              onClick={() => {
                handleExpansion(el?._id);
                setTimeout(() => listRef.current.resetAfterIndex(index), 0);
              }}
              className="p-2 border-gray-300 border rounded-md w-full text-violet-500 mt-4 font-semibold flex items-center justify-center gap-3"
            >
              {el?.isExpanded ? "Hide Details" : "Show Details"}

              {el?.isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </div>
          </div>
        )}

        {el?.isExpanded && (
          <div className=" bg-white">
            <ProductDetails
              heights={heights}
              handleIncrement={handleIncrement}
              handleDecrement={handleDecrement}
              // selectedPriceLevel={selectedPriceLevel}
              handleAddClick={handleAddClick}
              godownName="nil"
              details={el}
              setHeight={(height) => setHeight(index, height)}
              tab="stockTransfer"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex-1 bg-slate-50 h-screen   ">
        <div className="sticky top-0 h-[100px] ">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  ">
            <div className="flex justify-between  items-center gap-2 ">
              <div className="flex items-center gap-2">
                <IoIosArrowRoundBack
                  onClick={backHandler}
                  className="text-2xl text-white cursor-pointer"
                />
                <p className="text-white text-sm   font-bold ">Add Item</p>
              </div>
              <div className="flex items-center gap-4 md:gap-6 ">
                <MdOutlineQrCodeScanner className="text-white text-lg  cursor-pointer md:text-xl" />
              </div>
            </div>
            {/* <div className="flex justify-end">
              <p className="text-sm text-white">Showroom</p>
              </div> */}
          </div>
          <SearchBar onType={searchData} />

          {/* <div type="button" className="flex  px-4 bg-white ">
            <p className="text-xs  p-0.5 px-1 text-black font-bold opacity-60 mb-2  ">
              {godownname}
            </p>
          </div> */}
        </div>

        {loader ? (
          <div className="flex justify-center items-center h-screen">
            <HashLoader color="#363ad6" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-4 py-2 pb-6 mt-4 flex justify-center items-center rounded-sm cursor-pointer border-b-2 h-screen">
            <p>No products available</p>
          </div>
        ) : (
          <List
            ref={listRef}
            style={{
              scrollbarWidth: "thin",
              // scrollbarColor: "transparent transparent",
           
            }}
            className=""
            height={listHeight} // Specify the height of your list
            itemCount={filteredItems.length} // Specify the total number of items
            // itemSize={170} // Specify the height of each item
            itemSize={getItemSize}
            width="100%" // Specify the width of your list
            initialScrollOffset={scrollPosition}
            onScroll={({ scrollOffset }) => {
              setScrollPosition(scrollOffset);
              localStorage.setItem(
                "scrollPositionAddItemSales",
                scrollOffset.toString()
              );
            }}
          >
            {Row}
          </List>
        )}

        {item.length > 0 && (
          <div className=" sticky bottom-0 bg-white  w-full flex justify-center p-3 border-t h-[70px] ">
            <button
              onClick={continueHandler}
              className="bg-violet-700  w-[85%] text-ld font-bold text-white p-2 rounded-md"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddItemStockTransferSec;
