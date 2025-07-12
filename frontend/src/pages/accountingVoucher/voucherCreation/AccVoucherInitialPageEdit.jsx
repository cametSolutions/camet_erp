import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../api/api";
import HeaderTile from "../../voucher/voucherCreation/HeaderTile";
import { useDispatch } from "react-redux";
import {
  addVoucherNumber,
  changeDate,
  removeAll,
  removeParty,
  addVoucherType,
  addMode,
  addParty,
  addCashPaymentDetails,
  addBankPaymentDetails,
  addPaymentMethod,
  addChequeNumber,
  addChequeDate,
  addNote,
  addEnteredAmount,
  addTotalBillAmount,
  addAdvanceAmount,
  addRemainingAmount,
  addBillData,
} from "../../../../slices/voucherSlices/commonAccountingVoucherSlice";
import AddPartyTile from "../../voucher/voucherCreation/AddPartyTile";
import AddAmountTile from "../../../components/secUsers/main/AddAmountTile";
import PaymentModeTile from "../../../components/secUsers/main/PaymentModeTile";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import TitleDiv from "../../../components/common/TitleDiv";
import FooterButton from "../../voucher/voucherCreation/FooterButton";
import { formatVoucherType } from "../../../../utils/formatVoucherType";

function AccVoucherInitialPageEdit() {
  // ////////////////dispatch
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  // ///////////////////  redux details /////////////////////
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    voucherNumber: voucherNumberRedux,
    date: dateRedux,
    voucherType: voucherTypeFromRedux,
    party,
    billData,
    totalBillAmount,
    enteredAmount,
    advanceAmount,
    remainingAmount,
    paymentMethod,
    paymentDetails,
    note,
    mode,
  } = useSelector((state) => state.commonAccountingVoucherSlice);

  const [voucherNumber, setVoucherNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => {
    const parsedDate = new Date(dateRedux || new Date());
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  });
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  /// get voucherType form location
  //   const voucherType = location.state?.voucherType;
  //   useEffect(() => {
  //     if (voucherType && voucherTypeFromRedux === "") {
  //       dispatch(addVoucherType(voucherType));
  //     }
  //   }, [voucherType]);

  /// to get voucher number name
  const getVoucherNumberTitle = () => {
    return location.state?.voucherType + "Number";
  };

  const getVoucherType = () => {
    if (voucherTypeFromRedux) return;
    /// if the voucherType is not present in redux then we will take it from the location state
    /// voucher type is assigned from the select voucher page to this page

    let currentVoucher = "receipt";
    let Mode = "edit";

    const { voucherType, mode } = location.state || {};
    if (location && location.state && voucherType) {
      currentVoucher = voucherType;
      Mode = mode;
    }
    dispatch(addVoucherType(currentVoucher));
    dispatch(addMode(Mode));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const voucherNumberTitle = getVoucherNumberTitle();
    const {
      [voucherNumberTitle]: voucherNumberFromLocation,
      party: partyFromLocation,
      paymentDetails: paymentDetailsFromLocation,
      date: dateFromLocation,
      billData: billDataFromLocation,
      totalBillAmount: totalBillAmountFromLocation,
      enteredAmount: enteredAmountFromLocation,
      advanceAmount: advanceAmountFromLocation,
      remainingAmount: remainingAmountFromLocation,
      paymentMethod: paymentMethodFromLocation,
      note: noteFromLocation,
    } = location?.state?.data || {};

    ///// set voucher number
    if (voucherNumberFromLocation && voucherNumberRedux === "") {
      dispatch(addVoucherNumber(voucherNumberFromLocation));
      setVoucherNumber(voucherNumberFromLocation);
    } else {
      setVoucherNumber(voucherNumberRedux);
    }
    ////// set date
    if (dateFromLocation && dateRedux === "") {
      dispatch(changeDate(dateFromLocation));
      setSelectedDate(dateFromLocation);
    } else {
      setSelectedDate(dateRedux);
    }

    ////// set party
    if (Object.keys(partyFromLocation).length > 0 && party === null) {
      dispatch(addParty(partyFromLocation));
    } else {
      dispatch(addParty(party));
    }

    //// set bill data
    if (Object.keys(billDataFromLocation).length > 0 && billData === null) {
      dispatch(addBillData(billDataFromLocation));
    } else {
      dispatch(addBillData(billData));
    }

    if (enteredAmountFromLocation && enteredAmount === null) {
      dispatch(addEnteredAmount(enteredAmountFromLocation));
    } else {
      dispatch(addEnteredAmount(enteredAmount));
    }

    if (totalBillAmountFromLocation && totalBillAmount === null) {
      dispatch(addTotalBillAmount(totalBillAmountFromLocation));
    } else {
      dispatch(addTotalBillAmount(totalBillAmount));
    }

    if (advanceAmountFromLocation && advanceAmount === null) {
      dispatch(addAdvanceAmount(advanceAmountFromLocation));
    } else {
      dispatch(addAdvanceAmount(advanceAmount));
    }

    if (remainingAmountFromLocation && remainingAmount === null) {
      dispatch(addRemainingAmount(remainingAmountFromLocation));
    } else {
      dispatch(addRemainingAmount(remainingAmount));
    }
    // dispatch(
    //   addSettlementData({
    //     billData,
    //     totalBillAmount,
    //     enteredAmount,
    //     advanceAmount,
    //     remainingAmount,
    //   })
    // );

    /////   set payment details
    if (
      paymentMethodFromLocation &&
      paymentMethod === "" &&
      paymentMethodFromLocation === "Cash"
    ) {
      if (paymentDetailsFromLocation) {
        dispatch(addCashPaymentDetails(paymentDetailsFromLocation));
      }
    }
    if (
      paymentMethodFromLocation &&
      paymentMethod === "" &&
      (paymentMethodFromLocation === "Online" || paymentMethod === "Cheque")
    ) {
      if (paymentDetailsFromLocation) {
        dispatch(addBankPaymentDetails(paymentDetailsFromLocation));
      }
    }
    if (paymentMethodFromLocation && paymentMethod === "") {
      dispatch(addPaymentMethod(paymentMethodFromLocation));
    }

    if (
      paymentDetailsFromLocation?.chequeNumber &&
      paymentDetails.chequeNumber === ""
    ) {
      dispatch(addChequeNumber(paymentDetailsFromLocation.chequeNumber));
    }
    if (paymentDetailsFromLocation?.chequeDate) {
      dispatch(addChequeDate(paymentDetailsFromLocation.chequeDate));
    }

    if (noteFromLocation && note === "") {
      dispatch(addNote(note));
    }
    setLoading(false);
  }, [location]);

  useEffect(() => {
    getVoucherType();
    fetchData();
  }, [location.state]);

  const submitHandler = async () => {
    setSubmitLoading(true);
    const voucherNumberTitle = getVoucherNumberTitle();

    // Form data
    const formData = {
      cmp_id,
      [voucherNumberTitle]: voucherNumber,
      date: selectedDate,
      party,
      billData,
      totalBillAmount,
      enteredAmount,
      advanceAmount,
      remainingAmount,
      paymentMethod,
      paymentDetails,
      note,
    };

    if (formData?.paymentMethod === "Online") {
      formData.paymentDetails = {
        ...formData.paymentDetails,
        chequeDate: null,
        chequeNumber: null,
        cash_name: null,
      };
    }
    if (formData?.paymentMethod === "Cash") {
      formData.paymentDetails = {
        ...formData.paymentDetails,
        cash_name: formData.paymentDetails.cash_ledname,
        bank_ledname: null,
        bank_name: null,
        chequeDate: null,
        chequeNumber: null,
      };
    }

    // Validation
    if (!formData[voucherNumberTitle]) {
      setSubmitLoading(false);
      return toast.error(
        ` ${formatVoucherType(voucherNumberRedux)}  number is required`
      );
    }

    if (!formData.party || !formData.party._id) {
      setSubmitLoading(false);
      return toast.error("Party selection is required.");
    }

    if (!formData.enteredAmount) {
      setSubmitLoading(false);
      return toast.error(" Amount is required.");
    }

    if (!formData.paymentMethod) {
      setSubmitLoading(false);
      return toast.error("Payment method is required.");
    }
    if (
      (formData.paymentMethod === "Cheque" ||
        formData.paymentMethod === "Online") &&
      !formData.paymentDetails
    ) {
      setSubmitLoading(false);
      return toast.error(
        "Payment details are required for cheque or online payments."
      );
    }

    if (formData.paymentMethod === "Cheque") {
      if (!formData.paymentDetails.chequeDate) {
        setSubmitLoading(false);
        return toast.error("Cheque date is required.");
      }
      if (!formData.paymentDetails.chequeNumber) {
        setSubmitLoading(false);
        return toast.error("Cheque number is required.");
      }
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        setSubmitLoading(false);
        return toast.error("Bank details are required.");
      }
    }

    if (formData.paymentMethod === "Online") {
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        setSubmitLoading(false);
        return toast.error("Bank details are required.");
      }
    }
    if (formData.paymentMethod === "Cash") {
      if (
        !formData.paymentDetails.cash_ledname ||
        !formData.paymentDetails._id
      ) {
        setSubmitLoading(false);
        return toast.error("Cash details are required.");
      }
    }

    // If validation passes, proceed with the form submission
    try {
      const res = await api.put(
        `/api/sUsers/edit${voucherTypeFromRedux}/${location?.state?.data?._id}`,
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

      navigate(
        `/sUsers/${voucherTypeFromRedux}/details/${res?.data?.data._id}`
      );
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative mb-10 sm:mb-0">
      <TitleDiv
        title={formatVoucherType(voucherTypeFromRedux)}
        from={`/sUsers/selectVouchers`}
        loading={loading || submitLoading}
      />

      <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
        <HeaderTile
          title={formatVoucherType(voucherTypeFromRedux)}
          number={voucherNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="add"
          loading={submitLoading}
          mode={mode}
        />

        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link={`/sUsers/searchParty${formatVoucherType(voucherTypeFromRedux)}`}
          linkBillTo=""
        />

        <AddAmountTile party={party} />
        <PaymentModeTile tab={voucherTypeFromRedux} />

        <FooterButton
          submitHandler={submitHandler}
          tab="add"
          title={formatVoucherType(voucherTypeFromRedux)}
          loading={submitLoading || loading}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default AccVoucherInitialPageEdit;
