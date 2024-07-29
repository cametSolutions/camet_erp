/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";

import { IoMdAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { useSelector } from "react-redux";
import { MdOutlineClose } from "react-icons/md";
import {
  removeParty,
  addAdditionalCharges,
  AddFinalAmount,
  deleteRow,
  changeDate,
} from "../../../slices/invoiceSecondary";
import { useDispatch } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FiMinus } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { IoIosAddCircle } from "react-icons/io";
import { MdPlaylistAdd } from "react-icons/md";
import {
  removeAll,
  removeAdditionalCharge,
  removeItem,
} from "../../../slices/invoiceSecondary";
import { IoIosArrowRoundBack } from "react-icons/io";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { PiAddressBookFill } from "react-icons/pi";
import DespatchDetails from "../../components/secUsers/DespatchDetails";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";

function InvoiceSecondary() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const date = useSelector((state) => state.invoiceSecondary.date);
  console.log(date);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [subTotal, setSubTotal] = useState(0);
  const [additional, setAdditional] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);

  const additionalChargesFromRedux = useSelector(
    (state) => state.invoiceSecondary.additionalCharges
  );

  const orgId = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?._id
  );
  const despatchDetails = useSelector(
    (state) => state.invoiceSecondary.despatchDetails
  );

  useEffect(() => {
    localStorage.removeItem("scrollPositionAddItem");
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  useEffect(() => {
    const getAdditionalChargesIntegrated = async () => {
      try {
        const res = await api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
          withCredentials: true,
        });
        console.log(res.data);
        setAdditionalChragesFromCompany(res.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    if (type != "self") {
      getAdditionalChargesIntegrated();
    }
  }, []);

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/getSingleOrganization/${orgId}`,
          {
            withCredentials: true,
          }
        );

        console.log(res.data.organizationData);
        if (type == "self") {
          setAdditionalChragesFromCompany(
            res.data.organizationData.additionalCharges
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSingleOrganization();
  }, [orgId]);

  useEffect(() => {
    const fetchConfigurationNumber = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/fetchConfigurationNumber/${orgId}/salesOrder`,

          {
            withCredentials: true,
          }
        );

        console.log(res.data);
        if (res.data.message === "default") {
          const { configurationNumber } = res.data;
          setOrderNumber(configurationNumber);
          return;
        }

        const { configDetails, configurationNumber } = res.data;
        console.log(configDetails);
        console.log(configurationNumber);

        if (configDetails) {
          const { widthOfNumericalPart, prefixDetails, suffixDetails } =
            configDetails;
          const newOrderNumber = configurationNumber.toString();
          console.log(newOrderNumber);
          console.log(widthOfNumericalPart);
          console.log(prefixDetails);
          console.log(suffixDetails);

          const padedNumber = newOrderNumber.padStart(widthOfNumericalPart, 0);
          console.log(padedNumber);
          const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
            .filter(Boolean)
            .join("-");
          console.log(finalOrderNumber);
          setOrderNumber(finalOrderNumber);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchConfigurationNumber();
  }, []);

  const [rows, setRows] = useState(
    additionalChargesFromRedux.length > 0
      ? additionalChargesFromRedux
      : additionalChragesFromCompany.length > 0
      ? [
          {
            option: additionalChragesFromCompany[0].name,
            value: "",
            action: "add",
            taxPercentage: additionalChragesFromCompany[0].taxPercentage,
            hsn: additionalChragesFromCompany[0].hsn,
            _id: additionalChragesFromCompany[0]._id,
            finalValue: "",
          },
        ]
      : [] // Fallback to an empty array if additionalChragesFromCompany is also empty
  );

  useEffect(() => {
    if (additionalChargesFromRedux.length > 0) {
      setAdditional(true);
    }
  }, []);
  const dispatch = useDispatch();

  const handleAddRow = () => {
    const hasEmptyValue = rows.some((row) => row.value === "");
    console.log(hasEmptyValue);
    if (hasEmptyValue) {
      toast.error("Please add a value.");
      return;
    }

    setRows([
      ...rows,
      {
        option: additionalChragesFromCompany[0]?.name,
        value: "",
        action: "add",
        taxPercentage: additionalChragesFromCompany[0]?.taxPercentage,
        hsn: additionalChragesFromCompany[0]?.hsn,
        _id: additionalChragesFromCompany[0]?._id,
        finalValue: "",
      },
    ]);
  };

  const handleLevelChange = (index, id) => {
    const selectedOption = additionalChragesFromCompany.find(
      (option) => option._id === id
    );
    console.log(selectedOption);

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      option: selectedOption?.name,
      taxPercentage: selectedOption?.taxPercentage,
      hsn: selectedOption?.hsn,
      _id: selectedOption?._id,
      finalValue: "",
    };
    console.log(newRows);
    setRows(newRows);

    dispatch(addAdditionalCharges({ index, row: newRows[index] }));
  };

  const handleRateChange = (index, value) => {
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
  };
  const party = useSelector((state) => state.invoiceSecondary.party);
  const items = useSelector((state) => state.invoiceSecondary.items);
  const priceLevelFromRedux =
    useSelector((state) => state.invoiceSecondary.selectedPriceLevel) || "";

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    console.log(subTotal);
    setSubTotal(subTotal);
  }, [items]);

  const additionalChargesTotal = useMemo(() => {
    return rows.reduce((acc, curr) => {
      let value = curr.finalValue === "" ? 0 : parseFloat(curr.finalValue);
      if (curr.action === "add") {
        return acc + value;
      } else if (curr.action === "sub") {
        return acc - value;
      }
      return acc;
    }, 0);
  }, [rows]);

  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded);

  const navigate = useNavigate();

  const handleAddItem = () => {
    console.log(Object.keys(party).length);
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItem");
  };

  const cancelHandler = () => {
    setAdditional(false);
    dispatch(removeAdditionalCharge());
    setRows([{ option: "Option 1", value: "", action: "add" }]);
  };

  const submitHandler = async () => {
    console.log("haii");
    if (Object.keys(party).length == 0) {
      console.log("haii");

      toast.error("Add a party first");
      return;
    }
    if (items.length == 0) {
      console.log("haii");

      toast.error("Add at least an item");
      return;
    }

    if (additional) {
      console.log("haii");

      const hasEmptyValue = rows.some((row) => row.value === "");
      if (hasEmptyValue) {
        console.log("haii");

        toast.error("Please add a value.");
        return;
      }
      const hasNagetiveValue = rows.some((row) => parseFloat(row.value) < 0);
      if (hasNagetiveValue) {
        console.log("haii");

        toast.error("Please add a positive value");
        return;
      }
      console.log("haii");
    }

    const lastAmount = totalAmount.toFixed(2);

    dispatch(AddFinalAmount(lastAmount));

    const formData = {
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orgId,
      orderNumber,
      despatchDetails,
      selectedDate,
    };

    console.log(formData);

    try {
      const res = await api.post("/api/sUsers/createInvoice", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/InvoiceDetails/${res.data.data._id}`);

      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="flex relative ">
      <div className="flex-1 bg-slate-100  h-screen  ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          {/* <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          /> */}
          <Link to={"/sUsers/dashboard"}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
          </Link>
          <p className="text-white text-lg   font-bold ">
            Create Bill / Sales Order
          </p>
        </div>

        {/* invoiec date */}

        <HeaderTile
          title={"Order"}
          number={orderNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="add"
        />

  
        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchParty"
          linkBillTo="/sUsers/billToSalesOrder"
        />

        {/* Despatch details */}

        <DespatchDetails tab={"order"} />

        {/* adding items */}

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
                <div className="flex  items-center gap-3 font-bold">
                  <IoIosArrowDown className="font-bold" />
                  <p>Items ({items.length})</p>
                </div>

                <Link to={"/sUsers/addItem"}>
                  <div className=" flex items-center gap-2 font-bold text-violet-500">
                    <IoMdAdd className="text-xl" />
                    <p>Add Item</p>
                  </div>
                </Link>
              </div>

              {items.map((el, index) => (
                <>
                  <div
                    key={index}
                    className="py-3 mt-0 px-3 md:px-6 bg-white flex items-center gap-1.5 md:gap-4"
                  >
                    <div
                      onClick={() => {
                        dispatch(removeItem(el));
                      }}
                      className=" text-gray-500 text-sm cursor-pointer "
                    >
                      <MdCancel />
                    </div>
                    <div className=" flex-1">
                      <div className="flex justify-between font-bold text-xs gap-10">
                        <p>{el.product_name}</p>
                        <p className="text-nowrap"> ₹ {el.total ?? 0}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 ">
                        <div className="w-3/5 md:w-2/5 font-semibold text-gray-500 text-xs  flex flex-col gap-2 ">
                          <div className="flex justify-between">
                            <p className="text-nowrap">
                              Qty <span className="text-xs">x</span> Rate
                            </p>
                            <p className="text-nowrap">
                              {el.count} {el.unit} X{" "}
                              {/* {el.Priceleveles.find(
                                (item) => item.pricelevel == priceLevelFromRedux
                              )?.pricerate || 0} */}
                              {el?.selectedPriceRate || 0}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-nowrap"> Tax </p>
                            <p className="text-nowrap">({el.igst} %)</p>
                          </div>
                          {(el.discount > 0 || el.discountPercentage > 0) && (
                            <div className="flex justify-between">
                              <p className="text-nowrap"> Discount </p>
                              <div className="flex items-center">
                                <p className="text-nowrap ">
                                  {el.discount > 0
                                    ? `₹ ${el.discount}`
                                    : `${el.discountPercentage}%`}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* <Link
                        to={{
                          pathname: `/pUsers/editItem/${el._id}`,
                          state: { from: "invoice" }, // Set the state to indicate where the user is coming from
                        }}
                      > */}
                        <div className="">
                          <p
                            onClick={() => {
                              navigate(`/sUsers/editItem/${el._id}`, {
                                state: { from: "invoice" },
                              });
                            }}
                            className="text-violet-500 text-xs md:text-base font-bold  p-1  px-4   border border-1 border-gray-300 rounded-2xl cursor-pointer"
                          >
                            Edit
                          </p>
                        </div>
                        {/* </Link> */}
                      </div>
                    </div>
                  </div>
                  <hr />
                </>
              ))}
            </div>
            <div className="flex  justify-between items-center bg-white p-2 px-4">
              <p className="text-sm md:text-base font-bold">Items Subtotal:</p>
              <p className="text-sm md:text-base font-bold">{` ₹ ${subTotal.toFixed(
                2
              )}`}</p>
            </div>
            {type == "self" && (
              <>
                {additional ? (
                  <div className="container mx-auto mt-2 bg-white p-4 text-xs">
                    <div className="flex  items-center justify-between  font-bold  text-[13px]">
                      <div className="flex  items-center gap-3">
                        <IoIosArrowDown className="font-bold text-[15px]" />
                        <p className="text-blue-800">Additional Charges</p>
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

                                {row?.taxPercentage !== "" &&
                                  row.value !== "" && (
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
                  <div className=" flex justify-end items-center mt-4 font-semibold gap-1 text-violet-500 cursor-pointer pr-4">
                    <div
                      onClick={() => {
                        setAdditional(true);
                      }}
                      className="flex items-center"
                    >
                      <IoMdAdd className="text-2xl" />
                      <p>Additional Charges </p>
                    </div>
                  </div>
                )}
              </>
            )}
            {type != "self" && (
              <>
                {additional ? (
                  <div className="container mx-auto mt-2 bg-white p-4 text-xs">
                    <div className="flex  items-center justify-between  font-bold  text-[13px]">
                      <div className="flex  items-center gap-3">
                        <IoIosArrowDown className="font-bold text-[15px]" />
                        <p className="text-blue-800">Additional Charges</p>
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

                                {row?.taxPercentage !== "" &&
                                  row.value !== "" && (
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
                  <div className=" flex justify-end items-center mt-4 font-semibold gap-1 text-violet-500 cursor-pointer pr-4">
                    <div
                      onClick={() => {
                        setAdditional(true);
                      }}
                      className="flex items-center"
                    >
                      <IoMdAdd className="text-2xl" />
                      <p>Additional Charges </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div className="flex justify-between bg-white mt-2 p-3">
          <p className="font-bold text-lg">Total Amount</p>
          <div className="flex flex-col items-center">
            <p className="font-bold text-lg">₹ {totalAmount.toFixed(2) ?? 0}</p>
            <p className="text-[9px] text-gray-400">(rounded)</p>
          </div>
        </div>

        <div className=" md:hidden ">
          <div className="flex justify-center overflow-hidden w-full">
            <button
              onClick={submitHandler}
              className="fixed bottom-0 text-white bg-violet-700  w-full  p-2 py-2.5 flex items-center justify-center gap-2 hover_scale cursor-pointer "
            >
              <IoIosAddCircle className="text-2xl" />
              <p>Generate Order</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoiceSecondary;
