/* eslint-disable react/prop-types */
import ProductDetails from "@/components/common/ProductDetails";
import Decimal from "decimal.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoAddCircleSharp } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { VariableSizeList as List } from "react-window";
import {
  addItem,
  removeItem,
  updateItem,
} from "../../../slices/salesSecondary";
function VoucherProductLIst({
  items,
  loader,
  tab = "Sales",
  setItems,
  selectedPriceLevel,
}) {
  const listRef = useRef(null);
  const [listHeight, setListHeight] = useState(0);
  const [heights, setHeights] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  //// for calculating the height of list
  useEffect(() => {
    const calculateHeight = () => {
      const newHeight = window.innerHeight - 142;
      setListHeight(newHeight);
    };

    // Calculate the height on component mount and whenever the window is resized
    calculateHeight();
    window.addEventListener("resize", calculateHeight);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", calculateHeight);
  }, []);

  useEffect(() => {
    const storedScrollPosition = localStorage.getItem(
      "scrollPositionAddItemSales"
    );
    if (storedScrollPosition) {
      setScrollPosition(parseInt(storedScrollPosition, 10));
    }
  }, []);

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

  const getItemSize = (index) => {
    const product = items[index];
    const isExpanded = product?.isExpanded || false;
    const baseHeight = isExpanded ? heights[index] || 250 : 220; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 230 : 0; // Extra height for expanded items
    return baseHeight + extraHeight;
  };

  // Filter items with balace stock zero for purchase only but not for normal no   batch and  no godown items
  const displayedItems = useMemo(() => {
    if (tab === "Purchase") {
      return items.map((item) => {
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

  const handleExpansion = (id) => {
    const currentItems = [...items];

    const updatedItems = structuredClone(currentItems);
    const index = updatedItems.findIndex((item) => item._id === id);

    if (index !== -1) {
      updatedItems[index].isExpanded = !updatedItems[index].isExpanded;
    }
    setItems(updatedItems);
  };

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

  const handleAddClick = (_id, idx) => {
    const updatedItems = items.map((item) => {
      if (item._id === _id) {
        const itemToUpdate = { ...item, GodownList: [...item.GodownList] };

        if (itemToUpdate.GodownList[idx]) {
          const currentBatchOrGodown = { ...itemToUpdate.GodownList[idx] };

          currentBatchOrGodown.added = currentBatchOrGodown.added
            ? !currentBatchOrGodown.added
            : true;
          currentBatchOrGodown.count = 1;
          currentBatchOrGodown.actualCount = 1;
          // currentBatchOrGodown.IndividualTotal = totalData?.individualSubtotal;

          itemToUpdate.GodownList[idx] = currentBatchOrGodown;
        }
        itemToUpdate.count =
          new Decimal(itemToUpdate?.count || 0).add(1)?.toNumber() || 1;
        itemToUpdate.actualCount = itemToUpdate?.count;

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

        dispatch(addItem({ payload: itemToUpdate, moveToTop: false }));

        return itemToUpdate;
      }
      return item;
    });

    setItems(updatedItems);
    if (selectedPriceLevel === "" || selectedPriceLevel === undefined) {
      navigate(`/sUsers/editItemSales/${_id}/${"nil"}/${idx}`);
    }
  };

  const handleIncrement = (_id, godownIndex = null, moveToTop = false) => {
    const updatedItems = items.map((item) => {
      if (item._id !== _id) return item; // Keep items unchanged if _id doesn't match
      const currentItem = structuredClone(item);

      if (currentItem?.hasGodownOrBatch && godownIndex !== null) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };

        // If godownOrBatch.count is undefined, set it to 1, otherwise increment by 1
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .add(1)
          .toNumber();
        godownOrBatch.actualCount = godownOrBatch.count;

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
        const sumOfActualCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.actualCount || 0),
          0
        );
        currentItem.count = sumOfCounts; // Update currentItem.count with the sum
        currentItem.actualCount = sumOfActualCounts; // Update currentItem.count with the sum

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
        currentItem.actualCount = currentItem.count;

        // Calculate totals and update individual total
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
        currentItem.total = totalData.total;
        currentItem.GodownList[0].individualTotal = totalData?.total; // Update the overall total
      }

      dispatch(updateItem({ item: currentItem, moveToTop })); // Log the updated currentItem
      return currentItem; // Return the updated currentItem
    });

    // Move the updated item to the top if moveToTop is true
    if (moveToTop) {
      const updatedItemIndex = updatedItems.findIndex((el) => el._id === _id);
      if (updatedItemIndex !== -1) {
        const [updatedItem] = updatedItems.splice(updatedItemIndex, 1);
        setItems([updatedItem, ...updatedItems]); // Move the updated item to the top
      } else {
        setItems(updatedItems); // Otherwise, update the state as is
      }
    } else {
      setItems(updatedItems); // Update the state with the updated items
    } // Update the state with the updated items
  };

  ///////////////////////////handleDecrement///////////////////////////////////
  const handleDecrement = (_id, godownIndex = null) => {
    const updatedItems = items.map((item) => {
      if (item._id !== _id) return item; // Keep items unchanged if _id doesn't match
      const currentItem = structuredClone(item);

      if (godownIndex !== null && currentItem.hasGodownOrBatch) {
        const godownOrBatch = { ...currentItem.GodownList[godownIndex] };
        godownOrBatch.count = new Decimal(godownOrBatch.count)
          .sub(1)
          .toNumber();
        godownOrBatch.actualCount = godownOrBatch.count;

        // Ensure count does not go below 0
        if (godownOrBatch.count <= 0) {
          godownOrBatch.added = false;
        }

        const updatedGodownList = currentItem.GodownList.map((godown, index) =>
          index === godownIndex ? godownOrBatch : godown
        );

        // Calculate the sum of counts in GodownList
        const sumOfCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.count || 0),
          0
        );

        const sumOfActualCounts = updatedGodownList.reduce(
          (sum, godown) => sum + (godown.actualCount || 0),
          0
        );
        currentItem.count = sumOfCounts;
        currentItem.actualCount = sumOfActualCounts;
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
        currentItem.actualCount = currentItem.count;

        // Ensure count does not go below 0
        if (currentItem.count <= 0) {
          currentItem.added = false;
          dispatch(removeItem(currentItem._id));
        }

        // Calculate totals and update individual total
        const totalData = calculateTotal(currentItem, selectedPriceLevel);
        // currentItem.individualTotal = totalData.total;
        currentItem.GodownList[0].individualTotal = totalData?.total;
        currentItem.total = totalData.total; // Update the overall total
      }

      dispatch(updateItem({ item: currentItem, moveToTop: false })); // Log the updated currentItem
      // Log the updated currentItem
      return currentItem; // Return the updated currentItem
    });

    setItems(updatedItems); // Update the state with the updated items
  };

  const Row = ({ index, style }) => {
    const el = displayedItems[index];

    // const isExpanded = expandedProductId === el?._id;
    const adjustedStyle = {
      ...style,
      marginTop: "6px",
      height: "190px",
      
      // height: el?.hasGodownOrBatch ? "230px" : "180px",
    };
    return (
      <div
        style={adjustedStyle}
        key={index}
        className="bg-white border  py-2 pb-6  mt-0  rounded-sm cursor-pointer z-10  shadow-lg  "
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
                  <span className="text-gray-500 text-xs md:text-sm  ">
                    Stock :
                    <span>
                      {" "}
                      {el?.GodownList.reduce(
                        (acc, curr) => (acc += Number(curr?.balance_stock)),
                        0
                      ) || 0}
                    </span>
                    {el?.batchEnabled && tab === "Purchase" && (
                      <div
                        onClick={() => {
                          navigate(`/sUsers/addBatchPurchase/${el?._id}`);
                        }}
                        className=" mt-3 flex items-center gap-1 rounded-md border-none  font-bold border-2 text-green-500 text-md"
                      >
                        <span>
                          <IoAddCircleSharp color="blue" size={15} />
                        </span>
                        Add batches
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
                    <span>{el?.GodownList[0]?.balance_stock}</span>
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

          {el?.added && !el?.hasGodownOrBatch && el?.count > 0 ? (
            <div className="flex items-center flex-col gap-2">
              {!el?.hasGodownOrBatch && (
                <>
                  <button
                    onClick={() => {
                      navigate(
                        `/sUsers/editItem${tab}/${el?._id}/${"nil"}/null`,
                        {
                          state: {
                            from: tab,
                            id: location?.state?.id,
                          },
                        }
                      );
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
              //   selectedPriceLevel={selectedPriceLevel}
              handleAddClick={handleAddClick}
              godownName="nil"
              details={el}
              setHeight={(height) => setHeightOfProducts(index, height)}
              tab={tab}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {items.length === 0 ? (
        <div className="bg-white p-4 py-2 pb-6 mt-7 flex justify-center items-center rounded-sm cursor-pointer border-b-2 h-screen">
          <p>No products available</p>
        </div>
      ) : (
        !loader && (
          <div className="relative">
            <List
              ref={listRef}
              style={{
                scrollbarWidth: "thin",
                paddingBottom: "2px",
                zIndex: "10",
                // scrollbarColor: "transparent transparent",
              }}
              className="z-0"
              height={listHeight} // Specify the height of your list
              itemCount={items.length} // Specify the total number of items
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
          </div>
        )
      )}
    </div>
  );
}

export default VoucherProductLIst;
