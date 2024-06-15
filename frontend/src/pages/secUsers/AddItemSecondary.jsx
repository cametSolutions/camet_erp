/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useMemo, useRef } from "react";
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
  setBrandInRedux,
  setCategoryInRedux,
  setSubCategoryInRedux,
  setPriceLevel,
  changeCount,
  addPriceRate,
} from "../../../slices/invoiceSecondary";
import { HashLoader } from "react-spinners";
import { FixedSizeList as List } from "react-window";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { toast } from "react-toastify";
import { Decimal } from "decimal.js";
import SearchBar from "../../components/common/SearchBar";

function AddItemSecondary() {
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

  ///////////////////////////cpm_id///////////////////////////////////

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  ///////////////////////////itemsFromRedux///////////////////////////////////

  const itemsFromRedux = useSelector((state) => state.invoiceSecondary.items);

  ///////////////////////////priceLevelFromRedux///////////////////////////////////

  const priceLevelFromRedux =
    useSelector((state) => state.invoiceSecondary.selectedPriceLevel) || "";

  ///////////////////////////filters FromRedux///////////////////////////////////

  const brandFromRedux =
    useSelector((state) => state.invoiceSecondary.brand) || "";
  const categoryFromRedux =
    useSelector((state) => state.invoiceSecondary.category) || "";
  const subCategoryFromRedux =
    useSelector((state) => state.invoiceSecondary.subcategory) || "";
  const allProductsFromRedux =
    useSelector((state) => state.invoiceSecondary.products) || "";

  ///////////////////////////navigate dispatch///////////////////////////////////

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listRef = useRef(null);
  const location = useLocation();

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
          dispatch(addAllProducts(res.data.productData));
        } else {
          productData = allProductsFromRedux;
        }

        if (itemsFromRedux.length > 0) {
          console.log("haii");

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

          console.log(updatedItems);
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
  }, [cpm_id]);

  ///////////////////////////setSelectedPriceLevel fom redux///////////////////////////////////

  useEffect(() => {
    setSelectedPriceLevel(priceLevelFromRedux);
  }, []);

  ///////////////////////////sdo persisting of products///////////////////////////////////

  //////////////////////////////orgId////////////////////////////////

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  /////////////////////////scroll////////////////////////////

  useEffect(() => {
    const storedScrollPosition = localStorage.getItem("scrollPositionAddItem");
    if (storedScrollPosition) {
      setScrollPosition(parseInt(storedScrollPosition, 10));
    }
  }, []);

  //////////////////////////////fetchFilters////////////////////////////////

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

          console.log(priceLevels);
          setBrands(brands);
          setCategories(categories);
          setSubCategories(subcategories);
          setPriceLevels(priceLevels);
          if (priceLevelFromRedux == "") {
            console.log("haii");
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
            console.log("haii");
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

  const searchData = (data) => {
    setSearch(data);
  };

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

  useEffect(() => {
    console.log("haiii");
    addSelectedRate(selectedPriceLevel);
  }, [selectedPriceLevel]);

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

  const handleAddClick = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);
    // Create a shallow copy of the items
    const itemToUpdate = { ...updatedItems[index] };
    console.log(itemToUpdate);
    if (itemToUpdate) {
      // Toggle the 'added' state of the item
      itemToUpdate.added = !itemToUpdate.added;
      itemToUpdate.count = 1;
      const total = calculateTotal(itemToUpdate, selectedPriceLevel).toFixed(2);
      itemToUpdate.total = total;
      updatedItems[index] = itemToUpdate;

      dispatch(changeTotal(itemToUpdate));
      setItem(updatedItems);
      setRefresh(!refresh);
      dispatch(addItem(itemToUpdate));
    }
  };

  ///////////////////////////calculateTotal///////////////////////////////////

  const calculateTotal = (item, selectedPriceLevel) => {
    const priceRate =
      item.Priceleveles.find((level) => level.pricelevel === selectedPriceLevel)
        ?.pricerate || 0;

    let subtotal = priceRate * item?.count;
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
    return discountedSubtotal + gstAmount;
  };

  ///////////////////////////handleTotalChangeWithPriceLevel and add price rate ///////////////////////////////////

  const handleTotalChangeWithPriceLevel = (pricelevel) => {
    const updatedItems = filteredItems.map((item) => {
      if (item.added === true) {
        const newTotal = calculateTotal(item, pricelevel).toFixed(2);
        dispatch(changeTotal({ ...item, total: newTotal }));

        item?.Priceleveles.find(
          (item) => item.pricelevel === selectedPriceLevel
        )?.pricerate;

        return {
          ...item,
          total: newTotal,
        };
      }
      return item;
    });

    setItem(updatedItems);
  };

  //////////////////////////////////////////addSelectedRate/////////////////////////////////////////////

  const addSelectedRate = (pricelevel) => {
    console.log(pricelevel);
    console.log("haii");

    const updatedItems = filteredItems.map((item) => {
      const priceRate = item?.Priceleveles.find(
        (item) => item.pricelevel === pricelevel
      )?.pricerate;
      console.log(priceRate);
      dispatch(addPriceRate({ ...item, selectedPriceRate: priceRate }));

      return {
        ...item,
        selectedPriceRate: priceRate,
      };
    });

    setItem(updatedItems);
  };

  //////////////////////////////////////////handlepriceRateChange/////////////////////////////////////////////

  const handlePriceRateChange = (e, _id) => {
    const newRate = Number(e.target.value);

    // Update the items with the new rate
    const updatedItems = filteredItems.map((item) =>
      item._id === _id ? { ...item, selectedPriceRate: newRate } : item
    );

    console.log(updatedItems);
    setItem(updatedItems);
    
  };

  ///////////////////////////handleIncrement///////////////////////////////////

  const handleIncrement = (_id) => {
    const updatedItems = [...item];
    const index = updatedItems.findIndex((item) => item._id === _id);

    const currentItem = { ...updatedItems[index] };

    console.log(currentItem.count);

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
        updatedItems[index] = { ...currentItem, added: false }; // Make a copy and update the 'added' property
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
    handleTotalChangeWithPriceLevel(selectedValue);
    // addSelectedRate(selectedValue);
  };

  /////////////////////////// calculateHeight ///////////////////////////////////

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 250;
      setListHeight(newHeight);
    };

    console.log(window.innerHeight);

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  const continueHandler = () => {
    if (selectedPriceLevel === "") {
      toast.error("Select a price level ");
    }
    console.log(location.state);
    if (location?.state?.from === "editInvoice") {
      navigate(`/sUsers/editInvoice/${location.state.id}`);
    } else {
      navigate("/sUsers/invoice");
    }
  };

  const backHandler = () => {
    navigate(-1);
    // if (location?.state?.from === "editInvoice") {
    //   navigate(`/sUsers/editInvoice/${location.state.id}`);
    // } else {
    //   navigate("/sUsers/invoice");
    // }
  };

  ///////////////////////////react window ///////////////////////////////////

  const Row = ({ index, style }) => {
    const el = filteredItems[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "170px",
    };
    return (
      <div
        style={adjustedStyle}
        key={index}
        className="flex flex-col bg-white shadow-lg  "
      >
        <div className=" p-4 py-2 pb-2  mt-4 flex justify-between items-center  rounded-sm cursor-pointer  ">
          <div className="flex items-start gap-3 md:gap-4  ">
            <div className="w-10 mt-1  uppercase h-10 rounded-lg bg-violet-200 flex items-center justify-center font-semibold text-gray-400">
              {el?.product_name?.slice(0, 1)}
            </div>
            <div className="flex flex-col font-bold text-sm md:text-sm  gap-1 leading-normal">
              <p>{el.product_name}</p>

              <div className="flex">
                <p className="text-red-500">STOCK : </p>
                <span>{el.balance_stock}</span>
              </div>
              <div>
                <span>Total : ₹ </span>
                <span>{el.total || 0}</span>
              </div>
            </div>
          </div>

          <div>
            <div
              className="px-4 py-2 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
              onClick={() => {
                el.added
                  ? navigate(`/sUsers/editItem/${el._id}`)
                  : handleAddClick(el._id);
              }}
            >
              {el.added ? "Edit" : "Add"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4">
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

          <div className="relative text-sm text-gray-500 ">
            <input
              onChange={(e) => handlePriceRateChange(e, el._id)}
              type="number"
              value={
                el.selectedPriceRate !== undefined ? el.selectedPriceRate : ""
              }
              placeholder="Rate"
              className="border-none pl-6  input-number text-center shadow-lg w-[100px]  focus:ring-0   "
            />
            <span className="  absolute left-3 top-1/2 transform -translate-y-1/2">
              ₹
            </span>{" "}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex relative">
      <div>
        <SidebarSec TAB={"invoice"} />
      </div>

      <div className="flex-1 bg-slate-50 h-screen overflow-y-scroll  ">
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
            className="bg-white text-sm font-semibold py-0 px-2 flex items-center justify-evenly z-20 w-full gap-2  "
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
              marginTop: "6px",
            }}
            className=""
            height={listHeight} // Specify the height of your list
            itemCount={filteredItems.length} // Specify the total number of items
            itemSize={190} // Specify the height of each item
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

export default AddItemSecondary;
