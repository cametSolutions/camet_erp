// Import statements
import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAllProducts,
  addAllPriceLevels,
  setPriceLevel,
} from "../../../slices/salesSecondary";
import SearchBar from "@/components/common/SearchBar";
import VoucherProductLIst from "./VoucherProductLIst";
import Filter from "@/components/secUsers/Filter";
import CustomBarLoader from "@/components/common/CustomBarLoader";

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

  // Reference for search debounce
  const searchTimeoutRef = useRef(null);
  const limit = 30; // Number of products per page

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
  } = useSelector((state) => state.salesSecondary);

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
      setSearchTerm(data);
      setPage(1); // Reset to first page on new search
      setItems([]);
      setHasMore(true);
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
        
        // Use cached data from Redux if available for this page
        if (pageNumberFromRedux >= pageNumber && allProductsFromRedux.length > 0) {
          setItems(allProductsFromRedux);
          setHasMore(hasMoreFromRedux);
          processItemsWithRedux(allProductsFromRedux);
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
              (priceLevelItem) => priceLevelItem.pricelevel === selectedPriceLevelFromRedux
            )?.pricerate || 0;

          const updatedGodownList = productItem.GodownList.map((godownOrBatch) => ({
            ...godownOrBatch,
            selectedPriceRate: priceRate,
          }));

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
    [cmp_id, selectedPriceLevelFromRedux, dispatch, pageNumberFromRedux, 
     allProductsFromRedux, hasMoreFromRedux, isLoading, pricesLoaded]
  );

  /**
   * Update fetched products with any existing data from Redux
   * Ensures selected quantities and other user selections are preserved
   */
  const processItemsWithRedux = (productData) => {
    if (itemsFromRedux.length > 0) {
      const reduxItemIds = itemsFromRedux.map((item) => item?._id);
      const processedItems = productData.map((product) => {
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
        const endpoint = type === "self"
          ? `/api/sUsers/fetchFilters/${cmp_id}`
          : `/api/sUsers/fetchAdditionalDetails/${cmp_id}`;

        const res = await api.get(endpoint, { withCredentials: true });
        const data = type === "self" ? res.data.data : res.data;
        const { priceLevels } = data;

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

  // Fetch products only after price levels are loaded
  useEffect(() => {
    if (pricesLoaded) {
      fetchProducts(1, searchTerm);
    }
  }, [fetchProducts, searchTerm, pricesLoaded]);

  // Handle search term changes by resetting pagination
  useEffect(() => {
    if (pricesLoaded && searchTerm !== "") {
      fetchProducts(1, searchTerm);
    }
  }, [searchTerm, pricesLoaded]);

  /**
   * Apply selected price level rates to all products
   * Updates displayed prices when price level changes
   */
  const addSelectedRate = (pricelevel) => {
    if (!items || items.length === 0) return;
  
    const updatedItems = items.map((productItem) => {
      const priceRate =
        productItem?.Priceleveles?.find(
          (priceLevelItem) => priceLevelItem.pricelevel === pricelevel
        )?.pricerate || 0;
  
      const updatedGodownList = productItem.GodownList.map((godownOrBatch) => ({
        ...godownOrBatch,
        selectedPriceRate: priceRate,
      }));
  
      return {
        ...productItem,
        GodownList: updatedGodownList,
      };
    });
  
    setItems(updatedItems);
  };
  

  // Update items when price level changes
  
  useEffect(() => {
    if (pricesLoaded) {
    console.log(selectedPriceLevelFromRedux);

      addSelectedRate(selectedPriceLevelFromRedux);
    }
  }, [selectedPriceLevelFromRedux, refresh, pricesLoaded]);

  // ===================================
  // Render Component
  // ===================================
  return (
    <div className="h-screen overflow-y-auto">
      <TitleDiv title={"Add Item"} from="/sUsers/sales" />
      <SearchBar onType={searchData} />
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
      />
    </div>
  );
}

export default VoucherAddCount;