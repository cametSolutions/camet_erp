import { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
  addPaymentDetails,
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
import ReceiptButton from "../../components/secUsers/main/Forms/ReceiptButton";

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
    enteredAmount : enteredAmountRedux,
    advanceAmount : advanceAmountRedux,
    remainingAmount : remainingAmountRedux,
  } = useSelector((state) => state.receipt);

  const [selectedDate, setSelectedDate] = useState(dateRedux);

  /////fetch receipt details

  const { data: receiptDetails } = useFetch(
    outstandingsRedux.length == 0 && `/api/sUsers/getReceiptDetails/${id}`
  );

  console.log("paymentDetailsRedux", paymentDetailsRedux);

  useEffect(() => {
    if (receiptDetails) {
      if (receiptDetails) {
        const {
          receiptNumber,
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
        } = receiptDetails.receipt;

        if (id && !_idRedux) {
          dispatch(addReceiptId(id));
        }

        if (receiptNumber && !receiptNumberRedux) {
          dispatch(addReceiptNumber(receiptNumber));
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
    }
  }, [receiptDetails]);

  

  const submitHandler = async () => {
    // Form data
    const formData = {
      cmp_id,
      receiptNumber: receiptNumberRedux,
      date: dateRedux,
      party: partyRedux,
      billData: billDataRedux,
      totalBillAmount: totalBillAmountRedux,
      enteredAmount : enteredAmountRedux,
      advanceAmount : advanceAmountRedux,
      remainingAmount : remainingAmountRedux,
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
        bank_ledname: null,
        bank_name: null,
        _id: null,
        chequeDate: null,
        chequeNumber: null,
      };
    }

    // console.log(formData);

    // Validation
    if (!formData.receiptNumber) {
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
      const res = await api.put(`/api/sUsers/editReceipt/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/receipt/details/${res?.data?.receipt._id}`);
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
        <p className="text-white text-lg   font-bold ">Receipt</p>
      </header>

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
      <ReceiptButton submitHandler={submitHandler} text="Edit Receipt" />

    </div>
  );
}

export default EditReceipt;
