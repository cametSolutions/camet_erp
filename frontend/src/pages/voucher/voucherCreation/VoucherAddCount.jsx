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
} from "../../../../slices/voucherSlices/commonVoucherSlice";
import SearchBar from "@/components/common/SearchBar";
import VoucherProductLIst from "./VoucherProductLIst";
import Filter from "@/pages/voucher/voucherCreation/Filter";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import { useNavigate } from "react-router-dom";
import { store } from "../../../../app/store";
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
  const { enableNegativeStockBlockForVanInvoice } = configurations[0];

  // Get sales data from Redux
  const {
    items: itemsFromRedux,
    selectedPriceLevel: selectedPriceLevelFromRedux,
    products: allProductsFromRedux,
    priceLevels: priceLevelsFromRedux,
    page: pageNumberFromRedux,
    hasMore: hasMoreFromRedux,
    voucherType: voucherTypeFromRedux,
    stockTransferToGodown,
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
          vanSale: voucherTypeFromRedux === "vanSale" ? true : false,
          taxInclusive: taxInclusive,
          // search: searchTerm,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        if (
          voucherTypeFromRedux === "stockTransfer" &&
          Object.keys(stockTransferToGodown)?.length > 0
        ) {
          params.append("excludeGodownId", stockTransferToGodown?._id);
        }

        ///// if voucher Type is sale order ,then we don not need to differentiate between has godown or batch or not
        //// all are considered as normal no godown and batch products so add it in params

        if (voucherTypeFromRedux === "saleOrder") {
          params.append("saleOrder", true);
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
                priceLevelItem._id === selectedPriceLevelFromRedux?._id
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
      if (reduxItem?.batchEnabled && !reduxItem?.gdnEnabled) {
        matchedGodown = product?.GodownList?.find(
          (g) => g?.batch === godown?.batch
        );
      } else if (!reduxItem?.batchEnabled && reduxItem?.gdnEnabled) {
        matchedGodown = product?.GodownList?.find(
          (g) => g?.godownMongoDbId === godown?.godownMongoDbId
        );
      } else if (reduxItem?.batchEnabled && reduxItem?.gdnEnabled) {
        matchedGodown = product?.GodownList?.find(
          (g) =>
            g?.godownMongoDbId === godown?.godownMongoDbId &&
            g?.batch === godown?.batch
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
        if (priceLevelsFromRedux !== null) {
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
        let defaultPriceLevel;

        // purchase does not need the price level ,it is manually typed

        if (voucherTypeFromRedux === "purchase" || voucherTypeFromRedux === "stockTransfer") {
          defaultPriceLevel = {
            _id: null,
            name: null,
          };
        } else {
          defaultPriceLevel = priceLevels[0];
        }

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
        item.Priceleveles.find((level) => level._id === selectedPriceLevel?._id)
          ?.pricerate || 0;
    }

    let subtotal = 0;
    let individualTotals = [];
    let totalCessAmt = 0; // Track total standard cess amount
    let totalAdditionalCessAmt = 0; // Track total additional cess amount
    let totalCgstAmt = 0; // Track total CGST amount
    let totalSgstAmt = 0; // Track total SGST amount
    let totalIgstAmt = 0; // Track total IGST amount
    let totalTaxableAmount = 0; // Track total taxable amount (before tax)

    item.GodownList.forEach((godownOrBatch, index) => {
      if (situation === "normal") {
        priceRate = godownOrBatch.selectedPriceRate;
      }
      const quantity = Number(godownOrBatch.count) || 0;
      const igstValue = Math.max(item.igst || 0, 0);
      const cgstValue = Math.max(item.cgst || 0, 0);
      const sgstValue = Math.max(item.sgst || 0, 0);

      // Calculate base price based on tax inclusivity
      let basePrice = priceRate * quantity;
      let taxBasePrice = basePrice;

      // For tax inclusive prices, calculate the base price without tax
      // in the end of this function we are adding is tax inclusive in the godown also ,so add that for further references
      if (item?.isTaxInclusive || godownOrBatch.isTaxInclusive) {
        // Use total tax rate (IGST or CGST+SGST)
        const totalTaxRate = igstValue || 0;
        taxBasePrice = Number(
          (basePrice / (1 + totalTaxRate / 100)).toFixed(2)
        );
      }

      // Calculate discount based on discountType
      let discountedPrice = taxBasePrice;
      let discountAmount = 0;
      let discountPercentage = 0;
      let discountType = godownOrBatch.discountType || "none";

      if (discountType === "percentage" && godownOrBatch.discountPercentage) {
        // Percentage discount - the percentage stays the same, amount is calculated
        discountPercentage = Number(godownOrBatch.discountPercentage) || 0;
        discountAmount = Number(
          ((taxBasePrice * discountPercentage) / 100).toFixed(2)
        );
      } else if (discountType === "amount" && godownOrBatch.discountAmount) {
        // Fixed amount discount - the amount stays the same, percentage is calculated
        discountAmount = Number(godownOrBatch.discountAmount) || 0;
        // Calculate the equivalent percentage
        discountPercentage =
          taxBasePrice > 0
            ? Number(((discountAmount / taxBasePrice) * 100).toFixed(2))
            : 0;
      }

      discountedPrice = taxBasePrice - discountAmount;

      // This is the taxable amount (price after discount, before tax)
      const taxableAmount = discountedPrice;
      totalTaxableAmount += taxableAmount;

      // Calculate cess amounts
      let cessAmount = 0;
      let additionalCessAmount = 0;

      // Standard cess calculation
      if (item.cess && item.cess > 0) {
        cessAmount = Number((taxableAmount * (item.cess / 100)).toFixed(2));
      }

      // Additional cess calculation - calculated as quantity * addl_cess
      if (item.addl_cess && item.addl_cess > 0) {
        additionalCessAmount = Number((quantity * item.addl_cess).toFixed(2));
      }

      // Combine cess amounts
      const totalCessAmount = Number(
        (cessAmount + additionalCessAmount).toFixed(2)
      );

      // Calculate tax amounts
      let cgstAmt = 0;
      let sgstAmt = 0;
      let igstAmt = 0;

      igstAmt = Number((taxableAmount * (igstValue / 100)).toFixed(2));
      cgstAmt = Number((taxableAmount * (cgstValue / 100)).toFixed(2));
      sgstAmt = Number((taxableAmount * (sgstValue / 100)).toFixed(2));

      // Calculate total tax amount
      // const taxAmount = Number((cgstAmt + sgstAmt + igstAmt).toFixed(2));

      // Calculate total including tax and cess
      const individualTotal = Math.max(
        Number((taxableAmount + igstAmt + totalCessAmount).toFixed(2)),
        0
      );

      subtotal += individualTotal;
      totalCessAmt += cessAmount;
      totalAdditionalCessAmt += additionalCessAmount;
      totalCgstAmt += cgstAmt;
      totalSgstAmt += sgstAmt;
      totalIgstAmt += igstAmt;

      individualTotals.push({
        index,
        basePrice: taxBasePrice, // Original price × quantity before discount
        discountAmount, // Discount amount
        discountPercentage, // Discount percentage
        discountType:
          godownOrBatch.discountType ||
          (godownOrBatch.discount
            ? "amount"
            : godownOrBatch.discountPercentage
            ? "percentage"
            : "none"),
        taxableAmount, // Amount after discount, before tax (basis for tax calculation)
        cgstValue, // CGST percentage
        sgstValue, // SGST percentage
        igstValue, // IGST percentage
        cessValue: item.cess || 0, // Standard cess percentage
        addlCessValue: item.addl_cess || 0, // Additional cess per quantity
        cgstAmount: cgstAmt, // CGST amount
        sgstAmount: sgstAmt, // SGST amount
        igstAmount: igstAmt, // IGST amount
        cessAmount: cessAmount, // Standard cess amount (percentage based)
        additionalCessAmount, // Additional cess amount (quantity based)
        individualTotal, // Final amount including taxes and cess
        quantity, // Quantity
        isTaxInclusive: item?.isTaxInclusive || false, // Tax inclusive flag
        // rate: priceRate, // Unit price
      });
    });

    subtotal = Math.max(parseFloat(subtotal.toFixed(2)), 0);
    totalCgstAmt = parseFloat(totalCgstAmt.toFixed(2));
    totalSgstAmt = parseFloat(totalSgstAmt.toFixed(2));
    totalIgstAmt = parseFloat(totalIgstAmt.toFixed(2));
    totalCessAmt = parseFloat(totalCessAmt.toFixed(2));
    totalAdditionalCessAmt = parseFloat(totalAdditionalCessAmt.toFixed(2));
    totalTaxableAmount = parseFloat(totalTaxableAmount.toFixed(2));

    return {
      individualTotals, // Detailed breakdown of each godown/batch
      total: subtotal, // Grand total including all taxes and cess
      totalTaxableAmount, // Total amount on which tax is calculated
      totalCessAmt, // Total standard cess amount
      totalAdditionalCessAmt, // Total additional cess amount
      // totalCessAmount: totalCessAmt + totalAdditionalCessAmt, // Combined total cess
      totalCgstAmt, // Total CGST amount
      totalSgstAmt, // Total SGST amount
      totalIgstAmt, // Total IGST amount
      totalTaxAmount: totalCgstAmt + totalSgstAmt + totalIgstAmt, // Total tax amount (convenience field)
    };
  };

  const addSelectedRate = (pricelevel) => {
    if (!items || items.length === 0) return;

    const updatedItems = items.map((item) => {
      const newPriceRate =
        item?.Priceleveles?.find(
          (priceLevelItem) => priceLevelItem?._id === pricelevel?._id
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

        itemToUpdate.GodownList = itemToUpdate.GodownList.map((godown, idx) => {
          const matching = totalData.individualTotals.find(
            (el) => el.index === idx
          );

          if (!matching) {
            return {
              ...godown,
              individualTotal: 0,
            };
          }

          // eslint-disable-next-line no-unused-vars
          const { index: _, quantity: __, ...rest } = matching;

          return {
            ...godown,
            ...rest,
          };
        });

        itemToUpdate.total = totalData?.total || 0;
        itemToUpdate.totalCgstAmt = totalData?.totalCgstAmt || 0;
        itemToUpdate.totalSgstAmt = totalData?.totalSgstAmt || 0;
        itemToUpdate.totalIgstAmt = totalData?.totalIgstAmt || 0;
        itemToUpdate.totalCessAmt = totalData?.totalCessAmt || 0;
        itemToUpdate.totalAddlCessAmt = totalData?.totalAdditionalCessAmt || 0;
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
  const handleIncrement = (_id, godownIndex = 0, moveToTop = false) => {
    const updatedItems = items.map((item) => {
      if (item._id !== _id) return item; // Skip if not the target item

      // Create a deep copy of the item
      const currentItem = structuredClone(item);
      // Handle godown/batch specific increment
      if (godownIndex !== null) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };

        // Increment count with Decimal.js for precision
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .add(1)
          .toNumber();
        godownOrBatch.actualCount = godownOrBatch.count;

        if (
          godownOrBatch?.count > godownOrBatch?.balance_stock &&
          voucherTypeFromRedux === "vanSale" &&
          enableNegativeStockBlockForVanInvoice
        ) {
          return currentItem; // Skip if balance stock is 0
        }

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
        currentItem.totalCount = sumOfCounts;
        currentItem.totalActualCount = sumOfActualCounts;

        // Calculate totals and update individual batch totals
        const totalData = calculateTotal(
          currentItem,
          selectedPriceLevelFromRedux
        );
        const updatedGodownListWithTotals = updatedGodownList.map(
          (godown, index) => {
            const matching = totalData.individualTotals.find(
              ({ index: i }) => i === index
            );

            if (!matching) {
              return {
                ...godown,
                individualTotal: 0,
              };
            }

            // eslint-disable-next-line no-unused-vars
            const { index: _, quantity: __, ...rest } = matching;

            return {
              ...godown,
              ...rest,
            };
          }
        );

        currentItem.GodownList = updatedGodownListWithTotals;
        currentItem.total = totalData?.total || 0;
        currentItem.totalCgstAmt = totalData?.totalCgstAmt || 0;
        currentItem.totalSgstAmt = totalData?.totalSgstAmt || 0;
        currentItem.totalIgstAmt = totalData?.totalIgstAmt || 0;
        currentItem.totalCessAmt = totalData?.totalCessAmt || 0;
        currentItem.totalAddlCessAmt = totalData?.totalAdditionalCessAmt || 0;
      } else {
        return currentItem; // If no godownIndex is provided, return the item as is
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
          priceLevelItem?._id === selectedPriceLevelFromRedux?._id
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
