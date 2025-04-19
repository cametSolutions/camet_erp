/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/api";
import {
  removeAll,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  removeParty,
  addAdditionalCharges,
  deleteRow,
  addAllAdditionalCharges,
  addVoucherType,
  addVoucherNumber,
} from "../../../slices/voucherSlices/commonVoucherSlice";
import DespatchDetails from "../../components/secUsers/DespatchDetails";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";
import PaymentSplittingIcon from "../../components/secUsers/main/paymentSplitting/PaymentSplittingIcon";
import FooterButton from "../../components/secUsers/main/FooterButton";
import TitleDiv from "../../components/common/TitleDiv";

function VoucherInitialPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // to find the current voucher
  const getVoucherType = () => {
    if (voucherTypeFromRedux) return;
    const pathname = location.pathname;
    let currentVoucher;
    if (pathname === "/sUsers/sales") {
      currentVoucher = "sale";
    } else {
      currentVoucher = "saleOrder";
    }

    dispatch(addVoucherType(currentVoucher));
  };

  // Redux selectors
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const {
    date,
    party,
    items,
    despatchDetails,
    heights: batchHeights,
    selectedPriceLevel: priceLevelFromRedux = "",
    voucherType: voucherTypeFromRedux,
    voucherNumber: voucherNumberFromRedux,
    allAdditionalCharges: allAdditionalChargesFromRedux,
  } = useSelector((state) => state.commonVoucherSlice);

  const paymentSplittingReduxData = useSelector(
    (state) => state?.paymentSplitting?.paymentSplittingData
  );

  const {
    additionalCharges: additionalChargesFromRedux = [],
    convertedFrom = [],
  } = useSelector((state) => state.commonVoucherSlice);

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [showAdditionalCharges, setShowAdditionalCharges] = useState(
    additionalChargesFromRedux.length > 0
  );
  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    date ? new Date(date) : new Date()
  );
  const [additionalChargesFromCompany, setAdditionalChargesFromCompany] =
    useState([]);
  const [rows, setRows] = useState([]);

  // Calculated values
  const subTotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  }, [items]);

  const additionalChargesTotal = useMemo(() => {
    return rows.reduce((acc, curr) => {
      let value = curr.finalValue === "" ? 0 : parseFloat(curr.finalValue);
      return curr.action === "add" ? acc + value : acc - value;
    }, 0);
  }, [rows]);

  const totalAmount = useMemo(() => {
    const totalAmountNotRounded = parseFloat(subTotal) + additionalChargesTotal;
    return Math.round(totalAmountNotRounded);
  }, [subTotal, additionalChargesTotal]);

  // API calls wrapped in promises
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Prepare promises conditionally
      const promises = [];

      // Additional Charges
      let additionalCharges = allAdditionalChargesFromRedux;
      if (!additionalCharges || additionalCharges.length === 0) {
        promises.push(
          api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
            withCredentials: true,
          })
        );
      } else {
        setAdditionalChargesFromCompany(additionalCharges);
        if (additionalCharges.length > 0) {
          const initialRow = {
            option: additionalCharges[0].name,
            value: "",
            action: "add",
            taxPercentage: additionalCharges[0].taxPercentage,
            hsn: additionalCharges[0].hsn,
            _id: additionalCharges[0]._id,
            finalValue: "",
          };
          setRows([initialRow]);
        } else {
          setRows(allAdditionalChargesFromRedux);
        }
      }

      // Configuration Number
      if (!voucherNumberFromRedux) {
        promises.push(
          api.get(`/api/sUsers/fetchConfigurationNumber/${cmp_id}/sales`, {
            withCredentials: true,
          })
        );
      } else {
        setVoucherNumber(voucherNumberFromRedux);
      }

      const responses = await Promise.all(promises);

      // Handle additional charges response if fetched
      if (responses[0] && !allAdditionalChargesFromRedux?.length) {
        const additionalChargesResponse = responses[0];
        additionalCharges =
          additionalChargesResponse.data?.additionalCharges || [];
        setAdditionalChargesFromCompany(additionalCharges);
        dispatch(addAllAdditionalCharges(additionalCharges));

        if (additionalCharges.length > 0) {
          const initialRow = {
            option: additionalCharges[0].name,
            value: "",
            action: "add",
            taxPercentage: additionalCharges[0].taxPercentage,
            hsn: additionalCharges[0].hsn,
            _id: additionalCharges[0]._id,
            finalValue: "",
          };
          setRows([initialRow]);
        }
      }

      // Handle configuration number response if fetched
      const configResponseIndex = allAdditionalChargesFromRedux?.length ? 0 : 1;

      if (responses[configResponseIndex]) {
        const configData = responses[configResponseIndex].data;

        if (configData.message === "default") {
          const voucherNumber = configData.configurationNumber;
          setVoucherNumber(voucherNumber);
          dispatch(addVoucherNumber(voucherNumber));
        } else {
          const { configDetails, configurationNumber } = configData;
          if (configDetails) {
            const { widthOfNumericalPart, prefixDetails, suffixDetails } =
              configDetails;
            const paddedNumber = configurationNumber
              .toString()
              .padStart(widthOfNumericalPart, 0);
            const finalOrderNumber = [
              prefixDetails,
              paddedNumber,
              suffixDetails,
            ]
              .filter(Boolean)
              .join("-");
            setVoucherNumber(finalOrderNumber);
            dispatch(addVoucherNumber(finalOrderNumber));
          } else {
            setVoucherNumber(configurationNumber);
            dispatch(addVoucherNumber(configurationNumber));
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id]);

  // Initialize component
  useEffect(() => {
    getVoucherType();
    if (!date) dispatch(changeDate(selectedDate));
    localStorage.removeItem("scrollPositionAddItemSales");
    fetchData();
  }, [fetchData]);

  // Row manipulation handlers
  const handleAddRow = () => {
    if (rows.some((row) => row.value === "")) {
      toast.error("Please add a value.");
      return;
    }

    if (additionalChargesFromCompany.length === 0) return;

    const newRow = {
      option: additionalChargesFromCompany[0].name,
      value: "",
      action: "add",
      taxPercentage: additionalChargesFromCompany[0].taxPercentage,
      hsn: additionalChargesFromCompany[0].hsn,
      _id: additionalChargesFromCompany[0]._id,
      finalValue: "",
    };

    setRows((prevRows) => [...prevRows, newRow]);
  };

  const handleLevelChange = (index, id) => {
    const selectedOption = additionalChargesFromCompany.find(
      (option) => option._id === id
    );
    if (!selectedOption) return;

    const newRows = [...rows];
    const updatedRow = {
      ...newRows[index],
      option: selectedOption.name,
      taxPercentage: selectedOption.taxPercentage,
      hsn: selectedOption.hsn,
      _id: selectedOption._id,
      finalValue: "",
    };

    newRows[index] = updatedRow;
    setRows(newRows);
    dispatch(addAdditionalCharges({ index, row: updatedRow }));
  };

  const handleRateChange = (index, value) => {
    const newRows = [...rows];
    let updatedRow = { ...newRows[index], value };

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
    const updatedRow = { ...newRows[index], action: value };
    newRows[index] = updatedRow;
    setRows(newRows);
    dispatch(addAdditionalCharges({ index, row: updatedRow }));
  };

  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    dispatch(deleteRow(index));
  };

  // Navigation and form handlers
  const handleAddItem = () => {
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItemSales");
  };

  // const cancelAdditionalCharges = () => {
  //   setShowAdditionalCharges(false);
  //   dispatch(removeAdditionalCharge());

  //   if (additionalChargesFromCompany.length > 0) {
  //     setRows([{
  //       option: additionalChargesFromCompany[0].name,
  //       value: "",
  //       action: "add",
  //       taxPercentage: additionalChargesFromCompany[0].taxPercentage,
  //       hsn: additionalChargesFromCompany[0].hsn,
  //       _id: additionalChargesFromCompany[0]._id,
  //       finalValue: "",
  //     }]);
  //   } else {
  //     setRows([]);
  //   }
  // };

  const submitHandler = async () => {
    // Validation
    if (Object.keys(party).length === 0) {
      toast.error("Add a party first");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least an item");
      return;
    }

    if (showAdditionalCharges) {
      if (rows.some((row) => row.value === "")) {
        toast.error("Please add a value.");
        return;
      }

      if (rows.some((row) => parseFloat(row.value) < 0)) {
        toast.error("Please add a positive value");
        return;
      }
    }

    setSubmitLoading(true);

    try {
      const formData = {
        party,
        items,
        despatchDetails,
        priceLevelFromRedux,
        additionalChargesFromRedux: rows,
        lastAmount: totalAmount.toFixed(2),
        cmp_id,
        voucherNumber,
        batchHeights,
        selectedDate,
        convertedFrom,
        paymentSplittingData:
          Object.keys(paymentSplittingReduxData).length !== 0
            ? paymentSplittingReduxData
            : {},
      };

      const res = await api.post(
        `/api/sUsers/createSale?vanSale=${false}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      navigate(`/sUsers/salesDetails/${res.data.data._id}`, {
        state: { from: location?.state?.from || "null" },
      });
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating sale");
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mb-14 sm:mb-0">
      <div className="flex-1 bg-slate-100 h -screen ">
        <TitleDiv
          title="Sales"
          // from={`/sUsers/selectVouchers`}
          loading={isLoading || submitLoading}
        />

        <div className={`${isLoading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}

          <HeaderTile
            title={voucherTypeFromRedux}
            number={voucherNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            tab="add"
            isLoading={submitLoading}
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
            // additional={additional}
            // cancelHandler={cancelHandler}
            rows={rows}
            handleDeleteRow={handleDeleteRow}
            handleLevelChange={handleLevelChange}
            additionalChargesFromCompany={additionalChargesFromCompany}
            actionChange={actionChange}
            handleRateChange={handleRateChange}
            handleAddRow={handleAddRow}
            // setAdditional={setAdditional}
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
            isLoading={submitLoading || isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default VoucherInitialPage;
