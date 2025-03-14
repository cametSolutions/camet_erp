import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import { useDispatch } from "react-redux";
import {
  addReceiptNumber,
  changeDate,
  removeAll,
  removeParty,
  addParty,
  addSettlementData,
  addOutstandings,
  setTotalBillAmount,
  addBankPaymentDetails,
  addCashPaymentDetails,
  addPaymentMethod,
  // addAllBankList,
  addNote,
  addChequeNumber,
  addChequeDate,
  addReceiptId,
  // addIsNoteOpen,
} from "../../../slices/receipt";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddAmountTile from "../../components/secUsers/main/AddAmountTile";
import PaymentModeTile from "../../components/secUsers/main/PaymentModeTile";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useFetch from "../../customHook/useFetch";
import { useParams } from "react-router-dom";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../../components/secUsers/main/FooterButton";

function EditReceipt() {
  const { id } = useParams();
  // //////////////// dispatch ////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // /////////////////// redux details /////////////////////
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    receiptNumber: receiptNumberRedux,
    date: dateRedux,
    party: partyRedux,
    billData: billDataRedux,
    totalBillAmount: totalBillAmountRedux,
    paymentMethod: paymentMethodRedux,
    paymentDetails: paymentDetailsRedux,
    note: noteRedux,
    _id: _idRedux,
    outstandings: outstandingsRedux,
    modifiedOutstandings: modifiedOutstandingsRedux,
    enteredAmount: enteredAmountRedux,
    advanceAmount: advanceAmountRedux,
    remainingAmount: remainingAmountRedux,
  } = useSelector((state) => state.receipt);

  const [selectedDate, setSelectedDate] = useState(dateRedux);
  const [submitLoading, setSubmitLoading] = useState(false);

  /////fetch receipt details

  const { data: receiptDetails, loading } = useFetch(
    outstandingsRedux.length == 0 && `/api/sUsers/getReceiptDetails/${id}`
  );


  useEffect(() => {
    if (receiptDetails) {
      if (receiptDetails) {
        const {
          receiptNumber,
          date,
          party,
          billData,
          totalBillAmount,
          enteredAmount,
          advanceAmount,
          remainingAmount,
          paymentMethod,
          paymentDetails,
          note,
          outstandings,
        } = receiptDetails.receipt;

        if (id && !_idRedux) {
          dispatch(addReceiptId(id));
        }

        if (receiptNumber && !receiptNumberRedux) {
          dispatch(addReceiptNumber(receiptNumber));
        }

        if (date) {
          setSelectedDate(new Date(date));
          dispatch(changeDate(new Date(date).toISOString()));
        } else {
          console.log("date not changed");

          setSelectedDate(dateRedux);
        }

        if (party && Object.keys(partyRedux) == 0) {
          dispatch(addParty(party));
        }
        if (billData && billDataRedux.length == 0) {

          dispatch(
            addSettlementData({
              billData,
              totalBillAmount,
              enteredAmount,
              advanceAmount,
              remainingAmount,
            })
          );
        }
        if (totalBillAmount && !totalBillAmountRedux) {
          dispatch(setTotalBillAmount(totalBillAmount));
        }
        // if (paymentDetails) {
        //   dispatch(addBankPaymentDetails(paymentDetails));
        // }

        if (
          paymentMethod &&
          paymentMethodRedux === "" &&
          paymentMethod === "Cash"
        ) {
          if (paymentDetails) {
            dispatch(addCashPaymentDetails(paymentDetails));
          }
        }
        if (
          paymentMethod &&
          paymentMethodRedux === "" &&
          (paymentMethod === "Online" || paymentMethod === "Cheque")
        ) {
          if (paymentDetails) {
            dispatch(addBankPaymentDetails(paymentDetails));
          }
        }
        if (paymentMethod && paymentMethodRedux === "") {
          dispatch(addPaymentMethod(paymentMethod));
        }
        if (note && noteRedux === "") {
          dispatch(addNote(note));
        }
        if (
          paymentDetails?.chequeNumber &&
          paymentDetailsRedux.chequeNumber === ""
        ) {
          dispatch(addChequeNumber(paymentDetails.chequeNumber));
        }
        if (paymentDetails?.chequeDate) {
          dispatch(addChequeDate(paymentDetails.chequeDate));
        }

        if (outstandings && outstandingsRedux.length == 0) {
          dispatch(addOutstandings(outstandings));
        }
      }
    }
  }, [receiptDetails]);

  const submitHandler = async () => {
    setSubmitLoading(true);
    // Form data
    const formData = {
      cmp_id,
      receiptNumber: receiptNumberRedux,
      date: dateRedux,
      party: partyRedux,
      billData: billDataRedux,
      totalBillAmount: totalBillAmountRedux,
      enteredAmount: enteredAmountRedux,
      advanceAmount: advanceAmountRedux,
      remainingAmount: remainingAmountRedux,
      paymentMethod: paymentMethodRedux,
      paymentDetails: paymentDetailsRedux,
      outstandings: modifiedOutstandingsRedux,
      note: noteRedux,
    };

    if (formData?.paymentMethod === "Online") {
      formData.paymentDetails = {
        ...formData.paymentDetails,
        chequeDate: null,
        chequeNumber: null,
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

    // console.log(formData);

    // Validation
    if (!formData.receiptNumber) {
      setSubmitLoading(false);
      return toast.error("Receipt number is required.");
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

    // console.log("formData", formData);

    // If validation passes, proceed with the form submission
    try {
      const res = await api.put(`/api/sUsers/editReceipt/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);

      navigate(`/sUsers/receipt/details/${res?.data?.receipt._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    // <div>jhdfgk</div>
    <div>
      <TitleDiv title="Receipt" loading={loading || submitLoading} />
      <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
        <HeaderTile
          title={"Receipt"}
          number={receiptNumberRedux}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="edit"
        />
        <AddPartyTile
          party={partyRedux}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchPartyReceipt"
          linkBillTo=""
        />
        <AddAmountTile party={partyRedux} tab="receipt" process="edit" />
        <PaymentModeTile tab="receipt" />
        <FooterButton
          submitHandler={submitHandler}
          tab="edit"
          title="Receipt"
          loading={submitLoading || loading}
        />{" "}
      </div>
    </div>
  );
}

export default EditReceipt;
