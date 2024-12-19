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
  addDespatchDetails,
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
  setItem,
  setParty,
  setFinalAmount,
  setAdditionalCharges,
  setSelectedPriceLevel,
  saveId,
  removeItem,
} from "../../../slices/invoiceSecondary";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useParams } from "react-router-dom";
import { PiAddressBookFill } from "react-icons/pi";
import DespatchDetails from "../../components/secUsers/DespatchDetails";
import TitleDiv from "../../components/common/TitleDiv";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import FooterButton from "../../components/secUsers/main/FooterButton";

function EditInvoiceSecondary() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const [openModal, setOpenModal] = useState(false);

  const [additional, setAdditional] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);
  const dateFromRedux = useSelector((state) => state.invoiceSecondary.date);
  const [dataLoading, setDataLoading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateFromRedux);

  const additionalChargesFromRedux = useSelector(
    (state) => state.invoiceSecondary.additionalCharges
  );

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const dispatch = useDispatch();

  const { id } = useParams();

  ////dataLoading////
  // Helper function to manage dataLoading state
  const incrementLoading = () => setDataLoading((prev) => prev + 1);
  const decrementLoading = () => setDataLoading((prev) => prev - 1);

  useEffect(() => {
    const getAdditionalChargesIntegrated = async () => {
      incrementLoading();

      try {
        const res = await api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
          withCredentials: true,
        });
        setAdditionalChragesFromCompany(res.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        decrementLoading();
      }
    };
    if (type != "self") {
      getAdditionalChargesIntegrated();
    }
  }, []);

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      incrementLoading();

      try {
        const res = await api.get(
          `/api/sUsers/getSingleOrganization/${orgId}`,
          {
            withCredentials: true,
          }
        );
        if (type == "self") {
          setAdditionalChragesFromCompany(
            res.data.organizationData.additionalCharges
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        decrementLoading();
      }
    };
    fetchSingleOrganization();
  }, [orgId]);

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
    if (additionalChargesFromRedux.length) {
      setAdditional(true);
    } else if (id !== undefined) {
      dispatch(saveId(id));
    }
  }, []);
  const [subTotal, setSubTotal] = useState(0);


  const handleAddRow = () => {
    const hasEmptyValue = rows.some((row) => row.value === "");
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

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      option: selectedOption?.name,
      taxPercentage: selectedOption?.taxPercentage,
      hsn: selectedOption?.hsn,
      _id: selectedOption?._id,
      finalValue: "",
    };
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
  const partyFromRedux = useSelector((state) => state.invoiceSecondary.party);
  const items = useSelector((state) => state.invoiceSecondary.items);
  const itemsFromRedux = useSelector((state) => state.invoiceSecondary.items);
  const despatchDetailsFromRedux = useSelector(
    (state) => state.invoiceSecondary.despatchDetails
  );
  const priceLevelFromRedux =
    useSelector((state) => state.invoiceSecondary.selectedPriceLevel) || "";

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      incrementLoading();
      try {
        const res = await api.get(`/api/sUsers/getInvoiceDetails/${id}`, {
          withCredentials: true,
        });

        const {
          party,
          items,
          priceLevel,
          additionalCharges,
          finalAmount,
          orderNumber,
          despatchDetails,
          createdAt,
        } = res.data.data;


        // additionalCharges: [ { option: 'option 1', value: '95', action: 'add' } ],
        if (Object.keys(partyFromRedux) == 0) {
          dispatch(setParty(party));
        }

        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
        }
        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
        }
        if (!dateFromRedux) {
          setSelectedDate(createdAt);
          dispatch(changeDate(createdAt));
        }

        if (priceLevelFromRedux == "") {
          dispatch(setSelectedPriceLevel(priceLevel));
        }
        if (additionalChargesFromRedux.length == 0) {
          dispatch(setAdditionalCharges(additionalCharges));
        }

        dispatch(setFinalAmount(finalAmount));
        setOrderNumber(orderNumber);

        if (
          additionalCharges &&
          additionalCharges.length > 0 &&
          additionalChargesFromRedux.length == 0
        ) {
          setAdditional(true);

          const newRows = additionalCharges.map((el) => {
            return {
              option: el.option,
              value: el.value,
              action: el.action,
              _id: el._id,
              taxPercentage: el.taxPercentage,
              hsn: el.hsn,
              finalValue: el.finalValue,
            };
          });
          setRows(newRows);
        }

        if (
          Object.keys(despatchDetailsFromRedux).every(
            (key) => despatchDetailsFromRedux[key] == ""
          )
        ) {
          dispatch(addDespatchDetails(despatchDetails));
        }
      } catch (error) {
        console.log(error);
      } finally {
        decrementLoading();
      }
    };
    fetchInvoiceDetails();
  }, []);

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
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

  const totalAmount =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);

  const navigate = useNavigate();

  const handleAddItem = () => {
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItem", { state: { from: "editInvoice", id: id } });
  };

  const cancelHandler = () => {
    setAdditional(false);
    dispatch(removeAdditionalCharge());
    setRows([{ option: "Option 1", value: "", action: "add" }]);
  };

  const InvoiceIdForEdit = useSelector((state) => state.invoiceSecondary.id);

  const submitHandler = async () => {
    setSubmitLoading(true);

    if (Object.keys(party).length == 0) {
      toast.error("Add a party first");
      setSubmitLoading(false);

      return;
    }
    if (items.length == 0) {
      toast.error("Add at least an item");
      setSubmitLoading(false);
      return;
    }

    if (additional) {
      const hasEmptyValue = rows.some((row) => row.value === "");
      if (hasEmptyValue) {
        toast.error("Please add a value.");
        setSubmitLoading(false);
        return;
      }
      const hasNagetiveValue = rows.some((row) => parseFloat(row.value) < 0);
      if (hasNagetiveValue) {
        toast.error("Please add a positive value");
        setSubmitLoading(false);
        return;
      }
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
      despatchDetails: despatchDetailsFromRedux,
      selectedDate: dateFromRedux || new Date(),
    };

 
    try {
      const res = await api.post(
        `/api/sUsers/editInvoice/${InvoiceIdForEdit}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);

      navigate(`/sUsers/InvoiceDetails/${res.data.data._id}`);

      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (dataLoading > 0) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [dataLoading]);

  return (
    <div className="mb-14 sm:mb-0">
      <div className="flex-1 bg-slate-100    ">
        <TitleDiv
          title="Edit Sale Order"
          from={`/sUsers/selectVouchers`}
          loading={loading || submitLoading}
        />

        {/* invoiec date */}
        <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
          <HeaderTile
            title={"Order"}
            number={orderNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            tab="edit"
            loading={submitLoading}
          />

          {/* adding party */}

          <div className="bg-white  py-3 px-4 pb-3 drop-shadow-lg mt-2 md:mt-3 text-xs md:text-base">
            <div className="flex justify-between">
              <div className="flex gap-2 ">
                <p className="font-bold uppercase text-xs">Party name</p>
                <span className="text-red-500 mt-[-4px] font-bold">*</span>
              </div>
              {Object.keys(party).length !== 0 && (
                <div className="flex items-center">
                  {/* <Link to={"/sUsers/searchParty"}> */}
                  <p
                    onClick={() => {
                      navigate(`/sUsers/searchParty`, {
                        state: { from: "editInvoice", id: id },
                      });
                    }}
                    className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer"
                  >
                    Change
                  </p>

                  <Link to={`/sUsers/billToSalesOrder/${party._id}`}>
                    <p className="text-violet-500 p-1 px-3  text-2xl  border-gray-300 rounded-2xl cursor-pointer">
                      <PiAddressBookFill />
                    </p>
                  </Link>
                  {/* </Link> */}
                </div>
              )}
            </div>

            {Object.keys(party).length === 0 ? (
              <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500">
                <button
                  onClick={() => {
                    navigate(`/sUsers/searchParty`, {
                      state: { from: "editInvoice", id: id },
                    });
                  }}
                  className="flex justify-center gap-2 hover_scale text-base "
                >
                  <IoMdAdd className="text-2xl" />
                  <p>Add Party Name</p>
                </button>
              </div>
            ) : (
              <div className="mt-3 p-3 py-2 border  border-gray-300  rounded-md   cursor-pointer items-center font-medium flex justify-between gap-4">
                <div className="flex justify-center items-center gap-3">
                  <IoPerson className="ml-4 text-gray-500" />
                  <span>{party?.partyName}</span>
                </div>
                <div className="">
                  <MdOutlineClose
                    onClick={() => {
                      dispatch(removeParty());
                    }}
                    className="mr-2 text-pink-500 hover_scale hover:text-pink-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Despatch details */}

          <DespatchDetails tab={"order"} />

          {/* adding items */}

          {items.length == 0 && (
            <div className="bg-white p-4 pb-6  drop-shadow-lg mt-2 md:mt-3">
              <div className="flex gap-2 ">
                <p className="font-bold uppercase text-sm">Item</p>
                <span className="text-red-500 mt-[-4px] font-bold">*</span>
              </div>

              <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500 ">
                {/* <Link to={"/sUsers/addItem"}>  */}
                <div
                  onClick={handleAddItem}
                  className="flex justify-center gap-2 hover_scale items-center "
                >
                  <IoMdAdd className="text-2xl" />
                  <p className="text-sm">Add Item</p>
                </div>
                {/* </Link> */}
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

                  {/* <Link to={"/sUsers/addItem"}> */}
                  <div
                    onClick={handleAddItem}
                    className=" flex items-center gap-2 font-bold text-violet-500 cursor-pointer"
                  >
                    <IoMdAdd className="text-2xl" />
                    <p>Add Item</p>
                  </div>
                  {/* </Link> */}
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
                <p className="text-sm md:text-base font-bold">
                  Items Subtotal:
                </p>
                <p className="text-sm md:text-base font-bold">{` ₹ ${subTotal.toFixed(
                  2
                )}`}</p>
              </div>
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
                                  className="block w-full py-2 px-4 bg-white text-sm focus:outline-none border-b-2 border-t-0 border-l-0 border-r-0 "
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

          <div className="flex justify-between bg-white mt-2 p-3">
            <p className="font-bold text-lg">Total Amount</p>
            <p className="font-bold text-lg">
              ₹ {Math.round(totalAmount).toFixed(2) ?? 0}
            </p>
          </div>

          <FooterButton
            submitHandler={submitHandler}
            tab="edit"
            title=" Order"
            loading={submitLoading || loading}
          />
        </div>
      </div>
    </div>
  );
}

export default EditInvoiceSecondary;
