/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../../api/api";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { useSelector } from "react-redux";
import SearchBar from "../../../../components/common/SearchBar";
import TitleDiv from "@/components/common/TitleDiv";
import { truncateToNDecimals } from "../../../../../../backend/helpers/helper";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ProductDetails from "@/components/common/ProductDetails";

function StockRegister() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listHeight, setListHeight] = useState(0);
  const [heights, setHeights] = useState({});


  const listRef = useRef();
  const searchTimeoutRef = useRef(null);
  const limit = 60; // Number of products per page

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // Debounced search function
  const searchData = (data) => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to update the search term after 500ms
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(data);
      // Reset pagination when searching
      setPage(1);
      setProducts([]);
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

  const fetchProducts = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      if (isLoading) return;

      setIsLoading(true);
      setLoader(pageNumber === 1);

      try {
        const params = new URLSearchParams({
          page: pageNumber,
          limit,
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

        if (pageNumber === 1) {
          setProducts(res.data.productData);
        } else {
          setProducts((prevProducts) => [
            ...prevProducts,
            ...res.data.productData,
          ]);
        }

        setHasMore(res.data.pagination.hasMore);
        setPage(pageNumber);
      } catch (error) {
        console.log(error);
        setHasMore(false);
        // toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
        setLoader(false);
      }
    },
    [cmp_id]
  );

  useEffect(() => {
    // Fetch products whenever searchTerm changes (debounced)
    fetchProducts(1, searchTerm);
  }, [fetchProducts, searchTerm]);

  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 95;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // Items loaded status for InfiniteLoader
  const isItemLoaded = (index) => index < products.length;

  // Load more items when reaching the end
  const loadMoreItems = () => {
    if (!isLoading && hasMore) {
      return fetchProducts(page + 1, searchTerm);
    }
    return Promise.resolve();
  };

  const handleExpansion = (id) => {
    const updatedItems = [...products];
    const index = updatedItems.findIndex((item) => item._id === id);

    const itemToUpdate = { ...updatedItems[index] };

    if (itemToUpdate) {
      itemToUpdate.isExpanded = !itemToUpdate.isExpanded;

      updatedItems[index] = itemToUpdate;
    }
    setProducts(updatedItems);
    setTimeout(() => listRef.current.resetAfterIndex(index), 0);
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

    const getItemSize = (index) => {
    const product = products[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded ? heights[index] || 250 : 195; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 230 : 0; // Extra height for expanded items

    console.log("baseHeight", baseHeight);
    console.log("extraHeight", extraHeight);
    

    return baseHeight + extraHeight || 0;
    // return
  };


  const Row = ({ index, style }) => {
    const el = products[index];
    const adjustedStyle = {
      ...style,
      marginTop: "16px",
      height: "150px",
    };

    return (
      <>
        <div
          key={index}
          style={adjustedStyle}
          className={`bg-white  pb-6 mt-4 flex flex-col  rounded-sm cursor-pointer  py-4 border-t ${
            !el?.hasGodownOrBatch ? "shadow-lg" : ""
          }  `}
        >
          <div className=" w-full gap-3   px-5  ">
            <div className="">
              <p className="font-bold text-sm">{el?.product_name}</p>
            </div>
          </div>

          <div className=" text-sm  px-5 flex justify-between items-center mt-3   ">
            <div className="flex-col font-semibold text-sm">
              <div className="flex gap-2 text-nowrap">
                <p className=" text-gray-400  ">Hsn :</p>
                <p className=" text-gray-400"> {el?.hsn_code}</p>
              </div>
              <div className="flex gap-2    ">
                <p className=" text-gray-400">Tax :</p>
                <p className=" text-gray-400"> {`${el?.igst} %`}</p>
              </div>

              {el?.item_mrp && (
                <div className="flex gap-2    ">
                  <p className=" text-gray-400">MRP :</p>
                  <p className=" text-gray-400"> {`${el?.item_mrp}`}</p>
                </div>
              )}
            </div>
            <div>
              <div className="flex flex-col gap-1 ">
                <div className="flex items-center justify-end">
                  <p className="  text-xs   md:text-sm font-semibold text-gray-500  ">
                    Actual Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1 ">
                    {" "}
                    {el?.GodownList?.reduce(
                      (acc, curr) => acc + (Number(curr?.balance_stock) || 0),
                      0
                    ) || 0}
                  </h2>
                </div>
                <div className="flex items-center justify-end">
                  <p className=" text-xs md:text-sm font-semibold text-gray-500">
                    Saleable Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1">
                    {" "}
                    {el?.balance_stock || 0}
                  </h2>
                </div>
                <div className="flex items-center justify-end">
                  <p className=" text-xs md:text-sm font-semibold text-gray-500">
                    Order Stock :
                  </p>
                  <h2 className="font-semibold text-green-500 ml-1">
                    {" "}
                    {truncateToNDecimals(
                      (el?.GodownList?.reduce(
                        (acc, curr) => acc + (Number(curr?.balance_stock) || 0),
                        0
                      ) || 0) - (Number(el?.balance_stock) || 0),
                      3
                    )}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {el?.hasGodownOrBatch && (
            <div className="px-4 shadow-lg pb-3 ">
              <div
                onClick={() => {
                  handleExpansion(el?._id);
                  setTimeout(() => listRef.current.resetAfterIndex(index), 0);
                }}
                className="p-2  border-gray-300 border rounded-md w-full text-violet-500 mt-4 font-semibold flex items-center justify-center gap-3"
              >
                {el?.isExpanded ? "Hide Details" : "Show Details"}

                {el?.isExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </div>
            </div>
          )}

          {el?.isExpanded && (
            <ProductDetails
              details={el}
              tab={"inventory"}
              setHeight={(height) => setHeight(index, height)}
            />
          )}

          {!el?.hasGodownOrBatch && (
            <hr className="mt-5  border-t-2 border-slate-300 mx-4" />
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex-1 bg-slate-50  h-screen overflow-hidden  ">
        <div className="sticky top-0 z-20 ">
          <TitleDiv loading={loader} title="Stock Register" />

          <SearchBar onType={searchData} />
        </div>

        {!loader && !isLoading && products.length === 0 && (
          <div className="flex justify-center items-center mt-20 overflow-hidden font-bold text-gray-500">
            Oops!!.No Products Found
          </div>
        )}

        <div className="pb-4">
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={hasMore ? products.length + 1 : products.length}
            loadMoreItems={loadMoreItems}
            threshold={10}
          >
            {({ onItemsRendered, ref }) => (
              <List
                className="pb-4"
                height={listHeight}
                itemCount={hasMore ? products.length + 1 : products.length}
                itemSize={getItemSize}
                onItemsRendered={onItemsRendered}
                ref={(listInstance) => {
                  ref(listInstance);
                  listRef.current = listInstance;
                }}
              >
                {Row}
              </List>
            )}
          </InfiniteLoader>
        </div>

        {isLoading && !loader && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </>
  );
}

export default StockRegister;
