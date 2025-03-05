import {
  IoIosArrowDown,
  IoIosArrowRoundBack,
  IoIosArrowUp,
} from "react-icons/io";
import { useNavigate } from "react-router-dom";
import ProductDetails from "../../common/ProductDetails";
import SearchBar from "../../common/SearchBar";
import { MdOutlineQrCodeScanner } from "react-icons/md";
import { VariableSizeList as List } from "react-window";
import { IoAddCircleSharp } from "react-icons/io5";
import { useMemo } from "react";
import Filter from "../Filter";
import BarcodeScan from "../barcodeScanning/BarcodeScan";
import CustomBarLoader from "../../common/CustomBarLoader";

/* eslint-disable react/prop-types */
function AdditemOfSale({
  filteredItems,
  handleDecrement,
  listRef,
  heights,
  selectedPriceLevel,
  setHeight,
  backHandler,
  handlePriceLevelChange,
  priceLevels,
  searchData,
  // selectedBrand,
  // setSelectedBrand,
  // dispatch,
  // setBrandInRedux,
  // brands,
  // categories,
  // selectedCategory,
  // setseleCtedCategory,
  // setCategoryInRedux,
  // selectedSubCategory,
  // setSelectedSubCategory,
  // setSubCategoryInRedux,
  // subCategories,
  loader,
  listHeight,
  getItemSize,
  scrollPosition,
  setScrollPosition,
  continueHandler,
  item,
  tab,
  handleExpansion,
  handleIncrement,
  handleAddClick,
  addAllProducts,
  isScanOn = false,
  handleBarcodeScanProducts,
  setIsScanOn=() => {},
}) {
  const navigate = useNavigate();

  const scanHandler = () => {
    setIsScanOn(!isScanOn);
  };

  // Filter items with balace stock zero for purchase only but not for normal no   batch and  no godown items
  const displayedItems = useMemo(() => {
    if (tab === "Purchase") {
      return filteredItems.map((item) => {
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
    return filteredItems;
  }, [filteredItems, tab]);

  const Row = ({ index, style }) => {
    const el = displayedItems[index];

    // const isExpanded = expandedProductId === el?._id;
    const adjustedStyle = {
      ...style,
      marginTop: "6px",
      height: "210px",
      // height: el?.hasGodownOrBatch ? "230px" : "180px",
    };
    return (
      <div
        style={adjustedStyle}
        key={index}
        className="bg-white  py-2 pb-6  mt-0  rounded-sm cursor-pointer z-10  shadow-lg  "
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
                    <span>Net Amount :  </span>
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
                      <span>Price </span>
                      
                      : {
                         el?.GodownList[0]?.selectedPriceRate || 0
                      }
                    </p>
                    
                  </div>
                  <div className="flex font-normal">
                    <p className="text-red-500 ">STOCK :    </p>
                    <span>{el?.GodownList[0]?.balance_stock}</span>
                    <span className="text-[11px] ml-1 mt-[0.5px] "> / {el?.unit}</span>
                  </div>
                  <div className="font-normal">
                    <span >Total : </span>
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
              selectedPriceLevel={selectedPriceLevel}
              handleAddClick={handleAddClick}
              godownName="nil"
              details={el}
              setHeight={(height) => setHeight(index, height)}
              tab={tab}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-50 h-screen relative  ">
      <div className="sticky top-0 h-[165px]  z-40 ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  ">
          <div className="flex justify-between  items-center gap-2 ">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={backHandler}
                className="text-2xl text-white cursor-pointer"
              />
              <p className="text-white text-sm   font-bold ">Add Item</p>
            </div>
            <div className="flex items-center gap-4 md:gap-6  ">
              <div className={`${tab === "Purchase" && "hidden"}`}>
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
              <div
                className={`${isScanOn && "border p-0.5 border-yellow-500"}`}
              >
                <MdOutlineQrCodeScanner
                  onClick={scanHandler}
                  className="text-white text-lg  cursor-pointer md:text-xl hover:scale-[1.05]  "
                />
              </div>
            </div>
          </div>
          {/* <div className="flex justify-end">
            <p className="text-sm text-white">Showroom</p>
            </div> */}
        </div>

        {isScanOn ? (
          <div className="relative z-50">
            {" "}
            {/* Added z-index */}
            <BarcodeScan
              handleBarcodeScanProducts={handleBarcodeScanProducts}
              addAllProducts={addAllProducts}
            />
          </div>
        ) : (
          <SearchBar onType={searchData} />
        )}
        {loader && <CustomBarLoader />}

        <Filter addAllProducts={addAllProducts} />
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white p-4 py-2 pb-6 mt-4 flex justify-center items-center rounded-sm cursor-pointer border-b-2 h-screen">
          <p>No products available</p>
        </div>
      ) : (
        !loader && (
          <div className="relative">
            <List
              ref={listRef}
              style={{
                scrollbarWidth: "thin",
                paddingBottom: "45px",
                zIndex: "10",
                // scrollbarColor: "transparent transparent",
              }}
              className="z-0"
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
          </div>
        )
      )}

      {item.length > 0 && !loader && (
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
  );
}

export default AdditemOfSale;
