/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import ProductDetails from "@/components/common/ProductDetails";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoAddCircleSharp } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { VariableSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import {
  addItem,
  removeItem,
  updateItem,
} from "../../../../slices/voucherSlices/commonVoucherSlice";

/**
 * VoucherProductList Component
 *
 */
export default function VoucherProductList({
  items,
  loader,
  tab = "Sales",
  setItems,
  selectedPriceLevel,
  hasMore,
  isLoading,
  fetchProducts,
  page = 1,
  searchTerm = "",
  calculateTotal,
  handleIncrement,
  isScanOn,
  listRef,
}) {
  // ========== REFS AND STATE ==========
  const [listHeight, setListHeight] = useState(0);
  const [heights, setHeights] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loadingIndex, setLoadingIndex] = useState(null);

  ///// Fetching data from redux
  const { voucherType: voucherTypeFromRedux } = useSelector(
    (state) => state.commonVoucherSlice
  );

  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const { enableNegativeStockBlockForVanInvoice = false } = configurations[0];

  // ========== LIST HEIGHT CALCULATION ==========
  /**
   * Calculate and set the height of the product list based on window size
   */
  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 210;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  // ========== SCROLL POSITION PERSISTENCE ==========
  /**
   * Retrieve and set the scroll position from localStorage on component mount
   */
  useEffect(() => {
    const storedScrollPosition = localStorage.getItem(
      "scrollPositionAddItemSales"
    );

    if (storedScrollPosition) {
      setScrollPosition(parseInt(storedScrollPosition, 10));
    }
  }, []);

  /**
   * Reset the list indices when heights change to ensure proper rendering
   */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
    }
  }, [heights]);

  // ========== CALLBACKS AND ITEM HANDLING ==========
  /**
   * Set the height of a product item at a specific index
   * Only updates if the height has changed to prevent unnecessary renders
   */
  const setHeightOfProducts = useCallback((index, height) => {
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

  /**
   * Calculate the size of an item based on its expanded state and properties
   */
  const getItemSize = (index) => {
    const product = items[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded
      ? heights[index] || 220
      : product?.hasGodownOrBatch
      ? 200
      : 180; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 230 : 0; // Extra height for expanded items
    return baseHeight + extraHeight;
  };

  // ========== ITEM FILTERING ==========
  /**
   * Filter items based on tab type and stock balance
   * For Purchase tab, filters out items with zero balance stock except for special cases
   */
  const displayedItems = useMemo(() => {
    if (tab === "Purchase") {
      return items?.map((item) => {
        const processedItem = {
          ...item,
          GodownList:
            item.GodownList.length === 1 &&
            item.GodownList[0].balance_stock === 0 &&
            !item.GodownList[0].batch &&
            !item.GodownList[0].godown_id
              ? item.GodownList
              : item.GodownList.filter(
                  (godown) =>
                    godown.balance_stock !== 0 || godown.newBatch === true
                ),
        };

        return processedItem;
      });
    }
    return items;
  }, [items, tab]);

  // ========== EVENT HANDLERS ==========
  /**
   * Toggle the expanded state of an item
   */
  const handleExpansion = (id) => {
    const currentItems = [...items];
    const updatedItems = structuredClone(currentItems);
    const index = updatedItems.findIndex((item) => item._id === id);

    if (index !== -1) {
      updatedItems[index].isExpanded = !updatedItems[index].isExpanded;
    }
    setItems(updatedItems);
  };

  /**
   * Handle adding a new product to the list
   */
  const handleAddClick = (_id, idx = 0) => {
    const updatedItems = items.map((item) => {
      if (item._id === _id) {
        // Create a deep copy of the item with its GodownList
        const itemToUpdate = { ...item, GodownList: [...item.GodownList] };

        if (itemToUpdate.GodownList[idx]) {
          const currentBatchOrGodown = { ...itemToUpdate.GodownList[idx] };

          const balance_stock = currentBatchOrGodown?.balance_stock || 0;

          // Check if the  has no stock for van sale
          if (
            balance_stock <= 0 &&
            enableNegativeStockBlockForVanInvoice &&
            voucherTypeFromRedux === "vanSale"
          ) {
            return item;
          }

          // Toggle the added state or set to true if undefined
          currentBatchOrGodown.added = currentBatchOrGodown.added
            ? !currentBatchOrGodown.added
            : true;

          // Initialize count values
          currentBatchOrGodown.count = 1;
          currentBatchOrGodown.actualCount = 1;

          // Update the GodownList with the modified batch/godown
          itemToUpdate.GodownList[idx] = currentBatchOrGodown;
        }

        // Update the overall item count
        const totalOfCounts = itemToUpdate.GodownList.reduce(
          (sum, godown) => sum + (godown.count || 0),
          0
        );
        itemToUpdate.totalCount = totalOfCounts;
        itemToUpdate.totalActualCount = totalOfCounts;

        // Calculate totals for the item
        const totalData = calculateTotal(itemToUpdate, selectedPriceLevel);

        // Update individual totals for each godown/batch
        const updatedGodownListWithTotals = itemToUpdate.GodownList.map(
          (godown, index) => {
            const matching = totalData.individualTotals.find(
              ({ index: i }) => i === index
            );
            if (!matching) return godown;

            // Destructure to exclude `index` and spread the rest
            // eslint-disable-next-line no-unused-vars
            const { index: _, quantity: __, ...rest } = matching;

            return {
              ...godown,
              ...rest,
            };
          }
        );

        itemToUpdate.GodownList = updatedGodownListWithTotals;
        // Update item total and added state
        itemToUpdate.total = totalData?.total || 0;
        itemToUpdate.totalCgstAmt = totalData?.totalCgstAmt || 0;
        itemToUpdate.totalSgstAmt = totalData?.totalSgstAmt || 0;
        itemToUpdate.totalIgstAmt = totalData?.totalIgstAmt || 0;
        itemToUpdate.totalCessAmt = totalData?.totalCessAmt || 0;
        itemToUpdate.totalAddlCessAmt = totalData?.totalAdditionalCessAmt || 0;
        itemToUpdate.added = true;

        // Dispatch to Redux store
        dispatch(addItem({ payload: itemToUpdate, moveToTop: false }));

        return itemToUpdate;
      }
      return item;
    });

    // Update the items state
    setItems(updatedItems);

    // Navigate to edit page if no price level is selected
    if (
      selectedPriceLevel?._id === null &&
      (voucherTypeFromRedux == "purchase" ||
        voucherTypeFromRedux == "debitNote")
    ) {
      navigate(`/sUsers/editItemSales/${_id}/${idx}`);
    }
  };

  /**
   * Decrement the count of a product or specific godown/batch
   * Removes the item if count reaches zero
   */
  const handleDecrement = (_id, godownIndex = 0) => {
    const updatedItems = items.map((item) => {
      if (item._id !== _id) return item; // Skip if not the target item

      // Create a deep copy of the item
      const currentItem = structuredClone(item);

      // Handle godown/batch specific decrement
      if (godownIndex !== null) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };

        // Decrement count with Decimal.js for precision
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .sub(1)
          .toNumber();
        godownOrBatch.actualCount = godownOrBatch.count;

        // Mark as not added if count reaches zero or below
        if (godownOrBatch.count <= 0) {
          godownOrBatch.added = false;
        }

        // Update the specific godown/batch in the GodownList
        const updatedGodownList = currentItem.GodownList.map((godown, index) =>
          index === godownIndex ? godownOrBatch : godown
        );

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
        currentItem.GodownList = updatedGodownList;

        // Check if all godown/batch items are not added
        const allAddedFalse = currentItem.GodownList.every(
          (item) => item.added === false || item.added == undefined
        );

        // Remove the item if none of its godown/batch items are added
        if (allAddedFalse) {
          dispatch(removeItem(currentItem._id));
        }

        // Calculate totals and update individual batch totals
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
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
        return currentItem; // If no godownIndex, return the item as is
      }

      // Dispatch the updated item to Redux
      dispatch(updateItem({ item: currentItem, moveToTop: false }));
      return currentItem;
    });

    // Update the items state
    setItems(updatedItems);
  };

  /**
   * Remove a specific batch which is added while creating purchase
   * Only for purchase
   */

  const handleRemoveBatch = (_id, index) => {
    setLoadingIndex(index); // show loader for the clicked index

    setTimeout(() => {
      const currentItems = [...items];
      const updatedItems = structuredClone(currentItems);
      const itemIndex = updatedItems.findIndex((item) => item._id === _id);

      if (
        itemIndex === -1 ||
        !Array.isArray(updatedItems[itemIndex].GodownList) ||
        index >= updatedItems[itemIndex].GodownList.length
      ) {
        // setLoadingIndex(null); // reset loader index even on failure
        return;
      }

      // Extract item reference to avoid repetition
      const item = updatedItems[itemIndex];
      const currentBatch = item.GodownList[index];
      const {
        count = 0,
        actualCount = 0,
        individualTotal = 0,
        cgstAmount = 0,
        igstAmount = 0,
        cessAmount = 0,
        sgstAmount = 0,
        additionalCessAmount = 0,
      } = currentBatch || {};

      // Update all the totals on the referenced item
      item.totalCount -= count;
      item.totalActualCount -= actualCount;
      item.total -= individualTotal;
      item.totalCgstAmt -= cgstAmount;
      item.totalSgstAmt -= sgstAmount;
      item.totalIgstAmt -= igstAmount;
      item.totalCessAmt -= cessAmount;
      item.totalAddlCessAmt -= additionalCessAmount;

      // Remove the batch from the GodownList
      item.GodownList.splice(index, 1);

      if (
        item?.GodownList?.every(
          (godown) => godown.added === false || godown.added == undefined
        )
      ) {
        item.added = false;
      }
      dispatch(updateItem({ item: item, moveToTop: false }));

      // Update the items state
      setItems(updatedItems);

      setLoadingIndex(null); // stop loader after .5 sec
    }, 500);
  };

  // ========== INFINITE LOADING HANDLERS ==========
  /**
   * Load more items when the user scrolls to the bottom of the list
   * Returns a promise that resolves when new items are loaded
   */
  const loadMoreItems = useCallback(() => {
    if (!hasMore || isLoading || isScanOn) return Promise.resolve();
    return fetchProducts(page + 1, searchTerm);
  }, [hasMore, isLoading, fetchProducts, page, searchTerm]);

  /**
   * Check if an item at a specific index is loaded
   */
  const isItemLoaded = (index) => {
    return index < displayedItems.length;
  };

  /**
   * to get item wise stock according to voucher
   */

  const getItemWiseStock = (item) => {
    if (voucherTypeFromRedux === "saleOrder") {
      return item?.balance_stock || 0;
    } else {
      const sumOfStock =
        item?.GodownList.reduce(
          (acc, curr) => (acc += Number(curr?.balance_stock)),
          0
        ) || 0;

      return sumOfStock;
    }
  };

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index) && !isScanOn) {
      return (
        <div
          style={style}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col rounded-sm"
        >
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    const el = displayedItems[index];

    // const isExpanded = expandedProductId === el?._id;
    const adjustedStyle = {
      ...style,
      marginTop: "6px",
      // height: ,

      height: el?.hasGodownOrBatch ? "190px" : "170px",
    };
    return (
      <div
        style={adjustedStyle}
        key={index}
        className="bg-white border-2  py-2   mt-0  rounded-sm cursor-pointer z-10  shadow-lg  "
      >
        <div
          className={`flex justify-between items-center px-4 pt-4  ${
            !el?.batchEnabled ? "pb-4" : "pb-2"
          } `}
        >
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
                {el?.hasGodownOrBatch
                  ? el?.product_name.length < 30
                    ? el?.product_name
                    : el?.product_name.slice(0, 50) + "..."
                  : el?.product_name.length < 30
                  ? el?.product_name
                  : el?.product_name.slice(0, 30) + "..."}
                {/* {el?.product_name} */}
              </p>
              {el?.hasGodownOrBatch && (
                <div className="flex flex-col font-normal">
                  <div className="flex">
                    <span>Net Amount : </span>
                    <span>{el?.total || 0}</span>
                  </div>
                  <span className="text-gray-500 text-xs md:text-sm mt-1  ">
                    Stock :<span>{getItemWiseStock(el)}</span>
                    {el?.batchEnabled &&
                      voucherTypeFromRedux === "purchase" && (
                        <div
                          onClick={() => {
                            navigate(`/sUsers/addBatchPurchase/${el?._id}`, {
                              state: {
                                item: el,
                              },
                            });
                          }}
                          className="mt-1.5  flex items-center gap-1 rounded-md border-none  font-bold border-2 text-[#00B881] text-md"
                        >
                          <span className="font-normal">
                            <IoAddCircleSharp color="blue" size={15} />
                          </span>
                          <p className="font-semibold text-xs"> Add batches</p>
                        </div>
                      )}
                  </span>
                </div>
              )}

              {!el?.hasGodownOrBatch && (
                <>
                  <div className="flex gap-1 items-center font-normal ">
                    <p>
                      <span>MRP</span> : {el?.item_mrp || 0}
                    </p>
                    |
                    <p>
                      <span>Price </span>:{" "}
                      {el?.GodownList[0]?.selectedPriceRate || 0}
                    </p>
                  </div>
                  <div className="flex font-normal">
                    <p className="text-red-500 ">STOCK : </p>
                    <span>{getItemWiseStock(el)}</span>
                    <span className="text-[11px] ml-1 mt-[0.5px] ">
                      {" "}
                      / {el?.unit}
                    </span>
                  </div>
                  <div className="font-normal">
                    <span>Total : </span>
                    <span>{el?.GodownList[0]?.individualTotal || 0}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {el?.added &&
          !el?.hasGodownOrBatch &&
          el?.GodownList[0]?.count > 0 ? (
            <div className="flex items-center flex-col gap-2">
              {!el?.hasGodownOrBatch && (
                <>
                  <button
                    onClick={() => {
                      navigate(`/sUsers/editItem${tab}/${el?._id}/null`, {
                        state: {
                          from: tab,
                          id: location?.state?.id,
                        },
                      });
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
                        value={
                          el?.GodownList[0]?.count
                            ? el?.GodownList[0]?.count
                            : 0
                        } // Display the count from the state
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
              className="p-2 border-gray-300 border rounded-md w-full text-violet-500 mt-2 font-semibold flex items-center justify-center gap-3"
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
              handleAddClick={handleAddClick}
              godownName="nil"
              details={el}
              setHeight={(height) => setHeightOfProducts(index, height)}
              tab={tab}
              handleRemoveBatch={handleRemoveBatch}
              loadingIndex={loadingIndex}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {items.length === 0 && !loader ? (
        <div className="bg-white p-4 py-2 pb-6 mt-7 flex justify-center items-center rounded-sm cursor-pointer  ">
          <p>No products available</p>
        </div>
      ) : (
        !loader && (
          <div className="relative">
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={hasMore && !isScanOn ? items.length + 1 : items.length}
              loadMoreItems={loadMoreItems}
              threshold={10}
            >
              {/* eslint-disable-next-line no-unused-vars */}
              {({ onItemsRendered, ref }) => (
                <List
                  style={{
                    scrollbarWidth: "thin",
                    paddingBottom: "20px",
                    zIndex: "10",
                  }}
                  className="z-0"
                  height={listHeight}
                  itemCount={
                    hasMore && !isScanOn ? items.length + 1 : items.length
                  }
                  itemSize={getItemSize}
                  width="100%"
                  initialScrollOffset={scrollPosition}
                  onItemsRendered={({
                    // eslint-disable-next-line no-unused-vars
                    visibleStartIndex,
                    visibleStopIndex,
                  }) => {
                    if (visibleStopIndex >= items.length - 1) {
                      loadMoreItems();
                    }
                  }}
                  onScroll={({ scrollOffset }) => {
                    setScrollPosition(scrollOffset);
                    localStorage.setItem(
                      "scrollPositionAddItemSales",
                      scrollOffset.toString()
                    );
                  }}
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
        )
      )}
    </div>
  );
}
