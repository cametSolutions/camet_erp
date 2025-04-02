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

function VoucherAddCount() {
  const [items, setItems] = useState([]);
  const [priceLevels, setPriceLevels] = useState([]);
  const [loader, setLoader] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isScanOn, setIsScanOn] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const searchTimeoutRef = useRef(null);
  const limit = 50; // Number of products per page

  const dispatch = useDispatch();
  const {
    _id: cmp_id,
    configurations,
    type,
  } = useSelector((state) => state.secSelectedOrganization.secSelectedOrg);
  const { addRateWithTax } = configurations[0];
  const taxInclusive = addRateWithTax["sale"] || false;
  const {
    items: itemsFromRedux,
    selectedPriceLevel: selectedPriceLevelFromRedux,
    products: allProductsFromRedux,
    priceLevels: priceLevelsFromRedux,
  } = useSelector((state) => state.salesSecondary);

  // Debounced search function
  const searchData = (data) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(data);
      setPage(1);
      setItems([]);
      setHasMore(true);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Fetch products with pagination
  const fetchProducts = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      if (isLoading) return;

      setLoader(pageNumber === 1);

      try {
        setIsLoading(true);

        const params = new URLSearchParams({
          page: pageNumber,
          limit,
          vanSale: false,
          taxInclusive: taxInclusive,
        });

        if (searchTerm) {
          params.append("search", searchTerm);
        }


        const res = await api.get(
          `/api/sUsers/getProducts/${cmp_id}?${params}`,
          {
            withCredentials: true,
          }
        );

        const productData = res.data.productData;

        if (pageNumber === 1) {
          setItems(productData);
          dispatch(addAllProducts(productData));
        } else {
          setItems((prevItems) => [...prevItems, ...productData]);
          dispatch(addAllProducts([...allProductsFromRedux, ...productData]));
        }

        setHasMore(res.data.pagination.hasMore);
        setPage(pageNumber);

        // Process items with Redux data
        processItemsWithRedux(productData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id]
  );

  // Process items with Redux data
  const processItemsWithRedux = (productData) => {
    if (itemsFromRedux.length > 0) {
      const reduxItemIds = itemsFromRedux.map((item) => item?._id);
      const processedItems = productData.map((product) => {
        if (!reduxItemIds.includes(product._id)) {
          return product;
        }

        const reduxItem = itemsFromRedux.find(
          (item) => item._id === product._id
        );

        if (reduxItem.hasGodownOrBatch) {
          return updateItemWithBatchOrGodown(reduxItem, product);
        } else {
          return updateSimpleItem(reduxItem, product);
        }
      });

      setItems(processedItems);
    }
  };

  const updateItemWithBatchOrGodown = (reduxItem, product) => {
    const updatedGodownList = reduxItem?.GodownList?.map((godown) => {
      let matchedGodown;

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

      if (matchedGodown) {
        return { ...godown, balance_stock: matchedGodown.balance_stock };
      }

      return godown;
    });

    return { ...reduxItem, GodownList: updatedGodownList };
  };

  const updateSimpleItem = (reduxItem, product) => {
    const matchedGodown = product?.GodownList?.[0];
    const newBalanceStock = matchedGodown?.balance_stock;

    const updatedGodownList = reduxItem.GodownList.map((godown) => ({
      ...godown,
      balance_stock: newBalanceStock,
    }));

    return { ...reduxItem, GodownList: updatedGodownList };
  };

  // Initial load and search term changes
  useEffect(() => {
    fetchProducts(1, searchTerm);
  }, [fetchProducts, searchTerm]);

  // Fetch filters on initial load
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        if (priceLevelsFromRedux.length > 0) {
          setPriceLevels(priceLevelsFromRedux);
          return;
        }

        const endpoint =
          type === "self"
            ? `/api/sUsers/fetchFilters/${cmp_id}`
            : `/api/sUsers/fetchAdditionalDetails/${cmp_id}`;

        const res = await api.get(endpoint, { withCredentials: true });
        const data = type === "self" ? res.data.data : res.data;
        const { priceLevels } = data;

        setPriceLevels(priceLevels);
        dispatch(addAllPriceLevels(priceLevels));

        const defaultPriceLevel = priceLevels[0];
        dispatch(setPriceLevel(defaultPriceLevel));
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, [cmp_id, type, dispatch, priceLevelsFromRedux]);

  // Apply price rates when price level changes
  const addSelectedRate = (pricelevel) => {
    if (!items || items.length === 0) return;

    const updatedItems = items.map((productItem) => {
      const priceRate =
        productItem?.Priceleveles?.find(
          (priceLevelItem) => priceLevelItem.pricelevel === pricelevel
        )?.pricerate || 0;

      const reduxItem = itemsFromRedux.find((p) => p._id === productItem._id);

      const updatedGodownList = productItem.GodownList.map(
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
        ...productItem,
        GodownList: updatedGodownList,
      };
    });

    setItems(updatedItems);
  };

  useEffect(() => {
    addSelectedRate(selectedPriceLevelFromRedux);
  }, [selectedPriceLevelFromRedux, refresh]);

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
