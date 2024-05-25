/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useSelector } from "react-redux";
import { addItem, removeItem } from "../../../slices/salesSecondary";
import { useDispatch } from "react-redux";
import { changeCount } from "../../../slices/salesSecondary";
import { setPriceLevel } from "../../../slices/salesSecondary";
import {
  changeTotal,
  setBrandInRedux,
  setCategoryInRedux,
  setSubCategoryInRedux,
  removeAll,
  changeGodownCount,
  addAllProducts,
} from "../../../slices/salesSecondary";
import { HashLoader } from "react-spinners";
import { VariableSizeList as List } from "react-window";
import { Button, Modal } from "flowbite-react";
import { toast } from "react-toastify";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { Decimal } from "decimal.js";
import SearchBar from "../../components/common/SearchBar";
import { IoIosArrowDropdownCircle } from "react-icons/io";
import ProductDetails from "../../components/common/ProductDetails";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

// import SelectDefaultModal from "../../../constants/components/SelectDefaultModal";

function AddItemSalesSecondary() {
  const [item, setItem] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setseleCtedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [search, setSearch] = useState("");
  const [priceLevels, setPriceLevels] = useState([]);
  const [loader, setLoader] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [godown, setGodown] = useState([]);
  const [godownname, setGodownname] = useState("");
  const [heights, setHeights] = useState({});
  const [selectedProducts, setSelectedProducts] = useState({});
  ///////////////////////////cpm_id///////////////////////////////////

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  ///////////////////////////itemsFromRedux///////////////////////////////////

  const itemsFromRedux = useSelector((state) => state.salesSecondary.items);

  ///////////////////////////priceLevelFromRedux///////////////////////////////////

  const priceLevelFromRedux =
    useSelector((state) => state.salesSecondary.selectedPriceLevel) || "";

  const allProductsFromRedux =
    useSelector((state) => state.salesSecondary.products) || [];

  ///////////////////////////filters FromRedux///////////////////////////////////

  const brandFromRedux =
    useSelector((state) => state.salesSecondary.brand) || "";
  const categoryFromRedux =
    useSelector((state) => state.salesSecondary.category) || "";
  const subCategoryFromRedux =
    useSelector((state) => state.salesSecondary.subcategory) || "";

  ///////////////////////////navigate dispatch///////////////////////////////////

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listRef = useRef(null);
  const location = useLocation();

  ///////////////////////////Godown name///////////////////////////////////
  useEffect(() => {
    const fetchGodownname = async () => {
      try {
        const godown = await api.get(`/api/sUsers/godownsName/${cpm_id}`, {
          withCredentials: true,
        });
        setGodownname(godown.data || "");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };
    fetchGodownname();
  }, []);

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
            withCredentials: true,
          });
          productData = res.data.productData;
          console.log(res.data.productData);
          dispatch(addAllProducts(res.data.productData));
        } else {
          productData = allProductsFromRedux;
        }

        if (itemsFromRedux.length > 0) {
          const reduxItemIds = itemsFromRedux.map((el) => el._id);
          const updatedItems = productData.map((product) => {
            if (reduxItemIds.includes(product._id)) {
              // If the product ID exists in Redux, replace it with the corresponding Redux item
              const reduxItem = itemsFromRedux.find(
                (item) => item._id === product._id
              );
              return reduxItem;
            } else {
              return product;
            }
          });
          setItem(updatedItems);
        } else {
          setItem(productData);
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
  }, [cpm_id]);

  ///////////////////////////setSelectedPriceLevel fom redux///////////////////////////////////

  useEffect(() => {
    setSelectedPriceLevel(priceLevelFromRedux);
  }, []);

  /////////////////////////scroll////////////////////////////

  useEffect(() => {
    const storedScrollPosition = localStorage.getItem(
      "scrollPositionAddItemSales"
    );
    if (storedScrollPosition) {
      setScrollPosition(parseInt(storedScrollPosition, 10));
    }
  }, []);

  ///////////////////////////sdo persisting of products///////////////////////////////////

  // useEffect(() => {
  //   if (itemsFromRedux.length > 0) {
  //     const updatedItems = item.map((currentItem) => {
  //       // Find the corresponding item in itemsFromRedux
  //       const matchingItem = itemsFromRedux.find(
  //         (el) => el._id === currentItem._id
  //       );
  //       if (matchingItem) {
  //         // If matching item found, return it with updated count and total
  //         return {
  //           ...currentItem,
  //           count: matchingItem.count,
  //           total: matchingItem.total,
  //         };
  //       } else {
  //         // If no matching item found, return the current item
  //         return currentItem;
  //       }
  //     });

  //     // Update the state with the modified items
  //     setItem(updatedItems);
  //   }
  // }, [itemsFromRedux, refresh]);

  //////////////////////////////orgId////////////////////////////////

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  //////////////////////////////fetchFilters////////////////////////////////

  console.log(type);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        let res;
        if (type == "self") {
          res = await api.get(`/api/sUsers/fetchFilters/${orgId}`, {
            withCredentials: true,
          });
        } else {
          res = await api.get(`/api/sUsers/fetchAdditionalDetails/${orgId}`, {
            withCredentials: true,
          });
        }

        if (type === "self") {
          const { brands, categories, subcategories, priceLevels } =
            res.data.data;
          setBrands(brands);
          setCategories(categories);
          setSubCategories(subcategories);
          setPriceLevels(priceLevels);
          if (priceLevelFromRedux == "") {
            const defaultPriceLevel = priceLevels[0];
            setSelectedPriceLevel(defaultPriceLevel);
            dispatch(setPriceLevel(defaultPriceLevel));
          }
        } else {
          const { priceLevels, brands, categories, subcategories } = res.data;

          setBrands(brands);
          setCategories(categories);
          setSubCategories(subcategories);

          setPriceLevels(priceLevels);
          if (priceLevelFromRedux == "") {
            const defaultPriceLevel = priceLevels[0];
            setSelectedPriceLevel(defaultPriceLevel);
            dispatch(setPriceLevel(defaultPriceLevel));
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchFilters();
  }, [orgId, type]);

  ///////////////////////////filter items///////////////////////////////////

  const filterItems = (items, brand, category, subCategory, searchTerm) => {
    return items.filter((item) => {
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

  ///////////////////////////handleAddClick///////////////////////////////////

  const handleAddClick = (_id, idx) => {
    console.log("haii", _id);
    const updatedItems = item.map(item => {
      if (item._id === _id) {
        const itemToUpdate = { ...item, GodownList: [...item.GodownList] };

        if (itemToUpdate.GodownList[idx]) {
          const currentBatchOrGodown = { ...itemToUpdate.GodownList[idx] };
          console.log(currentBatchOrGodown);

          currentBatchOrGodown.added = currentBatchOrGodown.added ? !currentBatchOrGodown.added : true;
          currentBatchOrGodown.count = 1;

          itemToUpdate.GodownList[idx] = currentBatchOrGodown;
          console.log(currentBatchOrGodown);
        }

        return { ...itemToUpdate, added:itemToUpdate.added ? !itemToUpdate.added : true };
      }
      return item;
    });

    setItem(updatedItems);
  };
  console.log("item", item);

  ///////////////////////////calculateTotal///////////////////////////////////

  const calculateTotal = (item, selectedPriceLevel) => {
    const priceRate =
      item.Priceleveles.find((level) => level.pricelevel === selectedPriceLevel)
        ?.pricerate || 0;

    let subtotal = priceRate * Number(item?.count);
    let discountedSubtotal = subtotal;

    if (item.discount !== 0 && item.discount !== undefined) {
      discountedSubtotal -= item.discount;
    } else if (
      item.discountPercentage !== 0 &&
      item.discountPercentage !== undefined
    ) {
      discountedSubtotal -= (subtotal * item.discountPercentage) / 100;
    }

    const gstAmount =
      (discountedSubtotal * (item.newGst || item.igst || 0)) / 100;

    const total = discountedSubtotal + gstAmount;

    return total;
  };

  ///////////////////////////handleIncrement///////////////////////////////////

  const handleIncrement = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);

    const currentItem = { ...updatedItems[index] };

    if (currentItem?.GodownList?.length > 0 && !godownname) {
      setOpenModal(true);

      setGodown(currentItem?.GodownList);
    } else {
      if (!currentItem.count) {
        currentItem.count = 1;
      } else {
        currentItem.count = new Decimal(currentItem.count).add(1).toNumber();
      }

      currentItem.total = calculateTotal(
        currentItem,
        selectedPriceLevel
      ).toFixed(2);
      updatedItems[index] = currentItem;
      setItem(updatedItems);
      // setRefresh(!refresh);

      dispatch(changeCount(currentItem));
      dispatch(changeTotal(currentItem));
      dispatch(changeGodownCount(currentItem));
    }
  };
  ///////////////////////////handleTotalChangeWithPriceLevel///////////////////////////////////

  const handleTotalChangeWithPriceLevel = (pricelevel) => {
    const updatedItems = filteredItems.map((item) => {
      if (item.added === true) {
        const newTotal = calculateTotal(item, pricelevel).toFixed(2);
        dispatch(changeTotal({ ...item, total: newTotal }));

        return {
          ...item,
          total: newTotal,
        };
      }
      return item;
    });

    setItem(updatedItems);
  };

  ///////////////////////////handleDecrement///////////////////////////////////
  const handleDecrement = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);
    // Make a copy of the array
    const currentItem = { ...updatedItems[index] };

    if (currentItem?.GodownList?.length > 0 && !godownname) {
      setOpenModal(true);
      setGodown(currentItem?.GodownList);
    } else {
      if (currentItem.count > 0) {
        currentItem.count = new Decimal(currentItem.count).sub(1).toNumber();

        if (currentItem.count <= 0) {
          dispatch(removeItem(currentItem));
          updatedItems[index] = { ...currentItem, added: false };
          setItem(updatedItems);
        }

        // Use the calculateTotal function to calculate the total for the current item
        currentItem.total = calculateTotal(
          currentItem,
          selectedPriceLevel
        ).toFixed(2);

        updatedItems[index] = currentItem; // Update the item in the copied array
        setItem(updatedItems);
        setRefresh(!refresh);
      }

      dispatch(changeCount(currentItem));

      dispatch(changeTotal(currentItem));
    }

    // Decrement the count if it's greater than 0
  };

  ///////////////////////////modalSubmit///////////////////////////////////
  const modalSubmit = (id) => {
    setOpenModal(false);
    const updatedItems = [...item];

    // Find the itemToUpdate by id
    const itemToUpdateIndex = updatedItems.findIndex((item) => item._id === id);
    if (itemToUpdateIndex === -1) {
      console.error("Item not found");
      return;
    }

    const itemToUpdate = updatedItems[itemToUpdateIndex];

    // Calculate the total count across all godowns for itemToUpdate
    const totalCount = truncateToNDecimals(
      godown.reduce((acc, godownItem) => acc + Number(godownItem.count), 0),
      3
    );

    const itemWithUpdatedCount = {
      ...itemToUpdate,
      count: totalCount,
    };

    // Update itemToUpdate.count with the total count
    const updatedItem = {
      ...itemToUpdate,
      count: totalCount,
      total: calculateTotal(itemWithUpdatedCount, selectedPriceLevel).toFixed(
        2
      ),
      GodownList: godown,
    };

    // Update the item in the copied array

    if (updatedItem.count === 0) {
      dispatch(removeItem(itemToUpdate));
      updatedItem.added = false;
    }
    updatedItems[itemToUpdateIndex] = updatedItem;

    setItem(updatedItems);
    // updatedItems[itemToUpdateIndex]; // Update the local state
    if (!updatedItem.added) {
      updatedItem.added = !itemToUpdate.added;
      dispatch(addItem(updatedItem)); // Add or update the item in the Redux store
    }

    if (updatedItem.count === 0) {
      dispatch(removeItem(updatedItem)); // Dispatch an action to remove the item
      updatedItem.added = false; // Update the 'added' property of the item
    }

    dispatch(changeCount(updatedItem)); // Update the count in the Redux store
    dispatch(changeTotal(updatedItem)); // Update the total in the Redux store
    dispatch(changeGodownCount(updatedItem)); // Update the total in the Redux store
  };

  ///////////////////////////handlePriceLevelChange///////////////////////////////////

  const handlePriceLevelChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPriceLevel(selectedValue);
    dispatch(setPriceLevel(selectedValue));
    handleTotalChangeWithPriceLevel(selectedValue);
  };

  function truncateToNDecimals(num, n) {
    const parts = num.toString().split(".");
    if (parts.length === 1) return num; // No decimal part
    parts[1] = parts[1].substring(0, n); // Truncate the decimal part
    return parseFloat(parts.join("."));
  }

  ///////////////////////////react window ///////////////////////////////////

  /////////////////////////// calculateHeight ///////////////////////////////////

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 200;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const continueHandler = () => {
    if (location?.state?.from === "editSales") {
      navigate(`/sUsers/editSales/${location.state.id}`);
    } else {
      navigate("/sUsers/sales");
    }
  };

  const backHandler = () => {
    dispatch(removeAll());
    if (location?.state?.from === "editSales") {
      navigate(`/sUsers/editSales/${location.state.id}`);
    } else {
      navigate("/sUsers/sales");
    }
  };

  /////////////////////////// modal ///////////////////////////////////

  function onCloseModal() {
    setOpenModal(false);
  }

  // Function to handle incrementing the count
  const incrementCount = (index) => {
    const newGodownItems = godown.map((item) => ({ ...item })); // Deep copy each item object

    // newGodownItems[index].count += 1;
    newGodownItems[index].count = new Decimal(newGodownItems[index].count)
      .add(1)
      .toNumber();

    newGodownItems[index].balance_stock = new Decimal(
      newGodownItems[index].balance_stock
    )
      .sub(1)
      .toNumber();
    setGodown(newGodownItems);
    setTotalCount(totalCount + 1);
  };

  // Function to handle decrementing the count
  const decrementCount = (index) => {
    const newGodownItems = godown.map((item) => ({ ...item })); // Assuming godown is the correct state variable name

    if (newGodownItems[index].count > 0) {
      newGodownItems[index].count = new Decimal(newGodownItems[index].count)
        .sub(1)
        .toNumber();
      newGodownItems[index].balance_stock = new Decimal(
        newGodownItems[index].balance_stock
      )
        .add(1)
        .toNumber(); // Increase balance_stock by 1
      setGodown(newGodownItems); // Corrected function name to setGodown
      setTotalCount(totalCount - 1);
    } else {
      toast("Cannot decrement count as it is already at 0.");
    }
  };

  /////////////////////expansion panel////////////////////

  const handleExpansion = (id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === id);

    const itemToUpdate = { ...updatedItems[index] };
    setSelectedProducts((prevSelectedProducts) => ({
      ...prevSelectedProducts,
      [id]: itemToUpdate?.GodownList,
    }));
    if (itemToUpdate) {
      itemToUpdate.isExpanded = !itemToUpdate.isExpanded;

      updatedItems[index] = itemToUpdate;
    }
    setItem(updatedItems);
    // setTimeout(() => listRef.current.resetAfterIndex(index), 0);
  };

  const getItemSize = (index) => {
    const product = item[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded ? heights[index] || 200 : 170; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 180 : 0; // Extra height for expanded items

    return baseHeight + extraHeight;
    // return
  };

  // console.log(getItemSize(0));

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

  const Row = ({ index, style }) => {
    const el = filteredItems[index];
    // const isExpanded = expandedProductId === el._id;
    const adjustedStyle = {
      ...style,
      marginTop: "6px",
      height: "160px",
    };
    return (
      <div
        style={adjustedStyle}
        key={index}
        className="bg-white  py-2 pb-6  mt-0  rounded-sm cursor-pointer  z-0 shadow-lg  "
      >
        <div className=" flex justify-between items-center p-4">
          <div className="flex items-start gap-3 md:gap-4  ">
            <div className="w-10 mt-1  uppercase h-10 rounded-lg bg-violet-200 flex items-center justify-center font-semibold text-gray-400">
              {el.product_name.slice(0, 1)}
            </div>
            <div
              className={` flex flex-col font-bold text-sm md:text-sm  gap-1 leading-normal`}
            >
              <p className={`${el.hasGodownOrBatch ? "mt-2.5" : ""}`}>
                {el.product_name}
              </p>

              {!el?.hasGodownOrBatch && (
                <>
                  <div className="flex gap-1 items-center">
                    <p>
                      ₹{" "}
                      {
                        el?.Priceleveles.find(
                          (item) => item.pricelevel === selectedPriceLevel
                        )?.pricerate
                      }{" "}
                      /
                    </p>{" "}
                    <span className="text-[10px] mt-1">{el.unit}</span>
                  </div>
                  <div className="flex">
                    <p className="text-red-500">STOCK : </p>
                    <span>{el.balance_stock}</span>
                  </div>
                  <div>
                    <span>Total : ₹ </span>
                    <span>{el.total || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {el.added && el?.count > 0 ? (
            <div className="flex items-center flex-col gap-2">
              {/* <Link
              // to={`/sUsers/editItem/${el._id}`}
              to={{
                pathname: `/sUsers/editItem/${el._id}`,
                state: { from: "addItem" },
              }}
            > */}
              <button
                onClick={() => {
                  navigate(
                    `/sUsers/editItemSales/${el._id}/${godownname || "nil"}`,
                    {
                      state: { from: "editItemSales", id: location?.state?.id },
                    }
                  );
                  // saveScrollPosition();
                }}
                type="button"
                className="  mt-3  px-2 py-1  rounded-md border-violet-500 font-bold border  text-violet-500 text-xs"
              >
                Edit
              </button>
              {/* </Link> */}
              <div
                className="py-2 px-3 inline-block bg-white  "
                data-hs-input-number
              >
                <div className="flex items-center gap-x-1.5">
                  <button
                    onClick={() => handleDecrement(el._id)}
                    type="button"
                    className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                    data-hs-input-number-decrement
                  >
                    <svg
                      className="flex-shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <input
                    className="p-0 w-12 bg-transparent border-0 text-gray-800 text-center focus:ring-0 "
                    type="text"
                    disabled
                    value={el.count ? el.count : 0} // Display the count from the state
                    data-hs-input-number-input
                  />
                  <button
                    onClick={() => {
                      handleIncrement(el._id);
                    }}
                    type="button"
                    className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
                    data-hs-input-number-increment
                  >
                    <svg
                      className="flex-shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            !el?.hasGodownOrBatch && (
              <div
                onClick={() => {
                  handleAddClick(el._id);
                }}
                className="px-4 py-2 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
              >
                Add
              </div>
            )
          )}
        </div>
        {el.hasGodownOrBatch && (
          <div className="px-6">
            <div
              onClick={() => {
                handleExpansion(el._id);
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
              handleAddClick={handleAddClick}
              details={el}
              setHeight={(height) => setHeight(index, height)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex relative">
      <div>
        <SidebarSec TAB={"sales"} />
      </div>

      <div className="flex-1 bg-slate-50 h-screen overflow-y-scroll  ">
        <div className="sticky top-0 h-[165px] ">
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
                <div>
                  <select
                    onChange={(e) => handlePriceLevelChange(e)}
                    value={selectedPriceLevel}
                    className="block w-full p-1 px-3 truncate text-xs  border rounded-lg border-gray-100 bg-[#012a4a] text-white focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priceLevels.length > 0 ? (
                      priceLevels.map((el, index) => (
                        <option key={index} value={el}>
                          {el}
                        </option>
                      ))
                    ) : (
                      <option key="no-price-level" value="No price level added">
                        No price level added
                      </option>
                    )}
                  </select>
                </div>
                <MdOutlineQrCodeScanner className="text-white text-lg  cursor-pointer md:text-xl" />
              </div>
            </div>
            {/* <div className="flex justify-end">
              <p className="text-sm text-white">Showroom</p>
              </div> */}
          </div>

          <div className=" px-3 py-2 bg-white drop-shadow-lg  ">
            <div className="flex justify-between  items-center"></div>
            <div className="mt-2  md:w-1/2 ">
              <div className="relative ">
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
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <SearchBar onType={searchData} />
              </div>
            </div>
          </div>

          <div
            className="bg-white text-sm font-semibold py-0 pb-1 px-2 flex items-center justify-evenly z-20 w-full gap-2  "
            style={{ position: "relative", zIndex: "20" }}
          >
            <div className="w-4/12">
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  dispatch(setBrandInRedux(e.target.value));
                }}
                className="full form-select block border-none  py-1.5 text-sm md:text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border rounded transition ease-in-out m-0 focus:ring-0 focus:border-none"
              >
                <option value="">Brands</option>
                {brands.length > 0 &&
                  brands.map((brand, index) => (
                    <option key={index} value={brand}>
                      {brand}
                    </option>
                  ))}
              </select>
            </div>

            <div className="w-4/12">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setseleCtedCategory(e.target.value);
                  dispatch(setCategoryInRedux(e.target.value));
                }}
                className="w-full   form-select block border-none  py-1.5 text-sm md:text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border rounded transition ease-in-out m-0 focus:ring-0 focus:border-none"
              >
                <option value="">Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-4/12">
              <select
                value={selectedSubCategory}
                onChange={(e) => {
                  setSelectedSubCategory(e.target.value);
                  dispatch(setSubCategoryInRedux(e.target.value));
                }}
                className=" w-full  form-select block  py-1.5 text-sm md:text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border  border-none rounded transition ease-in-out m-0 focus:ring-0 focus:border-none "
              >
                <option value="">Subcategories</option>
                {subCategories.map((el, index) => (
                  <option key={index} value={el}>
                    {el}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div type="button" className="flex  px-4 bg-white ">
            <p className="text-xs  p-0.5 px-1 text-black font-bold opacity-60 mb-2  ">
              {godownname}
            </p>
          </div>
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
              scrollbarColor: "transparent transparent",
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

      {/* modal.......................................................... */}
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

                  <h3 className="font-medium  text-right  text-white ">
                    Total Count:{" "}
                    <span className="text-white  font-bold">
                      {truncateToNDecimals(
                        godown.reduce(
                          (acc, curr) => acc + parseFloat(curr.count),
                          0
                        ),
                        3 // Specify the number of decimal places you want
                      )}
                    </span>
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
                        {/* <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Balance Stock
                        </th> */}
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Count
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {godown.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 ">
                            <div className="text-sm text-gray-900">
                              {item.godown}
                            </div>
                            <div className="text-sm text-gray-900 mt-1">
                              Stock :{" "}
                              <span
                                className={`${
                                  item.balance_stock <= 0
                                    ? "text-red-500  font-bold"
                                    : ""
                                } text-green-500 font-bold"`}
                              >
                                {item.balance_stock}
                              </span>
                            </div>
                          </td>
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.balance_stock}
                            </div>
                          </td> */}
                          {/* <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.count}
                            </div>
                          </td> */}
                          <td className=" px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center  ">
                            <div className="flex gap-3 items-center justify-center">
                              <button
                                onClick={() => decrementCount(index)}
                                className="text-indigo-600 hover:text-indigo-900  text-lg"
                              >
                                -
                              </button>

                              {item.count}
                              <div></div>
                              <button
                                onClick={() => incrementCount(index)}
                                className="text-indigo-600 hover:text-indigo-900 text-lg"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full">
                <Button
                  onClick={() => {
                    modalSubmit(godown[0]?._id);
                  }}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>

      {/* modal.......................................................... */}
    </div>
  );
}

export default AddItemSalesSecondary;
