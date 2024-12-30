/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
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
import { Decimal } from "decimal.js";
import AdditemOfSale from "../../components/secUsers/main/AdditemOfSale";

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
  // const location = useLocation();

  // ///////////////////////////Godown name///////////////////////////////////

  const searchData = useCallback((data) => {
    setSearch(data);

    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, []);
  ///////////////////////////fetchProducts///////////////////////////////////

  useEffect(() => {
    const fetchProducts = async () => {
      setLoader(true);
      let productData;

      try {
        if (allProductsFromRedux.length === 0) {
          const res = await api.get(`/api/sUsers/getProducts/${cpm_id}`, {
            params: { vanSale: false, taxInclusive: true },
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
          setSelectedPriceLevel(defaultPriceLevel);
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

          // console.log("defaultPriceLevel", defaultPriceLevel);
          
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

        const gstAmount = item?.isTaxInclusive
          ? 0
          : (discountedSubtotal * (item.igst || 0)) / 100;

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

      const gstAmount = item?.isTaxInclusive
        ? 0
        : (discountedSubtotal * (item.newGst || item.igst || 0)) / 100;

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


  //// for find tax rate////////

  const findTaxRate = (item) => {

    

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
    if (
      selectedPriceLevel === "" ||
      selectedPriceLevel === undefined ||
      priceLevels.length === 0
    ) {
      navigate(`/sUsers/editItemSales/${_id}/${"nil"}/${idx}`);
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


  return (
    <AdditemOfSale
      tab={"Sales"}
      filteredItems={filteredItems}
      handleDecrement={handleDecrement}
      listRef={listRef}
      heights={heights}
      selectedPriceLevel={selectedPriceLevel}
      setHeight={setHeight}
      backHandler={backHandler}
      handlePriceLevelChange={handlePriceLevelChange}
      priceLevels={priceLevels}
      searchData={searchData}
      selectedBrand={selectedBrand}
      setSelectedBrand={setSelectedBrand}
      dispatch={dispatch}
      setBrandInRedux={setBrandInRedux}
      brands={brands}
      categories={categories}
      selectedCategory={selectedCategory}
      setseleCtedCategory={setseleCtedCategory}
      setCategoryInRedux={setCategoryInRedux}
      selectedSubCategory={selectedSubCategory}
      setSelectedSubCategory={setSelectedSubCategory}
      setSubCategoryInRedux={setSubCategoryInRedux}
      subCategories={subCategories}
      loader={loader}
      listHeight={listHeight}
      getItemSize={getItemSize}
      scrollPosition={scrollPosition}
      setScrollPosition={setScrollPosition}
      continueHandler={continueHandler}
      item={item}
      handleExpansion={handleExpansion}
      handleIncrement={handleIncrement}
      handleAddClick={handleAddClick}
      addAllProducts={addAllProducts}
    />
  );
}

export default AddItemSalesSecondary;
