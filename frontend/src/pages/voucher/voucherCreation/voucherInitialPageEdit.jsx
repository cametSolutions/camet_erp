/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../../api/api";
import {
  removeAll,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  removeParty,
  addVoucherType,
  addVoucherNumber,
  addAllAdditionalCharges,
  addVansSaleGodown,
  addMode,
  addParty,
  setItem,
  addDespatchDetails,
  setAdditionalCharges,
  setFinalAmount,
  setInitialized,
  addStockTransferToGodown,
} from "../../../../slices/voucherSlices/commonVoucherSlice";
import DespatchDetails from "./DespatchDetails";
import HeaderTile from "./HeaderTile";
import AddPartyTile from "./AddPartyTile";
import AddItemTile from "./AddItemTile";
// import PaymentSplittingIcon from "../../components/secUsers/main/paymentSplitting/PaymentSplittingIcon";
import FooterButton from "./FooterButton";
import TitleDiv from "../../../components/common/TitleDiv";
import AdditionalChargesTile from "./AdditionalChargesTile";
import { formatVoucherType } from "../../../../utils/formatVoucherType";
import AddGodownTile from "./AddGodownTile";

function VoucherInitialPageEdit() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);

  // Redux selectors
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const {
    date,
    party,
    items,
    despatchDetails,
    // heights: batchHeights,
    voucherType,
    selectedPriceLevel: priceLevelFromRedux = "",
    voucherType: voucherTypeFromRedux,
    voucherNumber: voucherNumberFromRedux,
    allAdditionalCharges: allAdditionalChargesFromRedux,
    finalAmount: totalAmount,
    vanSaleGodown: vanSaleGodownFromRedux,
    items: itemsFromRedux,
    party: partyFromRedux,
    despatchDetails: despatchDetailsFromRedux,
    finalAmount: finalAmountFromRedux,
    date: dateFromRedux,
    initialized: initializedFromRedux,
    stockTransferToGodown: stockTransferToGodownFromRedux,
  } = useSelector((state) => state.commonVoucherSlice);

  // to find the current voucher
  const getVoucherType = () => {
    if (voucherTypeFromRedux) return;
    /// if the voucherType is not present in redux then we will take it from the location state
    /// voucher type is assigned from the select voucher page to this page

    let currentVoucher = "sales";
    let Mode = "create";

    const { voucherType, mode } = location.state || {};
    if (location && location.state && voucherType) {
      currentVoucher = voucherType;
      Mode = mode;
    }
    dispatch(addVoucherType(currentVoucher));
    dispatch(addMode(Mode));
  };

  /// to get voucher number name

  const getVoucherNumberTitle = () => {
    if (!voucherTypeFromRedux) return "";
    if (
      voucherTypeFromRedux === "sales" ||
      voucherTypeFromRedux === "vanSale"
    ) {
      return "salesNumber";
    }
    if (voucherTypeFromRedux === "saleOrder") {
      return "orderNumber";
    } else {
      return voucherTypeFromRedux + "Number";
    }
  };

  /// to get api end point  edit of voucher

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
  const [selectedDate, setSelectedDate] = useState(() => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  });

  const [openAdditionalTile, setOpenAdditionalTile] = useState(false);
  const [voucherId, setVoucherId] = useState(null);

  // Calculated values
  const subTotal = useMemo(() => {
    return itemsFromRedux?.reduce(
      (acc, curr) => acc + (parseFloat(curr.total) || 0),
      0
    );
  }, [itemsFromRedux]);

  // API calls wrapped in promises
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    const voucherNumberTitle = getVoucherNumberTitle();

    const {
      date: selectedDateFromState,
      voucherType: voucherTypeFromState,
      // convertedFrom: convertedFromFromState,
      [voucherNumberTitle]: voucherNumberFromState,
      selectedGodownDetails: selectedGodownDetailsFromState = {},
      party: partyFromState = {},
      items: itemsFromState,
      despatchDetails: despatchDetailsFromState = {},
      additionalCharges: additionalChargesFromState = [],
      finalAmount: finalAmountFromState = 0,
      _id: voucherIdFromState,
      stockTransferToGodown: stockTransferToGodownFromState = {},
    } = location.state.data || {};


    try {
      if (voucherIdFromState) {
        setVoucherId(voucherIdFromState);
      }

      //  Populate Voucher Configuration Number for location state
      if (!voucherNumberFromRedux) {
        dispatch(addVoucherNumber(voucherNumberFromState));
        dispatch(addVoucherType(voucherTypeFromState));
        setVoucherNumber(voucherNumberFromState);
      } else {
        if (isMounted.current) {
          setVoucherNumber(voucherNumberFromRedux);
        }
      }

      /// populate date from location state
      if (selectedDateFromState && !dateFromRedux) {
        // Validate date before converting to ISO string
        const parsedDate = new Date(selectedDateFromState);

        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
          dispatch(changeDate(JSON.stringify(parsedDate)));
        } else {
          // Use current date as fallback if date is invalid
          const currentDate = new Date();
          setSelectedDate(currentDate);
          dispatch(changeDate(JSON.stringify(currentDate)));
        }
      } else if (dateFromRedux) {
        const parsedDate = new Date(JSON.parse(dateFromRedux));

        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        } else {
          // Use current date as fallback
          setSelectedDate(new Date());
        }
      }

      /// populate party from location state
      if (
        Object.keys(partyFromState)?.length > 0 &&
        Object.keys(partyFromRedux)?.length === 0
      ) {
        dispatch(addParty(partyFromState));
      }

      //// populate stock transfer to godown if voucher type is stock transfer

      if (
        voucherTypeFromRedux === "stockTransfer" &&
        stockTransferToGodownFromRedux === null &&
        Object.keys(stockTransferToGodownFromState).length > 0
      ) {
        dispatch(
          addStockTransferToGodown(stockTransferToGodownFromState || {})
        );
      }

      /// populate items from location state
      if (
        itemsFromState.length > 0 &&
        itemsFromRedux.length === 0 &&
        !initializedFromRedux
      ) {
        dispatch(setItem(itemsFromState));
      } else {
        dispatch(setItem(itemsFromRedux));
      }

      //// populate despatch details from location state
      if (
        Object.keys(despatchDetailsFromState).length > 0 &&
        Object.values(despatchDetailsFromRedux).every((item) => item === "")
      ) {
        dispatch(addDespatchDetails(despatchDetailsFromState));
      }
      /// populate additional charges from location state
      if (
        additionalChargesFromState.length > 0 &&
        additionalChargesFromRedux.length === 0 &&
        !initializedFromRedux
      ) {
        dispatch(setAdditionalCharges(additionalChargesFromState));
      }

      /// populate final amount from location state
      if (finalAmountFromState && finalAmountFromRedux == 0) {
        dispatch(setFinalAmount(finalAmountFromState));
      }
      // Add godownsName to Redux if voucher type is 'vanSale'
      if (
        voucherType === "vanSale" &&
        Object.keys(vanSaleGodownFromRedux).length === 0 &&
        isMounted.current
      ) {
        dispatch(addVansSaleGodown(selectedGodownDetailsFromState || {}));
      }

      // Get additional charges only if needed
      if (allAdditionalChargesFromRedux.length === 0 && isMounted.current) {
        const response = await api.get(
          `/api/sUsers/additionalcharges/${cmp_id}`,
          { withCredentials: true }
        );

        const additionalCharges = response.data?.additionalCharges || [];
        dispatch(addAllAdditionalCharges(additionalCharges));
      }

      if (!initializedFromRedux) {
        dispatch(setInitialized(true));
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error fetching data");
    } finally {
      setIsLoading(false);
    }
  }, [cmp_id, voucherTypeFromRedux, location]);

  ///// Initialize component
  useEffect(() => {
    getVoucherType();
    if (!date) dispatch(changeDate(JSON.stringify(selectedDate)));
    localStorage.removeItem("scrollPositionAddItemSales");
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [fetchData]);

  // Navigation and form handlers
  const handleAddItem = () => {
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItemSales");
  };

  const submitHandler = async () => {
    // Validation
    if (
      Object.keys(party).length === 0 &&
      voucherTypeFromRedux !== "stockTransfer"
    ) {
      toast.error("Add a party first");
      return;
    }

    if (
      voucherTypeFromRedux === "stockTransfer" &&
      Object.keys(stockTransferToGodownFromRedux).length === 0
    ) {
      toast.error("Select a from godown first");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least an item");
      return;
    }

    if (openAdditionalTile) {
      const hasEmptyValue = additionalChargesFromRedux.some(
        (row) => row.value === ""
      );
      if (hasEmptyValue) {
        toast.error("Please add a value.");
        setSubmitLoading(false);
        return;
      }
      const hasNagetiveValue = additionalChargesFromRedux.some(
        (row) => parseFloat(row.value) < 0
      );
      if (hasNagetiveValue) {
        toast.error("Please add a positive value");
        setSubmitLoading(false);

        return;
      }
    }

    setSubmitLoading(true);
    const voucherNumberTitle = getVoucherNumberTitle();

    // Ensure we have a valid date before converting to ISO string
    let dateToSubmit;
    try {
      dateToSubmit = new Date(selectedDate).toISOString();
    } catch (error) {
      console.error("Invalid date format:", error);
      dateToSubmit = new Date().toISOString(); // Fallback to current date
    }

    let formData = {};

    try {
      if (voucherTypeFromRedux === "stockTransfer") {
        formData = {
          selectedDate: new Date(dateToSubmit).toISOString(),
          voucherType,
          orgId: cmp_id,

          [voucherNumberTitle]: voucherNumber,
          stockTransferToGodown: stockTransferToGodownFromRedux,
          items,
          finalAmount: 0,
        };
      } else {
        formData = {
          selectedDate: new Date(selectedDate).toISOString(),
          voucherType,
          [voucherNumberTitle]: voucherNumber,
          orgId: cmp_id,
          finalAmount: Number(totalAmount.toFixed(2)),
          party,
          items,
          despatchDetails,
          priceLevelFromRedux,
          additionalChargesFromRedux,
          selectedGodownDetails: vanSaleGodownFromRedux,
        };
      }

      const res = await api.post(
        `/api/sUsers/edit${voucherTypeFromRedux}/${voucherId}?vanSale=${
          voucherTypeFromRedux === "vanSale" ? true : false
        }`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      dispatch(removeAll());
      setTimeout(() => {
        navigate(
          `/sUsers/${voucherTypeFromRedux}Details/${res.data.data._id}`,
          {
            state: { from: location?.state?.from || "null" },
            replace: true, // Use replace instead of push to prevent back navigation issues
          }
        );
      }, 100); // Small delay to ensure Redux state is cleared
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
          title={formatVoucherType(voucherTypeFromRedux)}
          // from={`/sUsers/selectVouchers`}
          loading={isLoading || submitLoading}
        />

        <div className={`${isLoading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}

          <HeaderTile
            title={formatVoucherType(voucherTypeFromRedux)}
            number={voucherNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            isLoading={submitLoading}
          />
          {/* adding party */}

          {voucherTypeFromRedux === "stockTransfer" ? (
            <AddGodownTile />
          ) : (
            <AddPartyTile
              party={party}
              dispatch={dispatch}
              removeParty={removeParty}
              link="/sUsers/searchPartySales"
              linkBillTo="/sUsers/billToSales"
              convertedFrom={convertedFrom}
            />
          )}

          {/* Despatch details */}

          {voucherTypeFromRedux !== "stockTransfer" && (
            <DespatchDetails tab={"sales"} />
          )}

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
            convertedFrom={convertedFrom}
            urlToAddItem="/sUsers/addItemSales"
            urlToEditItem="/sUsers/editItemSales"
          />

          <AdditionalChargesTile
            type={"sale"}
            subTotal={subTotal}
            setOpenAdditionalTile={setOpenAdditionalTile}
            openAdditionalTile={openAdditionalTile}
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

          {/* {items.length > 0 && totalAmount > 0 && (
            <PaymentSplittingIcon
              totalAmount={totalAmount}
              party={party}
              voucherType="sale"
            />
          )} */}

          <FooterButton
            submitHandler={submitHandler}
            title={formatVoucherType(voucherTypeFromRedux)}
            isLoading={submitLoading || isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default VoucherInitialPageEdit;
