import { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../../api/api";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import { useDispatch } from "react-redux";
import {
  addPaymentNumber,
  changeDate,
  removeAll,
  removeParty,
  addParty,
  addSettlementData,
  addOutstandings,
  setTotalBillAmount,
  addPaymentDetails,
  addPaymentMethod,
  // addAllBankList,
  addNote,
  addChequeNumber,
  addChequeDate,
  addReceiptId,
  // addIsNoteOpen,
} from "../../../slices/payment";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddAmountTile from "../../components/secUsers/main/AddAmountTile";
import PaymentModeTile from "../../components/secUsers/main/PaymentModeTile";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useFetch from "../../customHook/useFetch";
import { useParams } from "react-router-dom";
import ReceiptButton from "../../components/secUsers/main/Forms/ReceiptButton";

function EditPayment() {
  const { id } = useParams();
  // //////////////// dispatch ////////////////////
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // /////////////////// redux details /////////////////////
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    paymentNumber: paymentNumberRedux,
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
  } = useSelector((state) => state.payment);

  const [selectedDate, setSelectedDate] = useState(dateRedux);

  /////fetch receipt details

  const { data: paymentDetailsOfPurchase } = useFetch(
    outstandingsRedux.length == 0 && `/api/sUsers/getPaymentDetails/${id}`
  );

  // console.log("paymentDetailsRedux", paymentDetailsRedux);

  useEffect(() => {
    if (paymentDetailsOfPurchase) {
      const {
        paymentNumber,
        createdAt,
        party,
        billData,
        totalBillAmount,
        enteredAmount,
        // advanceAmount,
        // remainingAmount,
        paymentMethod,
        paymentDetails,
        note,
        outstandings,
      } = paymentDetailsOfPurchase.payment;

      if (id && !_idRedux) {
        dispatch(addReceiptId(id));
      }

      if (paymentNumber && !paymentNumberRedux) {
        dispatch(addPaymentNumber(paymentNumber));
      }

      if (createdAt) {
        setSelectedDate(new Date(createdAt));
        dispatch(changeDate(new Date(createdAt).toISOString()));
      } else {
        console.log("date not changed");

        setSelectedDate(dateRedux);
      }

      if (party && Object.keys(partyRedux) == 0) {
        dispatch(addParty(party));
      }
      if (billData && billDataRedux.length == 0) {
        dispatch(
          addSettlementData({ billData, totalBillAmount, enteredAmount })
        );
      }
      if (totalBillAmount && !totalBillAmountRedux) {
        dispatch(setTotalBillAmount(totalBillAmount));
      }
      if (paymentDetails) {
        dispatch(addPaymentDetails(paymentDetails));
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
  }, [paymentDetailsOfPurchase]);

  const submitHandler = async () => {
    // Form data
    const formData = {
      cmp_id,
      paymentNumber: paymentNumberRedux,
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
      formData.paymentDetailsOfPurchase = {
        ...formData.paymentDetailsOfPurchase,
        chequeDate: null,
        chequeNumber: null,
      };
    }
    if (formData?.paymentMethod === "Cash") {
      formData.paymentDetails = {
        ...formData.paymentDetails,
        bank_ledname: null,
        bank_name: null,
        _id: null,
        chequeDate: null,
        chequeNumber: null,
      };
    }

    // console.log(formData);

    // Validation
    if (!formData.paymentNumber) {
      return toast.error("Receipt number is required.");
    }

    if (!formData.party || !formData.party._id) {
      return toast.error("Party selection is required.");
    }

    if (!formData.enteredAmount) {
      return toast.error(" Amount is required.");
    }

    if (!formData.paymentMethod) {
      return toast.error("Payment method is required.");
    }
    if (
      (formData.paymentMethod === "Cheque" ||
        formData.paymentMethod === "Online") &&
      !formData.paymentDetails
    ) {
      return toast.error(
        "Payment details are required for cheque or online payments."
      );
    }

    if (formData.paymentMethod === "Cheque") {
      if (!formData.paymentDetails.chequeDate) {
        return toast.error("Cheque date is required.");
      }
      if (!formData.paymentDetails.chequeNumber) {
        return toast.error("Cheque number is required.");
      }
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        return toast.error("Bank details are required.");
      }
    }

    if (formData.paymentMethod === "Online") {
      if (
        !formData.paymentDetails.bank_ledname ||
        !formData.paymentDetails.bank_name ||
        !formData.paymentDetails._id
      ) {
        return toast.error("Bank details are required.");
      }
    }

    // console.log("formData", formData);

    // If validation passes, proceed with the form submission
    try {
      const res = await api.put(`/api/sUsers/editPayment/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/payment/details/${res?.data?.payment._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.log(error);
    }
  };

  return (
    // <div>jhdfgk</div>
    <div>
      <header className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
        <Link to={"/sUsers/selectVouchers"}>
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer" />
        </Link>
        <p className="text-white text-lg   font-bold ">Edit Payment</p>
      </header>

      <HeaderTile
        title={"Payment"}
        number={paymentNumberRedux}
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
        link="/sUsers/searchPartyPayment"
        linkBillTo=""
      />

      <AddAmountTile party={partyRedux} tab="payment" process="edit" />
      <PaymentModeTile tab="payment" />
      <ReceiptButton submitHandler={submitHandler} text="Edit Payment" />
    </div>
  );
}

export default EditPayment;
