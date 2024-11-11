/* eslint-disable react/prop-types */
import { FiMinus } from "react-icons/fi";
import { IoIosArrowDown, IoMdAdd } from "react-icons/io";
import { MdCancel, MdPlaylistAdd } from "react-icons/md";
import { Link } from "react-router-dom";

function AddItemTile({
  items,
  handleAddItem,
  dispatch,
  removeItem,
  removeGodownOrBatch,
  navigate,
  godownname,
  subTotal,
  type,
  additional,
  cancelHandler,
  rows,
  handleDeleteRow,
  handleLevelChange,
  additionalChragesFromCompany,
  actionChange,
  handleRateChange,
  handleAddRow,
  setAdditional,
  urlToAddItem,
  urlToEditItem,
}) {

  
  return (
    <div>
      {items.length == 0 && (
        <div className="bg-white p-4 pb-6  drop-shadow-lg mt-2 md:mt-3">
          <div className="flex gap-2 ">
            <p className="font-bold uppercase text-sm">Items</p>
            <span className="text-red-500 mt-[-4px] font-bold">*</span>
          </div>

          <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500 ">
            <div
              onClick={handleAddItem}
              className="flex justify-center gap-2 hover_scale items-center "
            >
              <IoMdAdd className="text-2xl" />
              <p className="text-sm">Add Item</p>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div>
            <div className="flex justify-between mt-2 bg-white p-3 px-4 w-full  ">
              <div className="flex  items-center gap-1 font-bold">
                <IoIosArrowDown className="font-bold text-xs sm:text-lg" />
                <p  className="text-xs sm:text-md">Items ({items.length})</p>
              </div>

              <Link to={urlToAddItem}>
                <div className=" flex items-center gap-2 font-bold text-violet-500">
                  <IoMdAdd className="text-lg sm:text-2xl" />
                  <p className="text-xs sm:text-md"  >Add Item</p>
                </div>
              </Link>
            </div>
            {items.map((el, index) => (
              <>
                <div
                  key={index}
                  className="py-3 mt-0 px-5 md:px-6 bg-white flex items-center gap-1.5 md:gap-4"
                >
                  {!el?.hasGodownOrBatch && (
                    <div
                      onClick={() => {
                        dispatch(removeItem(el));
                      }}
                      className="text-gray-500 text-sm cursor-pointer"
                    >
                      <MdCancel />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-xs gap-10 ">
                      <p className="text-[10px] sm:text-xs">{el.product_name}</p>
                      <p className="text-nowrap">
                        ₹{" "}
                        {el?.GodownList.reduce((acc, curr) => {
                          if (el?.hasGodownOrBatch) {
                            if (curr?.added) {
                              return (acc += Number(
                                curr.individualTotal?.toFixed(2) || 0
                              ));
                            } else {
                              return acc;
                            }
                          } else {
                            return (acc += Number(
                              curr.individualTotal.toFixed(2) || 0
                            ));
                          }
                        }, 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-1 text-xs mt-1">
                      <p className="text-nowrap">Tax</p>
                      <p className="text-nowrap">({el.igst} %)</p>
                    </div>
                    {el.hasGodownOrBatch ? (
                      el.GodownList.map((godownOrBatch, idx) =>
                        godownOrBatch.added ? (
                          <>
                            <div className="flex items-center gap-2">
                              <MdCancel
                                onClick={() => {
                                  dispatch(
                                    removeGodownOrBatch({
                                      id: el?._id,
                                      idx: idx,
                                    })
                                  );
                                }}
                                className="text-gray-500 text-sm cursor-pointer"
                              />
                              <div
                                key={idx}
                                className="flex justify-between items-center mt-5 flex-1 "
                              >
                                <div className="w-3/5 md:w-2/5 font-semibold text-gray-500 text-xs flex flex-col gap-2">
                                  {godownOrBatch.batch ? (
                                    <div className="flex justify-between">
                                      <p className="text-nowrap text-violet-500 text-bold">
                                        Batch: {godownOrBatch.batch}
                                      </p>
                                      <p className="text-nowrap ">
                                        {godownOrBatch.count} {el.unit} X{" "}
                                        {/* {el.Priceleveles.find(
                                            (item) =>
                                              item.pricelevel ===
                                              priceLevelFromRedux
                                          )?.pricerate || 0} */}
                                        {godownOrBatch?.selectedPriceRate || 0}
                                      </p>
                                    </div>
                                  ) : (
                                    godownOrBatch.godown && (
                                      <div className="flex justify-between ">
                                        <p className="text-nowrap text-violet-500 text-bold">
                                          Godown: {godownOrBatch.godown}
                                        </p>
                                        <p className="text-nowrap">
                                          {godownOrBatch.count} {el.unit} X{" "}
                                          {/* {el.Priceleveles.find(
                                              (item) =>
                                                item.pricelevel ===
                                                priceLevelFromRedux
                                            )?.pricerate || 0} */}
                                          {godownOrBatch?.selectedPriceRate ||
                                            0}
                                        </p>
                                      </div>
                                    )
                                  )}

                                  {(godownOrBatch.discount > 0 ||
                                    godownOrBatch.discountPercentage > 0) && (
                                    <div className="flex justify-between">
                                      <p className="text-nowrap">Discount</p>
                                      <div className="flex items-center">
                                        <p className="text-nowrap">
                                          {godownOrBatch.discount > 0
                                            ? `₹ ${godownOrBatch.discount}`
                                            : `${godownOrBatch.discountPercentage}%`}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <p className="text-nowrap">Total</p>
                                    <p className="text-nowrap">
                                      ₹ {godownOrBatch.individualTotal ?? 0}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p
                                    onClick={() => {
                                      navigate(
                                        `${urlToEditItem}/${el._id}/${
                                          godownname === "" ? "nil" : godownname
                                        }/${idx}`,
                                        {
                                          state: { from: type },
                                        }
                                      );
                                    }}
                                    className="text-violet-500 text-xs md:text-base font-bold p-1 px-4 border border-1 border-gray-300 rounded-2xl cursor-pointer"
                                  >
                                    Edit
                                  </p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : null
                      )
                    ) : (
                      <div className="flex justify-between items-center ">
                        <div className="w-3/5 md:w-2/5 font-semibold text-gray-500 text-xs flex flex-col gap-2">
                          <div className="flex justify-between">
                            <p className="text-nowrap">
                              Qty <span className="text-xs">x</span> Rate
                            </p>
                            <p className="text-nowrap">
                              {el.count} {el.unit} X{" "}
                              {el?.GodownList[0]?.selectedPriceRate || 0}
                            </p>
                          </div>

                          {(el.discount > 0 || el.discountPercentage > 0) && (
                            <div className="flex justify-between">
                              <p className="text-nowrap">Discount</p>
                              <div className="flex items-center">
                                <p className="text-nowrap">
                                  {el.discount > 0
                                    ? `₹ ${el.discount}`
                                    : `${el.discountPercentage}%`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <p
                            onClick={() => {
                              navigate(
                                `${urlToEditItem}/${el._id}/${
                                  godownname === "" ? "nil" : godownname
                                }/null`,
                                {
                                  state: { from: "sales" },
                                }
                              );
                            }}
                            className="text-violet-500 text-xs md:text-base font-bold p-1 px-4 border border-1 border-gray-300 rounded-2xl cursor-pointer"
                          >
                            Edit
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <hr />
              </>
            ))}
          </div>
          {type !== "stockTransfer" && (
            <div className="flex  justify-between items-center bg-white p-2 px-4">
              <p className="text-sm md:text-base font-bold">Items Subtotal:</p>
              <p className="text-sm md:text-base font-bold">{` ₹ ${subTotal.toFixed(
                2
              )}`}</p>
            </div>
          )}

          {/* {type == "self" &&  ( */}
          <>
            {additional && type !== "stockTransfer" ? (
              <div className="container mx-auto mt-2 bg-white p-4 text-xs">
                <div className="flex  items-center justify-between  font-bold  text-[13px]">
                  <div className="flex  items-center gap-3">
                    <IoIosArrowDown className="font-bold text-lg sm:text-xl" />
                    <p className="text-blue-800 text-xs sm:text-base">Additional Charges</p>
                  </div>
                  <button
                    onClick={cancelHandler}
                    // onClick={() => {setAdditional(false);dispatch(removeAdditionalCharge());setRefresh(!refresh);setRows()}}
                    className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <div className="container mx-auto  mt-2  md:px-8 ">
                  <table className="table-fixed w-full bg-white ">
                    <tbody>
                      {rows.map((row, index) => (
                        <tr key={index} className="">
                          <td className=" w-2  ">
                            <MdCancel
                              onClick={() => {
                                handleDeleteRow(index);
                              }}
                              className="text-sm cursor-pointer text-gray-500 hover:text-black"
                            />
                          </td>
                          <td className=" flex flex-col justify-center ml-2 mt-3.5 ">
                            <select
                              value={row._id}
                              onChange={(e) =>
                                handleLevelChange(index, e.target.value)
                              }
                              className="block w-full   bg-white text-sm focus:outline-none border-none border-b-gray-500 "
                            >
                              {additionalChragesFromCompany.length > 0 ? (
                                additionalChragesFromCompany.map(
                                  (el, index) => (
                                    <option key={index} value={el._id}>
                                      {" "}
                                      {el.name}{" "}
                                    </option>
                                  )
                                )
                              ) : (
                                <option>No charges available</option>
                              )}
                            </select>

                            {row?.taxPercentage !== "" && (
                              <div className="ml-3 text-[9px] text-gray-400">
                                GST @ {row?.taxPercentage} %
                              </div>
                            )}
                          </td>
                          <td className="">
                            <div className="flex gap-3 px-5 ">
                              <div
                                onClick={() => {
                                  actionChange(index, "add");
                                }}
                                className={` ${
                                  row.action === "add"
                                    ? "border-violet-500 "
                                    : ""
                                }  cursor-pointer p-1 px-1.5 rounded-md  border  bg-gray-100 `}
                              >
                                <IoMdAdd />
                              </div>
                              <div
                                onClick={() => {
                                  actionChange(index, "sub");
                                }}
                                className={` ${
                                  row.action === "sub"
                                    ? "border-violet-500 "
                                    : ""
                                }  cursor-pointer p-1 px-1.5 rounded-md  border  bg-gray-100 `}
                              >
                                <FiMinus />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <span className="mr-0 ">₹</span>
                              <input
                                type="number"
                                value={row.value}
                                onChange={(e) =>
                                  handleRateChange(index, e.target.value)
                                }
                                className={` ${
                                  additionalChragesFromCompany.length === 0
                                    ? "pointer-events-none opacity-20 "
                                    : ""
                                }   block w-full py-2 px-4 bg-white text-sm focus:outline-none border-b-2 border-t-0 border-l-0 border-r-0 `}
                              />
                            </div>

                            {row?.taxPercentage !== "" && row.value !== "" && (
                              <div className="ml-3 text-[9.5px] text-gray-400 mt-2">
                                With tax : ₹{" "}
                                {(parseFloat(row?.value) *
                                  (100 + parseFloat(row.taxPercentage))) /
                                  100}{" "}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    onClick={handleAddRow}
                    className="mt-4 px-4 py-1 bg-pink-500 text-white rounded"
                  >
                    <MdPlaylistAdd />
                  </button>
                </div>
              </div>
            ) : (
              type !== "stockTransfer" && (
                <div className=" flex justify-end items-center mt-4 font-semibold gap-1 text-violet-500 cursor-pointer pr-4">
                  <div
                    onClick={() => {
                      setAdditional(true);
                    }}
                    className="flex items-center"
                  >
                    <IoMdAdd className="text-lg sm:text-xl" />
                    <p className="text-xs sm:text-base">Additional Charges </p>
                  </div>
                </div>
              )
            )}
          </>
        </>
      )}
    </div>
  );
}

export default AddItemTile;
