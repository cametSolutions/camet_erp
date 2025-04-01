import api from "@/api/api";
import TitleDiv from "@/components/common/TitleDiv";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addAllProducts,
  addAllPriceLevels,
  setPriceLevel,
} from "../../../slices/salesSecondary";
import BarcodeScan from "@/components/secUsers/barcodeScanning/BarcodeScan";
import SearchBar from "@/components/common/SearchBar";
import VoucherProductLIst from "./VoucherProductLIst";

function VoucherAddCount() {
  const [items, setItems] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState("P2");
  // const [search, setSearch] = useState("");
  const [priceLevels, setPriceLevels] = useState([]);
  const [loader, setLoader] = useState(false);

  const [refresh, setRefresh] = useState(false);
  const [isScanOn, setIsScanOn] = useState(false);

  //// general initialization
  // const navigate = useNavigate();
  const dispatch = useDispatch();

  //// redux values form company
  const {
    _id: cmp_id,
    configurations,
    type,
  } = useSelector((state) => state.secSelectedOrganization.secSelectedOrg);

  ///// check if the company is tax inclusive or not
  const { addRateWithTax } = configurations[0];
  const taxInclusive = addRateWithTax["sale"] || false;

  ///// redux values form sales
  const {
    items: itemsFromRedux,
    selectedPriceLevel: selectedPriceLevelFromRedux,
    products: allProductsFromRedux,
    priceLevels: priceLevelsFromRedux,
  } = useSelector((state) => state.salesSecondary);

  //// fetch products and filters (price levels)

  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      setLoader(true);
      try {
        // Fetch products data
        let productData;
        if (allProductsFromRedux.length === 0) {
          const res = await api.get(`/api/sUsers/getProducts/${cmp_id}`, {
            params: { vanSale: false, taxInclusive: taxInclusive },
            withCredentials: true,
          });
          productData = res.data.productData;
          dispatch(addAllProducts(productData));
        } else {
          productData = allProductsFromRedux;
        }

        // Process items with Redux data (without price level application)
        let processedItems = productData;
        if (itemsFromRedux.length > 0) {
          const reduxItemIds = itemsFromRedux.map((items) => items?._id);
          processedItems = productData.map((product) => {
            if (!reduxItemIds.includes(product._id)) {
              return product;
            }

            const reduxItem = itemsFromRedux.find(
              (items) => items._id === product._id
            );

            if (reduxItem.hasGodownOrBatch) {
              return updateItemWithBatchOrGodown(reduxItem, product);
            } else {
              return updateSimpleItem(reduxItem, product);
            }
          });
        }

        // Set items based on scan mode (price rates will be applied in the second useEffect)
        isScanOn ? setItems(itemsFromRedux) : setItems(processedItems);

        // Fetch filters if we have products - but only on initial load
        if (
          (processedItems.length > 0 || productData.length > 0) &&
          !isScanOn &&
          priceLevelsFromRedux.length === 0
        ) {
          await fetchFilters();
        }

        if (priceLevelsFromRedux.length > 0) {
          setPriceLevels(priceLevelsFromRedux);
        }

        setRefresh((prevRefresh) => !prevRefresh);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoader(false);
      }

      // Restore scroll position
      const scrollPosition = parseInt(localStorage.getItem("scrollPosition"));
      if (scrollPosition) {
        window.scrollTo(0, scrollPosition);
      }
    };

    // Helper function for updating items with batch or godown
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

    // Helper function for updating simple items
    const updateSimpleItem = (reduxItem, product) => {
      const matchedGodown = product?.GodownList?.[0];
      const newBalanceStock = matchedGodown?.balance_stock;

      const updatedGodownList = reduxItem.GodownList.map((godown) => ({
        ...godown,
        balance_stock: newBalanceStock,
      }));

      return { ...reduxItem, GodownList: updatedGodownList };
    };

    // Fetch filters function - only called from the initial useEffect
    const fetchFilters = async () => {
      try {
        const endpoint =
          type === "self"
            ? `/api/sUsers/fetchFilters/${cmp_id}`
            : `/api/sUsers/fetchAdditionalDetails/${cmp_id}`;

        const res = await api.get(endpoint, { withCredentials: true });
        const data = type === "self" ? res.data.data : res.data;
        const { priceLevels } = data;

        setPriceLevels(priceLevels);
        dispatch(addAllPriceLevels(priceLevels));

        console.log(priceLevelsFromRedux);

        const defaultPriceLevel = priceLevels[0];
        setSelectedPriceLevel(defaultPriceLevel);
        dispatch(setPriceLevel(defaultPriceLevel));
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchProductsAndFilters();
  }, [cmp_id, isScanOn, taxInclusive]); // No selectedPriceLevel or refresh dependency

  // Separate function to update price rates - not inside useEffect
  const addSelectedRate = (pricelevel) => {
    if (!items || items.length === 0) return;

    const updatedItems = items.map((productItem) => {
      // Find the price rate for the selected price level
      const priceRate =
        productItem?.Priceleveles?.find(
          (priceLevelItem) => priceLevelItem.pricelevel === pricelevel
        )?.pricerate || 0;

      // Find if there's a matching Redux items
      const reduxItem = itemsFromRedux.find((p) => p._id === productItem._id);

      // Update GodownList with price rates
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

  // Second useEffect only for price rate updates - uses a simple function call instead of internal logic
  useEffect(() => {
    addSelectedRate(selectedPriceLevel);
  }, [selectedPriceLevel, refresh]);

  return (
    <div>
      <TitleDiv title={"Add Item"} from="/sUsers/sales" />
      <SearchBar />
      
      <hr />

      <VoucherProductLIst
        items={items}
        loader={loader}
        setItems={setItems}
        selectedPriceLevel={selectedPriceLevel}
      />
    </div>
  );
}

export default VoucherAddCount;
