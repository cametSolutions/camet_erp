/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { FiMinus } from "react-icons/fi";
import { IoIosArrowDown, IoMdAdd } from "react-icons/io";
import { MdCancel, MdPlaylistAdd } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdditionalCharges,
  removeAdditionalCharge,
  deleteRow,
  updateTotalValue,
  resetPaymentSplit,
} from "../../../../slices/voucherSlices/commonVoucherSlice";
import { toast } from "sonner";

export default function AdditionalChargesTile({
  type,
  setOpenAdditionalTile,
  openAdditionalTile,
}) {
  const {
    allAdditionalCharges: allAdditionalChargesFromRedux,
    additionalCharges: additionalChargesFromRedux,
    items: itemsFromRedux,
    voucherType: voucherTypeFromRedux,
  } = useSelector((state) => state.commonVoucherSlice);

  const defaultCharge = allAdditionalChargesFromRedux?.[0];
  const dispatch = useDispatch();

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (additionalChargesFromRedux.length > 0) {
      setRows(additionalChargesFromRedux);
      setOpenAdditionalTile(true);
    } else if (defaultCharge) {
      const { name: option, taxPercentage, hsn, _id } = defaultCharge;
      setRows([
        {
          option,
          value: "",
          action: "add",
          taxPercentage,
          hsn,
          _id,
          finalValue: "",
        },
      ]);
    }
  }, [additionalChargesFromRedux, defaultCharge]);

  useEffect(() => {
    if (itemsFromRedux.length <= 0) {
      setOpenAdditionalTile(false);
      setRows([
        {
          option: defaultCharge?.name,
          value: "",
          action: "add",
          taxPercentage: defaultCharge?.taxPercentage,
          hsn: defaultCharge?.hsn,
          _id: defaultCharge?._id,
          finalValue: "",
        },
      ]);
    }
  }, [itemsFromRedux]);

  const handleAddRow = () => {
    const hasEmptyValue = rows.some((row) => row.value === "");
    // console.log(hasEmptyValue);
    if (hasEmptyValue) {
      toast.error("Please add a value.");
      return;
    }

    setRows([
      ...rows,
      {
        option: defaultCharge?.name,
        value: "",
        action: "add",
        taxPercentage: defaultCharge?.taxPercentage,
        hsn: defaultCharge?.hsn,
        _id: defaultCharge?._id,
        finalValue: "",
      },
    ]);
  };

  const handleAdditionalChargeChange = (index, id) => {
    const selectedOption = allAdditionalChargesFromRedux.find(
      (option) => option._id === id
    );

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      option: selectedOption?.name,
      taxPercentage: selectedOption?.taxPercentage,
      hsn: selectedOption?.hsn,
      _id: selectedOption?._id,
      finalValue: "",
    };
    // console.log(newRows);
    setRows(newRows);

    dispatch(addAdditionalCharges({ index, row: newRows[index] }));
  };

  // console.log(rows);

  const handleRateChange = (index, value) => {

    console.log(value);
    
    const newRows = [...rows];
    let updatedRow = { ...newRows[index], value: value }; // Create a new object with the updated value

    if (updatedRow.taxPercentage && updatedRow.taxPercentage !== "") {
      const taxAmount =
        (parseFloat(value) * parseFloat(updatedRow.taxPercentage)) / 100;
      updatedRow.finalValue = parseFloat(value) + taxAmount;
    } else {
      updatedRow.finalValue = parseFloat(value);
    }
    newRows[index] = updatedRow;
    setRows(newRows);
    dispatch(addAdditionalCharges({ index, row: updatedRow }));
    dispatch(resetPaymentSplit())
  };

  const actionChange = (index, value) => {
    const newRows = [...rows];
    const updatedRow = { ...newRows[index], action: value }; // Create a new object with the updated action
    newRows[index] = updatedRow; // Replace the old row with the updated one in the newRows array
    setRows(newRows);
    dispatch(addAdditionalCharges({ index, row: updatedRow }));
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index); // Create a new array without the deleted row
    setRows(newRows);
    dispatch(deleteRow(index)); // You need to create an action to handle row deletion in Redux
    dispatch(resetPaymentSplit(index)); // You need to create an action to handle row deletion in Redux
  };

  const cancelHandler = () => {
    dispatch(removeAdditionalCharge());
    dispatch(resetPaymentSplit());
    setOpenAdditionalTile(false);
    setRows([
      {
        option: defaultCharge?.name,
        value: "",
        action: "add",
        taxPercentage: defaultCharge?.taxPercentage,
        hsn: defaultCharge?.hsn,
      },
    ]);
  };

  const additionalChargesTotal = useMemo(() => {
    return rows.reduce((acc, curr) => {
      let value = curr.finalValue === "" ? 0 : parseFloat(curr.finalValue);
      return curr.action === "add" ? acc + value : acc - value;
    }, 0);
  }, [rows]);

  // eslint-disable-next-line no-unused-vars
  const totalAmount = useMemo(() => {
    // const totalAmountNotRounded =
    //   parseFloat(subTotalFromRedux || 0) + (additionalChargesTotal || 0) || 0;

    dispatch(
      updateTotalValue({
        field: "totalAdditionalCharges",
        value: Number(parseFloat(additionalChargesTotal || 0).toFixed(2)),
      })
    );
  }, [additionalChargesTotal]);

  return (
    <>
      {voucherTypeFromRedux !== "stockTransfer" && (
        <div className="w-full bg-white py-3 mt-2">
          {openAdditionalTile && type !== "stockTransfer" ? (
            <div className="container  bg-white p-4  text-xs">
              <div className="flex  items-center justify-between  font-bold  text-[13px]">
                <div className="flex  items-center gap-3">
                  <IoIosArrowDown className="font-bold text-sm" />
                  <p className="text-blue-800 text-xs ">Additional Charges</p>
                </div>
                <button
                  onClick={cancelHandler}
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
                              handleAdditionalChargeChange(
                                index,
                                e.target.value
                              )
                            }
                            className="block w-full   bg-white text-sm focus:outline-none border-none border-b-gray-500 "
                          >
                            {allAdditionalChargesFromRedux.length > 0 ? (
                              allAdditionalChargesFromRedux.map((el, index) => (
                                <option key={index} value={el._id}>
                                  {" "}
                                  {el.name}{" "}
                                </option>
                              ))
                            ) : (
                              <option>No charges available</option>
                            )}
                          </select>

                          {row?.taxPercentage !== "" && (
                            <div className="ml-3 text-[9px] text-gray-400">
                              GST @ {row?.taxPercentage || 0} %
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
                                row.action === "add" ? "border-violet-500 " : ""
                              }  cursor-pointer p-1 px-1.5 rounded-md  border  bg-gray-100 `}
                            >
                              <IoMdAdd />
                            </div>
                            <div
                              onClick={() => {
                                actionChange(index, "sub");
                              }}
                              className={` ${
                                row.action === "sub" ? "border-violet-500 " : ""
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
                                allAdditionalChargesFromRedux.length === 0
                                  ? "pointer-events-none opacity-20 "
                                  : ""
                              }   block w-full py-2 px-4 bg-white text-sm focus:outline-none border-b-2 border-t-0 border-l-0 border-r-0 `}
                            />
                          </div>

                          {row?.taxPercentage !== "" && row.value !== "" && (
                            <div className="ml-3 text-[9.5px] text-gray-400 mt-2">
                              With tax : ₹{" "}
                              {(parseFloat(row?.value || 0) *
                                (100 + parseFloat(row.taxPercentage || 0))) /
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
            <div className=" flex justify-end items-center  font-semibold gap-1 text-violet-500 cursor-pointer pr-4">
              <div
                onClick={() => {
                  setOpenAdditionalTile(true);
                }}
                className="flex items-center"
              >
                <IoMdAdd className="text-lg sm:text-xl" />
                <p className="text-xs ml-1 sm:text-base">Additional Charges</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
