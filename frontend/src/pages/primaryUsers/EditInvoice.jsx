/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import Sidebar from "../../components/homePage/Sidebar";
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
} from "../../../slices/invoice";
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
  removeItem
} from "../../../slices/invoice";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { useParams } from "react-router-dom";

function EditInvoice() {

  const [showSidebar, setShowSidebar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalInputs, setModalInputs] = useState({
    startingNumber: "1",
    widthOfNumericalPart: "",
    prefixDetails: "",
    suffixDetails: "",
  });
  const [additional, setAdditional] = useState(false);
  const [refreshCmp, setrefreshCmp] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);
  console.log(modalInputs);

  const additionalChargesFromRedux = useSelector(
    (state) => state.invoice.additionalCharges
  );
  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  const type = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg.type
  );

  const dispatch = useDispatch();
  const { id } = useParams();
  
  useEffect(()=>{
   
    const getAdditionalChargesIntegrated = async () => {
      try {
        const res = await api.get(`/api/pUsers/additionalcharges/${orgId}`, {
          withCredentials: true,
        });
        console.log(res.data)
        setAdditionalChragesFromCompany(res.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
  if(type != "self" ){
    getAdditionalChargesIntegrated()
  }
  },[])

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/pUsers/getSingleOrganization/${orgId}`,
          {
            withCredentials: true,
          }
        );
        if(type == "self"){
        setAdditionalChragesFromCompany(
          res.data.organizationData.additionalCharges
        );
      }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleOrganization();
  }, [refreshCmp, orgId]);

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
    } else if (id !== undefined) {
      dispatch(saveId(id));
    }
  }, []);
  const [subTotal, setSubTotal] = useState(0);

  console.log(id);

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
  const party = useSelector((state) => state.invoice.party);
  const partyFromRedux = useSelector((state) => state.invoice.party);
  const items = useSelector((state) => state.invoice.items);
  const itemsFromRedux = useSelector((state) => state.invoice.items);
  console.log(itemsFromRedux);
  const priceLevelFromRedux =
    useSelector((state) => state.invoice.selectedPriceLevel) || "";

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const res = await api.get(`/api/pUsers/getInvoiceDetails/${id}`, {
          withCredentials: true,
        });

        console.log(res.data.data);
        const {
          party,
          items,
          priceLevel,
          additionalCharges,
          finalAmount,
          orderNumber,
        } = res.data.data;

        // additionalCharges: [ { option: 'option 1', value: '95', action: 'add' } ],
        if (Object.keys(partyFromRedux) == 0) {
          console.log("haii");
          dispatch(setParty(party));
        }

        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
        }
        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
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

          const newRows = additionalCharges.map((el, index) => {
            return {
              option: el.option,
              value: el.value,
              action: el.action,
              _id:el._id,
              taxPercentage: el.taxPercentage,
              hsn: el.hsn,
              finalValue: el.finalValue,
            };
          });
          setRows(newRows);
        }
      } catch (error) {
        console.log(error);
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

  console.log(additionalChargesTotal);
  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded); // Round the total amount

  const navigate = useNavigate();

  console.log(orderNumber);

  const handleAddItem = () => {
    console.log(Object.keys(party).length);
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/pUsers/addItem", { state: { from: "editInvoice", id: id } });
  };

  const cancelHandler = () => {
    setAdditional(false);
    dispatch(removeAdditionalCharge());
    setRows([{ option: "Option 1", value: "", action: "add" }]);
  };

  const InvoiceIdForEdit = useSelector((state) => state.invoice.id);

  console.log(InvoiceIdForEdit);

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
    };

    console.log(formData);
    console.log(id);
    try {
      const res = await api.post(
        `/api/pUsers/editInvoice/${InvoiceIdForEdit}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/pUsers/InvoiceDetails/${res.data.data._id}`);

      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    // setEmail('');
  }

  const saveOrderNumber = async () => {
    try {
      const res = await api.post(
        `/api/pUsers/saveOrderNumber/${orgId}`,
        modalInputs,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast(res.data.message);
      setOpenModal(false);
      setrefreshCmp(!refreshCmp);

      console.log(res);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };


  console.log(rows);

  return (
    <div className="flex relative ">
      <div>
        <Sidebar TAB={"invoice"} showBar={showSidebar} refresh={refreshCmp} />
      </div>

      <div className="flex-1 bg-slate-100  h-screen overflow-y-scroll  ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          {/* <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          /> */}
          <Link to={`/pUsers/InvoiceDetails/${id}`}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
          </Link>
          <p className="text-white text-lg   font-bold ">
            Create Bill / Sales Order
          </p>
        </div>

        {/* invoiec date */}

        <div className="flex justify-between  p-4 bg-white drop-shadow-lg items-center text-xs md:text-base ">
          <div className=" flex flex-col gap-1 justify-center">
            <p className="text-md font-semibold text-violet-400">
              Order #{orderNumber}
            </p>
            <p className="font-semibold   text-gray-500 text-xs md:text-base">
              {new Date().toDateString()}
            </p>
          </div>
          <div className="  ">
            <div className="  flex gap-5 items-center ">
              <div className="hidden md:block">
                <button
                  onClick={submitHandler}
                  className=" bottom-0 text-white bg-violet-700  w-full rounded-md  p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer "
                >
                  <IoIosAddCircle className="text-2xl" />
                  <p>Edit Order</p>
                </button>
              </div>
              {/* <div>
                <button
                  disabled
                  onClick={() => setOpenModal(true)}
                  className="  text-violet-500 text-xs  p-1 px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer"
                >
                  Edit
                </button>
              </div> */}
              {/* <div>
                <button
                  onClick={() => {
                    dispatch(removeAll());
                  }}
                  className="  text-red-500 text-xs  p-1 px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* adding party */}

        <div className="bg-white  py-3 px-4 pb-3 drop-shadow-lg mt-2 md:mt-3 text-xs md:text-base">
          <div className="flex justify-between">
            <div className="flex gap-2 ">
              <p className="font-bold uppercase text-xs">Party name</p>
              <span className="text-red-500 mt-[-4px] font-bold">*</span>
            </div>
            {Object.keys(party).length !== 0 && (
              <div>
                {/* <Link to={"/pUsers/searchParty"}> */}
                <p
                  onClick={() => {
                    navigate(`/pUsers/searchParty`, {
                      state: { from: "editInvoice", id: id },
                    });
                  }}
                  className="text-violet-500 p-1 px-3  text-xs border border-1 border-gray-300 rounded-2xl cursor-pointer"
                >
                  Change
                </p>
                {/* </Link> */}
              </div>
            )}
          </div>

          {Object.keys(party).length === 0 ? (
            <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500">
              <button
                onClick={() => {
                  navigate(`/pUsers/searchParty`, {
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

        {/* adding items */}

        {items.length == 0 && (
          <div className="bg-white p-4 pb-6  drop-shadow-lg mt-2 md:mt-3">
            <div className="flex gap-2 ">
              <p className="font-bold uppercase text-sm">Item</p>
              <span className="text-red-500 mt-[-4px] font-bold">*</span>
            </div>

            <div className="mt-3 p-6 border border-gray-300 h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500 ">
              {/* <Link to={"/pUsers/addItem"}>  */}
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

                {/* <Link to={"/pUsers/addItem"}> */}
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
                  <div key={index} className="py-3 mt-0 px-3 md:px-6 bg-white flex items-center gap-1.5 md:gap-4">
                    <div onClick={()=>{dispatch(removeItem(el))}} className=" text-gray-500 text-sm cursor-pointer "><MdCancel/></div>
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
                              {el.Priceleveles.find(
                                (item) => item.pricelevel == priceLevelFromRedux
                              )?.pricerate || 0}
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
                              navigate(`/pUsers/editItem/${el._id}`, {
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
                                className={` ${additionalChragesFromCompany.length===0 ? "pointer-events-none opacity-20 " : ""}   block w-full py-2 px-4 bg-white text-sm focus:outline-none border-b-2 border-t-0 border-l-0 border-r-0 `}
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
          <div className="flex flex-col items-center">
            <p className="font-bold text-lg">₹ {totalAmount.toFixed(2) ?? 0}</p>
            <p className="text-[9px] text-gray-400">(rounded)</p>
          </div>        </div>

        <div className=" md:hidden ">
          <div className="flex justify-center overflow-hidden w-full">
            <button
              onClick={submitHandler}
              className="fixed bottom-0 text-white bg-violet-700  w-full  p-2 py-4 flex items-center justify-center gap-2 hover_scale cursor-pointer "
            >
              <IoIosAddCircle className="text-2xl" />
              <p>Edit Order</p>
            </button>
          </div>
        </div>

        {openModal && (
          <div
            id="popup-modal"
            className="  absolute top-0 right-0 bottom-0 left-0 z-50 flex justify-center items-center"
          >
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative  rounded-lg shadow bg-gray-700">
                <button
                  onClick={() => setOpenModal(false)}
                  type="button"
                  className="absolute top-3 end-2.5 text-gray-400 bg-transparent   rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center hover:bg-gray-600 hover:text-white"
                  data-modal-hide="popup-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
                <div className="p-4 md:p-5 text-center">
                  <svg
                    className="mx-auto mb-4 text-gray-200 w-12 h-12 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                  <h3 className="mb-5 text-lg font-normal text-gray-200 ">
                    You haven't added any HSN yet!!
                  </h3>

                  <button
                    type="button"
                    className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-500  font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-3"
                    onClick={() => {
                      navigate("/pUsers/hsn");
                    }}
                  >
                    Add HSN
                  </button>
                  <button
                    data-modal-hide="popup-modal"
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className=" bg-red-500 text-white hover:bg-red-700 focus:outline-none   rounded-lg font-medium text-sm inline-flex items-center px-5 py-2.5 text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
        }}
        show={openModal}
        size="md"
        onClose={onCloseModal}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white ">
              Enter Details
            </h3>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="startingNumber" value="Starting Number" />
              </div>
              <TextInput
                disabled
                id="startingNumber"
                placeholder="1"
                type="number"
                value={modalInputs.startingNumber}
                onChange={(e) =>
                  setModalInputs({
                    ...modalInputs,
                    startingNumber: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label
                  htmlFor="widthOfNumericalPart"
                  value="Width of Numerical Part"
                />
              </div>
              <TextInput
                id="widthOfNumericalPart"
                placeholder="4"
                type="number"
                value={modalInputs.widthOfNumericalPart}
                onChange={(e) =>
                  setModalInputs({
                    ...modalInputs,
                    widthOfNumericalPart: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="prefixDetails" value="Prefix Details" />
              </div>
              <TextInput
                id="prefixDetails"
                placeholder="ABC"
                value={modalInputs.prefixDetails}
                onChange={(e) =>
                  setModalInputs({
                    ...modalInputs,
                    prefixDetails: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="suffixDetails" value="Suffix Details" />
              </div>
              <TextInput
                id="suffixDetails"
                placeholder="XYZ"
                value={modalInputs.suffixDetails}
                onChange={(e) =>
                  setModalInputs({
                    ...modalInputs,
                    suffixDetails: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="w-full">
              <Button onClick={saveOrderNumber}>Submit</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default EditInvoice;
