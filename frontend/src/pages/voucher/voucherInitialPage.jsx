/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";
import {
  removeAll,
  removeAdditionalCharge,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  removeParty,
  addAdditionalCharges,
  deleteRow,
} from "../../../slices/voucherSlices/commonVoucherSlice";

import DespatchDetails from "../../components/secUsers/DespatchDetails";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";
import PaymentSplittingIcon from "../../components/secUsers/main/paymentSplitting/PaymentSplittingIcon";
import FooterButton from "../../components/secUsers/main/FooterButton";
import TitleDiv from "../../components/common/TitleDiv";

function VoucherInitialPage() {
  const [additional, setAdditional] = useState(false);
  const [salesNumber, setSalesNumber] = useState("");
  const [dataLoading, setDataLoading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [additionalChargesFromCompany, setAdditionalChargesFromCompany] =
    useState([]);

  const date = useSelector((state) => state.salesSecondary.date);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const {
    additionalCharges: additionalChargesFromRedux = [],
    convertedFrom = [],
  } = useSelector((state) => state.salesSecondary);

  const { _id: cmp_id, type } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const despatchDetails = useSelector(
    (state) => state.salesSecondary.despatchDetails
  );

  const paymentSplittingReduxData = useSelector(
    (state) => state?.paymentSplitting?.paymentSplittingData
  );

  const location = useLocation();

  ////dataLoading////
  // Helper function to manage dataLoading state
  const incrementLoading = () => setDataLoading((prev) => prev + 1);
  const decrementLoading = () => setDataLoading((prev) => prev - 1);

  useEffect(() => {
    const getAdditionalCharges = async () => {
      incrementLoading();

      try {
        const res = await api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
          withCredentials: true,
        });
        // console.log(res.data);
        setAdditionalChargesFromCompany(res.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        decrementLoading();
      }
    };
    if (type != "self") {
      getAdditionalCharges();
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem("scrollPositionAddItemSales");
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  useEffect(() => {
    const fetchConfigurationNumber = async () => {
      incrementLoading();
      try {
        const res = await api.get(
          `/api/sUsers/fetchConfigurationNumber/${cmp_id}/sales`,

          {
            withCredentials: true,
          }
        );

        // console.log(res.data);
        if (res.data.message === "default") {
          const { configurationNumber } = res.data;
          setSalesNumber(configurationNumber);
          return;
        }
        const { configDetails, configurationNumber } = res.data;

        if (configDetails) {
          const { widthOfNumericalPart, prefixDetails, suffixDetails } =
            configDetails;
          const newOrderNumber = configurationNumber.toString();

          const padedNumber = newOrderNumber.padStart(widthOfNumericalPart, 0);
          const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
            .filter(Boolean)
            .join("-");
          setSalesNumber(finalOrderNumber);
        } else {
          setSalesNumber(salesNumber);
        }
      } catch (error) {
        console.log(error);
      } finally {
        decrementLoading();
      }
    };

    // console.log(salesNumber);

    fetchConfigurationNumber();
  }, []);

  const [rows, setRows] = useState(
    additionalChargesFromRedux.length > 0
      ? additionalChargesFromRedux
      : additionalChargesFromCompany.length > 0
      ? [
          {
            option: additionalChargesFromCompany[0].name,
            value: "",
            action: "add",
            taxPercentage: additionalChargesFromCompany[0].taxPercentage,
            hsn: additionalChargesFromCompany[0].hsn,
            _id: additionalChargesFromCompany[0]._id,
            finalValue: "",
          },
        ]
      : [] // Fallback to an empty array if additionalChargesFromCompany is also empty
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
    // console.log(hasEmptyValue);
    if (hasEmptyValue) {
      toast.error("Please add a value.");
      return;
    }

    setRows([
      ...rows,
      {
        option: additionalChargesFromCompany[0]?.name,
        value: "",
        action: "add",
        taxPercentage: additionalChargesFromCompany[0]?.taxPercentage,
        hsn: additionalChargesFromCompany[0]?.hsn,
        _id: additionalChargesFromCompany[0]?._id,
        finalValue: "",
      },
    ]);
  };

  const handleLevelChange = (index, id) => {
    const selectedOption = additionalChargesFromCompany.find(
      (option) => option._id === id
    );
    // console.log(selectedOption);

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
  const batchHeights = useSelector((state) => state.salesSecondary.heights);

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    setSubTotal(subTotal);

    // console.log ("subTotal", subTotal);
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

  // console.log("additionalChargesTotal", additionalChargesTotal);
  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded);

  // console.log("totalAmount", totalAmount);

  // console.log(totalAmount);

  const navigate = useNavigate();

  const handleAddItem = () => {
    // console.log(Object.keys(party).length);
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
        option: additionalChargesFromCompany[0].name,
        value: "",
        action: "add",
        taxPercentage: additionalChargesFromCompany[0].taxPercentage,
        hsn: additionalChargesFromCompany[0].hsn,
      },
    ]);
  };

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

    // dispatch(AddFinalAmount(lastAmount));

    const formData = {
      party,
      items,
      despatchDetails,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      cmp_id,
      salesNumber,
      batchHeights,
      selectedDate,
      convertedFrom,
    };

    if (Object.keys(paymentSplittingReduxData).length !== 0) {
      formData.paymentSplittingData = paymentSplittingReduxData;
      // formData.balanceAmount=paymentSplittingReduxData?.balanceAmount;
    } else {
      formData.paymentSplittingData = {};
    }

    // console.log(formData);

    try {
      const res = await api.post(
        `/api/sUsers/createSale?vanSale=${false}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/salesDetails/${res.data.data._id}`, {
        state: {
          from: location?.state?.from || "null",
        },
      });
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
          title="Sales"
          // from={`/sUsers/selectVouchers`}
          loading={loading || submitLoading}
        />

        <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}

          <HeaderTile
            title={"Sale"}
            number={salesNumber}
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
            link="/sUsers/searchPartySales"
            linkBillTo="/sUsers/billToSales"
            convertedFrom={convertedFrom}
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
            godownname={""}
            subTotal={subTotal}
            type="sale"
            additional={additional}
            cancelHandler={cancelHandler}
            rows={rows}
            handleDeleteRow={handleDeleteRow}
            handleLevelChange={handleLevelChange}
            additionalChargesFromCompany={additionalChargesFromCompany}
            actionChange={actionChange}
            handleRateChange={handleRateChange}
            handleAddRow={handleAddRow}
            setAdditional={setAdditional}
            convertedFrom={convertedFrom}
            urlToAddItem="/sUsers/addItemSales"
            urlToEditItem="/sUsers/editItemSales"
          />

          <div className="flex justify-between items-center bg-white mt-2 p-3">
            <p className="font-bold text-md">Total Amount</p>
            <div className="flex flex-col items-center">
              <p className="font-bold text-md">
                ₹ {totalAmount.toFixed(2) ?? 0}
              </p>
              <p className="text-[9px] text-gray-400">(rounded)</p>
            </div>
          </div>

          {items.length > 0 && totalAmount > 0 && (
            <PaymentSplittingIcon
              totalAmount={totalAmount}
              party={party}
              voucherType="sale"
            />
          )}

          <FooterButton
            submitHandler={submitHandler}
            tab="add"
            title="Sale"
            loading={submitLoading || loading}
          />
        </div>
      </div>
    </div>
  );
}

export default VoucherInitialPage;
