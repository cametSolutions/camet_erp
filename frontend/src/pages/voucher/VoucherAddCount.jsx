// Import statements
import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAllProducts,
  addAllPriceLevels,
  setPriceLevel,
  updateItem,
  addItem,
} from "../../../slices/voucherSlices/commonVoucherSlice";
import SearchBar from "@/components/common/SearchBar";
import VoucherProductLIst from "./VoucherProductLIst";
import Filter from "@/pages/voucher/Filter";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import { useNavigate } from "react-router-dom";
import { store } from "../../../app/store";
import BarcodeScan from "@/components/secUsers/barcodeScanning/BarcodeScan";
import Decimal from "decimal.js";
import { MdOutlineQrCodeScanner } from "react-icons/md";

/**
 * VoucherAddCount Component
 *
 * This component manages product selection for vouchers, handling:
 * - Product data loading with pagination and search
 * - Price level selection and application
 * - State synchronization with Redux
 * - Updates to product quantities and stock balances
 */
function VoucherAddCount() {
  // ===================================
  // State Management
  // ===================================
  const [items, setItems] = useState([]); // Current displayed products
  const [priceLevels, setPriceLevels] = useState([]); // Available price levels
  const [loader, setLoader] = useState(false); // Main loading state
  const [refresh, setRefresh] = useState(false); // Trigger for component refresh
  const [page, setPage] = useState(1); // Current page for pagination
  const [hasMore, setHasMore] = useState(true); // Whether more products can be loaded
  const [isLoading, setIsLoading] = useState(false); // Loading state for pagination
  const [searchTerm, setSearchTerm] = useState(""); // Current search term
  const [pricesLoaded, setPricesLoaded] = useState(false); // Whether price levels are loaded
  const [isScanOn, setIsScanOn] = useState(false); // Barcode scanning state

  const listRef = useRef(null);

  // Reference for search debounce
  const searchTimeoutRef = useRef(null);
  const limit = 30; // Number of products per page

  ////Navigation
  const navigate = useNavigate();

  // ===================================
  // Redux Integration
  // ===================================
  const dispatch = useDispatch();

  // Get organization data from Redux
  const {
    _id: cmp_id,
    configurations,
    type,
  } = useSelector((state) => state.secSelectedOrganization.secSelectedOrg);
  const { addRateWithTax } = configurations[0];
  const taxInclusive = addRateWithTax["sale"] || false;

  // Get sales data from Redux
  const {
    items: itemsFromRedux,
    selectedPriceLevel: selectedPriceLevelFromRedux,
    products: allProductsFromRedux,
    priceLevels: priceLevelsFromRedux,
    page: pageNumberFromRedux,
    hasMore: hasMoreFromRedux,
  } = useSelector((state) => state.commonVoucherSlice);

  // ===================================
  // Search Functionality
  // ===================================

  /**
   * Debounced search function
   * Waits 500ms after typing stops before applying search
   */
  const searchData = (data) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // First, update Redux to clear products
      dispatch(
        addAllProducts({
          page: 0, // Set to 0 not 1
          hasMore: true,
          products: [],
        })
      );

      // Then update component state
      setSearchTerm(data);
      setIsLoading(false);
      setPage(1);
      setItems([]);
      setHasMore(true);

      // Now fetch with a slight delay to ensure Redux state is updated
      setTimeout(() => {
        fetchProducts(1, data);
      }, 0);
    }, 500);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ===================================
  // Data Fetching & Processing
  // ===================================

  /**
   * Fetch products with pagination and search support
   * Uses cached data from Redux when available
   */

  const fetchProducts = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      // Skip if already loading or price levels not yet loaded

      if (isLoading || !pricesLoaded) return;

      setLoader(pageNumber === 1);

      try {
        setIsLoading(true);

        // Get the CURRENT Redux state rather than using the closure value
        const currentReduxState = store.getState().commonVoucherSlice;
        const currentProducts = currentReduxState.products;
        const currentPageNumber = currentReduxState.page;

        // Use cached data from Redux if available for this page
        if (currentPageNumber >= pageNumber && currentProducts.length > 0) {
          setItems(currentProducts);
          setHasMore(hasMoreFromRedux);
          processItemsWithRedux();
          setIsLoading(false);
          setLoader(false);
          return;
        }

        // Prepare query parameters
        const params = new URLSearchParams({
          page: pageNumber,
          limit,
          vanSale: false,
          taxInclusive: taxInclusive,
          // search: searchTerm,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        // Fetch products from API
        const res = await api.get(
          `/api/sUsers/getProducts/${cmp_id}?${params}`,
          {
            withCredentials: true,
          }
        );

        const productData = res.data.productData;

        // Add selected price rate to each product
        const productsWithPriceRates = productData.map((productItem) => {
          const priceRate =
            productItem?.Priceleveles?.find(
              (priceLevelItem) =>
                priceLevelItem.pricelevel === selectedPriceLevelFromRedux?._id
            )?.pricerate || 0;

          const updatedGodownList = productItem.GodownList.map(
            (godownOrBatch) => ({
              ...godownOrBatch,
              selectedPriceRate: priceRate,
            })
          );

          return {
            ...productItem,
            GodownList: updatedGodownList,
          };
        });

        // Update state based on whether this is the first page or not
        if (pageNumber === 1) {
          setItems(productsWithPriceRates);
        } else {
          setItems((prevItems) => [...prevItems, ...productsWithPriceRates]);
        }

        // Store in Redux for future use
        dispatch(
          addAllProducts({
            products: productsWithPriceRates,
            page: pageNumber,
            hasMore: res.data.pagination.hasMore,
          })
        );

        // Update pagination state
        setHasMore(res.data.pagination.hasMore);
        setPage(pageNumber);

        // Process items with any existing Redux data
        processItemsWithRedux(productsWithPriceRates);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [
      cmp_id,
      selectedPriceLevelFromRedux,
      dispatch,
      pageNumberFromRedux,
      allProductsFromRedux,
      hasMoreFromRedux,
      isLoading,
      pricesLoaded,
    ]
  );

  /**
   * Update fetched products with any existing data from Redux
   * Ensures selected quantities and other user selections are preserved
   */
  const processItemsWithRedux = () => {
    // Get the CURRENT Redux state rather than using the closure value
    const currentReduxState = store.getState().commonVoucherSlice;
    const itemsFromRedux = currentReduxState?.items || [];
    const productsFromRedux = currentReduxState?.products || [];
    if (itemsFromRedux.length > 0) {
      const reduxItemIds = itemsFromRedux.map((item) => item?._id);
      const processedItems = productsFromRedux.map((product) => {
        // Skip items not in Redux (not selected by user)
        if (!reduxItemIds.includes(product._id)) {
          return product;
        }

        const reduxItem = itemsFromRedux.find(
          (item) => item._id === product._id
        );

        // Different handling based on whether item has batches/godowns
        if (reduxItem.hasGodownOrBatch) {
          return updateItemWithBatchOrGodown(reduxItem, product);
        } else {
          return updateSimpleItem(reduxItem, product);
        }
      });

      setItems(processedItems);
    }
  };

  /**
   * Update an item with batch or godown data from Redux
   * Preserves user selections while updating stock balances
   */
  const updateItemWithBatchOrGodown = (reduxItem, product) => {
    const updatedGodownList = reduxItem?.GodownList?.map((godown) => {
      let matchedGodown;

      // Find matching godown/batch based on different identifiers
      if (godown.batch && !godown.godown_id) {
        matchedGodown = product?.GodownList?.find(
          (g) => g?.batch === godown?.batch
        );
      } else if (godown.godown_id && !godown.batch) {
        matchedGodown = product?.GodownList?.find(
          (g) => g?.godown_id === godown?.godown_id
        );
      } else if (godown.godown_id && godown.batch) {
        matchedGodown = product?.GodownList?.find(
          (g) =>
            g?.godown_id === godown?.godown_id && g?.batch === godown?.batch
        );
      }

      // Update balance stock if match found
      if (matchedGodown) {
        return { ...godown, balance_stock: matchedGodown.balance_stock };
      }

      return godown;
    });

    return { ...reduxItem, GodownList: updatedGodownList };
  };

  /**
   * Update a simple item without batch/godown complexity
   * Only updates the stock balance
   */
  const updateSimpleItem = (reduxItem, product) => {
    const matchedGodown = product?.GodownList?.[0];
    const newBalanceStock = matchedGodown?.balance_stock;

    const updatedGodownList = reduxItem.GodownList.map((godown) => ({
      ...godown,
      balance_stock: newBalanceStock,
    }));

    return { ...reduxItem, GodownList: updatedGodownList };
  };

  // ===================================
  // Effects & Lifecycle Methods
  // ===================================

  // Sync page number with Redux on initial load
  useEffect(() => {
    if (pageNumberFromRedux > 0) {
      setPage(pageNumberFromRedux);
    }
  }, [pageNumberFromRedux]);
  /**
   * Fetch price levels from API or Redux
   * Price levels must be loaded before products can be fetched
   */
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoader(true);

        // Use price levels from Redux if available
        if (priceLevelsFromRedux.length > 0) {
          setPriceLevels(priceLevelsFromRedux);
          setPricesLoaded(true);
          setLoader(false);
          return;
        }

        // Select API endpoint based on organization type
        const endpoint = `/api/sUsers/fetchFilters/${cmp_id}`;

        const res = await api.get(endpoint, { withCredentials: true });
        
      
        const { priceLevels } = res?.data?.data || [];

        

        // Update state and Redux
        setPriceLevels(priceLevels);
        dispatch(addAllPriceLevels(priceLevels));

        // Set default price level
        const defaultPriceLevel = priceLevels[0];
        
        dispatch(setPriceLevel(defaultPriceLevel));

        setPricesLoaded(true);
        setLoader(false);
      } catch (error) {
        console.error("Error fetching filters:", error);
        setLoader(false);
      }
    };

    fetchFilters();
  }, [cmp_id, type, dispatch, priceLevelsFromRedux]);

  // Handle search term changes by resetting pagination
  useEffect(() => {
    if (pricesLoaded) {
      fetchProducts(1, "");
    }
  }, [pricesLoaded]);

  /**
   * Apply selected price level rates to all products
   * Updates displayed prices when price level changes
   */
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
    let totalCess = 0; // Track total cess amount

    if (item.hasGodownOrBatch) {
      item.GodownList.forEach((godownOrBatch, index) => {
        if (situation === "normal") {
          priceRate = godownOrBatch.selectedPriceRate;
        }
        const quantity = Number(godownOrBatch.count) || 0;
        const igstValue = Math.max(item.igst || 0, 0);

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
          godownOrBatch.discountType === "percentage" &&
          godownOrBatch.discountPercentage !== 0 &&
          godownOrBatch.discountPercentage !== undefined &&
          godownOrBatch.discountPercentage !== ""
        ) {
          // Percentage discount
          const discountAmount =
            (taxBasePrice * godownOrBatch.discountPercentage) / 100;

          discountedPrice = taxBasePrice - discountAmount;
        } else if (
          godownOrBatch.discount !== 0 &&
          godownOrBatch.discount !== undefined &&
          godownOrBatch.discount !== ""
        ) {
          // Fixed amount discount (default)
          discountedPrice = taxBasePrice - godownOrBatch.discount;
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
          parseFloat(
            (discountedPrice + taxAmount + totalCessAmount).toFixed(2)
          ),
          0
        );

        subtotal += individualTotal;
        totalCess += totalCessAmount;

        individualTotals.push({
          index,
          batch: godownOrBatch.batch,
          individualTotal,
          cessAmount: totalCessAmount,
        });
      });
    } else {
      if (situation === "normal") {
        priceRate = item.GodownList[0].selectedPriceRate;
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

      individualTotals.push({
        index: 0,
        batch: item.batch || "No batch",
        individualTotal,
        cessAmount: totalCessAmount,
      });
    }

    subtotal = Math.max(parseFloat(subtotal.toFixed(2)), 0);

    return {
      individualTotals,
      total: subtotal,
      totalCess: totalCess,
    };
  };

  const addSelectedRate = (pricelevel) => {
    if (!items || items.length === 0) return;

    const updatedItems = items.map((item) => {
      const newPriceRate =
        item?.Priceleveles?.find(
          (priceLevelItem) => priceLevelItem.pricelevel === pricelevel
        )?.pricerate || 0;

      // Clone the item deeply
      const itemToUpdate = { ...item, GodownList: [...item.GodownList] };

      // Update all godowns with new price rate
      itemToUpdate.GodownList = itemToUpdate.GodownList.map((godown) => ({
        ...godown,
        selectedPriceRate: newPriceRate,
      }));

      // If the item is added, also calculate totals
      if (item.added === true) {
        const totalData = calculateTotal(
          itemToUpdate,
          pricelevel,
          "priceLevelChange"
        );

        itemToUpdate.GodownList = itemToUpdate.GodownList.map(
          (godown, idx) => ({
            ...godown,
            individualTotal:
              totalData.individualTotals.find((el) => el.index === idx)
                ?.individualTotal || 0,
          })
        );

        itemToUpdate.total = totalData.total;
        dispatch(updateItem({ item: itemToUpdate }));
      }

      return itemToUpdate;
    });

    setItems(updatedItems);
  };
  // Update items when price level changes
  useEffect(() => {
    if (pricesLoaded) {
      addSelectedRate(selectedPriceLevelFromRedux);
    }
  }, [selectedPriceLevelFromRedux, refresh, pricesLoaded]);

  ("");

  // ===================================
  // Barcode Management
  // ===================================

  //// we are defining handle increment (which can be jst call it in child) in parent because we need to call it in parent for barcode scanning
  const handleIncrement = (_id, godownIndex = null, moveToTop = false) => {
    const updatedItems = items.map((item) => {
      if (item._id !== _id) return item; // Skip if not the target item

      // Create a deep copy of the item
      const currentItem = structuredClone(item);

      // Handle godown/batch specific increment
      if (currentItem?.hasGodownOrBatch && godownIndex !== null) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };

        // Increment count with Decimal.js for precision
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .add(1)
          .toNumber();
        godownOrBatch.actualCount = godownOrBatch.count;

        // Update the specific godown/batch in the GodownList
        const updatedGodownList = currentItem.GodownList.map((godown, index) =>
          index === godownIndex ? godownOrBatch : godown
        );
        currentItem.GodownList = updatedGodownList;

        // Calculate the sum of all counts in the GodownList
        const sumOfCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.count || 0),
          0
        );
        const sumOfActualCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.actualCount || 0),
          0
        );

        // Update the item's overall counts
        currentItem.count = sumOfCounts;
        currentItem.actualCount = sumOfActualCounts;

        // Calculate totals and update individual batch totals
        const totalData = calculateTotal(
          currentItem,
          selectedPriceLevelFromRedux
        );
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
        // Handle simple item increment (no godown/batch)
        currentItem.count = new Decimal(currentItem.count).add(1).toNumber();
        currentItem.actualCount = currentItem.count;

        // Calculate totals and update
        const totalData = calculateTotal(
          currentItem,
          selectedPriceLevelFromRedux
        );
        currentItem.total = totalData.total;
        currentItem.GodownList[0].individualTotal = totalData?.total;
      }

      // Dispatch the updated item to Redux
      dispatch(updateItem({ item: currentItem, moveToTop }));
      return currentItem;
    });

    // Handle moving the updated item to the top of the list if requested
    if (moveToTop) {
      const updatedItemIndex = updatedItems.findIndex((el) => el._id === _id);
      if (updatedItemIndex !== -1) {
        const [updatedItem] = updatedItems.splice(updatedItemIndex, 1);
        setItems([updatedItem, ...updatedItems]); // Move to top
      } else {
        setItems(updatedItems);
      }
    } else {
      setItems(updatedItems);
    }
  };

  /// handling button click for toggling between scanning and not scanning

  const handleBarcodeButtonClick = () => {
    if (!isScanOn) {
      setIsScanOn(true);
      dispatch(
        addAllProducts({
          page: 1,
          hasMore: true,
          products: [],
        })
      );
      setItems(itemsFromRedux);
    } else {
      setIsScanOn(false);
      fetchProducts(1, "");
    }
  };

  //// Handling barcode scanned products

  const handleBarcodeScanProducts = (searchResult) => {
    if (searchResult.length === 0) {
      return;
    }

    let scannedItem = structuredClone(searchResult[0]);

    // Finding price rate
    const priceRate =
      scannedItem?.Priceleveles?.find(
        (priceLevelItem) =>
          priceLevelItem.pricelevel === selectedPriceLevelFromRedux
      )?.pricerate || 0;

    if (scannedItem?.hasGodownOrBatch) {
      scannedItem.isExpanded = true;
      scannedItem?.GodownList.forEach(
        (godown) => (godown.selectedPriceRate = priceRate)
      );

      // Check if the item already exists
      let isItemExistIndex = items?.findIndex(
        (el) => el._id === scannedItem._id
      );

      if (isItemExistIndex !== -1) {
        // Move the existing item to the top
        // Move the existing item to the top
        const [existingItem] = items.splice(isItemExistIndex, 1);

        // Create a new object with updated properties
        const updatedItem = { ...existingItem, isExpanded: true };
        setItems([updatedItem, ...items]);
        listRef.current.resetAfterIndex(0);
      } else {
        // Add the scanned item to the top if it doesn't exist
        setItems((prevResults) => [scannedItem, ...prevResults]);
      }
    } else {
      // Check if the item already exists
      let isItemExistIndex = items?.findIndex(
        (el) => el._id === scannedItem._id
      );

      if (isItemExistIndex !== -1) {
        // Increment the count and move to the top
        handleIncrement(scannedItem._id, null, true);
      } else {
        // Add the new item
        scannedItem.added = true;
        scannedItem.GodownList[0].selectedPriceRate = Number(priceRate);
        scannedItem.GodownList[0].individualTotal = Number(priceRate);
        scannedItem.count = 1;
        scannedItem.total = Number(priceRate);
        setItems((prevResults) => [scannedItem, ...prevResults]);
        dispatch(addItem({ payload: scannedItem, moveToTop: true }));
      }
    }
  };

  // ===================================
  // Render Component
  // ===================================

  console.log(priceLevels);
  

  return (
    <div className="h-screen overflow-y-auto">
      <TitleDiv
        title={"Add Item"}
        from="/sUsers/sales"
        rightSideContentOnClick={() => {
          handleBarcodeButtonClick();
        }}
        rightSideContent={<MdOutlineQrCodeScanner size={20} />}
      />
      {/* <SearchBar onType={searchData} /> */}
      {isScanOn ? (
        <div className="relative z-50">
          {" "}
          {/* Added z-index */}
          <BarcodeScan handleBarcodeScanProducts={handleBarcodeScanProducts} />
        </div>
      ) : (
        <SearchBar onType={searchData} />
      )}
      <Filter addAllProducts={addAllProducts} priceLevels={priceLevels} />

      {loader && <CustomBarLoader />}

      <VoucherProductLIst
        items={items}
        loader={loader}
        setItems={setItems}
        selectedPriceLevel={selectedPriceLevelFromRedux}
        hasMore={hasMore}
        isLoading={isLoading}
        page={page}
        fetchProducts={fetchProducts}
        searchTerm={searchTerm}
        setRefresh={setRefresh}
        calculateTotal={calculateTotal}
        handleIncrement={handleIncrement}
        isScanOn={isScanOn}
        listRef={listRef}
      />

      {items.length > 0 && !loader && (
        <div className=" sticky bottom-0 bg-white  w-full flex justify-center p-3 border-t h-[70px] z-50 ">
          <button
            onClick={() => navigate(-1)}
            className="bg-violet-700  w-full  text-ld font-bold text-white p-2 rounded-sm "
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

export default VoucherAddCount;
