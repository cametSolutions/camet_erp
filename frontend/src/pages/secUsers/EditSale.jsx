/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  removeParty,
  addAdditionalCharges,
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
  addConvertedFrom
} from "../../../slices/salesSecondary";
import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";

import DespatchDetails from "../voucher/DespatchDetails";
import HeaderTile from "../voucher/HeaderTile";
import AddPartyTile from "../voucher/AddPartyTile";
import AddItemTile from "../voucher/AddItemTile";
import { addPaymentSplittingData } from "../../../slices/filterSlices/paymentSplitting/paymentSplitting";
import PaymentSplittingIcon from "../../components/secUsers/main/paymentSplitting/PaymentSplittingIcon";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../voucher/FooterButton";

function EditSale() {
  ////////////////////////////////state//////////////////////////////////////////////////////

  const [additional, setAdditional] = useState(false);
  const [salesNumber, setSalesNumber] = useState("");
  const date = useSelector((state) => state.salesSecondary.date);
  const [selectedDate, setSelectedDate] = useState(date);
  const [dataLoading, setDataLoading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  ////dataLoading////
  // Helper function to manage dataLoading state
  const incrementLoading = () => setDataLoading((prev) => prev + 1);
  const decrementLoading = () => setDataLoading((prev) => prev - 1);

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

  const convertedFromFromRedux = useSelector(
    (state) => state.salesSecondary.convertedFrom
  ) || [];

  const salesDetailsFromRedux = useSelector((state) => state.salesSecondary);

  const {
    paymentSplittingData: paymentSplittingReduxData ={},
    initial: paymentSplittingInitial,
  } = useSelector((state) => state?.paymentSplitting);


  const {
    party: partyFromRedux,
    items: itemsFromRedux,
    despatchDetails: despatchDetailsFromRedux,
    finalAmount: finalAmountFromRedux,
    // heights: heightsFromRedux,
    date: dateFromRedux,
  } = salesDetailsFromRedux;

  ////////////////////////////////utils//////////////////////////////////////////////////////

  const dispatch = useDispatch();
  const { id } = useParams();

  ////////////////////////////////getting invoice details//////////////////////////////////////////////////////

  useEffect(() => {
    const fetchSalesDetails = async () => {
      incrementLoading();
      try {
        const res = await api.get(`/api/sUsers/getSalesDetails/${id}`, {
          withCredentials: true,
        });

        const {
          party,
          items,
          priceLevel,
          additionalCharges,
          finalAmount,
          salesNumber,
          despatchDetails,
          // createdAt,
          date,
          paymentSplittingData,
          convertedFrom
        } = res.data.data;

        // // additionalCharges: [ { option: 'option 1', value: '95', action: 'add' } ],
        if (Object.keys(partyFromRedux) == 0) {
          dispatch(setParty(party));
        }

        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
        }
        if (finalAmountFromRedux == "") {
          dispatch(setFinalAmount(finalAmount));
        }

        if (!dateFromRedux) {
          setSelectedDate(date);
          dispatch(changeDate(date));
        }

        if (priceLevelFromRedux == "") {
          dispatch(setSelectedPriceLevel(priceLevel));
        }
        if (additionalChargesFromRedux.length == 0) {
          dispatch(setAdditionalCharges(additionalCharges));
        }
        if (salesNumber) {
          setSalesNumber(salesNumber);
        }

        

        if (
          Object.keys(paymentSplittingReduxData).length == 0 &&
          paymentSplittingInitial === true
        ) {
          dispatch(addPaymentSplittingData(paymentSplittingData));
        }

        // dispatch(setFinalAmount(finalAmount));

    

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
        // if (Object.keys(heightsFromRedux).length == 0) {
        //   //   dispatch(setBatchHeight());
        // }

        // dispatch(addDespatchDetails(despatchDetails));

        // console.log("despatchDetailsFromRedux", despatchDetailsFromRedux);
        


        if (
          Object.keys(despatchDetailsFromRedux).every(
            (key) => despatchDetailsFromRedux[key] == ""
          )
        ) {
          dispatch(addDespatchDetails(despatchDetails));
        }

        if(convertedFromFromRedux.length == 0){
          dispatch(addConvertedFrom(convertedFrom));
        }
      } catch (error) {
        console.log(error);
      } finally {
        decrementLoading();
      }
    };
    fetchSalesDetails();
  }, []);

  ////////////////////////////////getting additional charges//////////////////////////////////////////////////////

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
    if (additionalChargesFromRedux.length > 0) {
      setAdditional(true);
    }
  }, []);

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
  const party = useSelector((state) => state.salesSecondary.party);
  const items = useSelector((state) => state.salesSecondary.items);
  const priceLevelFromRedux =
    useSelector((state) => state.salesSecondary.selectedPriceLevel) || "";

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

  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded);


  const navigate = useNavigate();

  const handleAddItem = () => {
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
    setSubmitLoading(true);
    // e.preventDefault();
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
    if (!salesNumber || salesNumber==="") {
      toast.error("Error with your voucher number");
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
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orgId,
      salesNumber,
      despatchDetails: despatchDetailsFromRedux,
      selectedDate: dateFromRedux || new Date(),
    };

    if (
      paymentSplittingReduxData &&
      Object.keys(paymentSplittingReduxData).length !== 0
    ) {
      formData.paymentSplittingData = paymentSplittingReduxData;
      // formData.balanceAmount=paymentSplittingReduxData?.balanceAmount;
    } else {
      formData.paymentSplittingData = {};
    }


    try {
      const res = await api.post(`/api/sUsers/editSale/${id}`, formData, {
        params: {
          vasSale: false,
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);

      navigate(`/sUsers/salesDetails/${id}`);
      dispatch(removeAll());
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
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
          from={`/sUsers/salesDetails/${id}`}
          loading={submitLoading || loading}
        />

        {/* {!loading && ( */}

        <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
          <HeaderTile
            title={"Sale"}
            number={salesNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            tab="edit"
            loading={submitLoading}
          />

          <AddPartyTile
            party={party}
            dispatch={dispatch}
            removeParty={removeParty}
            link="/sUsers/searchPartySales"
            linkBillTo="/sUsers/billToSales"
            convertedFrom={convertedFromFromRedux}
          />
          <DespatchDetails tab={"sale"} />

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
            additionalChragesFromCompany={additionalChragesFromCompany}
            actionChange={actionChange}
            handleRateChange={handleRateChange}
            handleAddRow={handleAddRow}
            setAdditional={setAdditional}
            convertedFrom={convertedFromFromRedux}
            urlToAddItem="/sUsers/addItemSales"
            urlToEditItem="/sUsers/editItemSales"
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

          {items.length > 0 && totalAmount > 0 && (
            <PaymentSplittingIcon
              totalAmount={totalAmount}
              party={party}
              voucherType="sale"
            />
          )}

          <FooterButton
            submitHandler={submitHandler}
            tab="edit"
            title="Sale"
            loading={submitLoading}
          />
        </div>
        {/* )} */}

        {/* adding items */}
      </div>
    </div>
  );
}

export default EditSale;
