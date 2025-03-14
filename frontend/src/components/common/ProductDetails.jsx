/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ProductDetails = ({
  details,
  setHeight,
  handleAddClick,
  // selectedPriceLevel,
  handleIncrement,
  handleDecrement,
  godownName,
  heights,
  tab = "",
}) => {
  const detailsRef = useRef();
  const batchOrGodownList = details?.GodownList;

  

  useEffect(() => {
    if (detailsRef.current) {
      setHeight(detailsRef.current.offsetHeight);
    }
  }, [details, heights, setHeight]);

  const navigate = useNavigate();

  return (
    <div
      ref={detailsRef}
      className={`product-details mb-6 mt-8 w-full shadow-lg p-3  `}
    >
      {batchOrGodownList.map((item, index) => (
        <>
          <div
            key={index}
            className="mb-8 flex  justify-between items-center mt-3  px-[40px] md:px-[64px]"
          >
            <div className="flex flex-col gap-1  ">
              {item?.batch && (
                <p className="font-bold text-sm md:text-sm">{item?.batch}</p>
              )}

              {/* <p className="font-bold text-xs md:text-sm">Batch {item?.batch}</p> */}
              {item?.godown && item?.batch && (
                <p className="text-gray-500  text-sm md:text-xs">
                  ( {item.godown} )
                </p>
              )}

              {item?.godown && !item?.batch && (
                <p className="text-black font-bold  text-sm md:text-sm">
                  {item.godown}
                </p>
              )}

              {item?.expdt && (
                <p className="text-red-400 font-normal text-[10px] md:text-sm">
                  Expires in {item?.expdt}
                </p>
              )}

              {tab !== "inventory" && (
                <>
                  <div className="flex items-center">
                    {tab !== "stockTransfer" && (
                      <>
                      
                        <p className="   text-xs md:text-sm">
                         MRP : {details?.item_mrp || 0} |
                        </p>
                        <p className="   text-xs md:text-sm  ml-1">
                         Price : {item?.selectedPriceRate || 0}
                        </p>
                        <p className="  text-xs md:text-sm ml-2 font-semibold">
                          ( ₹ {item?.individualTotal} )
                        </p>
                      </>
                    )}
                  </div>
                  <p className="text-gray-500 font-normal  text-sm md:text-sm ">
                    Stock: {item.balance_stock} /
                    <span className="text-black ml-1">{details?.unit || ""}</span>
                  </p>
                </>
              )}

              {/* <p>Manufacture Date: {item.mfgdt}</p> */}
            </div>
            <div className="flex flex-col">
              {tab !== "inventory" ? (
                <div className="flex items-center justify-center mt-3">
                  {(item?.added === undefined || item?.added === false) && (
                    <div
                      onClick={() => {
                        handleAddClick(details._id, index);
                      }}
                      className="px-3 py-1 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
                    >
                      Add
                    </div>
                  )}

                  {item?.added && (
                    <div className="flex flex-col items-center gap-3">
                      <div>
                        <button
                          onClick={() => {
                            navigate(
                              `/sUsers/editItem${tab}/${details?._id}/${
                                godownName || "nil"
                              }/${index}`,
                              {
                                state: { from: tab },
                              }
                            );
                          }}
                          className=" px-2 rounded-md border-violet-500 font-bold border-2 text-violet-500 text-xs"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            handleDecrement(details?._id, index);
                          }}
                          id="decrement-btn"
                          className="flex justify-center items-center w-4  h-4  rounded-full text-white focus:outline-none bg-gray-400 hover:bg-gray-500"
                        >
                          {/* -ve button */}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M20 12H4"
                            ></path>
                          </svg>
                        </button>
                        <span id="counter" className="text-sm font-bold mx-4">
                          {item?.count}
                        </span>

                        {/* +ve button */}
                        <button
                          onClick={() => {
                            handleIncrement(details?._id, index);
                          }}
                          id="increment-btn"
                          className="flex justify-center items-center w-4 h-4 rounded-full text-white focus:outline-none bg-indigo-500 hover:bg-indigo-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 6v12M6 12h12"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 font-semibold  text-[9px] md:text-sm ">
                  {" "}
                  Stock: {item.balance_stock}
                </p>
              )}
            </div>
          </div>
          <hr className="   border-slate-300 mx-2 " />
        </>
      ))}
    </div>
  );
};

export default ProductDetails;
