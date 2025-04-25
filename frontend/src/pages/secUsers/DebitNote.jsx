/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  removeParty,
  addAdditionalCharges,
  AddFinalAmount,
  deleteRow,
} from "../../../slices/debitNote";
import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import {
  removeAll,
  removeAdditionalCharge,
  removeItem,
  removeGodownOrBatch,
  changeDate,
} from "../../../slices/debitNote";

import DespatchDetails from "../voucher/voucherCreation/DespatchDetails";
import HeaderTile from "../voucher/voucherCreation/HeaderTile";
import AddPartyTile from "../voucher/voucherCreation/AddPartyTile";
import AddItemTile from "../voucher/voucherCreation/AddItemTile";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../voucher/voucherCreation/FooterButton";
function DebitNote() {
  const [additional, setAdditional] = useState(false);
  const [dataLoading, setDataLoading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [debitNoteNumber, setDebitNoteNumber] = useState("");
  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);

  const date = useSelector((state) => state.debitNote.date);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const additionalChargesFromRedux = useSelector(
    (state) => state.debitNote.additionalCharges
  );
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const despatchDetails = useSelector(
    (state) => state.debitNote.despatchDetails
  );

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
    localStorage.removeItem("scrollPositionAddItemSales");
    if (date) {
      setSelectedDate(date);
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

        // setCompany(res.data.organizationData);
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

  useEffect(() => {
    const fetchConfigurationNumber = async () => {
      incrementLoading();
      try {
        const res = await api.get(
          `/api/sUsers/fetchConfigurationNumber/${orgId}/debitNote`,

          {
            withCredentials: true,
          }
        );

        if (res.data.message === "default") {
          const { configurationNumber } = res.data;
          setDebitNoteNumber(configurationNumber);
          return;
        }

        const { configDetails, configurationNumber } = res.data;

        if (configDetails) {
          const { widthOfNumericalPart, prefixDetails, suffixDetails } =
            configDetails;
          const newOrderNumber = configurationNumber.toString();
          // console.log(newOrderNumber);
          // console.log(widthOfNumericalPart);
          // console.log(prefixDetails);
          // console.log(suffixDetails);

          const padedNumber = newOrderNumber.padStart(widthOfNumericalPart, 0);
          const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
            .filter(Boolean)
            .join("-");
          setDebitNoteNumber(finalOrderNumber);
        } else {
          setDebitNoteNumber(debitNoteNumber);
        }
      } catch (error) {
        console.log(error);
      } finally {
        decrementLoading();
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
  const [subTotal, setSubTotal] = useState(0);
  const dispatch = useDispatch();

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
  const party = useSelector((state) => state.debitNote.party);
  const items = useSelector((state) => state.debitNote.items);
  const priceLevelFromRedux =
    useSelector((state) => state.debitNote.selectedPriceLevel) || "";

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
  const totalAmount = Math.round(totalAmountNotRounded);

  const navigate = useNavigate();

  const handleAddItem = () => {
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItemDebitNote");
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
    setSubmitLoading(true);
    if (Object.keys(party).length == 0) {
      toast.error("Add a party first");
      setSubmitLoading(false);
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
      despatchDetails,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orgId,
      debitNoteNumber,
      selectedDate,
    };

    try {
      const res = await api.post(`/api/sUsers/createDebitNote`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);

      navigate(`/sUsers/debitDetails/${res.data.data._id}`);
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
      <div className="flex-1 bg-slate-100 h -screen ">
   
        <TitleDiv
          title="Debit Note"
          from={`/sUsers/selectVouchers`}
          loading={loading || submitLoading}
        />

        <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}
          <HeaderTile
            title={"Debit"}
            number={debitNoteNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            tab="add"
            loading={submitLoading}
          />

          {/* adding party */}

          <AddPartyTile
            party={party}
            dispatch={dispatch}
            removeParty={removeParty}
            link="/sUsers/searchPartyDebitNote"
            linkBillTo="/sUsers/billToDebitNote"
          />

          {/* Despatch details */}

          <DespatchDetails tab={"debitNote"} />

          {/* adding items */}

          <AddItemTile
            items={items}
            handleAddItem={handleAddItem}
            dispatch={dispatch}
            removeItem={removeItem}
            removeGodownOrBatch={removeGodownOrBatch}
            navigate={navigate}
            godownname={""}
            subTotal={subTotal}
            type="debitNote"
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
            urlToAddItem="/sUsers/addItemDebitNote"
            urlToEditItem="/sUsers/editItemDebitNote"
          />

          <div className="flex justify-between bg-white mt-2 p-3">
            <p className="font-bold text-lg">Total Amount</p>
            <div className="flex flex-col items-center">
              <p className="font-bold text-lg">
                ₹ {totalAmount.toFixed(2) ?? 0}
              </p>
              <p className="text-[9px] text-gray-400">(rounded)</p>
            </div>
          </div>

          <FooterButton
            submitHandler={submitHandler}
            tab="add"
            title="Debit"
            loading={submitLoading || loading}
          />
        </div>
      </div>
    </div>
  );
}

export default DebitNote;
