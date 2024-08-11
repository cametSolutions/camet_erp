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
import { setPriceLevel } from "../../../slices/salesSecondary";
import {
  changeTotal,
  setBrandInRedux,
  setCategoryInRedux,
  setSubCategoryInRedux,
  addAllProducts,
  updateItem,
} from "../../../slices/salesSecondary";
import { HashLoader } from "react-spinners";
import { VariableSizeList as List } from "react-window";
import { Decimal } from "decimal.js";
import SearchBar from "../../components/common/SearchBar";
import ProductDetails from "../../components/common/ProductDetails";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

function AddItemSalesSecondary() {
  const [item, setItem] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("");
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
  const [refresh, setRefresh] = useState(false);

  // const [godownname, setGodownname] = useState("");
  const [heights, setHeights] = useState({});

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

  // ///////////////////////////Godown name///////////////////////////////////


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
            params:{vanSale:false},
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
          if (updatedItems.length > 0) {
            fetchFilters();
          }

          setRefresh((prevRefresh) => !prevRefresh);
        } else {
          setItem(productData);
          if (productData.length > 0) {
            fetchFilters();
          }
          setRefresh((prevRefresh) => !prevRefresh);
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

  //////////////////////////////orgId////////////////////////////////

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  //////////////////////////////fetchFilters////////////////////////////////

  // useEffect(() => {
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
        // setBrands(brands);
        // setCategories(categories);
        // setSubCategories(subcategories);
        setPriceLevels(priceLevels);
        if (priceLevelFromRedux == "") {
          const defaultPriceLevel = priceLevels[0];
          dispatch(setPriceLevel(defaultPriceLevel));
        }
      } else {
        const { priceLevels, brands, categories, subcategories } = res.data;

        // setBrands(brands);
        // setCategories(categories);
        // setSubCategories(subcategories);

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

  console.log(filteredItems?.length);
  console.log(item?.length);

  //////////////////////////////////////////addSelectedRate initially not in redux/////////////////////////////////////////////

  const addSelectedRate = (pricelevel) => {
    if (item?.length > 0) {
      const updatedItems = filteredItems.map((item) => {
        const priceRate =
          item?.Priceleveles?.find(
            (priceLevelItem) => priceLevelItem.pricelevel === pricelevel
          )?.pricerate || 0;

        const reduxItem = itemsFromRedux.find((p) => p._id === item._id);
        // const reduxRate = reduxItem?.selectedPriceRate || null;

        // if (item?.hasGodownOrBatch) {
        const updatedGodownList = item.GodownList.map(
          (godownOrBatch, index) => {
            const reduxRateOfGodown =
              reduxItem?.GodownList?.[index]?.selectedPriceRate;
            return {
              ...godownOrBatch,
              selectedPriceRate:
                reduxRateOfGodown !== undefined ? reduxRateOfGodown : priceRate,
            };
          }
        );

        return {
          ...item,
          GodownList: updatedGodownList,
        };
      });

      setItem(updatedItems);
    }
  };

  console.log(item);

  useEffect(() => {
    addSelectedRate(selectedPriceLevel);
  }, [selectedPriceLevel, refresh]);

  ///////////////////////////calculateTotal///////////////////////////////////

  const calculateTotal = (item, selectedPriceLevel, situation = "normal") => {
    let priceRate = 0;
    if (situation === "priceLevelChange") {
      priceRate =
        item.Priceleveles.find(
          (level) => level.pricelevel === selectedPriceLevel
        )?.pricerate || 0;
    }

    let subtotal = 0;
    let individualTotals = [];

    if (item.hasGodownOrBatch) {
      item.GodownList.forEach((godownOrBatch, index) => {
        if (situation == "normal") {
          priceRate = godownOrBatch.selectedPriceRate;
        }
        let individualSubtotal = priceRate * Number(godownOrBatch.count) || 0;
        let discountedSubtotal = individualSubtotal;

        if (
          godownOrBatch.discount !== 0 &&
          godownOrBatch.discount !== undefined &&
          godownOrBatch.discount !== ""
        ) {
          discountedSubtotal = discountedSubtotal - godownOrBatch.discount;
        } else if (
          godownOrBatch.discountPercentage !== 0 &&
          godownOrBatch.discountPercentage !== undefined &&
          godownOrBatch.discountPercentage !== ""
        ) {
          discountedSubtotal -=
            (individualSubtotal * godownOrBatch.discountPercentage) / 100;
        }

        const gstAmount = (discountedSubtotal * (item.igst || 0)) / 100;

        subtotal += discountedSubtotal + gstAmount;

        const individualTotal = parseFloat(
          (discountedSubtotal + gstAmount).toFixed(2)
        );

        individualTotals.push({
          index,
          batch: godownOrBatch.batch,
          individualTotal,
        });
      });
    } else {
      if (situation == "normal") {
        priceRate = item.GodownList[0].selectedPriceRate;
      }
      let individualSubtotal = priceRate * Number(item.count);
      let discountedSubtotal = individualSubtotal;

      if (item.discount !== 0 && item.discount !== undefined) {
        discountedSubtotal -= item.discount;
      } else if (
        item.discountPercentage !== 0 &&
        item.discountPercentage !== undefined
      ) {
        discountedSubtotal -=
          (individualSubtotal * item.discountPercentage) / 100;
      }

      const gstAmount =
        (discountedSubtotal * (item.newGst || item.igst || 0)) / 100;

      subtotal += discountedSubtotal + gstAmount;

      const individualTotal = parseFloat(
        (discountedSubtotal + gstAmount).toFixed(2)
      );

      individualTotals.push({
        index: 0,
        batch: item.batch || "No batch",
        individualTotal,
      });
    }

    subtotal = parseFloat(subtotal.toFixed(2));

    return {
      individualTotals,
      total: subtotal,
    };
  };

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

        const totalData = calculateTotal(itemToUpdate, selectedPriceLevel);
        const updatedGodownListWithTotals = itemToUpdate.GodownList.map(
          (godown, index) => ({
            ...godown,
            individualTotal:
              totalData.individualTotals.find(({ index: i }) => i === index)
                ?.individualTotal || 0,
          })
        );
        itemToUpdate.GodownList = updatedGodownListWithTotals;

        itemToUpdate.total = totalData?.total || 0;
        itemToUpdate.added = true;

        dispatch(addItem(itemToUpdate));

        return itemToUpdate;
      }
      return item;
    });

    setItem(updatedItems);
    if (selectedPriceLevel === "") {
      navigate(`/sUsers/editItemSales/${_id}/${ "nil"}/${idx}`);
    }
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
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
        const updatedGodownListWithTotals = updatedGodownList.map(
          (godown, index) => ({
            ...godown,
            individualTotal:
              totalData.individualTotals.find(({ index: i }) => i === index)
                ?.individualTotal || 0,
          })
        );
        currentItem.GodownList = updatedGodownListWithTotals;
        currentItem.total = totalData.total; // Update the overall total
      } else {
        // Increment the count of the currentItem by 1
        currentItem.count = new Decimal(currentItem.count).add(1).toNumber();

        // Calculate totals and update individual total
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
        currentItem.total = totalData.total;
        currentItem.GodownList[0].individualTotal = totalData?.total; // Update the overall total
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
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
        const updatedGodownListWithTotals = updatedGodownList.map(
          (godown, index) => ({
            ...godown,
            individualTotal:
              totalData.individualTotals.find(({ index: i }) => i === index)
                ?.individualTotal || 0,
          })
        );
        currentItem.GodownList = updatedGodownListWithTotals;
        currentItem.total = totalData.total; // Update the overall total
      } else {
        currentItem.count = new Decimal(currentItem.count).sub(1).toNumber();

        // Ensure count does not go below 0
        if (currentItem.count <= 0) currentItem.added = false;

        // Calculate totals and update individual total
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
        // currentItem.individualTotal = totalData.total;
        currentItem.GodownList[0].individualTotal = totalData?.total;
        currentItem.total = totalData.total; // Update the overall total
      }

      dispatch(updateItem(currentItem)); // Log the updated currentItem
      // Log the updated currentItem
      return currentItem; // Return the updated currentItem
    });

    setItem(updatedItems); // Update the state with the updated items
  };

  ///////////////////////////handleTotalChangeWithPriceLevel///////////////////////////////////

  const handleTotalChangeWithPriceLevel = (pricelevel) => {
    const updatedItems = filteredItems.map((item) => {
      if (item.added === true) {
        const { individualTotals, total } = calculateTotal(
          item,
          pricelevel,
          "priceLevelChange"
        );

        dispatch(changeTotal({ ...item, total: total }));
        const newPriceRate =
          item?.Priceleveles.find(
            (priceLevelItem) => priceLevelItem.pricelevel === pricelevel
          )?.pricerate || 0;

        // if (item?.hasGodownOrBatch) {
        const updatedGodownList = item?.GodownList.map((godown, idx) => {
          return {
            ...godown,
            individualTotal:
              individualTotals.find((el) => el.index === idx)
                ?.individualTotal || 0,
            selectedPriceRate: newPriceRate,
          };
        });

        dispatch(
          updateItem({ ...item, GodownList: updatedGodownList, total: total })
        );
        return {
          ...item,
          GodownList: updatedGodownList,
          total: total,
        };
      }
      return item;
    });

    setItem(updatedItems);
  };

  ///////////////////////////handlePriceLevelChange///////////////////////////////////

  const handlePriceLevelChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedPriceLevel(selectedValue);
    dispatch(setPriceLevel(selectedValue));
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

  console.log(item);
  


  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [heights]);

  const getItemSize = (index) => {
    const product = item[index];
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

          {/* {el?.hasGodownOrBatch && (
            <div className="mt-1">
              <span className="text-gray-500 text-xs md:text-sm  ">
                Stock :{" "}
              </span>
              <span className="font-bold text-xs md:text-sm ">
                {el?.GodownList.reduce(
                  (acc, curr) => (acc += curr.balance_stock),
                  0
                ) || 0}
              </span>
            </div>
          )} */}

          {el?.added && el?.count && !el?.hasGodownOrBatch > 0 ? (
            <div className="flex items-center flex-col gap-2">
              {/* <Link
              // to={`/sUsers/editItem/${el?._id}`}
              to={{
                pathname: `/sUsers/editItem/${el?._id}`,
                state: { from: "addItem" },
              }}
            > */}

              {!el?.hasGodownOrBatch && (
                <>
                  <button
                    onClick={() => {
                      navigate(
                        `/sUsers/editItemSales/${el?._id}/${
                          "nil"
                        }/null`,
                        {
                          state: {
                            from: "editItemSales",
                            id: location?.state?.id,
                          },
                        }
                      );
                      // saveScrollPosition();
                    }}
                    type="button"
                    className="  mt-3  px-2 py-1  rounded-md border-violet-500 font-bold border  text-violet-500 text-xs"
                  >
                    Edit
                  </button>
                  <div
                    className="py-2 px-3 inline-block bg-white  "
                    data-hs-input-number
                  >
                    <div className="flex items-center gap-x-1.5">
                      <button
                        onClick={() => handleDecrement(el?._id)}
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
                        value={el?.count ? el?.count : 0} // Display the count from the state
                        data-hs-input-number-input
                      />
                      <button
                        onClick={() => {
                          handleIncrement(el?._id);
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
                </>
              )}
            </div>
          ) : (
            !el?.hasGodownOrBatch && (
              <div
                onClick={() => {
                  handleAddClick(el?._id);
                }}
                className="px-4 py-2 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
              >
                Add
              </div>
            )
          )}
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
              selectedPriceLevel={selectedPriceLevel}
              handleAddClick={handleAddClick}
              godownName="nil"
              details={el}
              setHeight={(height) => setHeight(index, height)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      <div className="flex-1 bg-slate-50 h-screen   ">
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
              marginTop: "6px",
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

export default AddItemSalesSecondary;
