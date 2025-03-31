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
  addAllProducts,
  addItem,
  removeItem,
  changeTotal,
  // setBrandInRedux,
  // setCategoryInRedux,
  // setSubCategoryInRedux,
  setPriceLevel,
  changeCount,
  addPriceRate,
} from "../../../slices/invoiceSecondary";
import { FixedSizeList as List } from "react-window";
import { Decimal } from "decimal.js";
import SearchBar from "../../components/common/SearchBar";
import Filter from "../../components/secUsers/Filter";
import CustomBarLoader from "../../components/common/CustomBarLoader";

function AddItemSecondary() {
  const [item, setItem] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("");
  const [refresh, setRefresh] = useState(false);
  // const [brands, setBrands] = useState([]);
  // const [categories, setCategories] = useState([]);
  // const [subCategories, setSubCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setseleCtedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [search, setSearch] = useState("");
  const [priceLevels, setPriceLevels] = useState([]);
  const [loader, setLoader] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Redux hooks
  const dispatch = useDispatch();
  const {
    secSelectedOrganization: {
      secSelectedOrg: { _id: cpm_id, type, configurations },
    },
    invoiceSecondary: {
      items: itemsFromRedux,
      selectedPriceLevel: priceLevelFromRedux = "",
      brand: brandFromRedux = "",
      category: categoryFromRedux = "",
      subcategory: subCategoryFromRedux = "",
      products: allProductsFromRedux = "",
    },
  } = useSelector((state) => state);

  ///// check if the company is tax inclusive or not  //////////////////////////
  const { addRateWithTax } = configurations[0];
  const taxInclusive = addRateWithTax["saleOrder"] || false;

  // Helper functions
  const calculateTotal = (item, selectedPriceLevel, situation = "normal") => {
    let priceRate = 0;
    if (situation === "priceLevelChange") {
      priceRate =
        item.Priceleveles.find(
          (level) => level.pricelevel === selectedPriceLevel
        )?.pricerate || 0;
    }

    let subtotal = 0;
    let totalCess = 0; // Track total cess amount

    if (situation === "normal") {
      priceRate = item.selectedPriceRate;
    }
    const quantity = Number(item.count);
    const igstValue = Math.max(item.newGst || item.igst || 0, 0);

    // Calculate base price based on tax inclusivity
    let basePrice = priceRate * quantity;
    let taxBasePrice = basePrice;

    // For tax inclusive prices, calculate the base price without tax
    if (item?.isTaxInclusive) {
      taxBasePrice = Number((basePrice / (1 + igstValue / 100)).toFixed(2));
    }

    // Calculate discount based on discountType
    let discountedPrice = taxBasePrice;

    if (
      item.discountType === "percentage" &&
      item.discountPercentage !== 0 &&
      item.discountPercentage !== undefined
    ) {
      // Percentage discount
      const discountAmount = (taxBasePrice * item.discountPercentage) / 100;
      discountedPrice = taxBasePrice - discountAmount;
    } else if (item.discount !== 0 && item.discount !== undefined) {
      // Fixed amount discount (default)
      discountedPrice = taxBasePrice - item.discount;
    }

    // Calculate cess amounts
    let cessAmount = 0;
    let additionalCessAmount = 0;

    // Standard cess calculation
    if (item.cess && item.cess > 0) {
      cessAmount = discountedPrice * (item.cess / 100);
    }

    // Additional cess calculation
    if (item.addl_cess && item.addl_cess > 0) {
      additionalCessAmount = quantity * item.addl_cess;
    }

    // Combine cess amounts
    const totalCessAmount = cessAmount + additionalCessAmount;

    // Calculate tax amount
    const taxAmount = discountedPrice * (igstValue / 100);

    // Calculate total including tax and cess
    const individualTotal = Math.max(
      parseFloat((discountedPrice + taxAmount + totalCessAmount).toFixed(2)),
      0
    );

    subtotal += individualTotal;
    totalCess += totalCessAmount;

    subtotal = Math.max(parseFloat(subtotal), 0);

    return subtotal;
  };

  const filterItems = (items, brand, category, subCategory, searchTerm) => {
    return items.filter(
      (item) =>
        (!brand || item.brand === brand) &&
        (!category || item.category === category) &&
        (!subCategory || item.sub_category === subCategory) &&
        (!searchTerm ||
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Helper closee

  // Other hooks
  const navigate = useNavigate();
  const listRef = useRef(null);
  const location = useLocation();

  ///////////////////////////fetchProducts///////////////////////////////////
  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);

      let productData;

      try {
        if (allProductsFromRedux.length === 0) {
          const res = await api.get(
            `/api/sUsers/getProducts/${cpm_id}?taxInclusive=${taxInclusive}`,
            {
              withCredentials: true,
            }
          );

          productData = res.data.productData;
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
          setRefresh(!refresh);
          if (updatedItems.length > 0) {
            await fetchFilters();
          }
          setRefresh(!refresh);
        } else {
          setItem(productData);
          setRefresh(!refresh);

          if (productData.length > 0) {
            await fetchFilters();
          }
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
  }, [cpm_id]);

  //////////////////////////////fetchFilters////////////////////////////////

  // Fetch filters
  const fetchFilters = useCallback(async () => {
    try {
      const { priceLevels, brands, categories, subcategories } = (
        await api.get(`/api/sUsers/fetchAdditionalDetails/${cpm_id}`, {
          withCredentials: true,
        })
      ).data;

      setPriceLevels(priceLevels);
      // setBrands(brands);
      // setCategories(categories);
      // setSubCategories(subcategories);

      if (priceLevelFromRedux === "") {
        const defaultPriceLevel = priceLevels[0];
        setSelectedPriceLevel(defaultPriceLevel);
        dispatch(setPriceLevel(defaultPriceLevel));
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }, [cpm_id, dispatch, priceLevelFromRedux]);

  ///////////////////////////setSelectedPriceLevel fom redux///////////////////////////////////

  useEffect(() => {
    setSelectedPriceLevel(priceLevelFromRedux);
  }, []);

  /////////////////////////scroll////////////////////////////

  useEffect(() => {
    const storedScrollPosition = localStorage.getItem("scrollPositionAddItem");
    if (storedScrollPosition) {
      setScrollPosition(parseInt(storedScrollPosition, 10));
    }
  }, []);

  const searchData = (data) => {
    setSearch(data);
  };

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

  const addSelectedRate = (pricelevel) => {
    if (filteredItems.length > 0) {
      const updatedItems = filteredItems.map((item) => {
        const priceRate =
          item?.Priceleveles?.find((item) => item.pricelevel === pricelevel)
            ?.pricerate || 0;

        // console.log(priceRate);

        const reduxItem = itemsFromRedux.find((p) => p._id === item._id);
        const reduxRate = reduxItem?.selectedPriceRate || null;

        return {
          ...item,
          selectedPriceRate: reduxRate ?? priceRate,
        };
      });

      setItem(updatedItems);
    }
  };

  useEffect(() => {
    if (selectedPriceLevel && (item.length > 0 || filteredItems.length > 0)) {
      addSelectedRate(selectedPriceLevel);
    }
  }, [selectedPriceLevel, refresh]);

  ///////////////////////////handleAddClick///////////////////////////////////

  const handleAddClick = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);
    // Create a shallow copy of the items
    const itemToUpdate = { ...updatedItems[index] };
    if (itemToUpdate) {
      // Toggle the 'added' state of the item
      itemToUpdate.added = !itemToUpdate.added;
      itemToUpdate.count = 1;
      itemToUpdate.actualCount = 1;
      // item.update.selectedPriceRate=
      const total = calculateTotal(itemToUpdate, selectedPriceLevel).toFixed(2);
      itemToUpdate.total = total;
      updatedItems[index] = itemToUpdate;

      dispatch(changeTotal(itemToUpdate));
      setItem(updatedItems);
      setRefresh(!refresh);
      dispatch(addItem(itemToUpdate));
      if (
        selectedPriceLevel === "" ||
        selectedPriceLevel === undefined ||
        priceLevels.length === 0
      ) {
        navigate(`/sUsers/editItem/${_id}`);
      }
    }
  };

  ///////////////////////////handleTotalChangeWithPriceLevel and add price rate ///////////////////////////////////

  const handleTotalChangeWithPriceLevel = (pricelevel) => {
    const updatedItems = filteredItems.map((item) => {
      if (item.added === true) {
        const newTotal = calculateTotal(
          item,
          pricelevel,
          "priceLevelChange"
        ).toFixed(2);

        console.log("newTotal", newTotal);

        dispatch(changeTotal({ ...item, total: newTotal }));

        const newPriceRate = item?.Priceleveles.find(
          (item) => item.pricelevel === pricelevel
        )?.pricerate;
        dispatch(
          addPriceRate({ _id: item._id, selectedPriceRate: newPriceRate })
        );

        return {
          ...item,
          total: newTotal,
        };
      }
      return item;
    });

    setItem(updatedItems);
  };

  // console.log("item", item);

  ///////////////////////////handleIncrement///////////////////////////////////

  const handleIncrement = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);

    const currentItem = { ...updatedItems[index] };

    if (!currentItem.count) {
      currentItem.count = 1;
    } else {
      // currentItem.count += 1;
      currentItem.count = new Decimal(currentItem.count);
      currentItem.count = currentItem.count.add(new Decimal(1));
      currentItem.count = parseFloat(currentItem.count.toString());
    }

    currentItem.total = calculateTotal(currentItem, selectedPriceLevel).toFixed(
      2
    );
    updatedItems[index] = currentItem;
    setItem(updatedItems);
    // setRefresh(!refresh);

    dispatch(changeCount(currentItem));
    dispatch(changeTotal(currentItem));
  };

  ///////////////////////////handleDecrement///////////////////////////////////
  const handleDecrement = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);
    // Make a copy of the array
    const currentItem = { ...updatedItems[index] };

    // Decrement the count if it's greater than 0
    if (currentItem.count > 0) {
      currentItem.count = new Decimal(currentItem.count);
      currentItem.count = currentItem.count.sub(new Decimal(1));
      currentItem.count = parseFloat(currentItem.count.toString());
      if (currentItem.count <= 0) {
        dispatch(removeItem(currentItem));
        updatedItems[index] = { ...currentItem, added: false, total: 0 }; // Make a copy and update the 'added' property
      } else {
        // Use the calculateTotal function to calculate the total for the current item
        currentItem.total = calculateTotal(
          currentItem,
          selectedPriceLevel
        ).toFixed(2);
        // Create a new object with updated 'added' property
        updatedItems[index] = { ...currentItem, added: currentItem.added };
      }

      setItem(updatedItems);
      setRefresh(!refresh);
    }

    dispatch(changeCount(currentItem));
    dispatch(changeTotal(currentItem));
  };

  ///////////////////////////handlePriceLevelChange///////////////////////////////////

  const handlePriceLevelChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPriceLevel(selectedValue);
    dispatch(setPriceLevel(selectedValue));
    addSelectedRate(selectedValue);
    handleTotalChangeWithPriceLevel(selectedValue);
  };

  /////////////////////////// calculateHeight ///////////////////////////////////

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 250;
      setListHeight(newHeight);
    };
    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const continueHandler = () => {
    // if (selectedPriceLevel === "") {
    //   toast.error("Select a price level ");
    // }
    // console.log(location.state);
    if (location?.state?.from === "editInvoice") {
      navigate(`/sUsers/editInvoice/${location.state.id}`);
    } else {
      navigate("/sUsers/invoice");
    }
  };

  const backHandler = () => {
    navigate(-1);
  };

  ///////////////////////////react window ///////////////////////////////////

  const Row = ({ index, style }) => {
    const el = filteredItems[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "160px",
    };
    return (
      <div
        style={adjustedStyle}
        key={el._id}
        className="flex flex-col bg-white shadow-lg  "
      >
        <div className=" p-4 py-2 pb-2 mt-7   flex justify-between items-center  rounded-sm cursor-pointer  ">
          <div className="flex items-start gap-3 md:gap-4  ">
            <div className="w-10 mt-1  uppercase h-10 rounded-lg bg-violet-200 flex items-center justify-center font-semibold text-gray-400">
              {el?.product_name?.slice(0, 1)}
            </div>
            <div className="flex flex-col font-bold text-sm md:text-sm  gap-1 leading-normal">
              <p>{el.product_name}</p>
              <div className="flex gap-1 items-center">
                <p>
                  <span>MRP</span> : {el?.item_mrp || 0}
                </p>
                |<p>Price : {el.selectedPriceRate || 0}</p>{" "}
              </div>

              <div className="flex">
                <p className="text-red-500">STOCK : </p>
                <span>{el.balance_stock}</span>{" "}
                <span className="text-[11px] ml-1 mt-[0.5px] ">
                  {" "}
                  / {el?.unit}
                </span>
              </div>

              <div>
                <span>Total : ₹ </span>
                <span>{el.total || 0}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <button
              className={`${
                el?.added ? "ml-11  py-1 px-2" : " px-4 py-2"
              }  rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs  `}
              onClick={() => {
                el.added
                  ? navigate(`/sUsers/editItem/${el._id}`)
                  : handleAddClick(el._id);
              }}
            >
              {el.added ? "Edit" : "Add"}
            </button>

            <div className="flex items-center justify-end px-4  ">
              {el.added ? (
                <div className="flex items-center gap-x-1.5 pl-11">
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
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex relative">
      <div className="flex-1 bg-slate-50 h-screen   ">
        <div className="sticky top-0 h-[157px]">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex justify-between  items-center gap-2  ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={backHandler}
                className="text-3xl text-white cursor-pointer"
              />
              <p className="text-white text-lg   font-bold ">Add Item</p>
            </div>

            <div className="flex items-center gap-4 md:gap-6 ">
              <div>
                <select
                  onChange={(e) => handlePriceLevelChange(e)}
                  value={selectedPriceLevel}
                  className="block w-full p-1 px-3 truncate text-sm  border rounded-lg border-gray-100 bg-[#012a4a] text-white focus:ring-blue-500 focus:border-blue-500"
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

          <SearchBar onType={searchData} />

          {loader && <CustomBarLoader />}

          <Filter addAllProducts={addAllProducts} />
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white p-4 py-2 pb-6 mt-4 flex justify-center items-center rounded-sm cursor-pointer border-b-2 h-screen">
            <p>No products available</p>
          </div>
        ) : (
          <List
            ref={listRef}
            style={{
              scrollbarWidth: "thin",
              // scrollbarColor: "transparent transparent",
              marginTop: "6px",
            }}
            className=""
            height={listHeight} // Specify the height of your list
            itemCount={filteredItems.length} // Specify the total number of items
            itemSize={175} // Specify the height of each item
            width="100%" // Specify the width of your list
            initialScrollOffset={scrollPosition}
            onScroll={({ scrollOffset }) => {
              setScrollPosition(scrollOffset);
              localStorage.setItem(
                "scrollPositionAddItem",
                scrollOffset.toString()
              );
            }}
          >
            {Row}
          </List>
        )}

        {item.length > 0 && (
          <div
            className={` ${
              loader && "opacity-50 pointer-events-none"
            }  sticky bottom-0 bg-white  w-full flex justify-center p-3 border-t h-[70px`}
          >
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

export default AddItemSecondary;
