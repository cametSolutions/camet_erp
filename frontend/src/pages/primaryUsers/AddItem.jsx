/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useMemo } from "react";
import Sidebar from "../../components/homePage/Sidebar";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import api from "../../api/api";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { useSelector } from "react-redux";
import { addItem, removeItem } from "../../../slices/invoice";
import { useDispatch } from "react-redux";
import { changeCount } from "../../../slices/invoice";
import { setPriceLevel } from "../../../slices/invoice";
import { changeTotal } from "../../../slices/invoice";
import { Dropdown } from "flowbite-react";
import { HashLoader } from "react-spinners";


function AddItem() {
  const [item, setItem] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [filterRefresh, setFilterRefresh] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setseleCtedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [search, setSearch] = useState("");
  const [priceLevels, setPriceLevels] = useState([]);
  const [loader, setLoader] = useState(false);

  const cpm_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  const itemsFromRedux = useSelector((state) => state.invoice.items);
  const priceLevelFromRedux =
    useSelector((state) => state.invoice.selectedPriceLevel) || "";

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      try {
        const res = await api.get("/api/pUsers/getProducts", {
          withCredentials: true,
        });

        if (itemsFromRedux.length > 0) {
          const reduxItemIds = itemsFromRedux.map((el) => el._id);
          const updatedItems = res.data.productData.map((product) => {
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
          setItem(res.data.productData);

          // if (priceLevelFromRedux === "") {
          //   const defaultPriceLevel =
          //     res.data.productData[0]?.Priceleveles[0]?.pricelevel;
          //   setSelectedPriceLevel(defaultPriceLevel);
          //   dispatch(setPriceLevel(defaultPriceLevel));
          // }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    };
    fetchProducts();
  }, [cpm_id]);

  useEffect(() => {
    const priceLevelSet = Array.from(
      new Set(
        item.flatMap((item) =>
          item?.Priceleveles.map((level) => level?.pricelevel)
        )
      )
    );
    setPriceLevels(priceLevelSet);

    if (priceLevelFromRedux === "") {
      const defaultPriceLevel = priceLevelSet[0];
      setSelectedPriceLevel(defaultPriceLevel);
      dispatch(setPriceLevel(defaultPriceLevel));
    }
  }, [item]);

  useEffect(() => {
    setSelectedPriceLevel(priceLevelFromRedux);
  }, []);
  useEffect(() => {
    if (itemsFromRedux.length > 0) {
      const updatedItems = item.map((currentItem) => {
        // Find the corresponding item in itemsFromRedux
        const matchingItem = itemsFromRedux.find(
          (el) => el._id === currentItem._id
        );
        if (matchingItem) {
          // If matching item found, return it with updated count and total
          return {
            ...currentItem,
            count: matchingItem.count,
            total: matchingItem.total,
            
          };
        } else {
          // If no matching item found, return the current item
          return currentItem;
        }
      });

      // Update the state with the modified items
      setItem(updatedItems);
    }
  }, [itemsFromRedux,refresh]);

  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await api.get(`/api/pUsers/fetchFilters/${orgId}`, {
          withCredentials: true,
        });

        const { brands, categories, subcategories } = res.data.data;

        setBrands(brands);
        setCategories(categories);
        setSubCategories(subcategories);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFilters();
  }, [orgId]);

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
  }, [item, selectedBrand, selectedCategory, selectedSubCategory, search,refresh]);

  ///////////////////////////handleAddClick///////////////////////////////////

  const handleAddClick = (index) => {
    const updatedItems = [...filteredItems]; // Create a shallow copy of the items
    const itemToUpdate = updatedItems[index];
    if (itemToUpdate) {
      // Toggle the 'added' state of the item
      itemToUpdate.added = !itemToUpdate.added;
      itemToUpdate.count = 1;
      const total = calculateTotal(itemToUpdate, selectedPriceLevel).toFixed(2);
      itemToUpdate.total = total;

      dispatch(changeTotal(itemToUpdate));
    }
    setItem(updatedItems);
    setRefresh(!refresh);
    dispatch(addItem(updatedItems[index]));
  };

  ///////////////////////////calculateTotal///////////////////////////////////

  const calculateTotal = (item, selectedPriceLevel) => {
    const priceRate =
      item.Priceleveles.find((level) => level.pricelevel === selectedPriceLevel)
        ?.pricerate || 0;

    let subtotal = priceRate * parseInt(item?.count);
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

  ///////////////////////////handleIncrement///////////////////////////////////

  const handleIncrement = (index) => {
    const updatedItems = [...filteredItems];
    const currentItem = { ...updatedItems[index] };

    if (!currentItem.count) {
      currentItem.count = 1;
    } else {
      currentItem.count += 1;
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
  const handleDecrement = (index) => {
    const updatedItems = [...filteredItems]; // Make a copy of the array
    const currentItem = { ...updatedItems[index] };

    // Decrement the count if it's greater than 0
    if (currentItem.count > 0) {
      currentItem.count -= 1;
      if (currentItem.count == 0) {
        dispatch(removeItem(currentItem));
        updatedItems[index].added=false
        return
      }

      // Use the calculateTotal function to calculate the total for the current item
      currentItem.total = calculateTotal(
        currentItem,
        selectedPriceLevel
      ).toFixed(2);
      console.log(currentItem.total);

      updatedItems[index] = currentItem; // Update the item in the copied array
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
  };

  return (
    <div className="flex relative">
      <div>
        <Sidebar TAB={"invoice"} />
      </div>

      <div className="flex-1 bg-slate-50 h-screen overflow-y-scroll  ">
        <div className="sticky top-0">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex justify-between  items-center gap-2  ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={() => {
                  navigate("/pUsers/invoice");
                }}
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
                  {/* {priceLevels.map((el, index) => (
                    <option key={index} value={el?.pricelevel}>
                      {el?.pricelevel}
                    </option>
                  ))} */}
                </select>
              </div>
              <MdOutlineQrCodeScanner className="text-white text-lg  cursor-pointer md:text-xl" />
            </div>
          </div>

          <div className=" px-3 py-2 bg-white drop-shadow-lg ">
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
                <div class="relative">
                  <input
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    type="search"
                    id="default-search"
                    className="block w-full p-2 text-sm text-gray-900 border  rounded-lg border-gray-300  bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search party by Item name..."
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
            </div>
          </div>

          <div className="bg-white text-sm font-semibold p-4 flex items-center  gap-10">
            <Dropdown
              label={selectedBrand === "" ? "Brand" : selectedBrand}
              inline
            >
              {brands.length > 0 ? (
                <>
                  <Dropdown.Item onClick={() => setSelectedBrand("")}>
                    All
                  </Dropdown.Item>
                  {brands.map((el, index) => (
                    <Dropdown.Item
                      onClick={() => setSelectedBrand(el)}
                      key={index}
                    >
                      {el}
                    </Dropdown.Item>
                  ))}
                </>
              ) : (
                <Dropdown.Item>No brands</Dropdown.Item>
              )}
            </Dropdown>

            <Dropdown
              label={selectedCategory === "" ? "Category" : selectedCategory}
              inline
            >
              {categories.length > 0 ? (
                <>
                  <Dropdown.Item onClick={() => setseleCtedCategory("")}>
                    All
                  </Dropdown.Item>
                  {categories.map((el, index) => (
                    <Dropdown.Item
                      onClick={() => setseleCtedCategory(el)}
                      key={index}
                    >
                      {el}
                    </Dropdown.Item>
                  ))}
                </>
              ) : (
                <Dropdown.Item>No Categories</Dropdown.Item>
              )}
            </Dropdown>
            <Dropdown
              label={
                selectedSubCategory === "" ? "Subcategory" : selectedSubCategory
              }
              inline
            >
              {subCategories.length > 0 ? (
                <>
                  <Dropdown.Item onClick={() => setSelectedSubCategory("")}>
                    All
                  </Dropdown.Item>
                  {subCategories.map((el, index) => (
                    <Dropdown.Item
                      onClick={() => setSelectedSubCategory(el)}
                      key={index}
                    >
                      {el}
                    </Dropdown.Item>
                  ))}
                </>
              ) : (
                <Dropdown.Item>No Subcategories</Dropdown.Item>
              )}
            </Dropdown>
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
          filteredItems.map((el, index) => (
            <div
              key={index}
              className="bg-white p-4 py-2 pb-6  mt-4 flex justify-between items-center  rounded-sm cursor-pointer border-b-2 "
            >
              <div className="flex items-start gap-3 md:gap-4  ">
                <div className="w-10 mt-1  uppercase h-10 rounded-lg bg-violet-200 flex items-center justify-center font-semibold text-gray-400">
                  {el.product_name.slice(0, 1)}
                </div>
                <div className="flex flex-col font-bold text-sm md:text-sm  gap-1 leading-normal">
                  <p>{el.product_name}</p>
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
                </div>
              </div>
              {el.added ? (
                <div className="flex items-center flex-col gap-2">
                  <Link to={`/pUsers/editItem/${el._id}`}>
                    <button className=" mt-3  px-2 py-1  rounded-md border-violet-500 font-bold border  text-violet-500 text-xs">
                      Edit
                    </button>
                  </Link>
                  <div
                    className="py-2 px-3 inline-block bg-white  "
                    data-hs-input-number
                  >
                    <div className="flex items-center gap-x-1.5">
                      <button
                        onClick={() => handleDecrement(index)}
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
                        className="p-0 w-6 bg-transparent border-0 text-gray-800 text-center focus:ring-0 "
                        type="text"
                        disabled
                        value={el.count ? el.count : 0} // Display the count from the state
                        data-hs-input-number-input
                      />
                      <button
                        onClick={() => {
                          handleIncrement(index);
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
                <div>
                  <div
                    className="px-4 py-2 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
                    onClick={() => handleAddClick(index)}
                  >
                    Add
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {item.length > 0 && (
          <Link to={"/pUsers/invoice"}>
            <div className="sticky bottom-0 bg-white  w-full flex justify-center p-3 border-t  ">
              <button
                // onClick={submitHandler}
                className="bg-violet-700  w-[85%] text-ld font-bold text-white p-2 rounded-md"
              >
                Continue
              </button>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

export default AddItem;
