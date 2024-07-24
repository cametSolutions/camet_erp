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
  removeAll,
  removeAdditionalCharge,
  removeItem,
  removeGodownOrBatch,
  setParty,
  setItem,
  setSelectedPriceLevel,
  setAdditionalCharges,
  setFinalAmount,
  addDespatchDetails,
  changeDate,
} from "../../../slices/salesSecondary";
import { useDispatch } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FiMinus } from "react-icons/fi";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { IoIosAddCircle } from "react-icons/io";
import { MdPlaylistAdd } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { Button, Label, Modal, TextInput } from "flowbite-react";
import { PiAddressBookFill } from "react-icons/pi";
import DespatchDetails from "../../components/secUsers/DespatchDetails";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";

function EditVanSale() {
  ////////////////////////////////state//////////////////////////////////////////////////////

  const [openModal, setOpenModal] = useState(false);
  const [modalInputs, setModalInputs] = useState({
    startingNumber: "1",
    widthOfNumericalPart: "",
    prefixDetails: "",
    suffixDetails: "",
  });
  const [additional, setAdditional] = useState(false);
  const [godownname, setGodownname] = useState("");
  const [refreshCmp, setrefreshCmp] = useState(false);
  const [salesNumber, setSalesNumber] = useState("");
  const date = useSelector((state) => state.salesSecondary.date);
  const [selectedDate, setSelectedDate] = useState(date);

  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);
  const [subTotal, setSubTotal] = useState(0);

  const additionalChargesFromRedux = useSelector(
    (state) => state.salesSecondary.additionalCharges
  );
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

  ////////////////////////////////redux//////////////////////////////////////////////////////

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  const salesDetailsFromRedux = useSelector((state) => state.salesSecondary);
  console.log(salesDetailsFromRedux);

  const {
    party: partyFromRedux,
    items: itemsFromRedux,
    despatchDetails: despatchDetailsFromRedux,
    finalAmount: finalAmountFromRedux,
    heights: heightsFromRedux,
    date: dateFromRedux,

  } = salesDetailsFromRedux;

  ////////////////////////////////utils//////////////////////////////////////////////////////

  const dispatch = useDispatch();
  const { id } = useParams();

  ////////////////////////////////getting invoice details//////////////////////////////////////////////////////

  useEffect(() => {
    const fetchSalesDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/getSalesDetails/${id}`, {
          params:{
            vanSale:true
          },
          withCredentials: true,
        });

        console.log(res.data.data);
        const {
          party,
          items,
          priceLevel,
          additionalCharges,
          finalAmount,
          salesNumber,
          despatchDetails,
          createdAt,
        } = res.data.data;

        console.log(createdAt);

        // // additionalCharges: [ { option: 'option 1', value: '95', action: 'add' } ],
        if (Object.keys(partyFromRedux) == 0) {
          console.log("haii");

          dispatch(setParty(party));
        }

        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
        }
        if (finalAmount) {
          dispatch(setFinalAmount(finalAmountFromRedux));
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

        // dispatch(setFinalAmount(finalAmount));

        if (salesNumber) {
          setSalesNumber(salesNumber);
        }

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
        if (Object.keys(heightsFromRedux).length == 0) {
          console.log("haii");
          //   dispatch(setBatchHeight());
        }

        if (
          Object.keys(despatchDetailsFromRedux).every(
            (key) => despatchDetailsFromRedux[key] == ""
          )
        ) {
          console.log("haii");
          dispatch(addDespatchDetails(despatchDetails));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSalesDetails();
  }, []);

  ////////////////////////////////getting additional charges//////////////////////////////////////////////////////

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
    localStorage.removeItem("scrollPositionAddItemSales");
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
        // setCompany(res.data.organizationData);
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
  }, [refreshCmp, orgId]);

  useEffect(() => {
    const fetchGodownname = async () => {
      try {
        const godown = await api.get(`/api/sUsers/godownsName/${cmp_id}`, {
          withCredentials: true,
        });
        console.log(godown);
        setGodownname(godown.data || "");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };
    fetchGodownname();
  }, []);

  console.log(salesNumber);

  console.log(rows);

  useEffect(() => {
    if (additionalChargesFromRedux.length > 0) {
      setAdditional(true);
    }
  }, []);

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

  console.log(rows);

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
  const party = useSelector((state) => state.salesSecondary.party);
  const items = useSelector((state) => state.salesSecondary.items);
  const priceLevelFromRedux =
    useSelector((state) => state.salesSecondary.selectedPriceLevel) || "";

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

  console.log(additionalChargesTotal);
  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded);

  console.log(totalAmount);

  const navigate = useNavigate();

  const handleAddItem = () => {
    console.log(Object.keys(party).length);
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItemSales");
  };

  const cancelHandler = () => {
    setAdditional(false);
    dispatch(removeAdditionalCharge());
    setRows([
      {
        option: additionalChragesFromCompany[0].name,
        value: "",
        action: "add",
        taxPercentage: additionalChragesFromCompany[0].taxPercentage,
        hsn: additionalChragesFromCompany[0].hsn,
      },
    ]);
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
      salesNumber,
      despatchDetails: despatchDetailsFromRedux,
      selectedDate:dateFromRedux||new Date()
    };

    console.log(formData);

    try {
      const res = await api.post(`/api/sUsers/editSale/${id}`, formData, {
        params:{
          vanSale:true
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);

      navigate(`/sUsers/vanSaleDetails/${res.data.data._id}`);
      dispatch(removeAll());
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.log(error);
    }
  };

  function onCloseModal() {
    setOpenModal(false);
    // setEmail('');
  }

  const saveSalesNumber = async () => {
    try {
      const res = await api.post(
        `/api/sUsers/saveSalesNumber/${orgId}`,
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

  return (
    <div className="flex relative ">
      <div className="flex-1 bg-slate-100  h-screen   ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          {/* <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          /> */}
          <Link to={"/sUsers/dashboard"}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
          </Link>
          <p className="text-white text-lg   font-bold ">Van Sale Edit</p>
        </div>

        {/* invoiec date */}

        <HeaderTile
          title={"Van Sale"}
          number={salesNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="edit"
        />

        {/* adding party */}

        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchPartySales"
          linkBillTo="/sUsers/billToSales"
        />

        {/* Despatch details */}

        <DespatchDetails tab={"sale"} />

        {/* adding items */}

      
        <AddItemTile
          items={items}
          handleAddItem={handleAddItem}
          dispatch={dispatch}
          removeItem={removeItem}
          removeGodownOrBatch={removeGodownOrBatch}
          navigate={navigate}
          godownname={godownname}
          subTotal={subTotal}
          type="sale"
          additional={additional}
          cancelHandler={cancelHandler}
          rows={rows}
          handleDeleteRow={handleDeleteRow}
          handleLevelChange={handleLevelChange}
          additionalChragesFromCompany={additionalChragesFromCompany}
          actionChange={actionChange}
          handleRateChange={handleRateChange}
          handleAddRow={handleAddRow}
          setAdditional={setAdditional}
          urlToAddItem="/sUsers/addItemVanSale"
          urlToEditItem="/sUsers/editItemSales"
        />

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
              className="fixed bottom-0 text-white bg-violet-700  w-full  p-2 py-4 flex items-center justify-center gap-2 hover_scale cursor-pointer "
            >
              <IoIosAddCircle className="text-2xl" />
              <p>Edit Sale</p>
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
                      navigate("/sUsers/hsn");
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
              <Button onClick={saveSalesNumber}>Submit</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default EditVanSale;
